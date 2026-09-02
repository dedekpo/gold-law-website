import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  clientIp,
  isIsoDateTime,
  isUuid,
  jsonError,
  logError,
  readJson,
  userAgent,
  validContactId,
} from "@/lib/submissions/api";
import {
  CAPTURE_SOURCES,
  detectKind,
  LIMITS,
  resolveContentType,
  type CaptureSource,
  type DetectedCapture,
  type SignResponse,
  type SubmissionFileDoc,
} from "@/lib/submissions/shared";
import {
  consumeDistinctLimit,
  consumeRateLimit,
  countContactFiles,
  createPendingFile,
  getFile,
  ipKey,
  newFileId,
} from "@/lib/submissions/store";
import { createUploadGrant, submissionObjectPath } from "@/lib/submissions/storage";

/**
 * POST /api/submissions/[contactId]/sign
 *
 * Authorise one upload: validate the file's shape, apply the per-IP and
 * per-contact limits, create the pending Firestore record, and hand back a
 * signed PUT URL the browser uploads to directly (bytes never pass through
 * here). Pass `resignFileId` to re-issue a URL for a pending file whose
 * signature expired mid-retry.
 */

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const RAW_KEY_RE = /^[A-Za-z0-9_.:-]{1,60}$/;

const NO_CAPTURE: DetectedCapture = { value: null, source: "none", offsetKnown: false, raw: {} };

/**
 * The browser's reading of the file's capture date. Anything malformed
 * degrades to "unknown" rather than rejecting the upload — the bytes are what
 * matter, and the date question is asked of the client anyway.
 */
