import { bucket } from "@/lib/firebase";
import { LIMITS } from "@/lib/submissions/shared";

/**
 * Direct-to-bucket uploads. The browser never sends file bytes through the
 * Next.js server (Vercel caps request bodies at ~4.5 MB): the API signs a
 * short-lived V4 PUT URL bound to one object path, one content type and one
 * exact byte length, and the browser PUTs the file straight to Cloud Storage.
 *
 * Requires a CORS rule on the bucket for the site origin —
 * see scripts/configure-storage-cors.mjs.
 */

// Path separators and ASCII control characters (NUL..US, DEL).
const UNSAFE_NAME_CHARS = /[/\\\u0000-\u001f\u007f]/g;

/** Object path for one submitted file, namespaced by contact then file. */
export function submissionObjectPath(
  contactId: string,
  fileId: string,
  filename: string,
): string {
  // The object path's structure is ours, not the file's.
  const safeName = filename.replace(UNSAFE_NAME_CHARS, "_").trim().slice(0, 180) || "file";
  return `submissions/${contactId}/${fileId}/${safeName}`;
}

export type UploadGrant = {
  url: string;
  headers: Record<string, string>;
  expiresAt: string;
};

/** Printable ASCII only — what an HTTP header value may safely carry. */
const PRINTABLE_ASCII = /^[ -~]*$/;

/**
 * Sign a PUT for exactly `size` bytes of `contentType` at `path`. Every custom
 * header is part of the signature, so the browser must send them verbatim —
 * which is also what pins the object's custom metadata to what we issued.
 */
export async function createUploadGrant(args: {
  path: string;
  contentType: string;
  size: number;
  meta: Record<string, string>;
}): Promise<UploadGrant> {
  const extensionHeaders: Record<string, string> = {
    "x-goog-content-length-range": `${args.size},${args.size}`,
  };
  for (const [key, value] of Object.entries(args.meta)) {
    // Empty values add nothing and are the one case whose signing we could not
    // verify against the bucket edge, so leave them out entirely.
    if (!value) continue;
    extensionHeaders[`x-goog-meta-${key}`] = PRINTABLE_ASCII.test(value)
      ? value
      : encodeURIComponent(value);
  }
  const expires = Date.now() + LIMITS.signedUrlTtlMs;
  const [url] = await bucket().file(args.path).getSignedUrl({
    version: "v4",
    action: "write",
    expires,
    contentType: args.contentType,
    extensionHeaders,
  });
  return {
    url,
    headers: { "Content-Type": args.contentType, ...extensionHeaders },
    expiresAt: new Date(expires).toISOString(),
  };
}

export type StoredObject = {
  size: number;
  md5: string | null;
  crc32c: string | null;
  contentType: string | null;
  metadata: Record<string, string>;
};

/** What the bucket holds at `path`, or null when nothing landed there. */
export async function inspectObject(path: string): Promise<StoredObject | null> {
  const file = bucket().file(path);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [meta] = await file.getMetadata();
  const custom: Record<string, string> = {};
  for (const [key, value] of Object.entries(meta.metadata ?? {})) {
    if (typeof value === "string") custom[key] = value;
  }
  return {
    size: Number(meta.size ?? 0),
    md5: meta.md5Hash ?? null,
    crc32c: meta.crc32c ?? null,
    contentType: meta.contentType ?? null,
    metadata: custom,
  };
}
