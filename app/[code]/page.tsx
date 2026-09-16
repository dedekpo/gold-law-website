import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import NoticeCard from "@/components/NoticeCard";
import { normalizeCode, resolveEvidenceLink } from "@/lib/short-links";
import { consumeRateLimit, ipKey } from "@/lib/submissions/store";

/**
 * /<code> — the short evidence-submission link clients receive
 * (https://chrisgoldlaw.com/k7m2x). Forwards to /submissions/<contactId>.
 *
 * This dynamic segment sits at the site root, so it catches every path no
 * static page claims. Anything that is not a 5-symbol code goes straight to
 * the branded 404 without touching the database; real-looking codes are
 * rate-limited per IP before the lookup so the 33.5M-code space cannot be
 * enumerated cheaply. Temporary redirect on purpose: the destination may
 * change and browsers must not pin the old one.
 */

export const metadata: Metadata = {
  title: "Evidence Submission",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const LOOKUPS_PER_MINUTE_PER_IP = 30;
const MINUTE_MS = 60_000;

export default async function ShortLinkPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = normalizeCode(raw);
  if (!code) notFound();

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip");

  let contactId: string | null = null;
  let failure: "limited" | "unavailable" | null = null;
  try {
    const limit = await consumeRateLimit(ipKey(ip, "short"), LOOKUPS_PER_MINUTE_PER_IP, MINUTE_MS);
    if (!limit.ok) failure = "limited";
    else contactId = await resolveEvidenceLink(code);
  } catch (err) {
    console.error("[short-link] lookup failed", { code, err });
    failure = "unavailable";
  }

  // redirect() throws — keep it outside the try above.
  if (contactId) redirect(`/submissions/${contactId}`);
  if (!failure) notFound();

  return (
    <NoticeCard
      bannerTitle="Evidence Submission"
      bannerSubtitle="Secure client upload portal"
      title={
        failure === "limited"
          ? "Too many attempts from your connection."
          : "This page is temporarily unavailable."
      }
    >
      <p>
        {failure === "limited"
          ? "Please wait a minute and open the link you received from us again."
          : "We could not open your link just now. Please try again in a few minutes."}
      </p>
    </NoticeCard>
  );
}
