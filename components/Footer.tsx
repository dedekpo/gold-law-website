import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "./icons";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
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

export default function Footer() {
  return (
    <footer
      className="relative bg-ink-deep bg-cover bg-center text-white/60"
      style={{ backgroundImage: "url(/images/bg-footer.jpg)" }}
    >
      <div className="absolute inset-0 bg-ink-deep/95" aria-hidden="true" />
      <div className="relative border-t border-gold/25">
        {/* Top footer */}
        <div className="mx-auto max-w-7xl px-4 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Image
              src="/images/gold-logo.jpg"
              alt="Gold Law – Consumer Attorneys"
              width={448}
              height={144}
              className="h-16 w-auto"
            />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/50">
              Consumer class action attorneys taking on robocalls, debt collector harassment,
              false advertising, and data breaches.
            </p>
          </div>
          <ul className="space-y-3">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-gold transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div>
            <h2 className="relative mb-6 pb-3 text-xl text-white after:absolute after:bottom-0 after:left-0 after:h-px after:w-10 after:bg-gold">
              Our Office
            </h2>
            <p>350 Lincoln Rd., 2nd Floor,</p>
            <p>Miami Beach, FL 33139</p>
            <p className="mt-4">
              <span className="text-gold">Email: </span>
              <a href="mailto:info@chrisgoldlaw.com" className="hover:text-gold transition-colors">
                info@chrisgoldlaw.com
              </a>
            </p>
            <p>
              <span className="text-gold">Phone: </span>
              <a href="tel:+13059004653" className="hover:text-gold transition-colors">
                (305) 900-GOLD(4653)
              </a>
            </p>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col lg:flex-row items-center justify-between gap-4">
            <ul className="flex items-center gap-3">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold hover:text-gold"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm">
              <div>
                Copyright © {new Date().getFullYear()} Gold Law, PA. Powered by{" "}
                <Link href="/" className="text-gold hover:text-gold-pale transition-colors">
                  Gold Law
                </Link>
              </div>
              <ul className="flex items-center gap-4">
                {footerLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-gold transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
