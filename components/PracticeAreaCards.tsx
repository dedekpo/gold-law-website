import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "./icons";

const cards = [
  {
    href: "/unwanted-calls-and-text-messages-tcpa-violations",
    image: "/images/practice-tcpa.jpg",
    title: "Unwanted Calls and Text Messages (TCPA Violations)",
    description:
      "At Gold Law, we stand up for consumers harassed by unsolicited calls, robocalls, and text messages under the Telephone Consumer Protection Act (TCPA)",
  },
  {
    href: "/debt-collector-harassment-fdcpa-violations",
    image: "/images/practice-fdcpa.jpg",
    title: "Debt Collector Harassment (FDCPA Violations)",
    description:
      "Gold Law is passionate about defending consumers from abusive debt collection practices under the Fair Debt Collection Practices Act (FDCPA)",
  },
  {
    href: "/false-advertising",
    image: "/images/practice-false-advertising.jpg",
    title: "False Advertising",
    description:
      "False advertising is unfair and can deceive consumers and lead to financial losses, disappointment, and other hardships. Gold Law is here to fight for those who’ve been misled by deceptive marketing and advertising tactics. Whether a product didn’t deliver on its promise",
  },
  {
    href: "/data-breaches",
    image: "/images/practice-data-breaches.jpg",
    title: "Data Breaches",
    description:
      "When businesses fail to protect your personal information, it can lead to significant financial and emotional distress. Data breaches expose sensitive details like credit card numbers, social security numbers, and personal identifiers, putting your privacy and security at risk",
  },
];

function PracticeCard({ card }: { card: (typeof cards)[number] }) {
  return (
    <article className="flex h-full flex-col rounded border-[3px] border-red/20 bg-navy p-8 pb-10">
      <Image
        src={card.image}
        alt={card.title}
        width={640}
        height={420}
        className="mb-5 w-full rounded object-cover aspect-[3/2]"
      />
      <h3 className="mb-3 text-center font-serif text-[22px] font-semibold leading-snug text-gold">
        {card.title}
      </h3>
      <p className="mb-6 text-center text-sm leading-relaxed text-white/80">{card.description}</p>
      <div className="mt-auto text-center">
        <Link
          href={card.href}
          className="inline-flex items-center gap-2 rounded bg-red px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-red-hover"
        >
          <ArrowRightIcon className="h-3.5 w-3.5" />
          Read More
        </Link>
      </div>
    </article>
  );
}

export default function PracticeAreaCards() {
  return (
    <section
      className="relative bg-cover bg-center"
      style={{ backgroundImage: "url(/images/bg-practice.jpg)" }}
    >
      <div className="absolute inset-0 bg-crimson/[0.77]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:py-24">
        <h3 className="mb-2 text-center font-serif text-xl font-semibold text-gold">
          Areas of Practice
        </h3>
        <h2 className="mx-auto mb-12 max-w-4xl text-center font-serif text-4xl lg:text-[44px] font-semibold leading-tight text-white">
          We Are Here To Fight Against Harassing Telemarketers and Debt Collectors
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cards.slice(0, 3).map((card) => (
            <PracticeCard key={card.href} card={card} />
          ))}
        </div>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3">
          <PracticeCard card={cards[3]} />
        </div>
      </div>
    </section>
  );
}
