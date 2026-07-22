import Link from "next/link";
import ArticleLayout from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mobile Terms of Service",
  description:
    "Terms for Gold Law's SMS program: message frequency, opt-out instructions (text STOP), help, and privacy protections for your mobile information.",
  path: "/sms-terms",
});

export default function SmsTermsPage() {
  return (
    <ArticleLayout
      bannerTitle="Mobile Terms of Service"
      bannerSubtitle="“We Are Leading Law Firm”"
      showCta={false}
    >
      <h2>Gold Law, P.A. Mobile Terms of Service — SMS Program</h2>
      <p>Effective Date: July 19, 2026</p>
      <p>Program Name: Gold Law, P.A.</p>

      <h2>Program Description</h2>
      <p>
        By providing your mobile phone number to Gold Law, P.A. — through our website
        contact/intake form, a GoHighLevel-hosted landing page or funnel, or a Meta
        (Facebook/Instagram) lead ad form — and by checking the applicable consent box or
        otherwise opting in, you agree to receive text messages (SMS/MMS) from Gold Law, P.A.
        related to: (a) following up on your inquiry about a potential legal matter; (b)
        scheduling, confirming, or rescheduling a consultation or appointment; and (c) providing
        case and client status updates if you become a client. Message types may include
        appointment reminders, requests for documents or information, scheduling coordination,
        and status updates on your matter.
      </p>
      <p>
        We do not use this program to send unsolicited marketing or promotional text messages to
        individuals who have not first contacted us or provided their mobile number through one
        of the channels described above.
      </p>

      <h2>Message Frequency</h2>
      <p>
        Message frequency varies depending on the status of your inquiry or case. You may receive
        more messages during active scheduling or case activity and fewer messages at other
        times.
      </p>

      <h2>Cost</h2>
      <p>
        Message and data rates may apply. Charges are set by your wireless carrier, not by Gold
        Law. Contact your carrier for details about your text and data plan.
      </p>

      <h2>Opt-Out / Cancellation</h2>
      <p>
        You can cancel this SMS program at any time. Text “STOP” to the number you received
        messages from. After you send “STOP,” we will send one final confirmation message and you
        will not receive further texts from us unless you opt back in. If you experience issues
        with the program, text “HELP” or contact us directly using the information below.
      </p>

      <h2>Rejoining</h2>
      <p>
        To resume receiving messages after opting out, submit a new request through our website
        contact form, reply “START,” or contact our office directly and ask to be re-added.
      </p>

      <h2>Help</h2>
      <p>
        For help with the Gold Law text messaging program, text “HELP” to the number you received
        messages from, or contact us at{" "}
        <a href="mailto:info@chrisgoldlaw.com" className="text-red underline hover:no-underline">
          info@chrisgoldlaw.com
        </a>{" "}
        or{" "}
        <a href="tel:+13059004653" className="text-red underline hover:no-underline">
          (305) 900-GOLD (4653)
        </a>
        .
      </p>

      <h2>Carrier Disclaimer</h2>
      <p>
        Carriers are not liable for delayed or undelivered messages. Participating carriers
        include, but are not limited to, AT&amp;T, T-Mobile, Verizon, and other major U.S.
        wireless carriers.
      </p>

      <h2>Eligibility</h2>
      <p>
        This program is available only to individuals 18 years of age or older who are the
        account holder or an authorized user of the mobile number provided, and who reside in the
        United States.
      </p>

      <h2>No Attorney-Client Relationship Formed by Text</h2>
      <p>
        Enrolling in this SMS program, or exchanging text messages with Gold Law, does not create
        an attorney-client relationship. See our{" "}
        <Link href="/terms-and-conditions" className="text-red underline hover:no-underline">
          Website Terms and Conditions
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="text-red underline hover:no-underline">
          Privacy Policy
        </Link>{" "}
        for more information.
      </p>

      <h2>Confidentiality Warning</h2>
      <p>
        Standard SMS text messaging is not an encrypted or fully secure communication method.
        Please do not send sensitive, confidential, or privileged information by text. If you
        have questions about how to safely share information about your matter, call our office
        directly.
      </p>

      <h2>Privacy</h2>
      <p>
        Your use of this SMS program is also governed by our Privacy Policy at{" "}
        <Link href="/privacy-policy" className="text-red underline hover:no-underline">
          chrisgoldlaw.com/privacy-policy/
        </Link>
        , which describes how we collect and use your information. No mobile information will be
        shared with third parties or affiliates for marketing or promotional purposes. All the
        categories of information described in our Privacy Policy exclude text messaging
        originator opt-in data and consent; this information will not be shared with any third
        parties, except with our aggregators and mobile messaging service providers as necessary
        to deliver the SMS program itself.
      </p>

      <h2>Compliance</h2>
      <p>
        This program operates in compliance with the Telephone Consumer Protection Act (TCPA),
        the CTIA Messaging Principles and Best Practices, and applicable carrier requirements.
        Consent to receive text messages is never required as a condition of retaining Gold Law
        as your attorney or purchasing any service.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Mobile Terms of Service from time to time. The “Effective Date” above
        reflects the date of the most recent revision.
      </p>

      <h2>Contact</h2>
      <p>
        Gold Law, P.A.
        <br />
        350 Lincoln Rd., 2nd Floor, Miami Beach, FL 33139
        <br />
        Email:{" "}
        <a href="mailto:info@chrisgoldlaw.com" className="text-red underline hover:no-underline">
          info@chrisgoldlaw.com
        </a>{" "}
        • Phone:{" "}
        <a href="tel:+13059004653" className="text-red underline hover:no-underline">
          (305) 900-GOLD (4653)
        </a>
      </p>
    </ArticleLayout>
  );
}
