import { db } from "@/lib/firebase";
import { CONTACT_ID_RE } from "@/lib/submissions/shared";

/**
 * Short evidence-submission links: https://chrisgoldlaw.com/<code> forwards
 * to /submissions/<GHL contact id>. The backoffice mints the codes (webhook on
 * contact creation + backfill) and mirrors the URL onto the contact's
 * "Evidence Submission URL" custom field; the website only READS
 * `shortLinks/{code}` → { contactId, target: "evidence" }.
 *
 * Code format (kept in sync by hand with backoffice lib/evidence-links.ts):
 * 5 symbols from Crockford's base32 alphabet, lowercase — no i/l/o/u. A
 * client reading the link off a voicemail may still type I, L, O or capitals,
 * so lookups fold case and those look-alikes before validating.
 */

export const CODE_LENGTH = 5;
export const CODE_RE = /^[0-9abcdefghjkmnpqrstvwxyz]{5}$/;

const LOOKALIKES: Record<string, string> = { i: "1", l: "1", o: "0" };

/** Lowercase and fold look-alikes; returns null unless the result is a valid code. */
export function normalizeCode(raw: string): string | null {
  const folded = raw
    .trim()
    .toLowerCase()
    .replace(/[ilo]/g, (ch) => LOOKALIKES[ch]);
  return CODE_RE.test(folded) ? folded : null;
}

/** The GHL contact id behind a code, or null when the code is unknown. Throws on a Firestore failure. */
export async function resolveEvidenceLink(code: string): Promise<string | null> {
  const snap = await db().collection("shortLinks").doc(code).get();
  if (!snap.exists) return null;
  const data = snap.data() as { contactId?: unknown; target?: unknown };
  if (data.target !== "evidence") return null;
  if (typeof data.contactId !== "string" || !CONTACT_ID_RE.test(data.contactId)) return null;
  return data.contactId;
}
