/**
 * Single source of truth for the SMS opt-in consent language.
 *
 * This wording is what carriers (via The Campaign Registry) vet during A2P 10DLC
 * campaign registration, and what we rely on as the record of express written
 * consent under the TCPA. It must contain, at minimum:
 *
 *   - the business name inside the consent sentence
 *   - the types of messages sent
 *   - message frequency
 *   - "Message & data rates may apply"
 *   - STOP and HELP instructions
 *   - links to the Privacy Policy and Terms
 *
 * ContactForm renders this same wording with real links. If you change the copy
 * here, change it there too, and bump SMS_CONSENT_VERSION so stored consent
 * records stay attributable to the exact text the user agreed to.
 */
export const SMS_CONSENT_VERSION = "2026-07-27";

export const SMS_CONSENT_TEXT =
  "I agree to receive text messages from Gold Law, P.A. at the mobile number provided. " +
  "These are transactional and customer care messages, including case status updates, " +
  "appointment reminders, and requests for information about my legal matter. Messages may " +
  "be sent using an automated system. Message frequency varies. Message & data rates may " +
  "apply. Consent is not a condition of purchase or of legal representation. Reply STOP to " +
  "opt out at any time, or reply HELP for help. See our Privacy Policy at " +
  "https://www.chrisgoldlaw.com/privacy-policy and our Terms & Conditions at " +
  "https://www.chrisgoldlaw.com/terms-and-conditions.";
