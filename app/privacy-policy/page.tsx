import Link from "next/link";
import ArticleLayout from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Gold Law, P.A. collects, uses, and protects your information when you visit chrisgoldlaw.com, submit a form, or opt in to text messages.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <ArticleLayout
      bannerTitle="Privacy Policy"
      bannerSubtitle="“We Are Leading Law Firm”"
      showCta={false}
    >
      <h2>Gold Law, P.A. Privacy Policy</h2>
      <p>Effective Date: July 19, 2026</p>
      <p>
        This Privacy Policy describes how Gold Law, P.A. (“Gold Law,” “we,” “us,” or “our”)
        collects, uses, discloses, and protects information when you visit chrisgoldlaw.com (the
        “Site”), submit a form, opt in to text messages, or otherwise interact with us in
        connection with a potential legal matter. By using the Site or providing us your
        information, you agree to the practices described in this Privacy Policy.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We may collect the following categories of information:</p>
      <ul>
        <li>
          <strong>Contact Information:</strong> name, mailing address, email address, and phone
          number.
        </li>
        <li>
          <strong>Case/Matter Information:</strong> details you provide about a potential legal
          issue, including the nature of the matter, relevant dates, related communications or
          documents, and other facts relevant to evaluating your case.
        </li>
        <li>
          <strong>Communications:</strong> records of calls, emails, texts, and chat messages
          between you and our firm.
        </li>
        <li>
          <strong>Website Usage Data:</strong> information collected automatically when you visit
          the Site, such as IP address, browser type, pages viewed, referring URLs, and time spent
          on the Site, collected through cookies and similar technologies (see Section 5).
        </li>
        <li>
          <strong>Advertising/Lead Data:</strong> if you submit your information through a Meta
          (Facebook/Instagram) lead ad or a GoHighLevel-hosted landing page or funnel, we receive
          the contact and case information you provide there.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Respond to your inquiry and evaluate a potential legal matter;</li>
        <li>
          Communicate with you by phone, email, or text about your inquiry, scheduling, or your
          case if you become a client;
        </li>
        <li>Provide legal representation and manage the attorney-client relationship;</li>
        <li>Improve the Site and our intake process;</li>
        <li>Comply with legal, regulatory, and ethical obligations; and</li>
        <li>Maintain records as required by law and the Rules Regulating The Florida Bar.</li>
      </ul>

      <h2>3. How We Share Your Information</h2>
      <p>We do not sell your personal information. We may share information with:</p>
      <ul>
        <li>
          Co-counsel, referral, or other law firms we work with on your matter, where applicable;
        </li>
        <li>
          Service providers who perform functions on our behalf (e.g., case management, phone/text
          messaging platforms, IT and hosting providers, and customer support), under
          confidentiality obligations;
        </li>
        <li>
          Courts, regulators, or other government entities, or opposing parties, as required in
          connection with litigation or by law; and
        </li>
        <li>A successor entity in the event of a merger, acquisition, or sale of firm assets.</li>
      </ul>
      <p>
        <strong>Text Messaging Data — Special Protection.</strong> No mobile information will be
        shared with third parties or affiliates for marketing or promotional purposes. All the
        categories of information described above exclude text messaging originator opt-in data
        and consent; this information will not be shared with any third parties, except with our
        aggregators and mobile messaging service providers as necessary to deliver messages you
        have requested.
      </p>

      <h2>4. Your Choices</h2>
      <ul>
        <li>
          <strong>Email:</strong> You may unsubscribe from marketing emails at any time using the
          “unsubscribe” link in any email.
        </li>
        <li>
          <strong>Text Messages:</strong> You may opt out of text messages at any time by replying
          “STOP” to any message you receive from us. See our{" "}
          <Link href="/sms-terms" className="text-red underline hover:no-underline">
            Mobile Terms of Service
          </Link>{" "}
          for details.
        </li>
        <li>
          <strong>Access/Deletion:</strong> You may request to access, correct, or delete the
          personal information we hold about you by contacting us using the information in Section
          12, subject to our record-keeping obligations as a law firm.
        </li>
      </ul>

      <h2>5. Cookies and Tracking Technologies</h2>
      <p>
        Like most websites, we use cookies, pixels (including the Meta/Facebook pixel), and
        similar technologies to operate the Site, understand how visitors use it, and measure the
        effectiveness of our advertising, including ads run through Meta and other platforms. You
        can control cookies through your browser settings; disabling cookies may affect how the
        Site functions. We do not currently respond to browser “Do Not Track” signals.
      </p>

      <h2>6. Data Security</h2>
      <p>
        We use reasonable administrative, technical, and physical safeguards designed to protect
        your information from unauthorized access, disclosure, alteration, or destruction.
        However, no method of transmission over the internet, and no method of electronic storage,
        is completely secure, and standard SMS text messages are not encrypted. Please avoid
        sending highly sensitive information through the Site’s contact forms or by text (see
        Section 8).
      </p>

      <h2>7. Data Retention</h2>
      <p>
        We retain personal information for as long as necessary to fulfill the purposes described
        in this Privacy Policy, including to comply with our legal, accounting, and professional
        responsibility obligations, which for client files may extend beyond the conclusion of
        representation as required under Florida law and the Rules Regulating The Florida Bar.
      </p>

      <h2>8. Confidentiality and No Attorney-Client Relationship</h2>
      <p>
        Submitting information through this Site’s forms, chat, or text messaging program does not
        create an attorney-client relationship and does not make your information confidential or
        privileged. An attorney-client relationship is formed only when Gold Law agrees, in
        writing, to represent you. Please do not send sensitive or privileged information until
        representation has been formally established.
      </p>

      <h2>9. Children’s Privacy</h2>
      <p>
        This Site is not directed to children under the age of 13, and we do not knowingly collect
        personal information from children under 13. If you believe a child has provided us with
        personal information, please contact us using the information below so we can delete it.
      </p>

      <h2>10. Your California and Other State Privacy Rights</h2>
      <p>
        Depending on where you live, you may have additional rights regarding your personal
        information under state privacy laws (such as the California Consumer Privacy Act). To
        exercise any such rights, contact us using the information in Section 12; we will respond
        consistent with applicable law and our obligations as a law firm.
      </p>

      <h2>11. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted on this page
        with a revised Effective Date. We encourage you to review this Policy periodically.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or wish to exercise any of the choices
        described above, contact us at:
      </p>
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
