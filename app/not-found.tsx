import Link from "next/link";
import NoticeCard from "@/components/NoticeCard";

/**
 * Branded 404. Also what a mistyped short evidence link lands on, so the
 * message tells a client how to get a fresh link rather than just "not found".
 */
export default function NotFound() {
  return (
    <NoticeCard bannerTitle="Page Not Found" title="We could not find that page.">
      <p>
        If you followed a link we sent you, please open the exact link from our message, or
        contact us and we will send you a new one.
      </p>
      <p className="mt-3">
        <Link href="/" className="font-medium text-ink hover:text-gold-deep">
          Return to the home page
        </Link>
      </p>
    </NoticeCard>
  );
}
