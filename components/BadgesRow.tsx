import Image from "next/image";

const badges = [
  { src: "/images/badge-ntl-top40.png", alt: "National Trial Lawyers Top 40 Under 40" },
  { src: "/images/badge-super-lawyers.png", alt: "Super Lawyers" },
  { src: "/images/badge-avvo-1.png", alt: "Avvo Rating" },
  { src: "/images/badge-avvo-2.png", alt: "Avvo Clients' Choice" },
];

export default function BadgesRow() {
  return (
    <section
      className="relative bg-cover bg-center"
      style={{ backgroundImage: "url(/images/bg-badges.jpg)" }}
    >
      <div className="absolute inset-0 bg-crimson/[0.72]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-2 items-center justify-items-center gap-8 md:grid-cols-4">
          {badges.map((badge) => (
            <Image
              key={badge.src}
              src={badge.src}
              alt={badge.alt}
              width={200}
              height={200}
              className="h-28 w-auto object-contain md:h-32"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
