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
    "w-full h-11 border border-[#d9d9d9] bg-white px-3 text-sm text-black outline-none focus:border-red transition-colors";

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
          className="sm:col-span-2 w-full border border-[#d9d9d9] bg-white p-3 text-sm text-black outline-none focus:border-red transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 cursor-pointer bg-[#333333] px-8 py-3 text-white transition-colors hover:bg-red-hover disabled:opacity-60"
      >
        {status === "sent" ? "Message Sent!" : "Send Your Message"}
      </button>
      <p className="mt-4 text-sm text-muted">
        By selecting &quot;YES&quot; to the question above, you agree to receive recurring text
        messages that may be sent by an automated system. Consent is not a condition of purchasing
        goods or services. By clicking Next, you agree to our{" "}
        <Link href="/privacy-policy" className="text-red hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
