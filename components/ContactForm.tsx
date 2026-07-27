"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/app/actions";

const initialState: ContactFormState = { status: "idle" };

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  const inputClasses =
    "w-full h-12 rounded-sm border border-bone-dark bg-white px-4 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-gold transition-colors";

  return (
    <form action={formAction} aria-label="Contact form">
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

      {/* Express written consent for SMS. Optional by design — the form submits
          without it, and no texts are sent unless it is checked. */}
      <div className="mt-5 rounded-sm border border-bone-dark bg-white p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="sms-consent"
            name="sms-consent"
            value="yes"
            className="mt-0.5 h-5 w-5 shrink-0 accent-gold-deep"
          />
          <label htmlFor="sms-consent" className="text-sm leading-relaxed text-muted">
            I agree to receive text messages from{" "}
            <span className="font-semibold text-ink">Gold Law, P.A.</span>{" "}
            at the mobile number provided. These are transactional and customer care messages,
            including case status
            updates, appointment reminders, and requests for information about my legal matter.
            Messages may be sent using an automated system. Message frequency varies. Message &amp;
            data rates may apply. Consent is not a condition of purchase or of legal representation.
            Reply STOP to opt out at any time, or reply HELP for help. See our{" "}
            <Link
              href="/privacy-policy"
              onClick={(event) => event.stopPropagation()}
              className="text-gold-deep underline hover:no-underline"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms-and-conditions"
              onClick={(event) => event.stopPropagation()}
              className="text-gold-deep underline hover:no-underline"
            >
              Terms &amp; Conditions
            </Link>
            .
          </label>
        </div>
        <p className="mt-3 text-xs italic text-muted/80">
          This box is optional and is not pre-checked. You can send your message without it, and we
          will not text you unless you check it.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-5 cursor-pointer rounded-sm bg-ink px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-gold-pale transition-colors hover:bg-ink-deep disabled:opacity-60"
      >
        {state.status === "sent" ? "Message Sent!" : "Send Your Message"}
      </button>

      {state.status === "sent" && (
        <p role="status" className="mt-4 text-sm text-ink">
          Thanks — we&rsquo;ve received your message and will be in touch shortly.
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="mt-4 text-sm text-gold-deep">
          {state.message}
        </p>
      )}
    </form>
  );
}
