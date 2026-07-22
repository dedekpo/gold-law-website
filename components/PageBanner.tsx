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
      <div className="absolute inset-0 bg-navy/90" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-24 text-center">
        <h1 className="font-serif text-5xl lg:text-[65px] font-semibold leading-none text-white">
          {title}
        </h1>
        {subtitle && <p className="mt-4 text-[17px] text-[#cccccc]">{subtitle}</p>}
      </div>
    </section>
  );
}
