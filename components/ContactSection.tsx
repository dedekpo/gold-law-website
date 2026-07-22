import Image from "next/image";
import ContactForm from "./ContactForm";

type ContactSectionProps = {
  overline?: string;
  title?: string;
};

export default function ContactSection({
  overline = "New Case?",
  title = "Contact Us for a Free Case Review",
}: ContactSectionProps) {
  return (
    <section className="grid lg:grid-cols-2">
      {/* Dark info panel */}
      <div
        className="relative bg-navy-deep bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-dark.jpg)" }}
      >
        <div className="absolute inset-0 bg-navy-deep/80" aria-hidden="true" />
        <div className="relative px-6 py-16 lg:px-14 lg:py-24 lg:ml-auto lg:max-w-2xl">
          <h3 className="mb-2 font-serif text-xl font-semibold text-red-button">{overline}</h3>
          <h2 className="mb-5 font-serif text-4xl lg:text-[42px] font-semibold leading-tight text-white">
            {title}
          </h2>
          <p className="mb-10 text-[#cccccc]">
            Our legal team specializes in Telephone Consumer Protection Act cases and Fair Debt
            Collection Practices Act cases, and we&rsquo;re here to help you get compensation from
            harassing telemarketers and debt collectors
          </p>
          <div className="flex items-center gap-4">
            <Image
              src="/images/phone-badge.png"
              alt=""
              width={75}
              height={75}
              className="h-[75px] w-[75px]"
            />
            <div>
              <h3 className="font-serif text-xl font-semibold text-red">Have Any Questions?</h3>
              <p className="text-white">(305) 900-GOLD (4653)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div
        className="bg-white bg-repeat"
        style={{ backgroundImage: "url(/images/bg-pattern.png)" }}
      >
        <div className="px-6 py-16 lg:px-14 lg:py-24 lg:mr-auto lg:max-w-2xl">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
