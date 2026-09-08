import { contactVerifiedAt, markContactVerified } from "@/lib/submissions/store";

/**
 * The one thing the website asks GoHighLevel: does this contact exist in our
 * location? A submission link is /submissions/<contactId>, unauthenticated by
 * design, so an id GHL does not know must not be allowed to fill the bucket.
 *
 * Auth is the same Private Integration token the backoffice uses
 * (GO_HIGH_LEVEL_TOKEN + GO_HIGH_LEVEL_LOCATION_ID). A confirmed contact is
 * remembered on `submissions/{contactId}.ghlVerifiedAt` so the sign endpoint
 * does not hit GHL on every file; the page re-checks after a week.
 */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";
const VERIFIED_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type ContactCheck =
  /** GHL knows the contact (in our location). */
  | "ok"
  /** GHL has no such contact — the link is not valid. */
  | "missing"
  /** GHL could not be asked (outage, misconfiguration); nothing is known. */
  | "unknown";

function credentials(): { token: string; locationId: string } | null {
  const token = process.env.GO_HIGH_LEVEL_TOKEN?.trim();
  const locationId = process.env.GO_HIGH_LEVEL_LOCATION_ID?.trim();
  return token && locationId ? { token, locationId } : null;
}

/** Ask GHL directly; never throws. */
async function lookupContact(contactId: string): Promise<ContactCheck> {
  const creds = credentials();
  if (!creds) {
    console.error("[submissions:ghl] GO_HIGH_LEVEL_TOKEN / GO_HIGH_LEVEL_LOCATION_ID not set");
    return "unknown";
  }
  try {
    const res = await fetch(`${GHL_BASE_URL}/contacts/${encodeURIComponent(contactId)}`, {
      headers: {
        Authorization: `Bearer ${creds.token}`,
        Version: GHL_API_VERSION,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    // 404: no such contact. 400: GHL rejects the id's shape outright.
    if (res.status === 404 || res.status === 400) return "missing";
    if (!res.ok) {
      console.error(`[submissions:ghl] contact lookup failed with ${res.status}`, { contactId });
      return "unknown";
    }
    const body = (await res.json()) as { contact?: { id?: string; locationId?: string } };
    const contact = body.contact;
    if (!contact?.id) return "missing";
    // A contact from another sub-account is not ours to collect evidence for.
    if (contact.locationId && contact.locationId !== creds.locationId) return "missing";
    return "ok";
  } catch (err) {
    console.error("[submissions:ghl] contact lookup errored", err);
    return "unknown";
  }
}

/**
 * Verify a submission link's contact, using the cached confirmation when it is
 * fresh. A GHL outage never invalidates a contact that was confirmed before.
 */
export async function verifyContact(contactId: string): Promise<ContactCheck> {
  let cached: string | null = null;
  try {
    cached = await contactVerifiedAt(contactId);
  } catch (err) {
    console.error("[submissions:ghl] could not read the cached verification", err);
  }
  if (cached && Date.now() - Date.parse(cached) < VERIFIED_TTL_MS) return "ok";

  const result = await lookupContact(contactId);
  if (result === "ok") {
    try {
      await markContactVerified(contactId);
    } catch (err) {
      console.error("[submissions:ghl] could not cache the verification", err);
    }
  }
  // GHL unreachable but the contact was confirmed once: trust the old record.
  if (result === "unknown" && cached) return "ok";
  return result;
}
