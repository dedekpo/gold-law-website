"use server";

import { headers } from "next/headers";
import { SMS_CONSENT_TEXT, SMS_CONSENT_VERSION } from "@/lib/sms-consent";

export type ContactFormState = {
  status: "idle" | "sent" | "error";
  message?: string;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("your-name") ?? "").trim();
  const email = String(formData.get("your-email") ?? "").trim();
  const phone = String(formData.get("your-number") ?? "").trim();
  const message = String(formData.get("your-message") ?? "").trim();
  const smsConsent = formData.get("sms-consent") === "yes";

  if (!name || !email || !phone) {
    return { status: "error", message: "Please fill in your name, email, and phone number." };
  }

  const endpoint = process.env.GHL_WEBHOOK_URL;
  if (!endpoint) {
    console.error("GHL_WEBHOOK_URL is not set — contact form submission was dropped.");
    return {
      status: "error",
      message: "We couldn't send your message right now. Please call (305) 900-GOLD (4653).",
    };
  }

  // Capture the consent record alongside the lead. If a recipient ever disputes
  // consent, this is the evidence: what they agreed to, and when.
  const requestHeaders = await headers();
  const payload = {
    name,
    email,
    phone,
    message,
    source: "chrisgoldlaw.com contact form",
    smsConsent,
    smsConsentText: smsConsent ? SMS_CONSENT_TEXT : null,
    smsConsentVersion: smsConsent ? SMS_CONSENT_VERSION : null,
    smsConsentAt: smsConsent ? new Date().toISOString() : null,
    smsConsentIp: smsConsent
      ? (requestHeaders.get("x-forwarded-for")?.split(",")[0].trim() ?? null)
      : null,
    smsConsentUserAgent: smsConsent ? requestHeaders.get("user-agent") : null,
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Contact form webhook returned ${response.status}`);
      return {
        status: "error",
        message: "We couldn't send your message right now. Please call (305) 900-GOLD (4653).",
      };
    }
  } catch (error) {
    console.error("Contact form webhook failed", error);
    return {
      status: "error",
      message: "We couldn't send your message right now. Please call (305) 900-GOLD (4653).",
    };
  }

  return { status: "sent" };
}
