import type { Metadata } from "next";
import Image from "next/image";
import NewsletterForm from "@/components/NewsletterForm";
import PageBanner from "@/components/PageBanner";
import PracticeAreaCards from "@/components/PracticeAreaCards";
import { UserTieIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Practice Area",
};

export default function PracticeAreaPage() {
  return (
    <>
      <PageBanner title="Practice Areas" />

      <PracticeAreaCards />

      {/* New Case */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-cta.jpg)" }}
      >
        <div className="absolute inset-0 bg-navy/80" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pt-14 lg:pt-0">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="pb-14 lg:py-24 order-2 lg:order-1">
              <h3 className="mb-2 font-serif text-xl font-semibold text-red-button">New Case?</h3>
              <h2 className="mb-5 font-serif text-4xl lg:text-[46px] font-semibold leading-tight text-white">
                Contact us for a Free Case Review
              </h2>
              <p className="mb-10 text-[#cccccc]">
                Our legal team specializes in Telephone Consumer Protection Act cases and Fair Debt
                Collection Practices Act cases, and we&rsquo;re here to help you get compensation
                from harassing telemarketers and debt collectors
              </p>
              <div className="flex items-center gap-4">
                <UserTieIcon className="h-12 w-12 shrink-0 text-red-button" />
                <div>
                  <h3 className="font-serif text-xl font-semibold text-white">Expert Attorneys</h3>
                  <p className="text-white/80">(305) 900-GOLD(4653)</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex items-end justify-center">
              <Image
                src="/images/chris-gold-practice.jpg"
                alt="Attorney Chris Gold"
                width={800}
                height={1200}
                className="w-full max-w-md rounded object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-crimson">
        <div className="mx-auto max-w-3xl px-4 py-16 lg:py-20 text-center">
          <h3 className="mb-2 font-serif text-xl font-semibold text-gold">Newsletter</h3>
          <h2 className="mb-5 font-serif text-4xl lg:text-[44px] font-semibold leading-tight text-white">
            Subscribe to Our Newsletter
          </h2>
          <p className="mb-8 text-[15px] text-white">
            Our lawyers aggressively tackle robocalls and debt collectors, ensuring your rights are
            protected and getting you the compensation you deserve.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