function parseCapture(raw: unknown): DetectedCapture {
  if (!raw || typeof raw !== "object") return NO_CAPTURE;
  const c = raw as Record<string, unknown>;
  const rawEntries: Record<string, string> = {};
  if (c.raw && typeof c.raw === "object") {
    for (const [k, v] of Object.entries(c.raw as Record<string, unknown>).slice(0, 20)) {
      if (RAW_KEY_RE.test(k) && typeof v === "string") rawEntries[k] = v.slice(0, 500);
    }
  }
  const source =
    typeof c.source === "string" && CAPTURE_SOURCES.has(c.source)
      ? (c.source as CaptureSource)
      : null;
  if (!source || (c.value !== null && !isIsoDateTime(c.value))) {
    return { ...NO_CAPTURE, raw: rawEntries };
  }
  return {
    value: c.value as string | null,
    source,
    offsetKnown: c.offsetKnown === true,
    raw: rawEntries,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> },
) {
  const { contactId } = await params;
  if (!validContactId(contactId)) {
    return jsonError(404, "This submission link is not valid.", "bad_contact");
  }
  const body = await readJson(request);
  if (!body) return jsonError(400, "Invalid request body.", "bad_request");

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const size = typeof body.size === "number" && Number.isInteger(body.size) ? body.size : NaN;
  const declaredType = typeof body.contentType === "string" ? body.contentType : "";
  // A modification time in the future or before the JS epoch is noise.
  const lastModified =
    typeof body.lastModified === "number" &&
    Number.isFinite(body.lastModified) &&
    body.lastModified > 0 &&
    body.lastModified < Date.now() + 24 * HOUR_MS
      ? body.lastModified
      : null;
  const capture = parseCapture(body.capture);
  const derivedFrom = body.derivedFrom == null ? null : body.derivedFrom;
  const resignFileId = body.resignFileId == null ? null : body.resignFileId;
  if (derivedFrom !== null && !isUuid(derivedFrom)) {
    return jsonError(400, "Invalid source file id.", "bad_parent");
  }
  if (resignFileId !== null && !isUuid(resignFileId)) {
    return jsonError(409, "That upload can no longer be resumed.", "resign_invalid");
  }

  let clip: SubmissionFileDoc["clip"] = null;
  if (body.clip && typeof body.clip === "object") {
    const c = body.clip as Record<string, unknown>;
    const start = Number(c.startSeconds);
    const end = Number(c.endSeconds);
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start < 0 ||
      end - start < LIMITS.clip.minSeconds ||
      end - start > LIMITS.clip.maxSeconds
    ) {
      return jsonError(400, "The selected excerpt range is not valid.", "bad_clip");
    }
    clip = {
      startSeconds: Math.round(start * 1000) / 1000,
      endSeconds: Math.round(end * 1000) / 1000,
    };
  }

  let frameAtSeconds: number | null = null;
  if (body.frameAtSeconds != null) {
    const at = Number(body.frameAtSeconds);
    if (!Number.isFinite(at) || at < 0 || at > 24 * 60 * 60) {
      return jsonError(400, "The captured frame position is not valid.", "bad_frame");
    }
    frameAtSeconds = Math.round(at * 1000) / 1000;
  }

  if (!name || name.length > LIMITS.maxNameLength) {
    return jsonError(400, "The file name is missing or too long.", "bad_name");
  }
  if (!Number.isFinite(size) || size <= 0) {
    return jsonError(400, "The file appears to be empty.", "bad_size");
  }

  const contentType = resolveContentType(declaredType, name);
  const kind = detectKind(contentType, name);
  if (!kind) {
    return jsonError(
      415,
      "Only screenshots (images), screen recordings (videos), and audio recordings can be submitted.",
      "unsupported_type",
    );
  }
  if (size > LIMITS.maxBytes[kind]) {
    const maxMb = Math.round(LIMITS.maxBytes[kind] / (1024 * 1024));
    return jsonError(
      413,
      `This file is larger than the ${maxMb} MB limit for ${kind} files.`,
      "too_large",
    );
  }

  const ip = clientIp(request);

  try {
    // Rate limits first — cheap, and they are what stands between a bot and
    // the bucket: per-IP and per-contact request rates, plus a cap on how
    // many different contact ids one address may upload for (the links are
    // not authenticated, so inventing ids must not be free).
    const [byIp, byContact, byContacts] = await Promise.all([
      consumeRateLimit(ipKey(ip), LIMITS.signPerMinutePerIp, MINUTE_MS),
      consumeRateLimit(`contact:${contactId}`, LIMITS.signPerMinutePerContact, MINUTE_MS),
      consumeDistinctLimit(
        ipKey(ip, "contacts"),
        contactId,
        LIMITS.distinctContactsPerHourPerIp,
        HOUR_MS,
      ),
    ]);
    const limited = [byIp, byContact, byContacts].find((r) => !r.ok);
    if (limited && !limited.ok) {
      return jsonError(
        429,
        "Too many uploads in a short time. Please wait a moment and try again.",
        "rate_limited",
        { "Retry-After": String(limited.retryAfterSeconds) },
      );
    }

    // Retry path: same pending record, fresh signature. The record's shape is
    // authoritative — the client cannot change size or type on a re-sign.
    if (resignFileId) {
      const existing = await getFile(contactId, resignFileId);
      if (!existing || existing.status !== "pending") {
        return jsonError(409, "That upload can no longer be resumed.", "resign_invalid");
      }
      const grant = await createUploadGrant({
        path: existing.storagePath,
        contentType: existing.contentType,
        size: existing.size,
        meta: uploadMeta(existing),
      });
      const response: SignResponse = {
        fileId: existing.id,
        uploadUrl: grant.url,
        headers: grant.headers,
        expiresAt: grant.expiresAt,
      };
      return NextResponse.json(response);
    }

    const used = await countContactFiles(contactId);
    if (used >= LIMITS.maxFilesPerContact) {
      return jsonError(
        429,
        `This submission link has reached its limit of ${LIMITS.maxFilesPerContact} files. Please contact our office if you need to send more.`,
        "quota_exceeded",
      );
    }

    if (derivedFrom) {
      const parent = await getFile(contactId, derivedFrom);
      if (!parent) return jsonError(400, "The source recording was not found.", "bad_parent");
    }

    const fileId = newFileId();
    const doc: SubmissionFileDoc = {
      id: fileId,
      contactId,
      status: "pending",
      name,
      contentType,
      size,
      kind,
      storagePath: submissionObjectPath(contactId, fileId, name),
      createdAt: new Date().toISOString(),
      uploadedAt: null,
      clientLastModified: lastModified ? new Date(lastModified).toISOString() : null,
      capture,
      confirmation: null,
      derivedFrom,
      clip,
      frameAtSeconds,
      verified: null,
      client: { ip, userAgent: userAgent(request) },
      schemaVersion: 1,
    };

    const grant = await createUploadGrant({
      path: doc.storagePath,
      contentType,
      size,
      meta: uploadMeta(doc),
    });
    await createPendingFile(doc);

    const response: SignResponse = {
      fileId,
      uploadUrl: grant.url,
      headers: grant.headers,
      expiresAt: grant.expiresAt,
    };
    return NextResponse.json(response);
  } catch (err) {
    logError("sign", err, { contactId, name, size });
    return jsonError(502, "We could not start this upload. Please try again.", "sign_failed");
  }
}

/**
 * Custom object metadata written alongside the bytes, so the bucket alone can
 * be reconciled with Firestore if the two ever disagree. Empty values are
 * dropped by the signer.
 */
function uploadMeta(doc: SubmissionFileDoc): Record<string, string> {
  return {
    "contact-id": doc.contactId,
    "file-id": doc.id,
    "original-name": doc.name,
    "client-last-modified": doc.clientLastModified ?? "",
    "capture-value": doc.capture.value ?? "",
    "capture-source": doc.capture.source,
  };
}
