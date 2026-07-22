"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CaretDownIcon,
  EnvelopeIcon,
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  LinkedinIcon,
  MapMarkerIcon,
  PhoneIcon,
  TwitterIcon,
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
  { label: "Facebook", Icon: FacebookIcon },
  { label: "Twitter", Icon: TwitterIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "Google", Icon: GoogleIcon },
  { label: "LinkedIn", Icon: LinkedinIcon },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePracticeOpen, setMobilePracticeOpen] = useState(false);

  const navLink = (href: string) =>
    `font-medium text-[15px] uppercase tracking-wide transition-colors hover:text-red ${
      pathname === href ? "text-red" : "text-navy-deep"
    }`;

  return (
    <header className="relative z-50">
      {/* Top bar */}
      <div className="bg-navy text-white text-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <li className="flex items-center gap-2">
              <EnvelopeIcon className="h-3.5 w-3.5 text-red" />
              <a href="mailto:info@chrisgoldlaw.com" className="hover:text-red transition-colors">
                info@chrisgoldlaw.com
              </a>
            </li>
            <li className="hidden sm:flex items-center gap-2">
              <MapMarkerIcon className="h-3.5 w-3.5 text-red" />
              <span>350 Lincoln Rd., 2nd Floor Miami Beach, FL 33139</span>
            </li>
          </ul>
          <ul className="hidden md:flex items-center gap-4">
            {socials.map(({ label, Icon }) => (
              <li key={label}>
                <a href="#" aria-label={label} className="hover:text-red transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between gap-6 py-4">
          <Link href="/" className="shrink-0">
            <Image
              src="/images/logo.png"
              alt="Gold Law – Consumer Attorneys"
              width={240}
              height={84}
              priority
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
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
              <div className="absolute left-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <ul className="w-80 bg-white shadow-xl border-t-2 border-red py-2">
                  {practiceAreas.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block px-5 py-2.5 text-sm text-navy-deep hover:text-red transition-colors"
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
            className="hidden xl:flex items-center gap-3 border-l border-gray-200 pl-6"
          >
            <PhoneIcon className="h-8 w-8 text-red -scale-x-100" />
            <span>
              <span className="block text-sm text-muted">Contact us for a FREE case review</span>
              <span className="block text-xl font-semibold text-navy-deep">
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
            className="lg:hidden flex flex-col justify-center gap-1.5 h-11 w-11 items-center rounded border border-gray-200"
          >
            <span className="block h-0.5 w-6 bg-navy-deep" />
            <span className="block h-0.5 w-6 bg-navy-deep" />
            <span className="block h-0.5 w-6 bg-navy-deep" />
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4">
            <Link href="/" className="block py-3 text-navy-deep font-medium" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link
              href="/about-us"
              className="block py-3 text-navy-deep font-medium border-t border-gray-100"
              onClick={() => setMobileOpen(false)}
            >
              About Us
            </Link>
            <div className="border-t border-gray-100">
              <div className="flex items-center justify-between">
                <Link
                  href="/practice-area"
                  className="block py-3 text-navy-deep font-medium"
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
                    className={`h-3.5 w-3.5 text-navy-deep transition-transform ${mobilePracticeOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
              {mobilePracticeOpen && (
                <ul className="pl-4 pb-2">
                  {practiceAreas.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block py-2 text-sm text-muted"
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
              className="block py-3 text-navy-deep font-medium border-t border-gray-100"
              onClick={() => setMobileOpen(false)}
            >
              Contact Us
            </Link>
            <a
              href="tel:+13059004653"
              className="mt-2 flex items-center gap-3 rounded bg-navy px-4 py-3 text-white"
            >
              <PhoneIcon className="h-5 w-5 text-red -scale-x-100" />
              (305) 900-GOLD(4653)
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
