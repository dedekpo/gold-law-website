import Image from "next/image";
import BadgesRow from "@/components/BadgesRow";
import CheckList from "@/components/CheckList";
import PageBanner from "@/components/PageBanner";
import TcpaViolations from "@/components/TcpaViolations";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "Meet Christopher Gold, founder of Gold Law, P.A. — a Miami Beach consumer protection firm fighting robocalls, debt collector harassment, false advertising, and data breaches.",
  path: "/about-us",
});

export default function AboutUsPage() {
  return (
    <>
      <PageBanner title="About Us" subtitle="“We Are A Leading Law Firm”" />

      {/* About Attorney Chris Gold */}
      <section className="relative bg-crimson">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div className="relative">
              <Image
                src="/images/chris-gold-about.jpg"
                alt="Attorney Chris Gold"
                width={900}
                height={1350}
                className="w-full max-w-xl rounded object-cover"
              />
              <div className="mx-auto -mt-16 relative max-w-sm border-4 border-red-button/80 bg-white p-6 text-center">
                <h3 className="font-serif text-xl font-semibold text-navy-deep">
                  “Top 40 Under 40” Plaintiff Attorney (NTL, 2024)
                </h3>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-serif text-xl font-semibold text-gold">About Company</h3>
              <h2 className="mb-5 font-serif text-4xl lg:text-[46px] font-semibold leading-tight text-white">
                One of “Florida’s Most Effective Attorneys” (DBR, 2020)
              </h2>
              <p className="mb-8 text-[15px] leading-relaxed text-white">
                I’m Attorney Chris Gold, and for over 14 years, I’ve taken on large corporations on
                behalf of consumers just like you. Before I started my own firm, I was involved in
                some of the most complex class actions against some of the country’s largest
                corporations. For example, I was part of the small team of lawyers that secured a
                massive <strong>$650 million recovery against Facebook</strong> for illegally
                collecting its users’ facial recognition data. Over the years, I’ve recovered
                hundreds of millions of dollars for my clients.
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
              <div className="flex flex-wrap items-center gap-6 rounded bg-white p-6 lg:mr-20">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-navy-deep">Chris Gold</h3>
                  <p className="text-sm leading-relaxed">
                    350 Lincoln Rd., 2nd Floor
                    <br />
                    Miami Beach, FL 33139
                    <br />
                    (305) 900-GOLD (4653)
                  </p>
                </div>
                <Image
                  src="/images/logo-card.png"
                  alt="Gold Law"
                  width={300}
                  height={83}
                  className="h-14 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compensation banner */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg-cta.jpg)" }}
      >
        <div className="absolute inset-0 bg-navy/[0.72]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 lg:py-32 text-center">
          <h2 className="font-sans text-4xl lg:text-[49px] font-bold leading-tight text-gold">
            Hundreds of Millions in Compensation Recovered!
          </h2>
        </div>
      </section>

      <TcpaViolations background="crimson" />

      <BadgesRow />
    </>
  );
}
