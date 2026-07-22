import Image from "next/image";

const violations = [
  {
    number: "01",
    title: "Prerecorded or Artificial Voicemails",
    description:
      "It is illegal for any company to call you using a prerecorded message or artificial voice without your prior express written consent. If a company leaves you a voicemail using either a prerecorded message or artificial voice, send that evidence to us for a free case review. You could be entitled to $500 to $1,500 per call under the Telephone Consumer Protection Act, The Florida Telephone Solicitation Act, or other similar laws.",
  },
  {
    number: "02",
    title:
      "Marketing Voicemails or Text Messages to Telephone Numbers on the National Do Not Call Registry",
    description:
      "The TCPA created the National Do Not Call Registry to shield consumers from unwanted marketing messages. If you’re number is registered but you’re still receiving marketing calls and texts, you have the right to take legal action against the offenders. You can register or verify whether you’re already registered by visiting donotcall.gov.",
  },
  {
    number: "03",
    title: "Marketing Voicemails or Text Messages After You Asked Them to Stop",
    description:
      "When a business continues to contact you after you’ve explicitly asked them to stop, it’s a clear violation of the TCPA. These persistent communications are not only intrusive—they’re against the law.",
  },
  {
    number: "04",
    title: "Marketing Voicemails or Text Messages Between 9 p.m. and 8 a.m.",
    description:
      "Marketing communications during prohibited hours disrupt your life and violate TCPA regulations. Companies are obligated to respect your time and your rights, and we’re here to ensure they do.",
  },
];

export default function TcpaViolations({
  background = "navy",
}: {
  background?: "navy" | "crimson";
}) {
  return (
    <section
      className={
        background === "navy" ? "bg-navy-darkest bg-cover bg-center" : "bg-crimson"
      }
      style={background === "navy" ? { backgroundImage: "url(/images/bg-dark.jpg)" } : undefined}
    >
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <div className="bg-white px-6 py-14 lg:px-14 lg:pt-20 lg:pb-10">
          <h2 className="mb-8 font-serif text-4xl lg:text-[42px] font-semibold leading-tight text-navy-deep">
            What is Considered a TCPA Violation?
          </h2>
          <div>
            {violations.map((item) => (
              <div
                key={item.number}
                className="border-b border-black/10 py-6 first:pt-0 last:border-b-0"
              >
                <div className="mb-2 font-serif text-3xl font-bold text-red">{item.number}</div>
                <h3 className="mb-2 font-serif text-[22px] font-semibold leading-snug text-navy-deep">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white">
          <Image
            src="/images/chris-gold-office.jpg"
            alt="Attorney Chris Gold at his office"
            width={1000}
            height={1500}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
