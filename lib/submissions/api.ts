import { NextResponse } from "next/server";
import { CONTACT_ID_RE, type ApiError } from "@/lib/submissions/shared";

/** Helpers shared by the /api/submissions/[contactId]/* route handlers. */

export function jsonError(
  status: number,
  error: string,
  code?: string,
  headers?: Record<string, string>,
): NextResponse<ApiError> {
  return NextResponse.json({ error, code }, { status, headers });
}

export function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || null;
  return request.headers.get("x-real-ip");
}

export function userAgent(request: Request): string | null {
  return request.headers.get("user-agent")?.slice(0, 500) ?? null;
}

export function validContactId(id: string): boolean {
  return CONTACT_ID_RE.test(id);
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** ISO 8601 date-time, either floating (`2024-03-05T22:30:15`) or with an offset. */
export const ISO_DATETIME_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/;

export function isIsoDateTime(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATETIME_RE.test(value)) return false;
  // A floating value has no offset — validate the calendar part in UTC.
  const probe = /Z|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;
  return Number.isFinite(Date.parse(probe));
}

export function logError(scope: string, err: unknown, extra?: Record<string, unknown>) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[submissions:${scope}] ${message}`, extra ?? "");
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** File ids are server-minted UUIDs; anything else never reaches Firestore. */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}
