import type { Metadata } from "next";
import ContactSection from "@/components/ContactSection";
import PageBanner from "@/components/PageBanner";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default function ContactUsPage() {
  return (
    <>
      <PageBanner title="Contact us for a FREE case review" />

      <ContactSection
        overline="Contact Us"
        title="Have You Been Harassed by Unwanted Calls or Texts?"
      />

      {/* Map */}
      <iframe
        title="Gold Law office location – 350 Lincoln Rd, Miami Beach, FL 33139"
        src="https://www.google.com/maps?q=350+Lincoln+Rd,+Miami+Beach,+FL+33139&output=embed"
        className="h-[450px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </>
  );
}
