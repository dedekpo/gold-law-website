"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: wire up newsletter subscription backend
    setStatus("sent");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl">
      <input
        type="email"
        name="email"
        required
        placeholder="Enter Email *"
        className="h-12 w-full rounded-l-sm border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-gold/60 transition-colors"
      />
      <button
        type="submit"
        className="h-12 shrink-0 cursor-pointer rounded-r-sm bg-gold px-6 text-sm font-semibold uppercase tracking-[0.1em] text-ink-deep transition-colors hover:bg-gold-pale"
      >
        {status === "sent" ? "Subscribed!" : "Subscribe"}
      </button>
    </form>
  );
}
