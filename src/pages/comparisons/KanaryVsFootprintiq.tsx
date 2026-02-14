import { ComparisonPageLayout, type ComparisonPageData } from "@/components/seo/ComparisonPageLayout";

const data: ComparisonPageData = {
  slug: "kanary-vs-footprintiq",
  title: "Kanary vs FootprintIQ – Personal Data Removal vs Exposure Intelligence (2026) | FootprintIQ",
  metaDescription: "Compare Kanary and FootprintIQ. Kanary finds and removes personal data from the web. FootprintIQ maps your full digital exposure with ethical OSINT intelligence.",
  h1: "Kanary vs FootprintIQ",
  subtitle: "Personal data removal compared with ethical digital footprint intelligence.",
  competitorName: "Kanary",
  competitorTagline: "Personal data finder and removal service",
  footprintiqTagline: "Ethical digital footprint intelligence",
  introText: "Kanary scans the web for your personal information and automates removal requests to data brokers, people-search sites, and other sources. FootprintIQ approaches privacy from the intelligence side — mapping your full digital exposure, including username reuse and public profiles, to help you understand and strategically reduce your visibility. Both tools help protect your privacy, but they work at different stages of the process.",
  whoIsCompetitorFor: [
    "Users who want automated discovery and removal of personal data",
    "People concerned about their name, address, and phone number appearing online",
    "Those who want continuous monitoring and re-removal if data reappears",
    "Users who prefer a managed personal data cleanup service",
  ],
  whoIsFootprintiqFor: [
    "Users who want to understand the full scope of their digital exposure",
    "People concerned about username reuse, public profiles, and cross-platform patterns",
    "Professionals and researchers using ethical OSINT for self-assessment",
    "Anyone who wants a prioritised remediation roadmap before taking action",
    "Users who need breach signal detection alongside exposure mapping",
  ],
  comparisonRows: [
    { feature: "Personal data discovery", competitor: "yes", footprintiq: "yes" },
    { feature: "Automated removal requests", competitor: "yes", footprintiq: "no" },
    { feature: "Re-removal monitoring", competitor: "yes", footprintiq: "no" },
    { feature: "Username reuse detection", competitor: "no", footprintiq: "yes" },
    { feature: "Public profile scanning", competitor: "partial", footprintiq: "yes" },
    { feature: "Breach signal detection", competitor: "no", footprintiq: "yes" },
    { feature: "Exposure scoring", competitor: "no", footprintiq: "yes" },
    { feature: "Remediation priority ranking", competitor: "no", footprintiq: "yes" },
    { feature: "Cross-platform visibility map", competitor: "no", footprintiq: "yes" },
    { feature: "Free tier available", competitor: "no", footprintiq: "yes" },
  ],
  whyFootprintiqBetter: [
    "You want intelligence about your full digital exposure, not just data broker listings",
    "Username reuse and public profile patterns are important to you",
    "You need a prioritised strategy before deciding what to remove",
    "You want breach signals combined with public visibility analysis",
    "You prefer transparent, ethical OSINT methodology",
  ],
  whyCompetitorBetter: [
    "You want automated removal of personal data from data brokers",
    "Continuous re-monitoring and re-removal are priorities",
    "Your main concern is personal information (name, address, phone) on the web",
    "You want a fully managed service without manual steps",
  ],
  faqs: [
    { question: "Is Kanary the same as FootprintIQ?", answer: "No. Kanary focuses on finding and removing your personal data from data brokers and people-search sites. FootprintIQ is a digital footprint intelligence platform that maps your full public exposure — including username reuse, public profiles, and breach signals — and provides a prioritised remediation roadmap." },
    { question: "Can I use both Kanary and FootprintIQ?", answer: "Yes. FootprintIQ provides the exposure intelligence — showing you where you're visible and what to prioritise. Kanary can handle the automated removal of personal data from broker sites. Intelligence first, removal second." },
    { question: "Does Kanary detect username reuse?", answer: "No. Kanary focuses on personal data discovery and removal. FootprintIQ specialises in detecting username reuse across hundreds of platforms, mapping public profiles, and identifying how your digital identifiers connect." },
    { question: "Which is better for digital privacy?", answer: "They complement each other. Kanary is better for automated data removal. FootprintIQ is better for understanding your complete digital exposure and making strategic decisions about what to address first." },
  ],
};

const KanaryVsFootprintiq = () => <ComparisonPageLayout data={data} />;
export default KanaryVsFootprintiq;
