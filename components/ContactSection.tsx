import ContactForm from "./ContactForm";
import { PhoneVolumeIcon } from "./icons";

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
        className="relative bg-ink bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-dark.jpg)" }}
      >
        <div className="absolute inset-0 bg-ink/90" aria-hidden="true" />
        <div className="relative px-6 py-16 lg:px-14 lg:py-24 lg:ml-auto lg:max-w-2xl">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            {overline}
          </h3>
          <h2 className="mb-5 font-serif text-4xl lg:text-[42px] font-semibold leading-tight text-white">
            {title}
          </h2>
          <p className="mb-10 text-white/60">
            Our legal team specializes in Telephone Consumer Protection Act cases and Fair Debt
            Collection Practices Act cases, and we&rsquo;re here to help you get compensation from
            harassing telemarketers and debt collectors
          </p>
          <a href="tel:+13059004653" className="group flex items-center gap-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold/50 transition-colors group-hover:bg-gold">
              <PhoneVolumeIcon className="h-7 w-7 text-gold transition-colors group-hover:text-ink-deep" />
            </span>
            <span>
              <span className="block font-serif text-xl font-semibold text-gold-pale">
                Have Any Questions?
              </span>
              <span className="text-white">(305) 900-GOLD (4653)</span>
            </span>
          </a>
        </div>
      </div>

      {/* Form panel */}
      <div className="bg-bone">
        <div className="px-6 py-16 lg:px-14 lg:py-24 lg:mr-auto lg:max-w-2xl">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
