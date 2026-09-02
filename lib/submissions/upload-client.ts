import type {
  ApiError,
  CompleteResponse,
  ConfirmRequest,
  DetectedCapture,
  SignRequest,
  SignResponse,
} from "./shared";

/**
 * Browser side of the upload protocol:
 *   1. POST /sign      → pending record + signed PUT URL (+ the headers it covers)
 *   2. PUT  <bucket>   → the bytes go straight to Cloud Storage, with progress
 *   3. POST /complete  → the server verifies the object and marks it uploaded
 * Each step retries on transient failure; an expired signature or a retried
 * upload re-signs the SAME record (`resignFileId`) so nothing is duplicated.
 */

export class UploadError extends Error {
  code: string;
  status: number | null;
  retryable: boolean;
  retryAfterMs: number | null;
  constructor(
    message: string,
    opts: { code: string; status?: number | null; retryable?: boolean; retryAfterMs?: number | null },
  ) {
    super(message);
    this.name = "UploadError";
    this.code = opts.code;
    this.status = opts.status ?? null;
    this.retryable = opts.retryable ?? false;
    this.retryAfterMs = opts.retryAfterMs ?? null;
  }
}

// Server answers that no retry can change.
const FINAL_CODES = new Set(["quota_exceeded", "too_large", "unsupported_type", "bad_contact"]);

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function postJson<T>(
  url: string,
  body: unknown,
  opts: { signal?: AbortSignal; keepalive?: boolean } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: opts.signal,
      keepalive: opts.keepalive,
    });
  } catch {
    if (opts.signal?.aborted) throw new UploadError("Upload cancelled.", { code: "aborted" });
    throw new UploadError("Network error — check your connection.", {
      code: "network",
      retryable: true,
    });
  }
  if (response.ok) return (await response.json()) as T;
  let payload: ApiError | null = null;
  try {
    payload = (await response.json()) as ApiError;
  } catch {
    // non-JSON error body
  }
  const code = payload?.code ?? `http_${response.status}`;
  const retryAfter = Number(response.headers.get("Retry-After"));
  throw new UploadError(payload?.error ?? `Request failed (${response.status}).`, {
    code,
    status: response.status,
    retryable: !FINAL_CODES.has(code) && (response.status === 429 || response.status >= 500),
    retryAfterMs: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : null,
  });
}

/** Retry a step on retryable failures with exponential backoff (honouring Retry-After). */
export async function withRetry<T>(
  step: () => Promise<T>,
  opts: { attempts: number; baseMs: number; signal?: AbortSignal },
): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await step();
    } catch (err) {
      attempt++;
      if (!(err instanceof UploadError) || !err.retryable || attempt >= opts.attempts) throw err;
      const backoff = err.retryAfterMs ?? Math.min(opts.baseMs * 2 ** (attempt - 1), 30_000);
      await sleep(backoff + Math.random() * 400);
      if (opts.signal?.aborted) throw new UploadError("Upload cancelled.", { code: "aborted" });
    }
  }
}

export function signUpload(
  contactId: string,
  request: SignRequest,
  signal?: AbortSignal,
): Promise<SignResponse> {
  return postJson<SignResponse>(`/api/submissions/${contactId}/sign`, request, { signal });
}

export function completeUpload(
  contactId: string,
  fileId: string,
  signal?: AbortSignal,
): Promise<CompleteResponse> {
  return postJson<CompleteResponse>(
    `/api/submissions/${contactId}/complete`,
    { fileId },
    { signal },
  );
}

/**
 * Record the client's date answer. `keepalive` lets the request finish even if
 * the tab is closed right after the last dialog.
 */
export function confirmCapture(contactId: string, request: ConfirmRequest): Promise<void> {
  return withRetry(
    () =>
      postJson<{ ok: true }>(`/api/submissions/${contactId}/confirm`, request, {
        keepalive: true,
      }),
    { attempts: 3, baseMs: 1000 },
  ).then(() => undefined);
}

