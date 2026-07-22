import ContactSection from "@/components/ContactSection";
import PageBanner from "@/components/PageBanner";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Contact Gold Law for a FREE case review. Call (305) 900-GOLD or send us a message about unwanted calls or texts, debt collector harassment, false advertising, or data breaches.",
  path: "/contact-us",
});

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
