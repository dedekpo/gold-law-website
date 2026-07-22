"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CaretDownIcon,
  EnvelopeIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  MapMarkerIcon,
  PhoneIcon,
} from "./icons";

const practiceAreas = [
  {
    href: "/unwanted-calls-and-text-messages-tcpa-violations",
    label: "Unwanted Calls and Text Messages (TCPA Violations)",
  },
  {
    href: "/debt-collector-harassment-fdcpa-violations",
    label: "Debt Collector Harassment (FDCPA Violations)",
  },
  { href: "/false-advertising", label: "False Advertising" },
  { href: "/data-breaches", label: "Data Breaches" },
];

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61560217118796",
    Icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/gold_standard_law/",
    Icon: InstagramIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/chrisgoldlaw/",
    Icon: LinkedinIcon,
  },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePracticeOpen, setMobilePracticeOpen] = useState(false);

  const navLink = (href: string) =>
    `text-[13px] font-medium uppercase tracking-[0.18em] transition-colors hover:text-gold ${
      pathname === href ? "text-gold" : "text-white/80"
    }`;

  return (
    <header className="relative z-50 bg-ink-deep">
      {/* Top bar */}
      <div className="border-b border-white/10 text-sm text-white/60">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <li className="flex items-center gap-2">
              <EnvelopeIcon className="h-3.5 w-3.5 text-gold" />
              <a href="mailto:info@chrisgoldlaw.com" className="hover:text-gold transition-colors">
                info@chrisgoldlaw.com
              </a>
            </li>
            <li className="hidden sm:flex items-center gap-2">
              <MapMarkerIcon className="h-3.5 w-3.5 text-gold" />
              <span>350 Lincoln Rd., 2nd Floor Miami Beach, FL 33139</span>
            </li>
          </ul>
          <ul className="hidden md:flex items-center gap-4">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="hover:text-gold transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-gold/25">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between gap-6 py-4">
          <Link href="/" className="shrink-0">
            <Image
              src="/images/gold-logo.jpg"
              alt="Gold Law – Consumer Attorneys"
              width={448}
              height={144}
              priority
              className="h-12 w-auto lg:h-14"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-9">
            <Link href="/" className={navLink("/")}>
              Home
            </Link>
            <Link href="/about-us" className={navLink("/about-us")}>
              About Us
            </Link>
            <div className="relative group">
              <Link
                href="/practice-area"
                className={`${navLink("/practice-area")} inline-flex items-center gap-1.5`}
              >
                Practice Areas
                <CaretDownIcon className="h-3 w-3" />
              </Link>
              <div className="absolute left-0 top-full pt-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <ul className="w-80 bg-ink-soft border-t-2 border-gold py-2 shadow-2xl shadow-black/60">
                  {practiceAreas.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block px-5 py-2.5 text-sm text-white/80 hover:text-gold transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link href="/contact-us" className={navLink("/contact-us")}>
              Contact Us
            </Link>
          </nav>

          {/* Phone */}
          <a
            href="tel:+13059004653"
            className="hidden xl:flex items-center gap-3 border-l border-white/10 pl-6"
          >
            <PhoneIcon className="h-7 w-7 text-gold -scale-x-100" />
            <span>
              <span className="block text-xs uppercase tracking-[0.14em] text-white/50">
                Free case review
              </span>
              <span className="block text-lg font-semibold text-gold-pale">
                (305) 900-GOLD(4653)
              </span>
            </span>
          </a>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden flex flex-col justify-center gap-1.5 h-11 w-11 items-center rounded-sm border border-white/20"
          >
            <span className="block h-0.5 w-6 bg-gold" />
            <span className="block h-0.5 w-6 bg-gold" />
            <span className="block h-0.5 w-6 bg-gold" />
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-white/10 bg-ink-deep px-4 pb-4">
            <Link
              href="/"
              className="block py-3 text-white/90 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about-us"
              className="block py-3 text-white/90 font-medium border-t border-white/10"
              onClick={() => setMobileOpen(false)}
            >
              About Us
            </Link>
            <div className="border-t border-white/10">
              <div className="flex items-center justify-between">
                <Link
                  href="/practice-area"
                  className="block py-3 text-white/90 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Practice Areas
                </Link>
                <button
                  type="button"
                  aria-label="Toggle practice areas submenu"
                  aria-expanded={mobilePracticeOpen}
                  onClick={() => setMobilePracticeOpen((v) => !v)}
                  className="p-3"
                >
                  <CaretDownIcon
                    className={`h-3.5 w-3.5 text-gold transition-transform ${mobilePracticeOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
              {mobilePracticeOpen && (
                <ul className="pl-4 pb-2">
                  {practiceAreas.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block py-2 text-sm text-white/60"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link
              href="/contact-us"
              className="block py-3 text-white/90 font-medium border-t border-white/10"
              onClick={() => setMobileOpen(false)}
            >
              Contact Us
            </Link>
            <a
              href="tel:+13059004653"
              className="mt-2 flex items-center gap-3 rounded-sm border border-gold/40 px-4 py-3 text-gold-pale"
            >
              <PhoneIcon className="h-5 w-5 text-gold -scale-x-100" />
              (305) 900-GOLD(4653)
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
