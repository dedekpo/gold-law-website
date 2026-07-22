type PageBannerProps = {
  title: string;
  subtitle?: string;
};

export default function PageBanner({ title, subtitle }: PageBannerProps) {
  return (
    <section
      className="relative bg-cover bg-center"
      style={{ backgroundImage: "url(/images/bg-about.jpg)" }}
    >
      <div className="absolute inset-0 bg-ink/92" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-24 text-center">
        <h1 className="font-serif text-5xl lg:text-[65px] font-semibold leading-none text-white">
          {title}
        </h1>
        <div className="mx-auto mt-6 h-px w-16 bg-gold" aria-hidden="true" />
        {subtitle && (
          <p className="mt-5 text-sm uppercase tracking-[0.22em] text-gold-pale/80">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
