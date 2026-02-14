import { ComparisonPageLayout, type ComparisonPageData } from "@/components/seo/ComparisonPageLayout";

const data: ComparisonPageData = {
  slug: "incogni-vs-footprintiq",
  title: "Incogni vs FootprintIQ – Privacy Removal vs Exposure Intelligence (2026) | FootprintIQ",
  metaDescription: "Compare Incogni and FootprintIQ. Incogni automates data broker removal requests. FootprintIQ maps your full digital exposure. See which approach suits your privacy needs.",
  h1: "Incogni vs FootprintIQ",
  subtitle: "Automated data removal compared with comprehensive exposure mapping.",
  competitorName: "Incogni",
  competitorTagline: "Automated data broker removal by Surfshark",
  footprintiqTagline: "Ethical digital footprint intelligence",
  introText: "Incogni, developed by Surfshark, automates the process of sending data removal requests to data brokers and people-search sites. FootprintIQ operates upstream — it maps your full public digital exposure across hundreds of platforms, helping you understand what's visible and build a prioritised strategy. Both tools serve privacy, but from different angles.",
  whoIsCompetitorFor: [
    "Users who want affordable, automated data broker removal",
    "Surfshark users looking for an integrated privacy suite",
    "People who want a set-and-forget removal service",
    "Those primarily concerned with data broker and people-search listings",
  ],
  whoIsFootprintiqFor: [
    "Users who want to understand their exposure before acting on it",
    "People concerned about username reuse, public profiles, and cross-platform visibility",
    "Professionals and researchers conducting ethical OSINT",
    "Anyone who wants a clear, prioritised remediation roadmap",
    "Users who need breach signals alongside public exposure data",
  ],
  comparisonRows: [
    { feature: "Data broker removal", competitor: "yes", footprintiq: "Guidance & links" },
    { feature: "Number of brokers covered", competitor: "180+", footprintiq: "Guidance for 200+" },
    { feature: "Public profile scanning", competitor: "no", footprintiq: "yes" },
    { feature: "Username reuse detection", competitor: "no", footprintiq: "yes" },
    { feature: "Breach signal detection", competitor: "no", footprintiq: "yes" },
    { feature: "Exposure scoring", competitor: "no", footprintiq: "yes" },
    { feature: "Remediation priority ranking", competitor: "no", footprintiq: "yes" },
    { feature: "Progress tracking", competitor: "yes", footprintiq: "yes" },
    { feature: "Free tier available", competitor: "no", footprintiq: "yes" },
  ],
  whyFootprintiqBetter: [
    "You want a full picture of your digital exposure — not just broker listings",
    "Username reuse and public profile visibility are priorities",
    "You need intelligence to prioritise which exposures matter most",
    "You want breach signals combined with public data analysis",
    "You prefer ethical, transparent methodology over black-box automation",
  ],
  whyCompetitorBetter: [
    "Your main goal is automated data broker removal at a competitive price",
    "You want a simple, hands-off subscription service",
    "You're already using Surfshark and want integrated privacy tools",
    "You don't need exposure mapping — just want broker listings removed",
  ],
  faqs: [
    { question: "Is Incogni the same as FootprintIQ?", answer: "No. Incogni is a data removal service that sends opt-out requests to data brokers. FootprintIQ is a digital footprint intelligence platform that maps your full public exposure and provides prioritised remediation guidance." },
    { question: "Can I use Incogni and FootprintIQ together?", answer: "Absolutely. FootprintIQ maps your full exposure and prioritises what's most important. Incogni can then handle the automated removal of data broker listings. Together, they provide intelligence-driven privacy management." },
    { question: "Does FootprintIQ send removal requests?", answer: "No. FootprintIQ provides the intelligence layer — mapping your exposure, scoring risk, and generating a prioritised remediation roadmap with official opt-out links. The removal action is up to you or a service like Incogni." },
    { question: "Is Incogni cheaper than FootprintIQ?", answer: "Incogni offers a subscription for automated broker removal. FootprintIQ offers free scans for basic exposure visibility, with Pro plans for deeper intelligence. They're priced for different services — removal vs intelligence." },
  ],
};

const IncogniVsFootprintiq = () => <ComparisonPageLayout data={data} />;
export default IncogniVsFootprintiq;
