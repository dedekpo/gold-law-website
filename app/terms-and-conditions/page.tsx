import type { Metadata } from "next";
import Link from "next/link";
import ArticleLayout from "@/components/ArticleLayout";

export const metadata: Metadata = {
  title: "Terms and Conditions",
};

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
        that texting program is governed by our separate Mobile Terms of Service, available at{" "}
        <Link href="/sms-terms" className="text-red underline hover:no-underline">
          chrisgoldlaw.com/sms-terms/
        </Link>
        , which is incorporated into these Terms by reference. Please review those terms, along
        with our{" "}
        <Link href="/privacy-policy" className="text-red underline hover:no-underline">
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
