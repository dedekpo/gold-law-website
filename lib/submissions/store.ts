import { createHash, randomUUID } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase";
import type {
  CaptureConfirmation,
  SubmissionContactDoc,
  SubmissionFileDoc,
} from "@/lib/submissions/shared";

/** Firestore persistence for client submissions — see shared.ts for the model. */

const FILES = "submissionFiles";
const CONTACTS = "submissions";
const RATE_LIMITS = "submissionRateLimits";

export function newFileId(): string {
  return randomUUID();
}

export async function countContactFiles(contactId: string): Promise<number> {
  const snap = await db()
    .collection(FILES)
    .where("contactId", "==", contactId)
    .count()
    .get();
  return snap.data().count;
}

export async function contactSummary(
  contactId: string,
): Promise<SubmissionContactDoc | null> {
  const snap = await db().collection(CONTACTS).doc(contactId).get();
  return snap.exists ? (snap.data() as SubmissionContactDoc) : null;
}

/** When GHL last confirmed the contact exists, if ever (see lib/ghl.ts). */
export async function contactVerifiedAt(contactId: string): Promise<string | null> {
  const snap = await db().collection(CONTACTS).doc(contactId).get();
  const value = snap.exists ? (snap.data() as Partial<SubmissionContactDoc>).ghlVerifiedAt : null;
  return typeof value === "string" ? value : null;
}

/** Remember a GHL confirmation; the counters are left to markUploaded. */
export async function markContactVerified(contactId: string): Promise<void> {
  await db()
    .collection(CONTACTS)
    .doc(contactId)
    .set({ contactId, ghlVerifiedAt: new Date().toISOString() }, { merge: true });
}

export async function createPendingFile(doc: SubmissionFileDoc): Promise<void> {
  await db().collection(FILES).doc(doc.id).create(doc);
}

export async function getFile(
  contactId: string,
  fileId: string,
): Promise<SubmissionFileDoc | null> {
  const snap = await db().collection(FILES).doc(fileId).get();
  if (!snap.exists) return null;
  const doc = snap.data() as SubmissionFileDoc;
  // Files are addressed by id, but a client may only ever touch its own contact's.
  return doc.contactId === contactId ? doc : null;
}

/**
 * Quiet window that separates two submission sessions. A file uploaded more
 * than this long after the contact's previous upload opens a new session
 * (and a notification); anything sooner belongs to the session in progress,
 * however long that session has been running.
 */
export function sessionGapMs(): number {
  const minutes = Number(process.env.EVIDENCE_SESSION_GAP_MINUTES ?? 60);
  return (Number.isFinite(minutes) && minutes > 0 ? minutes : 60) * 60_000;
}

/** Pure rule, exported for tests: does an upload at `now` open a new session? */
export function opensSession(previousUploadAt: string | undefined, now: string, gapMs: number): boolean {
  if (!previousUploadAt) return true;
  const previous = Date.parse(previousUploadAt);
  if (!Number.isFinite(previous)) return true;
  return Date.parse(now) - previous > gapMs;
}

export type MarkUploadedResult = {
  /** True when this file is the first of a new submission session. */
  opensSession: boolean;
  /** The contact's uploaded-file count after this one. */
  fileCount: number;
};

/**
 * Flip a pending file to uploaded and roll its size into the contact's
 * counters. Runs in a transaction so a double "complete" (retry after a lost
 * response) cannot count the same file twice — and, for the same reason,
 * so that exactly one of several near-simultaneous uploads opens a session.
 * A file that was already uploaded never opens one.
 */
