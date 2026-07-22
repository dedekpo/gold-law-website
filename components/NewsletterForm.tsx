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
        className="h-12 w-full bg-white px-4 text-sm text-black placeholder:text-[#aaaaaa] outline-none"
      />
      <button
        type="submit"
        className="h-12 shrink-0 cursor-pointer bg-red px-6 text-[15px] text-[#fafafa] transition-colors hover:bg-navy"
      >
        {status === "sent" ? "Subscribed!" : "Subscribe"}
      </button>
    </form>
  );
}
