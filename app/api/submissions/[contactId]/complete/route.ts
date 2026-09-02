import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  clientIp,
  isUuid,
  jsonError,
  logError,
  readJson,
  validContactId,
} from "@/lib/submissions/api";
import { LIMITS, type CompleteResponse } from "@/lib/submissions/shared";
import { consumeRateLimit, getFile, ipKey, markUploaded } from "@/lib/submissions/store";
import { inspectObject } from "@/lib/submissions/storage";

/**
 * POST /api/submissions/[contactId]/complete — the browser finished its PUT.
 * Verify the object really landed in the bucket with the size we authorised,
 * then mark the record uploaded. Idempotent: a retried call on an already
 * uploaded file just returns its status.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> },
) {
  const { contactId } = await params;
  if (!validContactId(contactId)) {
    return jsonError(404, "This submission link is not valid.", "bad_contact");
  }
  const body = await readJson(request);
  const fileId = body?.fileId;
  if (!isUuid(fileId)) return jsonError(400, "Missing or invalid fileId.", "bad_request");

  try {
    const limited = await consumeRateLimit(
      ipKey(clientIp(request), "aux"),
      LIMITS.auxPerMinutePerIp,
      60_000,
    );
    if (!limited.ok) {
      return jsonError(429, "Too many requests. Please wait a moment.", "rate_limited", {
        "Retry-After": String(limited.retryAfterSeconds),
      });
    }
    const doc = await getFile(contactId, fileId);
    if (!doc) return jsonError(404, "Unknown file.", "not_found");
    if (doc.status === "uploaded") {
      const response: CompleteResponse = { ok: true, fileId, status: "uploaded" };
      return NextResponse.json(response);
    }

    const stored = await inspectObject(doc.storagePath);
    if (!stored) {
      return jsonError(409, "The file has not arrived in storage yet.", "not_in_storage");
    }
    if (stored.size !== doc.size) {
      return jsonError(
        409,
        "The stored file does not match the authorised upload.",
        "size_mismatch",
      );
    }
    await markUploaded(doc, {
      size: stored.size,
      md5: stored.md5,
      crc32c: stored.crc32c,
      contentType: stored.contentType,
    });
    const response: CompleteResponse = { ok: true, fileId, status: "uploaded" };
    return NextResponse.json(response);
  } catch (err) {
    logError("complete", err, { contactId, fileId });
    return jsonError(502, "We could not confirm the upload. Please try again.", "complete_failed");
  }
}
