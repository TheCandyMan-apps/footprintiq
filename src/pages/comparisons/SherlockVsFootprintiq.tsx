import { ComparisonPageLayout, ComparisonPageData } from "@/components/seo/ComparisonPageLayout";

const data: ComparisonPageData = {
  slug: "comparisons/sherlock-vs-footprintiq",
  title: "Sherlock vs FootprintIQ – CLI Username Search vs Automated OSINT Platform (2026) | FootprintIQ",
  metaDescription:
    "Compare Sherlock, Maigret, and WhatsMyName with FootprintIQ. CLI-based username enumeration vs automated, AI-filtered digital footprint intelligence.",
  h1: "Sherlock, Maigret & WhatsMyName vs FootprintIQ: CLI Tools vs Automated OSINT",
  subtitle:
    "Sherlock, Maigret, and WhatsMyName are powerful CLI-based username enumeration tools. FootprintIQ wraps multiple engines in an automated pipeline with AI false-positive filtering, breach correlation, and remediation guidance.",
  competitorName: "CLI Tools (Sherlock, Maigret, WhatsMyName)",
  competitorTagline: "Open-source command-line username enumeration",
  footprintiqTagline: "Automated multi-tool OSINT with AI filtering",
  introText:
    "Sherlock, Maigret, and WhatsMyName are among the most popular open-source OSINT tools for username enumeration. They allow users to check if a username exists across hundreds of platforms by querying each site directly. These tools are powerful, free, and fully customisable — but they require technical setup, produce significant false positives, and don't correlate results with breach data or data broker exposure. FootprintIQ takes a different approach: it combines multiple username enumeration engines (including techniques similar to Sherlock, Maigret, and WhatsMyName) in an automated pipeline, applies AI-powered false-positive filtering (LENS), and correlates findings with email breach data and data broker scanning. The result is a comprehensive digital footprint assessment accessible through a web interface — no CLI required.",
  whoIsCompetitorFor: [
    "Technical users comfortable with Python/CLI installation and configuration",
    "Security researchers who need full control over scanning parameters and output",
    "Users who prefer open-source, auditable tools they can inspect and modify",
    "Developers building custom OSINT pipelines who need a component tool",
    "Privacy advocates who want to run tools locally without sending data externally",
  ],
  whoIsFootprintiqFor: [
    "Users who want comprehensive results without technical setup or CLI knowledge",
    "Anyone who needs accurate results with minimal false positives (AI-filtered)",
    "People who want username exposure correlated with breach data and data broker listings",
    "Professionals who need presentable reports with risk scoring and remediation guidance",
    "Users who value speed — results from multiple engines in a single scan",
  ],
  comparisonRows: [
    { feature: "No technical setup required", competitor: "no", footprintiq: "yes" },
    { feature: "Open source / auditable", competitor: "yes", footprintiq: "partial" },
    { feature: "Username search (500+ platforms)", competitor: "yes", footprintiq: "yes" },
    { feature: "AI false-positive filtering", competitor: "no", footprintiq: "yes" },
    { feature: "Email breach detection", competitor: "no", footprintiq: "yes" },
    { feature: "Data broker scanning", competitor: "no", footprintiq: "yes" },
    { feature: "Dark web signal detection", competitor: "no", footprintiq: "yes" },
    { feature: "Multi-engine correlation", competitor: "no", footprintiq: "yes" },
    { feature: "Risk scoring", competitor: "no", footprintiq: "yes" },
    { feature: "Remediation guidance", competitor: "no", footprintiq: "yes" },
    { feature: "Exportable reports", competitor: "partial", footprintiq: "yes" },
    { feature: "Full CLI customisation", competitor: "yes", footprintiq: "no" },
    { feature: "Runs locally (no external API)", competitor: "yes", footprintiq: "no" },
    { feature: "Free tier available", competitor: "yes", footprintiq: "yes" },
  ],
  whyFootprintiqBetter: [
    "You want results from multiple OSINT engines combined and correlated in a single scan — not raw output from one tool at a time.",
    "You need AI-powered false-positive filtering. CLI tools like Sherlock often return 30-50% false positives; FootprintIQ's LENS system eliminates noise.",
    "You want username exposure correlated with email breach history and data broker listings for a complete risk picture.",
    "You need presentable reports with risk scoring and actionable remediation guidance — not raw JSON or terminal output.",
    "You're not a technical user and don't want to install Python, configure environments, or troubleshoot CLI dependencies.",
  ],
  whyCompetitorBetter: [
    "You need full control over scanning parameters, output formats, and platform lists — CLI tools offer maximum customisation.",
    "You prefer running tools locally on your own machine with no data leaving your system.",
    "You want fully open-source, auditable tools where you can inspect every line of code.",
    "You're building a custom OSINT pipeline and need component tools you can integrate programmatically.",
    "You're a security researcher who needs the raw, unfiltered output for manual analysis.",
  ],
  faqs: [
    {
      question: "What is Sherlock?",
      answer:
        "Sherlock is an open-source Python tool that checks if a username exists across 400+ social media and web platforms. It works by querying each platform and analysing the HTTP response to determine if a profile exists. It's one of the most popular OSINT tools on GitHub.",
    },
    {
      question: "What is Maigret?",
      answer:
        "Maigret is a fork of Sherlock with expanded capabilities. It supports more platforms (2,500+), uses more sophisticated detection methods, and can extract additional information from discovered profiles. Like Sherlock, it's a CLI tool requiring Python installation.",
    },
    {
      question: "What is WhatsMyName?",
      answer:
        "WhatsMyName is a project that maintains one of the largest databases of platform-to-username mappings. It provides both a web interface and a JSON database that other tools can use. Its database is often integrated into other OSINT tools.",
    },
    {
      question: "Why does FootprintIQ have fewer false positives than Sherlock?",
      answer:
        "CLI tools like Sherlock rely primarily on HTTP status codes and page content patterns to detect profiles. This produces many false positives — pages that return 200 OK but don't actually contain a real profile. FootprintIQ's LENS engine uses AI confidence scoring to analyse page context, verify profile authenticity, and filter out noise.",
    },
    {
      question: "Can I use Sherlock and FootprintIQ together?",
      answer:
        "Yes. Some users run Sherlock locally for quick checks and use FootprintIQ for comprehensive assessments with breach correlation, data broker scanning, and AI-filtered accuracy. The tools serve different purposes and can be complementary.",
    },
    {
      question: "Is FootprintIQ open source?",
      answer:
        "FootprintIQ's scanning methodology and ethical charter are publicly documented, but the platform code is not open source. The AI filtering engine (LENS), breach correlation logic, and platform infrastructure are proprietary. If fully open-source tools are a requirement, Sherlock and Maigret are excellent options.",
    },
  ],
};

export default function SherlockVsFootprintiq() {
  return <ComparisonPageLayout data={data} />;
}
