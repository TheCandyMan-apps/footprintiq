import { ComparisonPageLayout, type ComparisonPageData } from "@/components/seo/ComparisonPageLayout";

const data: ComparisonPageData = {
  slug: "best-digital-footprint-scanner",
  title: "Best Digital Footprint Scanners in 2026 – Comparison & Review | FootprintIQ",
  metaDescription: "Compare the best digital footprint scanners in 2026. See how FootprintIQ, Aura, DeleteMe, Incogni, and Kanary compare on features, privacy, and approach.",
  h1: "Best Digital Footprint Scanners in 2026",
  subtitle: "An objective comparison of the leading tools for understanding and reducing your online exposure.",
  competitorName: "Removal Services",
  competitorTagline: "Automated data broker removal",
  footprintiqTagline: "Ethical digital footprint intelligence",
  introText: "Choosing the right digital footprint tool depends on what you need. Some tools focus on automated data removal from brokers. Others — like FootprintIQ — focus on mapping your full public exposure before you decide what to remove. This page compares the most popular options so you can make an informed choice.",
  whoIsCompetitorFor: [
    "Users who want hands-off, automated data broker removal",
    "People primarily concerned with people-search site listings",
    "Those who prefer a subscription service that handles removal requests",
    "Users who already know what they want removed",
  ],
  whoIsFootprintiqFor: [
    "Users who want to understand their full digital exposure first",
    "Privacy-conscious individuals mapping username reuse and public profiles",
    "Professionals conducting ethical OSINT research",
    "Anyone who wants a structured remediation roadmap before taking action",
    "Users who value transparency about what's publicly visible",
  ],
  comparisonRows: [
    { feature: "Public profile scanning", competitor: "partial", footprintiq: "yes" },
    { feature: "Username reuse detection", competitor: "no", footprintiq: "yes" },
    { feature: "Data broker monitoring", competitor: "yes", footprintiq: "yes" },
    { feature: "Automated removal requests", competitor: "yes", footprintiq: "no" },
    { feature: "Breach signal detection", competitor: "partial", footprintiq: "yes" },
    { feature: "Exposure scoring", competitor: "partial", footprintiq: "yes" },
    { feature: "Remediation roadmap", competitor: "no", footprintiq: "yes" },
    { feature: "Ethical OSINT methodology", competitor: "partial", footprintiq: "yes" },
    { feature: "Free tier available", competitor: "no", footprintiq: "yes" },
  ],
  whyFootprintiqBetter: [
    "You want to understand your full exposure before deciding what to remove",
    "Username reuse and cross-platform visibility matter to you",
    "You need a prioritised remediation plan, not just blind removal",
    "You want ethical, transparent OSINT methodology",
    "You need breach signals combined with public profile analysis",
  ],
  whyCompetitorBetter: [
    "You want fully automated, hands-off data broker removal",
    "Your primary concern is people-search site listings specifically",
    "You prefer a service that handles everything without user involvement",
    "You don't need to understand your exposure — just want things removed",
  ],
  faqs: [
    { question: "What is the best digital footprint scanner?", answer: "It depends on your goal. If you want to understand your full public exposure — including username reuse, breach signals, and cross-platform visibility — FootprintIQ provides the most comprehensive intelligence. If you want automated removal of data broker listings, services like DeleteMe or Incogni specialise in that." },
    { question: "Do I need a scanner and a removal service?", answer: "Ideally, yes. Scanning tools like FootprintIQ map your exposure and help you prioritise. Removal services handle the opt-out process. Using both gives you visibility and action." },
    { question: "Is FootprintIQ free?", answer: "Yes — FootprintIQ offers free scans that show where your exposure exists. Pro scans provide deeper analysis, false-positive filtering, and structured remediation guidance." },
    { question: "How is FootprintIQ different from removal services?", answer: "FootprintIQ is an intelligence platform, not a removal service. It maps your public exposure across hundreds of platforms and provides a prioritised action plan. Removal services focus specifically on submitting opt-out requests to data brokers." },
  ],
};

const BestDigitalFootprintScanner = () => <ComparisonPageLayout data={data} />;
export default BestDigitalFootprintScanner;
