import Link from "next/link";
import PageBanner from "./PageBanner";

type ArticleLayoutProps = {
  bannerTitle: string;
  bannerSubtitle?: string;
  children: React.ReactNode;
  showCta?: boolean;
};

/* Shared layout for practice-area detail pages and the legal pages:
   banner + prose-style article + contact CTA. */
export default function ArticleLayout({
  bannerTitle,
  bannerSubtitle,
  children,
  showCta = true,
}: ArticleLayoutProps) {
  return (
    <>
      <PageBanner title={bannerTitle} subtitle={bannerSubtitle} />
      <article className="mx-auto max-w-5xl px-4 py-16 lg:py-20 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-3xl lg:[&_h2]:text-[38px] [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-ink [&_h2:first-child]:mt-0 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_strong]:text-ink">
        {children}
        {showCta && (
          <div className="mt-10">
            <Link
              href="/contact-us"
              className="inline-block rounded-sm bg-gold px-9 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink-deep transition-colors hover:bg-gold-pale"
            >
              Contact us for a FREE case review
            </Link>
          </div>
        )}
      </article>
    </>
  );
}
