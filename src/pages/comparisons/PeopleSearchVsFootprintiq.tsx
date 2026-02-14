import { ComparisonPageLayout, ComparisonPageData } from "@/components/seo/ComparisonPageLayout";

const data: ComparisonPageData = {
  slug: "people-search-vs-footprintiq",
  title: "People-Search Sites vs FootprintIQ – What's the Difference? (2026) | FootprintIQ",
  metaDescription:
    "Compare people-search sites like BeenVerified, Intelius, and Pipl with FootprintIQ. Understand the difference between data brokerage and ethical digital footprint intelligence.",
  h1: "People-Search Sites vs FootprintIQ",
  subtitle:
    "One category profits from exposing your data. The other helps you understand and reduce it.",
  competitorName: "People-Search Sites",
  competitorTagline: "Data aggregation and people lookup services",
  footprintiqTagline: "Ethical Digital Footprint Intelligence Platform",
  introText:
    "People-search sites — including BeenVerified, Intelius, Pipl, Spokeo, and TruePeopleSearch — aggregate personal information from public records, social media, and data brokers, then sell access to that data. FootprintIQ takes the opposite approach: it scans publicly accessible sources to show you what's visible about you, then provides a prioritised remediation plan to reduce your exposure. FootprintIQ never sells data, never profiles third parties without consent, and operates under a published Ethical OSINT Charter.",
  whoIsCompetitorFor: [
    "Users looking up other people's phone numbers, addresses, or background information",
    "Skip-tracing, debt collection, or tenant screening workflows",
    "Businesses that need bulk contact enrichment or identity resolution",
    "Investigators who need aggregated public-record dossiers on subjects",
  ],
  whoIsFootprintiqFor: [
    "Anyone who wants to see what's publicly visible about themselves",
    "People cleaning up after a data breach or privacy incident",
    "Parents checking their family's online exposure",
    "Security professionals conducting authorised, ethical OSINT assessments",
    "HR and compliance teams evaluating digital risk with consent",
  ],
  comparisonRows: [
    { feature: "Designed for self-assessment", competitor: "no", footprintiq: "yes" },
    { feature: "Consent-based scanning", competitor: "no", footprintiq: "yes" },
    { feature: "Published ethical charter", competitor: "no", footprintiq: "yes" },
    { feature: "Sells or monetises personal data", competitor: "yes", footprintiq: "no" },
    { feature: "Remediation roadmap", competitor: "no", footprintiq: "yes" },
    { feature: "Breach signal detection", competitor: "partial", footprintiq: "yes" },
    { feature: "Exposure risk scoring", competitor: "no", footprintiq: "yes" },
    { feature: "Data broker opt-out guidance", competitor: "no", footprintiq: "yes" },
    { feature: "Username & social media scanning", competitor: "partial", footprintiq: "yes" },
    { feature: "Free tier available", competitor: "partial", footprintiq: "yes" },
    { feature: "Transparent methodology", competitor: "no", footprintiq: "yes" },
    { feature: "Multi-tool OSINT pipeline", competitor: "no", footprintiq: "yes" },
  ],
  whyFootprintiqBetter: [
    "You want to protect yourself, not look up others — FootprintIQ is built for self-assessment, not surveillance.",
    "You want actionable guidance, not raw data — prioritised remediation plans with effort estimates and opt-out links.",
    "You care about ethics and transparency — published charter, consent-based scanning, no data brokerage.",
    "You want breach + footprint intelligence combined in one scan, not siloed across multiple paid services.",
    "You want a free starting point — free scans with meaningful results, not paywalled teasers.",
  ],
  whyCompetitorBetter: [
    "You need to look up someone else's contact details, address history, or court records.",
    "You need bulk contact enrichment or skip-tracing for business workflows.",
    "You need aggregated public-record dossiers (not exposure intelligence) for specific individuals.",
    "You need real-time identity resolution APIs for enterprise integrations.",
  ],
  faqs: [
    {
      question: "Is FootprintIQ a people-search site?",
      answer:
        "No. People-search sites aggregate and sell personal data about other people. FootprintIQ is a self-assessment tool that shows you what's publicly visible about you, then helps you reduce that exposure. FootprintIQ never sells data and operates under a published Ethical OSINT Charter.",
    },
    {
      question: "Can I use FootprintIQ to look up other people?",
      answer:
        "FootprintIQ is designed for self-assessment and authorised research only. You cannot use it to look up other people without their knowledge or consent. This is a core ethical boundary that distinguishes FootprintIQ from people-search services.",
    },
    {
      question: "How is FootprintIQ different from BeenVerified or Spokeo?",
      answer:
        "BeenVerified and Spokeo are data brokers that aggregate and sell personal information. FootprintIQ scans publicly accessible sources to map your digital exposure, scores the risk of each finding, and provides a step-by-step remediation plan. FootprintIQ never stores or sells your data.",
    },
    {
      question: "Does FootprintIQ access private databases?",
      answer:
        "No. FootprintIQ only analyses publicly accessible information — social media profiles, forum posts, data broker listings, and breach databases. It never accesses private records, court databases, or paywalled sources.",
    },
    {
      question: "Is FootprintIQ safe for activists and journalists?",
      answer:
        "Yes. FootprintIQ is designed with privacy-first principles. Scans are consent-based, data is not retained beyond the session, and the platform never creates profiles of third parties. It is suitable for high-risk individuals who need to assess their own public exposure.",
    },
    {
      question: "Why don't people-search sites offer remediation?",
      answer:
        "People-search sites profit from data exposure — helping you remove data would undermine their business model. FootprintIQ's business model is aligned with your privacy: we help you reduce exposure, not create more of it.",
    },
  ],
};

export default function PeopleSearchVsFootprintiq() {
  return <ComparisonPageLayout data={data} />;
}
