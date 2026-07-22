import Image from "next/image";
import Link from "next/link";
import BadgesRow from "@/components/BadgesRow";
import CheckList from "@/components/CheckList";
import ContactSection from "@/components/ContactSection";
import PracticeAreaCards from "@/components/PracticeAreaCards";
import TcpaViolations from "@/components/TcpaViolations";
import {
  BalanceScaleIcon,
  GavelIcon,
  PhoneVolumeIcon,
  UserTieIcon,
} from "@/components/icons";

const highlights = [
  { Icon: UserTieIcon, title: "Expert Attorneys" },
  { Icon: GavelIcon, title: "Hundreds of Millions in Compensation Recovered" },
  { Icon: BalanceScaleIcon, title: "Complex Litigation Experience" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative flex min-h-[647px] items-center bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-hero.jpg)" }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-b from-ink-deep/80 via-ink/80 to-ink-deep/90"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.32em] text-gold">
            Miami Beach · Consumer Class Actions
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-tight text-white md:text-6xl lg:text-[72px]">
            Top Consumer Class Action Law Firm
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/80">
            Get $500 to $1,500 for each unwanted call or text message you receive—
            <br className="hidden md:block" />
            You pay nothing unless we win!
          </p>
          <Link
            href="/contact-us"
            className="mt-10 inline-block rounded-sm bg-gold px-10 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-ink-deep transition-colors hover:bg-gold-pale"
          >
            Contact us for a FREE case review
          </Link>
        </div>
      </section>

      {/* Highlights strip */}
      <section className="border-y border-gold/20 bg-ink-deep py-8">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3">
          {highlights.map(({ Icon, title }) => (
            <div key={title} className="flex items-center gap-4">
              <Icon className="h-10 w-10 shrink-0 text-gold" />
              <h3 className="font-serif text-xl font-semibold text-white">{title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* About Attorney Chris Gold */}
      <section
        className="relative bg-cover bg-right"
        style={{ backgroundImage: "url(/images/bg-about.jpg)" }}
      >
        <div className="absolute inset-0 bg-ink/[0.93]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <Image
              src="/images/chris-gold-portrait.jpg"
              alt="Attorney Chris Gold"
              width={900}
              height={1350}
              className="w-full max-w-xl rounded-sm object-cover"
            />
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                About Attorney Chris Gold
              </h3>
              <h2 className="font-serif text-3xl lg:text-[37px] font-semibold leading-tight text-white">
                One of “Florida’s Most Effective Attorneys” (DBR, 2020)
              </h2>
              <h2 className="mb-5 mt-2 font-serif text-3xl lg:text-[37px] font-semibold leading-tight text-white">
                “Top 40 Under 40” Plaintiff Attorney (NTL, 2024)
              </h2>
              <p className="mb-8 leading-relaxed text-white/70">
                I’m Attorney Chris Gold, and for over 14 years, I’ve taken on large corporations on
                behalf of consumers just like you. Before I started my own firm, I was involved in
                some of the most complex class actions against some of the country’s largest
                corporations. For example, I was part of the small team of lawyers that secured a
                massive{" "}
                <strong className="text-gold-pale">$650 million recovery against Facebook</strong>{" "}
                for illegally collecting its users’ facial recognition data. Over the years, I’ve
                recovered hundreds of millions of dollars for my clients.
              </p>
              <div className="mb-10 grid gap-6 sm:grid-cols-2">
                <CheckList
                  items={[
                    "Proven Track Record",
                    "Consumer Champion",
                    "Personalized Attention",
                    "Multilingual Communication",
                  ]}
                />
                <CheckList
                  items={["First-Generation Brazilian-American", "Brazilian Jiu-Jitsu Black Belt"]}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-6 rounded-sm border border-gold/30 bg-ink-deep p-6">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-gold-pale">Chris Gold</h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    350 Lincoln Rd., 2nd Floor
                    <br />
                    Miami Beach, FL 33139
                    <br />
                    (305) 900-GOLD (4653)
                  </p>
                </div>
                <Image
                  src="/images/gold-logo.jpg"
                  alt="Gold Law"
                  width={448}
                  height={144}
                  className="h-14 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* We are Consumer Lawyers */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-cta.jpg)" }}
      >
        <div className="absolute inset-0 bg-ink-deep/85" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pt-20 lg:pt-24">
          <div className="grid items-end gap-10 lg:grid-cols-2">
            <div className="pb-20 lg:pb-24">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                We are Consumer Lawyers
              </h3>
              <h2 className="mb-5 font-serif text-4xl lg:text-[46px] font-semibold leading-tight text-white">
                Protecting Your Privacy
              </h2>
              <p className="mb-8 text-white/70">
                Experienced TCPA Attorneys Committed to Defending Your Privacy
              </p>
              <h2 className="mb-10 font-serif text-3xl lg:text-[42px] font-semibold leading-tight text-gold-pale">
                Hundreds of Millions in Compensation Recovered!
              </h2>
              <a
                href="tel:+13059004653"
                className="inline-flex items-center gap-5 rounded-sm border border-gold/40 bg-ink-soft/80 px-8 py-6 transition-colors hover:border-gold"
              >
                <PhoneVolumeIcon className="h-10 w-10 text-gold" />
                <span>
                  <span className="block font-serif text-lg font-semibold text-white">
                    Our 24/7 Emergency Phone Services
                  </span>
                  <span className="block text-white/70">(305) 900-GOLD (4653)</span>
                </span>
              </a>
            </div>
            <div className="flex items-end justify-center">
              <Image
                src="/images/chris-gold-cutout.png"
                alt="Attorney Chris Gold"
                width={682}
                height={1024}
                className="w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      <PracticeAreaCards />

      <ContactSection />

      {/* Robocalls CTA */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-contact.jpg)" }}
      >
        <div className="absolute inset-0 bg-ink/[0.88]" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 className="font-serif text-4xl lg:text-[46px] font-semibold leading-tight text-white">
            Find Out How to Stop Robocalls in Miami – Contact Us Today!
          </h2>
          <p className="mt-5 text-white/70">
            Our Class Action lawyers in Miami aggressively tackle robocall offenders, getting you
            <br className="hidden md:block" />
            compensation from the companies responsible.
          </p>
          <Link
            href="/contact-us"
            className="mt-8 inline-block rounded-sm bg-gold px-10 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-ink-deep transition-colors hover:bg-gold-pale"
          >
            Submit a Case
          </Link>
        </div>
      </section>

      <TcpaViolations />

      <BadgesRow />
    </>
  );
}
