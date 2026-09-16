import PageBanner from "@/components/PageBanner";

type NoticeCardProps = {
  bannerTitle: string;
  bannerSubtitle?: string;
  title: string;
  children: React.ReactNode;
};

/** Full-page notice (not found, unavailable, …) with the office's contact details. */
export default function NoticeCard({ bannerTitle, bannerSubtitle, title, children }: NoticeCardProps) {
  return (
    <>
      <PageBanner title={bannerTitle} subtitle={bannerSubtitle} />
      <section className="bg-bone">
        <div className="mx-auto max-w-3xl px-4 py-16 lg:py-24">
          <div className="rounded-sm border border-bone-dark bg-white p-8">
            <h2 className="font-serif text-2xl font-semibold text-ink">{title}</h2>
            <div className="mt-3 text-base leading-relaxed text-muted">{children}</div>
            <p className="mt-6 text-sm leading-relaxed text-muted">
              Call us at{" "}
              <a href="tel:+13059004653" className="font-medium text-ink hover:text-gold-deep">
                (305) 900-GOLD (4653)
              </a>{" "}
              or email{" "}
              <a href="mailto:info@chrisgoldlaw.com" className="font-medium text-ink hover:text-gold-deep">
                info@chrisgoldlaw.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
