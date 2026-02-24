import React from "react";
import { Link } from "react-router-dom";
import { QAGuideLayout, type QAGuideData } from "@/components/guides/QAGuideLayout";

const playbookLinks = [
  { label: "Pre-Travel Executive Exposure Check", to: "/playbooks/executive-travel-check" },
  { label: "Journalist & Activist Risk Audit", to: "/playbooks/journalist-risk-audit" },
  { label: "Pre-Employment Exposure Review", to: "/playbooks/pre-employment-exposure-review" },
];

const data: QAGuideData = {
  slug: "playbooks/executive-travel-check",
  title: "Pre-Travel Executive Exposure Check | FootprintIQ Playbook",
  metaDescription: "A step-by-step playbook for executives and high-profile individuals to audit their digital exposure before international travel or public appearances.",
  h1: "Pre-Travel Executive Exposure Check",
  subtitle: "A practical workflow for executives, VIPs, and high-profile individuals to assess their publicly visible digital footprint before international travel, conferences, or media appearances.",
  publishedDate: "2026-02-24",
  sections: [
    {
      heading: "Why Executives Need a Pre-Travel Exposure Audit",
      content: (
        <>
          <p>
            Executives, board members, and public-facing professionals carry a unique risk profile. Before international travel or high-visibility events, adversaries — from social engineers to competitive intelligence teams — may research targets using publicly accessible data.
          </p>
          <p>
            A pre-travel exposure check maps what is already visible: old social media accounts, leaked credentials, forum posts, data broker listings, and cross-platform identity links. The goal is not to eliminate your digital presence, but to <strong>understand what an attacker would see</strong> and prioritise remediation before you travel.
          </p>
          <p>
            This playbook outlines a repeatable, ethical workflow using FootprintIQ's scanning capabilities paired with manual checks, so your security team or EA can run it ahead of every trip.
          </p>
        </>
      ),
    },
    {
      heading: "Step 1: Run a Full-Spectrum Username & Email Scan",
      content: (
        <>
          <p>
            Start by running a <Link to="/scan" className="text-primary underline underline-offset-4 hover:text-primary/80">FootprintIQ scan</Link> using the executive's primary username(s) and email address. This provides the baseline exposure map.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Scan all known usernames (personal, corporate, legacy)</li>
            <li>Include personal and corporate email addresses</li>
            <li>Review the exposure level indicator for severity classification</li>
            <li>Note any results flagged as <em>Elevated</em> exposure</li>
          </ul>
          <p>
            The scan correlates findings across 350+ public platforms, identifying profile matches, data broker listings, and breach records.
          </p>
        </>
      ),
    },
    {
      heading: "Step 2: Review Breach & Credential Exposure",
      content: (
        <>
          <p>
            Check whether the executive's credentials appear in known data breaches. Even old breaches matter — credential reuse means a 2019 breach could compromise a 2026 account.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Review breach results in the scan report</li>
            <li>Flag any breaches involving corporate email domains</li>
            <li>Check whether exposed passwords are still in active use</li>
            <li>Recommend immediate password rotation for flagged accounts</li>
          </ul>
          <p>
            FootprintIQ does not store or display plaintext passwords. It surfaces breach records to help you assess risk.
          </p>
        </>
      ),
    },
    {
      heading: "Step 3: Assess Social & Messaging Platform Exposure",
      content: (
        <>
          <p>
            Social media and messaging platforms are primary intelligence vectors. Review what an adversary could learn from publicly visible profiles:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Travel patterns revealed through check-ins or geotagged posts</li>
            <li>Personal relationships visible through followers, tagged photos, or public group memberships</li>
            <li>Professional connections that reveal organisational structure</li>
            <li>Messaging platform presence (Telegram channels, Discord servers)</li>
          </ul>
          <p>
            Use the <Link to="/scan" className="text-primary underline underline-offset-4 hover:text-primary/80">Messaging Intelligence</Link> tab to review public channel associations and interaction patterns.
          </p>
        </>
      ),
    },
    {
      heading: "Step 4: Check Data Broker Listings",
      content: (
        <>
          <p>
            Data broker sites aggregate and sell personal information — home addresses, phone numbers, family members, and property records. For executives, this data can be weaponised for <Link to="/resources/doxxing-defense" className="text-primary underline underline-offset-4 hover:text-primary/80">doxxing</Link> or physical security threats.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cross-reference scan results with known data broker platforms</li>
            <li>Submit opt-out requests for the most sensitive listings</li>
            <li>Use FootprintIQ's <Link to="/guides/remove-from-data-brokers" className="text-primary underline underline-offset-4 hover:text-primary/80">data broker removal guide</Link> for step-by-step instructions</li>
            <li>Prioritise removal of home address and phone number listings</li>
          </ul>
        </>
      ),
    },
    {
      heading: "Step 5: Document & Brief",
      content: (
        <>
          <p>
            Compile findings into a concise briefing document for the executive and their security team. The brief should include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Exposure summary:</strong> Overall risk level (Minimal / Moderate / Elevated)</li>
            <li><strong>Top risks:</strong> 3–5 most actionable findings requiring immediate attention</li>
            <li><strong>Remediation actions:</strong> Password changes, account privacy settings, opt-out requests</li>
            <li><strong>Travel-specific recommendations:</strong> Devices, VPN usage, social media silence periods</li>
          </ul>
          <p>
            FootprintIQ's Pro tier includes structured PDF reporting for streamlined executive briefings.
          </p>
        </>
      ),
    },
    {
      heading: "Repeatable Workflow: Before Every Trip",
      content: (
        <>
          <p>
            This playbook is designed to be repeatable. We recommend running this workflow:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>7–14 days before travel</strong> — allows time for opt-outs and password rotations</li>
            <li><strong>After any public appearance</strong> — conferences, media interviews, or viral social media moments</li>
            <li><strong>Quarterly</strong> — as a baseline hygiene check for C-suite and board members</li>
          </ul>
          <p>
            Consistent exposure auditing turns digital hygiene from a reactive scramble into a predictable, manageable process.
          </p>
        </>
      ),
    },
  ],
  faqs: [
    {
      question: "How long does a pre-travel exposure check take?",
      answer: "A thorough check using FootprintIQ typically takes 15–30 minutes, depending on the number of usernames and email addresses scanned. Allow additional time for remediation actions like opt-outs and password changes.",
    },
    {
      question: "Can my executive assistant run this workflow?",
      answer: "Yes. This playbook is designed for non-technical users. An EA or security coordinator can run the scan, review findings, and compile the briefing with no OSINT expertise required.",
    },
    {
      question: "Does FootprintIQ access private accounts?",
      answer: "No. FootprintIQ only analyses publicly accessible data. It does not log into accounts, bypass authentication, or access private messages. All scans are ethical, legal, and consent-based.",
    },
    {
      question: "What should I do if the scan reveals elevated exposure?",
      answer: "Focus on the top 3–5 highest-risk findings. Rotate compromised passwords immediately, submit data broker opt-outs, and tighten social media privacy settings. Consider engaging a professional digital risk service for persistent issues.",
    },
    {
      question: "Is this workflow suitable for board members?",
      answer: "Absolutely. Board members, advisors, and non-executive directors often have legacy digital footprints that predate current security awareness. This workflow helps surface and address those risks.",
    },
    {
      question: "How is this different from a threat intelligence assessment?",
      answer: "This is a focused, self-service exposure audit — not a full threat intelligence engagement. It maps what's publicly visible about an individual, whereas threat intelligence assesses active threats, adversary intent, and organisational risk posture.",
    },
  ],
  relatedGuides: playbookLinks,
};

const ExecutiveTravelCheck = () => <QAGuideLayout data={data} />;
export default ExecutiveTravelCheck;