export async function markUploaded(
  doc: SubmissionFileDoc,
  verified: NonNullable<SubmissionFileDoc["verified"]>,
): Promise<MarkUploadedResult> {
  const now = new Date().toISOString();
  const fileRef = db().collection(FILES).doc(doc.id);
  const contactRef = db().collection(CONTACTS).doc(doc.contactId);
  return db().runTransaction(async (tx) => {
    const [fileSnap, contactSnap] = await Promise.all([
      tx.get(fileRef),
      tx.get(contactRef),
    ]);
    const existing = contactSnap.data() as Partial<SubmissionContactDoc> | undefined;
    const current = fileSnap.data() as SubmissionFileDoc | undefined;
    if (!current || current.status === "uploaded") {
      return { opensSession: false, fileCount: existing?.fileCount ?? 0 };
    }
    tx.update(fileRef, { status: "uploaded", uploadedAt: now, verified });
    const newSession = opensSession(existing?.lastUploadAt, now, sessionGapMs());
    tx.set(
      contactRef,
      {
        contactId: doc.contactId,
        fileCount: FieldValue.increment(1),
        totalBytes: FieldValue.increment(verified.size),
        firstUploadAt: existing?.firstUploadAt ?? now,
        lastUploadAt: now,
        ...(newSession
          ? { sessionCount: FieldValue.increment(1), sessionOpenedAt: now }
          : {}),
      },
      { merge: true },
    );
    return { opensSession: newSession, fileCount: (existing?.fileCount ?? 0) + 1 };
  });
}

/** Outcome of the office notification, kept on the contact doc for diagnosis. */
export async function recordNotification(
  contactId: string,
  outcome: { ok: true } | { ok: false; error: string },
): Promise<void> {
  await db()
    .collection(CONTACTS)
    .doc(contactId)
    .set(
      outcome.ok
        ? { lastNotifiedAt: new Date().toISOString(), lastNotifyError: null }
        : { lastNotifyError: outcome.error },
      { merge: true },
    );
}

export async function recordConfirmation(
  fileId: string,
  confirmation: CaptureConfirmation,
): Promise<void> {
  await db().collection(FILES).doc(fileId).update({ confirmation });
}

// ---------------------------------------------------------------------------
// Rate limiting — fixed windows kept in Firestore because the API runs on
// stateless serverless functions where in-memory counters would not be shared.
// Every window doc carries `expiresAt` so a Firestore TTL policy on that field
// (Console → Firestore → TTL, collection `submissionRateLimits`) can sweep them.
// ---------------------------------------------------------------------------

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

function retryAfter(windowStart: number, windowMs: number, now: number): number {
  return Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000));
}

function expiry(now: number, windowMs: number): Timestamp {
  return Timestamp.fromMillis(now + windowMs * 2);
}

/** At most `limit` hits per `windowMs` for `key`. */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const ref = db().collection(RATE_LIMITS).doc(key);
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();
    const data = snap.exists
      ? (snap.data() as { windowStart: number; count: number })
      : null;
    if (!data || now - data.windowStart >= windowMs) {
      tx.set(ref, {
        windowStart: now,
        count: 1,
        updatedAt: now,
        expiresAt: expiry(now, windowMs),
      });
      return { ok: true };
    }
    if (data.count >= limit) {
      return { ok: false, retryAfterSeconds: retryAfter(data.windowStart, windowMs, now) };
    }
    tx.update(ref, { count: data.count + 1, updatedAt: now });
    return { ok: true };
  });
}

/**
 * At most `limit` DISTINCT `member`s per `windowMs` for `key` — what stops one
 * address from inventing contact ids: a member already seen in the window is
 * free, a new one past the limit is refused.
 */
export async function consumeDistinctLimit(
  key: string,
  member: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const ref = db().collection(RATE_LIMITS).doc(key);
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();
    const data = snap.exists
      ? (snap.data() as { windowStart: number; members?: unknown })
      : null;
    const members = Array.isArray(data?.members)
      ? (data.members as unknown[]).filter((m): m is string => typeof m === "string")
      : null;
    if (!data || !members || now - data.windowStart >= windowMs) {
      tx.set(ref, {
        windowStart: now,
        members: [member],
        updatedAt: now,
        expiresAt: expiry(now, windowMs),
      });
      return { ok: true };
    }
    if (members.includes(member)) return { ok: true };
    if (members.length >= limit) {
      return { ok: false, retryAfterSeconds: retryAfter(data.windowStart, windowMs, now) };
    }
    tx.update(ref, { members: [...members, member], updatedAt: now });
    return { ok: true };
  });
}

/** Rate-limit keys never store a raw address. */
export function ipKey(ip: string | null, scope = ""): string {
  const digest = createHash("sha256")
    .update(ip ?? "unknown")
    .digest("hex")
    .slice(0, 32);
  return scope ? `ip:${digest}:${scope}` : `ip:${digest}`;
}
