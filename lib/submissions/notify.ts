import { fetchContactProfile } from "@/lib/ghl";
import { db } from "@/lib/firebase";
import { recordNotification } from "@/lib/submissions/store";

/**
 * Tell the office a client has sent evidence — once per submission session.
 *
 * The decision of WHEN is made in store.ts (markUploaded): the first file of
 * a session, determined transactionally, is the only one that gets here. This
 * module only builds the payload and POSTs it to a GoHighLevel "Inbound
 * Webhook" workflow trigger (GHL_EVIDENCE_WEBHOOK_URL), the same mechanism the
 * contact form uses. The workflow — not this code — posts to Slack, so the
 * message wording lives in GHL where the team can change it.
 *
 * Payload fields are flat strings so the workflow can merge them as
 * {{inboundWebhookRequest.<field>}}. `email` and `phone` are sent exactly as
 * GHL holds them so the trigger matches the existing contact rather than
 * creating a duplicate.
 *
 * Never throws: a webhook outage must not fail the client's upload. The
 * outcome is written to submissions/{contactId} (lastNotifiedAt /
 * lastNotifyError) so a silent Slack channel can be diagnosed.
 */

const WEBHOOK_TIMEOUT_MS = 8000;

function backofficeBaseUrl(): string {
  return (
    process.env.BACKOFFICE_BASE_URL ?? "https://gold-law-backoffice-production.up.railway.app"
  ).replace(/\/+$/, "");
}

/** The contact's short portal link (minted by the backoffice), if it has one. */
async function shortSubmissionUrl(contactId: string): Promise<string | null> {
  try {
    const snap = await db().collection("evidenceLinks").doc(contactId).get();
    const url = snap.exists ? (snap.data() as { url?: unknown }).url : null;
    return typeof url === "string" ? url : null;
  } catch {
    return null;
  }
}

export type EvidenceNotification = {
  event: "evidence_submitted";
  contactId: string;
  contactName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Uploaded files from this contact, all sessions, after this one. */
  fileCount: string;
  /** How many times this contact has sent evidence (sessions). */
  sessionCount: string;
  reviewUrl: string;
  submissionUrl: string;
  receivedAt: string;
};

export async function notifyNewEvidence(
  contactId: string,
  info: { fileCount: number; sessionCount?: number },
): Promise<void> {
  const endpoint = process.env.GHL_EVIDENCE_WEBHOOK_URL?.trim();
  if (!endpoint) {
    console.warn("[submissions:notify] GHL_EVIDENCE_WEBHOOK_URL is not set — office not notified", {
      contactId,
    });
    return;
  }

  try {
    const [profile, submissionUrl] = await Promise.all([
      fetchContactProfile(contactId),
      shortSubmissionUrl(contactId),
    ]);
    const payload: EvidenceNotification = {
      event: "evidence_submitted",
      contactId,
      contactName: profile?.name ?? contactId,
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      fileCount: String(info.fileCount),
      sessionCount: String(info.sessionCount ?? ""),
      reviewUrl: `${backofficeBaseUrl()}/evidence?contact=${encodeURIComponent(contactId)}`,
      submissionUrl: submissionUrl ?? `https://www.chrisgoldlaw.com/submissions/${contactId}`,
      receivedAt: new Date().toISOString(),
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`GHL webhook returned ${res.status}`);
    await recordNotification(contactId, { ok: true });
    console.log("[submissions:notify] office notified", { contactId, fileCount: info.fileCount });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[submissions:notify] failed", { contactId, error });
    await recordNotification(contactId, { ok: false, error }).catch(() => {});
  }
}
