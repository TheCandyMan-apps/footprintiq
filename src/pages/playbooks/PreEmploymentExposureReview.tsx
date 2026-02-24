import React from "react";
import { Link } from "react-router-dom";
import { QAGuideLayout, type QAGuideData } from "@/components/guides/QAGuideLayout";

const playbookLinks = [
  { label: "Pre-Travel Executive Exposure Check", to: "/playbooks/executive-travel-check" },
  { label: "Journalist & Activist Risk Audit", to: "/playbooks/journalist-risk-audit" },
  { label: "Pre-Employment Exposure Review", to: "/playbooks/pre-employment-exposure-review" },
];

const data: QAGuideData = {
  slug: "playbooks/pre-employment-exposure-review",
  title: "Pre-Employment Digital Exposure Review | FootprintIQ Playbook",
  metaDescription: "A compliance-aligned workflow for HR, security, and recruitment teams to assess a candidate's or employee's public digital footprint ethically and legally.",
  h1: "Pre-Employment Digital Exposure Review",
  subtitle: "A structured, ethical workflow for HR teams, security officers, and compliance departments to assess publicly visible digital exposure for candidates, employees, or contractors — using only public data and with full consent.",
  publishedDate: "2026-02-24",
  sections: [
    {
      heading: "Why Pre-Employment Exposure Reviews Matter",
      content: (
        <>
          <p>
            Organisations increasingly recognise that a candidate's or employee's publicly visible digital footprint can represent a security risk. Leaked credentials, data broker listings, and overshared personal information can be exploited by social engineers, competitive intelligence teams, or threat actors.
          </p>
          <p>
            A pre-employment exposure review is <strong>not a background check</strong>. It is a focused assessment of what is publicly visible about an individual — information that any adversary could already find. The goal is to identify and mitigate risks, not to make hiring decisions based on personal opinions or social media behaviour.
          </p>
          <p>
            This workflow is designed to be <Link to="/ethical-osint-charter" className="text-primary underline underline-offset-4 hover:text-primary/80">ethical, legal, and consent-based</Link>. It must only be conducted with the explicit, informed consent of the individual being reviewed.
          </p>
        </>
      ),
    },
    {
      heading: "Step 1: Obtain Informed Consent",
      content: (
        <>
          <p>
            <strong>This step is non-negotiable.</strong> Before running any exposure review, you must obtain written, informed consent from the individual. The consent should clearly state:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>That only publicly accessible data will be reviewed</li>
            <li>The purpose of the review (security risk assessment, not character judgment)</li>
            <li>What data will be collected and how it will be stored</li>
            <li>The individual's right to review and contest findings</li>
            <li>Data retention and deletion policies</li>
          </ul>
          <p>
            Without consent, this workflow should not proceed. FootprintIQ's <Link to="/ethical-osint-charter" className="text-primary underline underline-offset-4 hover:text-primary/80">Ethical OSINT Charter</Link> requires consent-based scanning for all individual-focused reviews.
          </p>
        </>
      ),
    },
    {
      heading: "Step 2: Define Review Scope",
      content: (
        <>
          <p>
            Clearly define what you are assessing and why. A pre-employment exposure review should focus on:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Credential exposure:</strong> Are the candidate's professional credentials compromised in known breaches?</li>
            <li><strong>Data broker listings:</strong> Is the candidate's personal information (home address, phone number) freely available on data broker sites?</li>
            <li><strong>Public profile footprint:</strong> Are there accounts or profiles that could be exploited for social engineering?</li>
            <li><strong>Username reuse:</strong> Does the candidate use the same username across personal and professional contexts?</li>
          </ul>
          <p>
            <strong>Out of scope:</strong> Political opinions, religious beliefs, personal relationships, health information, protected characteristics. These are not security risks — they are personal matters protected by employment law.
          </p>
        </>
      ),
    },
    {
      heading: "Step 3: Run the Exposure Scan",
      content: (
        <>
          <p>
            Using the consented identifiers (corporate email, professional username), run a <Link to="/scan" className="text-primary underline underline-offset-4 hover:text-primary/80">FootprintIQ scan</Link>. Focus on:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Breach records associated with corporate or professional email addresses</li>
            <li>Public profiles that could reveal organisational structure or access patterns</li>
            <li>Data broker listings that expose personal contact information</li>
            <li>Cross-platform username correlations that link professional and personal identities</li>
          </ul>
          <p>
            FootprintIQ provides an exposure level indicator (Minimal / Moderate / Elevated) that helps prioritise findings without manual scoring.
          </p>
        </>
      ),
    },
    {
      heading: "Step 4: Interpret Findings Responsibly",
      content: (
        <>
          <p>
            Findings should be interpreted through a security lens, not a moral one. Key principles:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Presence is not proof:</strong> A username match does not confirm account ownership. Cross-validate before acting.</li>
            <li><strong>Exposure is not fault:</strong> Data breaches and data broker listings happen without the individual's knowledge or consent.</li>
            <li><strong>Context matters:</strong> A LinkedIn profile is expected exposure; a leaked corporate credential is a security risk.</li>
            <li><strong>Recommendations, not judgments:</strong> Provide actionable remediation advice, not employment recommendations.</li>
          </ul>
          <p>
            See <Link to="/guides/interpret-osint-results" className="text-primary underline underline-offset-4 hover:text-primary/80">How to Interpret OSINT Results</Link> for detailed guidance on responsible analysis.
          </p>
        </>
      ),
    },
    {
      heading: "Step 5: Report & Remediate",
      content: (
        <>
          <p>
            Compile a structured exposure report that includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Summary:</strong> Overall exposure level and key risk areas</li>
            <li><strong>Findings:</strong> Specific items requiring attention (breached credentials, data broker listings)</li>
            <li><strong>Recommendations:</strong> Concrete remediation steps (password rotation, opt-out requests, privacy settings)</li>
            <li><strong>Exclusions:</strong> Explicitly state what was not assessed and why</li>
          </ul>
          <p>
            Share the report with the individual being reviewed. They should have the opportunity to address findings before any organisational decisions are made. This is both ethical and legally prudent.
          </p>
        </>
      ),
    },
    {
      heading: "Compliance & Legal Considerations",
      content: (
        <>
          <p>
            Pre-employment exposure reviews must comply with local employment law and data protection regulations. Key considerations:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>GDPR (EU/UK):</strong> Requires legitimate interest or consent for processing personal data. Document your lawful basis.</li>
            <li><strong>FCRA (US):</strong> If used for employment decisions, additional disclosure and dispute resolution requirements may apply.</li>
            <li><strong>EEOC guidance:</strong> Findings must not be used to discriminate based on protected characteristics.</li>
            <li><strong>Data minimisation:</strong> Only collect data relevant to the security assessment. Delete findings according to your retention policy.</li>
          </ul>
          <p>
            Consult your legal team before implementing this workflow. FootprintIQ provides the exposure data — your organisation is responsible for compliant usage.
          </p>
        </>
      ),
    },
  ],
  faqs: [
    {
      question: "Is a pre-employment exposure review the same as a background check?",
      answer: "No. A background check typically involves criminal records, credit history, and employment verification through regulated channels. An exposure review only assesses publicly visible digital data — what any adversary could already find online.",
    },
    {
      question: "Can I run this without the candidate's consent?",
      answer: "No. FootprintIQ requires consent-based scanning. Running an exposure review without informed consent is both unethical and likely illegal under GDPR, CCPA, and similar data protection laws.",
    },
    {
      question: "What if we find something concerning?",
      answer: "Share findings with the individual and provide remediation guidance. Exposure is rarely the individual's fault — data breaches, data broker aggregation, and username reuse are systemic problems. Focus on risk mitigation, not blame.",
    },
    {
      question: "Should we run exposure reviews for existing employees?",
      answer: "Yes, with consent. Periodic exposure reviews for employees in high-risk roles (IT admins, finance, executives) can identify new risks from recent breaches or data broker listings.",
    },
    {
      question: "How do we store and handle the results?",
      answer: "Treat exposure review results as sensitive HR data. Store them securely with access controls, document your retention period, and delete them when no longer needed. Never share individual results beyond authorised personnel.",
    },
    {
      question: "Can FootprintIQ be used for tenant screening or customer vetting?",
      answer: "FootprintIQ is designed for self-assessment and authorised security reviews. Using it for tenant screening or customer vetting may trigger additional legal requirements. Consult legal counsel before expanding use beyond the intended scope.",
    },
  ],
  relatedGuides: playbookLinks,
};

const PreEmploymentExposureReview = () => <QAGuideLayout data={data} />;
export default PreEmploymentExposureReview;
