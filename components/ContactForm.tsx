"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    // TODO: wire up backend submission (API route / server action)
    setStatus("sent");
  }

  const inputClasses =
    "w-full h-12 rounded-sm border border-bone-dark bg-white px-4 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-gold transition-colors";

  return (
    <form onSubmit={handleSubmit} aria-label="Contact form">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          name="your-name"
          placeholder="Name:"
          required
          maxLength={400}
          className={inputClasses}
        />
        <input
          type="email"
          name="your-email"
          placeholder="Email:"
          required
          maxLength={400}
          className={inputClasses}
        />
        <input
          type="tel"
          name="your-number"
          placeholder="Your Number:"
          required
          maxLength={400}
          className={`${inputClasses} sm:col-span-2`}
        />
        <textarea
          name="your-message"
          placeholder="Message:"
          rows={6}
          maxLength={2000}
          className="sm:col-span-2 w-full rounded-sm border border-bone-dark bg-white p-4 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-gold transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-5 cursor-pointer rounded-sm bg-ink px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-gold-pale transition-colors hover:bg-ink-deep disabled:opacity-60"
      >
        {status === "sent" ? "Message Sent!" : "Send Your Message"}
      </button>
      <p className="mt-5 text-sm text-muted">
        By selecting &quot;YES&quot; to the question above, you agree to receive recurring text
        messages that may be sent by an automated system. Consent is not a condition of purchasing
        goods or services. By clicking Next, you agree to our{" "}
        <Link href="/privacy-policy" className="text-gold-deep underline hover:no-underline">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
