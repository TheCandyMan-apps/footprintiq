import { ComparisonPageLayout, ComparisonPageData } from "@/components/seo/ComparisonPageLayout";

const data: ComparisonPageData = {
  slug: "osint-suites-vs-footprintiq",
  title: "Investigator OSINT Suites vs FootprintIQ – Comparison (2026) | FootprintIQ",
  metaDescription:
    "Compare professional investigator OSINT suites like Maltego, SpiderFoot, and Recon-NG with FootprintIQ. Understand when you need an investigation platform vs a privacy-first exposure scanner.",
  h1: "Investigator OSINT Suites vs FootprintIQ",
  subtitle:
    "Professional investigation platforms vs ethical, consumer-friendly exposure intelligence.",
  competitorName: "OSINT Suites",
  competitorTagline: "Professional investigation and intelligence platforms (Maltego, SpiderFoot, Recon-NG)",
  footprintiqTagline: "Ethical Digital Footprint Intelligence Platform",
  introText:
    "Professional OSINT suites like Maltego, SpiderFoot, and Recon-NG are powerful investigation frameworks designed for security researchers, law enforcement, and intelligence analysts. They require technical expertise, manual configuration, and often significant licensing costs. FootprintIQ serves a different purpose: it automates multi-tool scanning into a consumer-friendly experience, focusing on self-assessment and privacy-first exposure mapping rather than third-party investigation. Both categories use OSINT techniques, but their audiences, ethics models, and outputs are fundamentally different.",
  whoIsCompetitorFor: [
    "Security researchers conducting deep technical investigations",
    "Law enforcement and intelligence analysts with authorised mandates",
    "Penetration testers mapping attack surfaces for clients",
    "OSINT practitioners who need graph-based entity relationship analysis",
    "Users comfortable with CLI tools, API configurations, and manual workflows",
  ],
  whoIsFootprintiqFor: [
    "Anyone who wants to check their own online visibility without technical knowledge",
    "People who want a prioritised remediation plan, not a raw data dump",
    "Organisations needing consent-based employee exposure assessments",
    "Privacy-conscious individuals assessing their digital risk after a breach",
    "Users who want automated scanning without installing or configuring tools",
  ],
  comparisonRows: [
    { feature: "No technical setup required", competitor: "no", footprintiq: "yes" },
    { feature: "Designed for self-assessment", competitor: "no", footprintiq: "yes" },
    { feature: "Published ethical charter", competitor: "partial", footprintiq: "yes" },
    { feature: "Multi-tool automated pipeline", competitor: "partial", footprintiq: "yes" },
    { feature: "Remediation roadmap", competitor: "no", footprintiq: "yes" },
    { feature: "Exposure risk scoring", competitor: "no", footprintiq: "yes" },
    { feature: "Graph-based entity analysis", competitor: "yes", footprintiq: "partial" },
    { feature: "Custom module/plugin ecosystem", competitor: "yes", footprintiq: "no" },
    { feature: "Breach signal detection", competitor: "partial", footprintiq: "yes" },
    { feature: "Data broker scanning", competitor: "no", footprintiq: "yes" },
    { feature: "Free tier available", competitor: "partial", footprintiq: "yes" },
    { feature: "Consumer-friendly interface", competitor: "no", footprintiq: "yes" },
    { feature: "False-positive filtering", competitor: "no", footprintiq: "yes" },
  ],
  whyFootprintiqBetter: [
    "You want to check your own exposure without learning CLI tools or OSINT frameworks.",
    "You need a prioritised remediation plan with effort estimates and opt-out links, not a graph of raw entities.",
    "You want automated multi-tool scanning that filters false positives and scores risk — no manual configuration.",
    "You need breach signals, data broker scanning, and social media exposure in a single scan.",
    "You want an ethical, consent-based tool safe for personal and family privacy assessments.",
  ],
  whyCompetitorBetter: [
    "You need deep, manual investigation capabilities with custom transforms and graph analysis.",
    "You're a trained OSINT practitioner who needs granular control over data sources and queries.",
    "You need to investigate third parties under a legal mandate (law enforcement, authorised pen-testing).",
    "You need a plugin/module ecosystem to extend functionality for specialised use cases.",
    "You need real-time infrastructure reconnaissance or network-level OSINT capabilities.",
  ],
  faqs: [
    {
      question: "Is FootprintIQ an OSINT tool like Maltego?",
      answer:
        "FootprintIQ uses OSINT techniques under the hood, but it's designed for a different audience. Maltego is a professional investigation framework for trained analysts. FootprintIQ is a consumer-friendly exposure scanner that automates multi-tool OSINT and provides prioritised remediation guidance — no technical expertise required.",
    },
    {
      question: "Can FootprintIQ replace SpiderFoot or Recon-NG?",
      answer:
        "Not for professional investigations. SpiderFoot and Recon-NG offer deep, configurable reconnaissance capabilities designed for security researchers. FootprintIQ complements these tools by providing an accessible self-assessment layer that non-technical users can use independently.",
    },
    {
      question: "Does FootprintIQ use the same data sources as investigator tools?",
      answer:
        "FootprintIQ queries many of the same publicly accessible sources — social media platforms, breach databases, data broker listings, and forums. However, it filters and scores results for consumer relevance rather than presenting raw intelligence graphs.",
    },
    {
      question: "Is FootprintIQ suitable for professional security assessments?",
      answer:
        "Yes, for consent-based exposure assessments. Security consultants and HR teams use FootprintIQ Pro for structured employee exposure reports. For deep-dive adversarial investigations, professional OSINT suites remain more appropriate.",
    },
    {
      question: "Why does FootprintIQ filter results when OSINT suites show everything?",
      answer:
        "Raw OSINT output includes significant noise — false positives, stale data, and low-confidence matches. FootprintIQ's AI-powered filtering and confidence scoring reduce noise so users can focus on actionable findings rather than spending hours validating data manually.",
    },
    {
      question: "Can I use FootprintIQ and Maltego together?",
      answer:
        "Yes. Many security professionals use FootprintIQ for initial exposure mapping and triage, then use Maltego or SpiderFoot for deeper investigation on specific findings that warrant further analysis.",
    },
  ],
};

export default function OsintSuitesVsFootprintiq() {
  return <ComparisonPageLayout data={data} />;
}
