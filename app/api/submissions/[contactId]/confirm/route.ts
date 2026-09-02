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
  LIMITS,
  type CaptureConfirmation,
  type ConfirmResponse,
  type ConfirmationStatus,
} from "@/lib/submissions/shared";
import { consumeRateLimit, getFile, ipKey, recordConfirmation } from "@/lib/submissions/store";

/**
 * POST /api/submissions/[contactId]/confirm — the client's answer to "was this
 * captured on <date>?". Recorded with the responding IP and user agent, the
 * same way the contact form records SMS consent.
 */

const STATUSES: ReadonlySet<string> = new Set<ConfirmationStatus>([
  "confirmed",
  "corrected",
  "unknown",
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> },
) {
  const { contactId } = await params;
  if (!validContactId(contactId)) {
    return jsonError(404, "This submission link is not valid.", "bad_contact");
  }
  const body = await readJson(request);
  const fileId = isUuid(body?.fileId) ? body.fileId : "";
  const status = typeof body?.status === "string" && STATUSES.has(body.status)
    ? (body.status as ConfirmationStatus)
    : null;
  const attestedAt = body?.attestedAt === null || body?.attestedAt === undefined
    ? null
    : isIsoDateTime(body.attestedAt)
      ? body.attestedAt
      : undefined;
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) || null : null;

  if (!fileId || !status || attestedAt === undefined) {
    return jsonError(400, "Invalid confirmation.", "bad_request");
  }
  if (status === "corrected" && !attestedAt) {
    return jsonError(400, "A corrected date needs a value.", "bad_request");
  }

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
    const confirmation: CaptureConfirmation = {
      status,
      // "Confirmed" attests to the detected value, whatever the client echoed.
      attestedAt:
        status === "confirmed" ? doc.capture.value : status === "unknown" ? null : attestedAt,
      note,
      respondedAt: new Date().toISOString(),
      ip: clientIp(request),
      userAgent: userAgent(request),
    };
    await recordConfirmation(fileId, confirmation);
    const response: ConfirmResponse = { ok: true };
    return NextResponse.json(response);
  } catch (err) {
    logError("confirm", err, { contactId, fileId });
    return jsonError(502, "We could not save your answer. Please try again.", "confirm_failed");
  }
}
