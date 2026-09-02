import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import SubmissionPortal from "@/components/submissions/SubmissionPortal";
import { ClockIcon, PhoneIcon, ShieldIcon } from "@/components/submissions/icons";
import { CONTACT_ID_RE, LIMITS } from "@/lib/submissions/shared";
import { contactSummary } from "@/lib/submissions/store";

/**
 * /submissions/[contactId] — the link a client receives to send us evidence.
 * Private by design: not indexed, not linked from the site, and only
 * meaningful with a GHL contact id.
 */

export const metadata: Metadata = {
  title: "Evidence Submission",
  description: "Securely send Gold Law the screenshots and recordings related to your matter.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const tips = [
  "Upload the original files from your device. Screenshots forwarded through messaging apps are often re-compressed and lose their date information.",
  "Each file is stored exactly as it exists on your device, so the details embedded in it are preserved.",
  "You will be asked to confirm the date each screenshot or recording was taken.",
  `You may send up to ${LIMITS.maxFilesPerContact} files. Long screen recordings are supported.`,
];

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  if (!CONTACT_ID_RE.test(contactId)) notFound();

  let previouslyReceived: number | null = null;
  try {
    previouslyReceived = (await contactSummary(contactId))?.fileCount ?? 0;
  } catch (err) {
    console.error("[submissions:page] could not read contact summary", err);
  }

  return (
    <>
      <PageBanner title="Evidence Submission" subtitle="Secure client upload portal" />

      <section className="bg-bone">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted">
                Use this page to send Gold Law, P.A. the screenshots, screen recordings, and
                voicemail recordings related to your matter. Files are transmitted over an
                encrypted connection and stored exactly as they exist on your device, so the
                original date and time information they contain is preserved for the
                investigation.
              </p>
              <SubmissionPortal contactId={contactId} previouslyReceived={previouslyReceived} />
            </div>

            <aside className="space-y-6">
              <div className="rounded-sm border border-gold/30 bg-ink p-6 text-white/75">
                <h3 className="mb-4 flex items-center gap-3 font-serif text-xl font-semibold text-gold-pale">
                  <ClockIcon className="h-6 w-6 text-gold" />
                  Before you upload
                </h3>
                <ul className="space-y-3 text-sm leading-relaxed">
                  {tips.map((tip) => (
                    <li key={tip} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-sm border border-bone-dark bg-white p-6">
                <h3 className="mb-3 flex items-center gap-3 font-serif text-xl font-semibold text-ink">
                  <ShieldIcon className="h-6 w-6 text-gold-deep" />
                  Your privacy
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  Everything you send here is confidential and used solely for the evaluation and
                  prosecution of your claim. See our{" "}
                  <Link href="/privacy-policy" className="text-gold-deep underline hover:no-underline">
                    Privacy Policy
                  </Link>{" "}
                  for details on how we handle your information.
                </p>
              </div>

              <div className="rounded-sm border border-bone-dark bg-white p-6">
                <h3 className="mb-3 flex items-center gap-3 font-serif text-xl font-semibold text-ink">
                  <PhoneIcon className="h-6 w-6 text-gold-deep" />
                  Questions?
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  Call us at{" "}
                  <a href="tel:+13059004653" className="font-medium text-ink hover:text-gold-deep">
                    (305) 900-GOLD (4653)
                  </a>{" "}
                  or email{" "}
                  <a
                    href="mailto:info@chrisgoldlaw.com"
                    className="font-medium text-ink hover:text-gold-deep"
                  >
                    info@chrisgoldlaw.com
                  </a>
                  .
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
