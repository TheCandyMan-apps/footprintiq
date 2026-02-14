import { ComparisonPageLayout, type ComparisonPageData } from "@/components/seo/ComparisonPageLayout";

const data: ComparisonPageData = {
  slug: "aura-vs-footprintiq",
  title: "Aura vs FootprintIQ – Digital Protection Comparison (2026) | FootprintIQ",
  metaDescription: "Compare Aura and FootprintIQ. Aura offers identity theft protection and credit monitoring. FootprintIQ provides ethical digital footprint intelligence and exposure mapping.",
  h1: "Aura vs FootprintIQ",
  subtitle: "Identity theft protection compared with ethical digital footprint intelligence.",
  competitorName: "Aura",
  competitorTagline: "All-in-one identity theft protection",
  footprintiqTagline: "Ethical digital footprint intelligence",
  introText: "Aura is a comprehensive identity protection service that bundles credit monitoring, dark web alerts, VPN, antivirus, and identity theft insurance. FootprintIQ takes a different approach — it focuses specifically on mapping your public digital exposure using ethical OSINT techniques and providing actionable intelligence. The two tools serve different but complementary needs.",
  whoIsCompetitorFor: [
    "Users who want bundled identity protection (credit, antivirus, VPN)",
    "People concerned about active identity theft and fraud",
    "Families needing parental controls and multi-device protection",
    "Those who want identity theft insurance coverage",
  ],
  whoIsFootprintiqFor: [
    "Users who want to understand exactly what's publicly visible about them",
    "Privacy-conscious individuals focused on reducing digital exposure",
    "Professionals conducting ethical OSINT self-assessment",
    "Anyone who wants a clear map of username reuse and public profile visibility",
    "Users seeking a structured remediation roadmap",
  ],
  comparisonRows: [
    { feature: "Public profile scanning", competitor: "partial", footprintiq: "yes" },
    { feature: "Username reuse detection", competitor: "no", footprintiq: "yes" },
    { feature: "Credit monitoring", competitor: "yes", footprintiq: "no" },
    { feature: "Dark web monitoring", competitor: "yes", footprintiq: "Breach signals" },
    { feature: "VPN included", competitor: "yes", footprintiq: "no" },
    { feature: "Antivirus included", competitor: "yes", footprintiq: "no" },
    { feature: "Identity theft insurance", competitor: "yes", footprintiq: "no" },
    { feature: "Exposure scoring", competitor: "no", footprintiq: "yes" },
    { feature: "Remediation roadmap", competitor: "no", footprintiq: "yes" },
    { feature: "Ethical OSINT methodology", competitor: "no", footprintiq: "yes" },
    { feature: "Free tier available", competitor: "no", footprintiq: "yes" },
  ],
  whyFootprintiqBetter: [
    "You want to understand your public exposure, not just monitor for fraud",
    "Username reuse and cross-platform visibility are priorities",
    "You need intelligence-driven remediation, not reactive alerts",
    "You want a focused OSINT tool rather than a bundled suite",
    "You prefer ethical, transparent methodology",
  ],
  whyCompetitorBetter: [
    "You need active identity theft protection and insurance",
    "Credit monitoring and fraud alerts are your primary concern",
    "You want a bundled security suite (VPN, antivirus, password manager)",
    "You need family protection with parental controls",
  ],
  faqs: [
    { question: "Is Aura the same as FootprintIQ?", answer: "No. Aura is an identity theft protection suite that bundles credit monitoring, VPN, antivirus, and insurance. FootprintIQ is a digital footprint intelligence platform that maps your public exposure and provides remediation guidance using ethical OSINT." },
    { question: "Can I use both Aura and FootprintIQ?", answer: "Yes — they complement each other well. Aura protects against identity theft and fraud. FootprintIQ shows you what's publicly visible about you so you can proactively reduce your exposure." },
    { question: "Does FootprintIQ offer credit monitoring?", answer: "No. FootprintIQ focuses on digital footprint intelligence — mapping public profiles, username reuse, data broker listings, and breach signals. For credit monitoring, a service like Aura would be more appropriate." },
    { question: "Which is better for privacy?", answer: "It depends on your definition. Aura protects your identity from theft. FootprintIQ helps you understand and reduce what's publicly visible. For proactive digital privacy management, FootprintIQ provides deeper exposure intelligence." },
  ],
};

const AuraVsFootprintiq = () => <ComparisonPageLayout data={data} />;
export default AuraVsFootprintiq;
