import { ComparisonPageLayout, type ComparisonPageData } from "@/components/seo/ComparisonPageLayout";

const data: ComparisonPageData = {
  slug: "deleteme-vs-footprintiq",
  title: "DeleteMe vs FootprintIQ – Data Removal vs Exposure Intelligence (2026) | FootprintIQ",
  metaDescription: "Compare DeleteMe and FootprintIQ. DeleteMe removes your data from brokers. FootprintIQ maps your full digital exposure first. See which approach fits your needs.",
  h1: "DeleteMe vs FootprintIQ",
  subtitle: "Automated data removal compared with digital exposure intelligence.",
  competitorName: "DeleteMe",
  competitorTagline: "Automated data broker removal service",
  footprintiqTagline: "Ethical digital footprint intelligence",
  introText: "DeleteMe is a well-established data removal service that submits opt-out requests to people-search sites and data brokers on your behalf. FootprintIQ takes a fundamentally different approach — it maps your full digital exposure first, helping you understand what's visible and where, so you can make informed decisions about what to prioritise. Think of it as intelligence before action.",
  whoIsCompetitorFor: [
    "Users who want hands-off data broker removal",
    "People whose primary concern is people-search listings (Spokeo, Whitepages, etc.)",
    "Those who prefer a managed service that handles opt-outs automatically",
    "Users who already know their data is on broker sites",
  ],
  whoIsFootprintiqFor: [
    "Users who want to understand their full public exposure before removing anything",
    "People concerned about username reuse and cross-platform profile visibility",
    "Professionals conducting ethical OSINT self-assessment",
    "Anyone who wants a prioritised remediation roadmap — not just blind removal",
    "Users who want intelligence, not just action",
  ],
  comparisonRows: [
    { feature: "Data broker removal", competitor: "yes", footprintiq: "Guidance & links" },
    { feature: "People-search opt-outs", competitor: "yes", footprintiq: "Guidance & links" },
    { feature: "Public profile scanning", competitor: "no", footprintiq: "yes" },
    { feature: "Username reuse detection", competitor: "no", footprintiq: "yes" },
    { feature: "Breach signal detection", competitor: "no", footprintiq: "yes" },
    { feature: "Exposure scoring", competitor: "no", footprintiq: "yes" },
    { feature: "Cross-platform visibility map", competitor: "no", footprintiq: "yes" },
    { feature: "Remediation priority ranking", competitor: "no", footprintiq: "yes" },
    { feature: "Free tier available", competitor: "no", footprintiq: "yes" },
  ],
  whyFootprintiqBetter: [
    "You want to understand your full exposure before deciding what to remove",
    "Data brokers are only part of your concern — you also care about public profiles and username reuse",
    "You need a prioritised action plan, not just automated opt-outs",
    "You want to map exposure across hundreds of platforms, not just broker sites",
    "You value intelligence-driven decision making",
  ],
  whyCompetitorBetter: [
    "Your primary goal is removing listings from data broker sites",
    "You want a fully managed, hands-off removal experience",
    "You don't need to see or understand your exposure — just want it gone",
    "Your concern is specifically people-search sites",
  ],
  faqs: [
    { question: "Does FootprintIQ remove my data like DeleteMe?", answer: "No. FootprintIQ maps your exposure and provides a structured remediation roadmap — including official opt-out links and removal guidance. DeleteMe handles the opt-out process for you. FootprintIQ gives you the intelligence; DeleteMe gives you the execution." },
    { question: "Should I use DeleteMe and FootprintIQ together?", answer: "Yes — they work well together. FootprintIQ maps your full digital exposure and helps you prioritise what matters most. DeleteMe can then handle the data broker removal process. Intelligence first, action second." },
    { question: "Is DeleteMe better than FootprintIQ?", answer: "They serve different purposes. DeleteMe is better if you want automated data broker removal. FootprintIQ is better if you want to understand your full public exposure — including username reuse, public profiles, and breach signals — before taking action." },
    { question: "Why would I map exposure instead of just removing everything?", answer: "Because not all exposure is equal. Some listings are higher risk than others. A strategic approach — mapping first, then prioritising — is more effective than blind removal. FootprintIQ helps you identify what matters most." },
  ],
};

const DeletemeVsFootprintiq = () => <ComparisonPageLayout data={data} />;
export default DeletemeVsFootprintiq;
