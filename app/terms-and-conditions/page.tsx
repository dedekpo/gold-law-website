import Link from "next/link";
import ArticleLayout from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms and Conditions",
  description:
    "The terms governing your use of chrisgoldlaw.com, including attorney advertising disclosures and the full Mobile Terms of Service for our text messaging program.",
  path: "/terms-and-conditions",
});

/* Sub-heading style for the appended SMS terms — one level below the numbered
   section headings that ArticleLayout styles. */
const subHeading =
  "mb-3 mt-8 font-serif text-2xl font-semibold leading-tight text-ink";

export default function TermsAndConditionsPage() {
  return (
    <ArticleLayout
      bannerTitle="Terms and Conditions"
      bannerSubtitle="“We Are Leading Law Firm”"
      showCta={false}
    >
      <h2>Gold Law, P.A. Website Terms and Conditions</h2>
      <p>Effective Date: July 19, 2026</p>
      <p>
        Welcome to chrisgoldlaw.com (the “Site”), owned and operated by Gold Law, P.A. (“Gold
        Law,” “we,” “us,” or “our”). These Terms and Conditions (“Terms”) govern your access to
        and use of the Site. By accessing or using the Site, submitting a form, or otherwise
        interacting with us through the Site, you agree to be bound by these Terms. If you do not
        agree, please do not use the Site.
      </p>

      <h2>1. No Attorney-Client Relationship</h2>
      <p>
        Your use of this Site, and any information you submit through it — including through a
        contact form, chat, case evaluation request, or text message — does not create an
        attorney-client relationship between you and Gold Law or any of its attorneys. An
        attorney-client relationship is formed only when Gold Law agrees to represent you in
        writing, typically through a signed engagement or retainer agreement. Until that happens,
        you should not send us any information you consider confidential or privileged.
      </p>

      <h2>2. No Legal Advice; Informational Purposes Only</h2>
      <p>
        The content on this Site — including practice area descriptions, blog posts, and FAQs —
        is provided for general informational purposes only and does not constitute legal advice.
        Laws change, and the application of law to any specific situation depends on facts that
        can only be evaluated through a direct consultation with an attorney. You should not act,
        or refrain from acting, based on anything you read on this Site without seeking
        individualized legal advice from a licensed attorney.
      </p>

      <h2>3. Confidentiality of Submitted Information</h2>
      <p>
        Because no attorney-client relationship exists until we agree in writing to represent
        you, information you submit through this Site’s forms, chat widget, or text messaging
        program is not protected by the attorney-client privilege and may not be treated as
        confidential. Please avoid submitting sensitive personal, medical, or financial details
        until representation has been formally established.
      </p>

      <h2>4. Attorney Advertising Disclaimer</h2>
      <p>
        This Site is an advertisement for legal services. It is not intended to be, and should
        not be construed as, a guarantee, warranty, or prediction regarding the outcome of any
        legal matter. The hiring of an attorney is an important decision that should not be based
        solely on advertisements. No aspect of this advertisement has been approved by The
        Florida Bar. Christopher Gold is the attorney responsible for the content of this Site.
      </p>

      <h2>5. No Guarantee of Results</h2>
      <p>
        Gold Law does not guarantee any particular outcome in any legal matter. Testimonials,
        case results, and settlement figures referenced on the Site reflect the experience of
        specific clients under specific facts and are not representative of all outcomes. Every
        case is different, and prospective clients may not obtain the same or similar results.
      </p>

      <h2>6. Text Messaging (SMS) Program</h2>
      <p>
        If you provide your mobile phone number to Gold Law and opt in to receive text messages,
        that texting program is governed by our Mobile Terms of Service, which are reproduced in
        full in the Appendix at the end of these Terms and are also available as a standalone page
        at{" "}
        <Link href="/sms-terms" className="text-gold-deep underline hover:no-underline">
          chrisgoldlaw.com/sms-terms/
        </Link>
        . Those Mobile Terms of Service are incorporated into these Terms by reference. Please
        review them, along with our{" "}
        <Link href="/privacy-policy" className="text-gold-deep underline hover:no-underline">
          Privacy Policy
        </Link>
        , before opting in.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        All content on this Site — including text, graphics, logos, and the Gold Law name and
        mark — is the property of Gold Law, P.A. or its licensors and is protected by U.S.
        copyright and trademark law. You may view and print pages of the Site for your personal,
        non-commercial use, but you may not reproduce, distribute, or create derivative works
        from Site content without our prior written permission.
      </p>

      <h2>8. Third-Party Links</h2>
      <p>
        This Site may contain links to third-party websites that are not owned or controlled by
        Gold Law. We are not responsible for the content, accuracy, privacy practices, or terms
        of any third-party site, and inclusion of a link does not imply our endorsement.
      </p>

      <h2>9. Disclaimer of Warranties</h2>
      <p>
        The Site and its content are provided “as is” and “as available,” without warranties of
        any kind, express or implied, including warranties of accuracy, completeness, or fitness
        for a particular purpose. We do not warrant that the Site will be uninterrupted, secure,
        or error-free.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Gold Law, P.A. and its attorneys and staff will
        not be liable for any direct, indirect, incidental, consequential, or punitive damages
        arising out of your use of, or inability to use, this Site.
      </p>

      <h2>11. Governing Law; Venue</h2>
      <p>
        These Terms are governed by the laws of the State of Florida, without regard to its
        conflict-of-laws principles. Any dispute arising out of or relating to these Terms or
        your use of the Site will be brought exclusively in the state or federal courts located
        in Miami-Dade County, Florida.
      </p>

      <h2>12. Changes to These Terms</h2>
      <p>
        We may revise these Terms from time to time. The “Effective Date” above reflects the date
        of the most recent revision. Your continued use of the Site after changes are posted
        constitutes acceptance of the revised Terms.
      </p>

      <h2>13. Contact Us</h2>
      <p>Questions about these Terms may be directed to:</p>
      <p>
        Gold Law, P.A.
        <br />
        350 Lincoln Rd., 2nd Floor, Miami Beach, FL 33139
        <br />
        Email:{" "}
        <a href="mailto:info@chrisgoldlaw.com" className="text-gold-deep underline hover:no-underline">
          info@chrisgoldlaw.com
        </a>{" "}
        • Phone:{" "}
        <a href="tel:+13059004653" className="text-gold-deep underline hover:no-underline">
          (305) 900-GOLD (4653)
        </a>
      </p>

      <hr className="mt-14 border-t border-ink/15" />

      <h2>Appendix — Gold Law, P.A. Mobile Terms of Service (SMS Program)</h2>
      <p>Effective Date: July 19, 2026</p>
      <p>Program Name: Gold Law, P.A.</p>

      <h3 className={subHeading}>Program Description</h3>
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

      <h3 className={subHeading}>Message Frequency</h3>
      <p>
        Message frequency varies depending on the status of your inquiry or case. You may receive
        more messages during active scheduling or case activity and fewer messages at other
        times.
      </p>

      <h3 className={subHeading}>Cost</h3>
      <p>
        Message and data rates may apply. Charges are set by your wireless carrier, not by Gold
        Law. Contact your carrier for details about your text and data plan.
      </p>

      <h3 className={subHeading}>Opt-Out / Cancellation</h3>
      <p>
        You can cancel this SMS program at any time. Text “STOP” to the number you received
        messages from. After you send “STOP,” we will send one final confirmation message and you
        will not receive further texts from us unless you opt back in. If you experience issues
        with the program, text “HELP” or contact us directly using the information below.
      </p>

      <h3 className={subHeading}>Rejoining</h3>
      <p>
        To resume receiving messages after opting out, submit a new request through our website
        contact form, reply “START,” or contact our office directly and ask to be re-added.
      </p>

      <h3 className={subHeading}>Help</h3>
      <p>
        For help with the Gold Law text messaging program, text “HELP” to the number you received
        messages from, or contact us at{" "}
        <a href="mailto:info@chrisgoldlaw.com" className="text-gold-deep underline hover:no-underline">
          info@chrisgoldlaw.com
        </a>{" "}
        or{" "}
        <a href="tel:+13059004653" className="text-gold-deep underline hover:no-underline">
          (305) 900-GOLD (4653)
        </a>
        .
      </p>

      <h3 className={subHeading}>Carrier Disclaimer</h3>
      <p>
        Carriers are not liable for delayed or undelivered messages. Participating carriers
        include, but are not limited to, AT&amp;T, T-Mobile, Verizon, and other major U.S.
        wireless carriers.
      </p>

      <h3 className={subHeading}>Eligibility</h3>
      <p>
        This program is available only to individuals 18 years of age or older who are the
        account holder or an authorized user of the mobile number provided, and who reside in the
        United States.
      </p>

      <h3 className={subHeading}>No Attorney-Client Relationship Formed by Text</h3>
      <p>
        Enrolling in this SMS program, or exchanging text messages with Gold Law, does not create
        an attorney-client relationship. See the Website Terms and Conditions above and our{" "}
        <Link href="/privacy-policy" className="text-gold-deep underline hover:no-underline">
          Privacy Policy
        </Link>{" "}
        for more information.
      </p>

      <h3 className={subHeading}>Confidentiality Warning</h3>
      <p>
        Standard SMS text messaging is not an encrypted or fully secure communication method.
        Please do not send sensitive, confidential, or privileged information by text. If you
        have questions about how to safely share information about your matter, call our office
        directly.
      </p>

      <h3 className={subHeading}>Privacy</h3>
      <p>
        Your use of this SMS program is also governed by our Privacy Policy at{" "}
        <Link href="/privacy-policy" className="text-gold-deep underline hover:no-underline">
          chrisgoldlaw.com/privacy-policy/
        </Link>
        , which describes how we collect and use your information. No mobile information will be
        shared with third parties or affiliates for marketing or promotional purposes. All the
        categories of information described in our Privacy Policy exclude text messaging
        originator opt-in data and consent; this information will not be shared with any third
        parties, except with our aggregators and mobile messaging service providers as necessary
        to deliver the SMS program itself.
      </p>

      <h3 className={subHeading}>Compliance</h3>
      <p>
        This program operates in compliance with the Telephone Consumer Protection Act (TCPA),
        the CTIA Messaging Principles and Best Practices, and applicable carrier requirements.
        Consent to receive text messages is never required as a condition of retaining Gold Law
        as your attorney or purchasing any service.
      </p>

      <h3 className={subHeading}>Changes</h3>
      <p>
        We may update these Mobile Terms of Service from time to time. The “Effective Date” above
        reflects the date of the most recent revision.
      </p>

      <h3 className={subHeading}>Contact</h3>
      <p>
        Gold Law, P.A.
        <br />
        350 Lincoln Rd., 2nd Floor, Miami Beach, FL 33139
        <br />
        Email:{" "}
        <a href="mailto:info@chrisgoldlaw.com" className="text-gold-deep underline hover:no-underline">
          info@chrisgoldlaw.com
        </a>{" "}
        • Phone:{" "}
        <a href="tel:+13059004653" className="text-gold-deep underline hover:no-underline">
          (305) 900-GOLD (4653)
        </a>
      </p>
    </ArticleLayout>
  );
}
