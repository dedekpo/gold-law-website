import Link from "next/link";
import PageBanner from "./PageBanner";

type ArticleLayoutProps = {
  bannerTitle: string;
  bannerSubtitle?: string;
  children: React.ReactNode;
  showCta?: boolean;
};

/* Shared layout for practice-area detail pages and the privacy policy:
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
      <article className="mx-auto max-w-5xl px-4 py-16 lg:py-20 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-3xl lg:[&_h2]:text-[40px] [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-navy-deep [&_h2:first-child]:mt-0 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_strong]:text-navy-deep">
        {children}
        {showCta && (
          <div className="mt-10">
            <Link
              href="/contact-us"
              className="inline-block rounded bg-red-button px-9 py-4 font-medium text-white transition-colors hover:bg-red-hover"
            >
              Contact us for a FREE case review
            </Link>
          </div>
        )}
      </article>
    </>
  );
}
