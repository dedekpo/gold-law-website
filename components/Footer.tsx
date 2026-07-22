import Image from "next/image";
import Link from "next/link";
import {
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from "./icons";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
];

const socials = [
  { label: "Facebook", Icon: FacebookIcon },
  { label: "Twitter", Icon: TwitterIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "Google", Icon: GoogleIcon },
  { label: "LinkedIn", Icon: LinkedinIcon },
];

export default function Footer() {
  return (
    <footer
      className="relative bg-navy-deep bg-cover bg-center text-white/80"
      style={{ backgroundImage: "url(/images/bg-footer.jpg)" }}
    >
      <div className="absolute inset-0 bg-navy-deep/90" aria-hidden="true" />
      <div className="relative">
        {/* Top footer */}
        <div className="mx-auto max-w-7xl px-4 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Image
              src="/images/logo.png"
              alt="Gold Law – Consumer Attorneys"
              width={300}
              height={105}
              className="w-64 h-auto"
            />
          </div>
          <ul className="space-y-3">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-red transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div>
            <h2 className="relative mb-6 pb-3 text-xl text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-white">
              Our Office
            </h2>
            <p>350 Lincoln Rd., 2nd Floor,</p>
            <p>Miami Beach, FL 33139</p>
            <p className="mt-4">
              <span className="text-red">Email: </span>
              <a href="mailto:info@chrisgoldlaw.com" className="hover:text-red transition-colors">
                info@chrisgoldlaw.com
              </a>
            </p>
            <p>
              <span className="text-red">Phone: </span>
              <a href="tel:+13059004653" className="hover:text-red transition-colors">
                (305) 900-GOLD(4653)
              </a>
            </p>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col lg:flex-row items-center justify-between gap-4">
            <ul className="flex items-center gap-3">
              {socials.map(({ label, Icon }) => (
                <li key={label}>
                  <a
                    href="#"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-red"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm">
              <div>
                Copyright © {new Date().getFullYear()} Gold Law, PA. Powered by{" "}
                <Link href="/" className="text-white hover:text-red transition-colors">
                  Gold Law
                </Link>
              </div>
              <ul className="flex items-center gap-4">
                {footerLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-red transition-colors">
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