/** PUT the bytes to the signed URL. XHR, because fetch has no upload progress. */
export function putToStorage(
  url: string,
  headers: Record<string, string>,
  blob: Blob,
  onProgress?: (loaded: number, total: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded, event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(blob.size, blob.size);
        resolve();
        return;
      }
      // 403 = signature expired or header mismatch; the caller re-signs once.
      // 5xx/429 = transient on the bucket side; retry.
      reject(
        new UploadError(`Storage rejected the upload (${xhr.status}).`, {
          code: xhr.status === 403 ? "signature_rejected" : `storage_${xhr.status}`,
          status: xhr.status,
          retryable: xhr.status === 429 || xhr.status >= 500,
        }),
      );
    };
    xhr.onerror = () =>
      reject(
        new UploadError("The connection dropped during the upload.", {
          code: "network",
          retryable: true,
        }),
      );
    xhr.onabort = () => reject(new UploadError("Upload cancelled.", { code: "aborted" }));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(blob);
  });
}

export type UploadArgs = {
  contactId: string;
  blob: Blob;
  name: string;
  contentType: string;
  lastModified: number | null;
  capture: DetectedCapture;
  derivedFrom?: string | null;
  clip?: { startSeconds: number; endSeconds: number } | null;
  frameAtSeconds?: number | null;
  /** A pending record from an earlier attempt to reuse instead of minting a new one. */
  resignFileId?: string | null;
  onProgress?: (fraction: number) => void;
  /** Called as soon as the server has allocated (or re-confirmed) the record's id. */
  onFileId?: (fileId: string) => void;
  signal?: AbortSignal;
};

/** Run the full sign → PUT → complete sequence for one file. */
export async function uploadSubmissionFile(args: UploadArgs): Promise<{ fileId: string }> {
  const { contactId, blob, signal } = args;
  const request: SignRequest = {
    name: args.name,
    size: blob.size,
    contentType: args.contentType,
    lastModified: args.lastModified,
    capture: args.capture,
    derivedFrom: args.derivedFrom ?? null,
    clip: args.clip ?? null,
    frameAtSeconds: args.frameAtSeconds ?? null,
  };

  /** Prefer re-signing the existing record; fall back to a fresh one if it is gone. */
  const sign = async (reuse: string | null): Promise<SignResponse> => {
    if (reuse) {
      try {
        return await signUpload(contactId, { ...request, resignFileId: reuse }, signal);
      } catch (err) {
        if (!(err instanceof UploadError) || err.code !== "resign_invalid") throw err;
      }
    }
    return signUpload(contactId, request, signal);
  };

  let grant = await withRetry(() => sign(args.resignFileId ?? null), {
    attempts: 4,
    baseMs: 1500,
    signal,
  });
  args.onFileId?.(grant.fileId);

  let resigned = false;
  await withRetry(
    async () => {
      try {
        await putToStorage(
          grant.uploadUrl,
          grant.headers,
          blob,
          (loaded, total) => args.onProgress?.(total ? loaded / total : 0),
          signal,
        );
      } catch (err) {
        if (err instanceof UploadError && err.code === "signature_rejected" && !resigned) {
          // One fresh signature for the same record, then retry the PUT.
          resigned = true;
          grant = await sign(grant.fileId);
          args.onFileId?.(grant.fileId);
          throw new UploadError("Re-signed; retrying.", { code: "resigned", retryable: true });
        }
        throw err;
      }
    },
    { attempts: 5, baseMs: 2000, signal },
  );

  await withRetry(
    async () => {
      try {
        await completeUpload(contactId, grant.fileId, signal);
      } catch (err) {
        // The bucket is strongly consistent, but be forgiving of a slow edge.
        if (err instanceof UploadError && err.code === "not_in_storage") {
          throw new UploadError(err.message, { code: err.code, status: err.status, retryable: true });
        }
        throw err;
      }
    },
    { attempts: 5, baseMs: 1500, signal },
  );

  return { fileId: grant.fileId };
}
