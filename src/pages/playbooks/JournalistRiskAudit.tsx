import React from "react";
import { Link } from "react-router-dom";
import { QAGuideLayout, type QAGuideData } from "@/components/guides/QAGuideLayout";

const playbookLinks = [
  { label: "Pre-Travel Executive Exposure Check", to: "/playbooks/executive-travel-check" },
  { label: "Journalist & Activist Risk Audit", to: "/playbooks/journalist-risk-audit" },
  { label: "Pre-Employment Exposure Review", to: "/playbooks/pre-employment-exposure-review" },
];

const data: QAGuideData = {
  slug: "playbooks/journalist-risk-audit",
  title: "Journalist & Activist Digital Risk Audit | FootprintIQ Playbook",
  metaDescription: "A practical playbook for journalists, activists, and NGO workers to audit their digital exposure before sensitive investigations or field assignments.",
  h1: "Journalist & Activist Digital Risk Audit",
  subtitle: "A structured workflow for journalists, human rights workers, and activists to assess their publicly visible digital footprint before sensitive investigations, field work, or public campaigns.",
  publishedDate: "2026-02-24",
  sections: [
    {
      heading: "Why Journalists and Activists Need Exposure Auditing",
      content: (
        <>
          <p>
            Investigative journalists, NGO researchers, and activists are frequent targets of digital surveillance, doxxing, and social engineering. Before beginning a sensitive investigation or deploying to a high-risk region, understanding your own digital exposure is a critical operational security measure.
          </p>
          <p>
            Unlike corporate executives, journalists often operate with limited security resources. This playbook provides a <strong>free-to-start, self-service workflow</strong> that surfaces the most exploitable publicly visible data — without requiring a security team or expensive tooling.
          </p>
          <p>
            FootprintIQ is built on <Link to="/ethical-osint-charter" className="text-primary underline underline-offset-4 hover:text-primary/80">ethical OSINT principles</Link>. This workflow uses only publicly accessible data and never involves accessing private accounts, monitoring individuals without consent, or bypassing authentication.
          </p>
        </>
      ),
    },
    {
      heading: "Step 1: Identify Your Attack Surface",
      content: (
        <>
          <p>
            Your attack surface is the collection of all publicly visible information that could be used to identify, locate, or target you. Start by listing:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>All usernames (personal, professional, legacy, pseudonymous)</li>
            <li>Email addresses (work, personal, source-contact addresses)</li>
            <li>Phone numbers associated with messaging platforms</li>
            <li>Published bylines, author bios, and speaker profiles</li>
          </ul>
          <p>
            Many journalists use the same username across personal and professional accounts — a pattern that makes cross-platform identification trivially easy for adversaries.
          </p>
        </>
      ),
    },
    {
      heading: "Step 2: Run a Multi-Vector Scan",
      content: (
        <>
          <p>
            Use <Link to="/scan" className="text-primary underline underline-offset-4 hover:text-primary/80">FootprintIQ</Link> to scan your identified usernames and email addresses. The scan checks 350+ public platforms for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Profile matches across social media, forums, and professional networks</li>
            <li>Data broker listings revealing home addresses, phone numbers, and associates</li>
            <li>Breach records exposing credentials or personal data</li>
            <li>Messaging platform associations (public Telegram channels, Discord servers)</li>
          </ul>
          <p>
            Pay special attention to any accounts that link your real identity to a pseudonymous persona. These connections are high-priority risks.
          </p>
        </>
      ),
    },
    {
      heading: "Step 3: Assess Source & Contact Exposure",
      content: (
        <>
          <p>
            Journalists have a unique obligation: protecting sources. Review your scan results through this lens:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Are any contact methods (email, phone, messaging) publicly linked to your real identity?</li>
            <li>Could an adversary identify your sources by analysing your public social graph?</li>
            <li>Are secure communication channels (Signal, SecureDrop) visible in your public profiles?</li>
            <li>Do your published articles reference locations, contacts, or methodologies that could endanger sources?</li>
          </ul>
          <p>
            If your source-contact email appears in breach databases, assume it is compromised and rotate immediately.
          </p>
        </>
      ),
    },
    {
      heading: "Step 4: Harden Your Digital Presence",
      content: (
        <>
          <p>
            Based on your findings, take targeted remediation actions:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Separate identities:</strong> Use distinct usernames and email addresses for personal, professional, and investigative work</li>
            <li><strong>Remove data broker listings:</strong> Follow the <Link to="/guides/remove-from-data-brokers" className="text-primary underline underline-offset-4 hover:text-primary/80">data broker opt-out guide</Link> to remove home address and phone number listings</li>
            <li><strong>Lock social media:</strong> Set all personal accounts to private; audit tagged photos and location data</li>
            <li><strong>Rotate compromised credentials:</strong> Change passwords for any accounts appearing in breach results</li>
            <li><strong>Enable 2FA:</strong> Use hardware keys (YubiKey) for critical accounts — not SMS-based 2FA</li>
          </ul>
        </>
      ),
    },
    {
      heading: "Step 5: Operational Security Before Fieldwork",
      content: (
        <>
          <p>
            Before deploying to high-risk locations or beginning sensitive investigations:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Run a fresh FootprintIQ scan to confirm remediation effectiveness</li>
            <li>Use a clean device or travel device with no personal accounts logged in</li>
            <li>Disable location services and geotagging on all devices</li>
            <li>Use a VPN and encrypted DNS in hostile network environments</li>
            <li>Brief your editor or security contact on your digital exposure status</li>
          </ul>
          <p>
            Digital exposure auditing should be part of every pre-assignment safety checklist, alongside physical security protocols.
          </p>
        </>
      ),
    },
    {
      heading: "For NGOs and Press Freedom Organisations",
      content: (
        <>
          <p>
            FootprintIQ can be integrated into institutional digital safety programmes. Security teams at NGOs and press freedom organisations can:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Run bulk exposure checks for field teams before deployments</li>
            <li>Establish quarterly digital hygiene reviews for all staff</li>
            <li>Use FootprintIQ reports as part of incident response workflows</li>
            <li>Train journalists and researchers on interpreting exposure findings</li>
          </ul>
          <p>
            See <Link to="/osint-for-activists-journalists" className="text-primary underline underline-offset-4 hover:text-primary/80">OSINT for High-Risk Users</Link> for additional guidance tailored to activists and journalists.
          </p>
        </>
      ),
    },
  ],
  faqs: [
    {
      question: "Is FootprintIQ safe for journalists to use?",
      answer: "Yes. FootprintIQ only analyses publicly accessible data and operates under a published Ethical OSINT Charter. It does not access private accounts, store raw scan data beyond your session, or share results with third parties.",
    },
    {
      question: "Can an adversary tell if I've scanned myself?",
      answer: "No. FootprintIQ scans query public data sources. There is no 'profile view' notification sent to the platforms being checked. The scan is invisible to third parties.",
    },
    {
      question: "Should I use my real identity or a pseudonym for scanning?",
      answer: "Scan both. Use your real identity to understand what adversaries can find, and scan any pseudonyms to check whether they've been linked to your real identity through cross-platform correlation.",
    },
    {
      question: "How often should journalists run exposure audits?",
      answer: "Before every sensitive investigation or field assignment, and at minimum quarterly. Data broker listings and breach databases update continuously, so a clean scan today doesn't guarantee safety next month.",
    },
    {
      question: "Does FootprintIQ work for activists in authoritarian regimes?",
      answer: "FootprintIQ maps publicly visible exposure, which is useful for understanding what state actors or adversaries can find. However, it should be used alongside comprehensive operational security training — digital exposure is only one dimension of risk.",
    },
    {
      question: "Can I use FootprintIQ to check my sources' exposure?",
      answer: "Only with explicit, informed consent from the individual. FootprintIQ's ethical principles require consent-based scanning. Never scan someone without their knowledge or permission.",
    },
  ],
  relatedGuides: playbookLinks,
};

const JournalistRiskAudit = () => <QAGuideLayout data={data} />;
export default JournalistRiskAudit;
