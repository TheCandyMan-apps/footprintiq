/**
 * Comparison pages registry for programmatic SEO.
 * Each entry generates a /comparisons/:slug page.
 */

import type { FAQ } from "./contentRegistry";

export interface ComparisonEntry {
  slug: string;
  name: string;
  category: string;
  primaryKeyword: string;
  description: string;
  intro: string;
  pros: string[];
  cons: string[];
  whoItsFor: string;
  ethicalPositioning: string;
  features: { feature: string; competitor: string; footprintiq: string }[];
  faqs: FAQ[];
  relatedTools: string[];
  relatedGuides: string[];
}

/** Legacy comparison route → canonical path mapping */
export const LEGACY_COMPARISON_REDIRECTS: Record<string, string> = {
  "/comparisons/sherlock-vs-footprintiq": "/comparisons/sherlock",
  "/comparisons/pimeyes-alternative": "/comparisons/pimeyes",
};

export const comparisonPages: ComparisonEntry[] = [
  {
    slug: "sherlock",
    name: "Sherlock",
    category: "OSINT Tool",
    primaryKeyword: "Sherlock vs FootprintIQ",
    description: "Compare Sherlock and FootprintIQ for username OSINT. See features, accuracy, and ethical safeguards side by side.",
    intro: "Sherlock is a popular open-source command-line tool for finding usernames across social networks. It's fast, free, and widely used in the OSINT community. FootprintIQ integrates Sherlock as part of a broader multi-tool pipeline that adds AI-powered false-positive filtering, a professional dashboard, and ethical safeguards.",
    pros: ["Free and open source", "Fast CLI-based scanning", "Active community and regular updates", "Supports 400+ sites"],
    cons: ["Command-line only — no GUI", "High false-positive rate without filtering", "No reporting or case management", "No ethical use guardrails built in"],
    whoItsFor: "Sherlock is ideal for technical users comfortable with the command line who want quick, raw username lookups. FootprintIQ suits professionals and individuals who need filtered results, reporting, and ethical compliance.",
    ethicalPositioning: "FootprintIQ uses Sherlock as one input in its pipeline but adds AI filtering, confidence scoring, and strict ethical guidelines. Raw Sherlock output can contain many false positives that may lead to incorrect conclusions if not properly validated.",
    features: [
      { feature: "Platform coverage", competitor: "400+ sites", footprintiq: "500+ sites (multi-tool)" },
      { feature: "False-positive filtering", competitor: "None (raw output)", footprintiq: "AI-powered filtering" },
      { feature: "User interface", competitor: "CLI only", footprintiq: "Web dashboard + reports" },
      { feature: "Ethical safeguards", competitor: "None built-in", footprintiq: "Charter + responsible use policy" },
      { feature: "Reporting", competitor: "Terminal output", footprintiq: "PDF/CSV export + case management" },
      { feature: "Price", competitor: "Free (self-hosted)", footprintiq: "Free tier + premium plans" },
    ],
    faqs: [
      { q: "Is Sherlock better than FootprintIQ?", a: "They serve different needs. Sherlock is a single raw scanning tool; FootprintIQ combines multiple tools with AI filtering and professional reporting." },
      { q: "Does FootprintIQ use Sherlock?", a: "Yes. Sherlock is one of several OSINT tools in FootprintIQ's scanning pipeline, alongside Maigret, WhatsMyName, and others." },
      { q: "Is Sherlock free?", a: "Yes. Sherlock is open-source and free to use. However, it requires technical setup and produces unfiltered results." },
      { q: "Which tool has better accuracy?", a: "FootprintIQ typically delivers higher accuracy because it cross-references multiple tools and applies AI-based false-positive filtering." },
      { q: "Can I use Sherlock without technical knowledge?", a: "Sherlock requires command-line proficiency and Python installation. FootprintIQ provides a web-based interface accessible to non-technical users." },
      { q: "Is Sherlock safe to use?", a: "Sherlock itself is safe, but it has no ethical guardrails. Users must ensure they're using it responsibly. FootprintIQ includes built-in ethical guidelines." },
    ],
    relatedTools: ["/username-search", "/reverse-username-search", "/osint-playground"],
    relatedGuides: ["/guides/what-is-username-osint", "/guides/how-to-trace-a-username", "/best-reverse-username-search-tools"],
  },
  {
    slug: "maigret",
    name: "Maigret",
    category: "OSINT Tool",
    primaryKeyword: "Maigret vs FootprintIQ",
    description: "Compare Maigret and FootprintIQ for username OSINT scanning. Evaluate features, accuracy, and ease of use.",
    intro: "Maigret is a powerful open-source username enumeration tool that checks over 2,500 sites — one of the broadest coverage tools available. FootprintIQ incorporates Maigret as a core scanning engine while adding false-positive filtering, a web interface, and ethical compliance features.",
    pros: ["Broadest site coverage (2,500+ sites)", "Free and open source", "Detailed output with tags and metadata", "Active development"],
    cons: ["CLI-only with complex setup", "Very high false-positive rate at scale", "No built-in result validation", "Resource-intensive scans"],
    whoItsFor: "Maigret is best for advanced OSINT practitioners who can handle raw, high-volume output and validate results manually. FootprintIQ is for users who want Maigret's coverage with professional-grade filtering and reporting.",
    ethicalPositioning: "FootprintIQ leverages Maigret's extensive coverage but applies rigorous AI filtering to reduce the thousands of raw results to actionable, high-confidence findings. This prevents the false conclusions that can arise from unfiltered mass-scanning.",
    features: [
      { feature: "Site coverage", competitor: "2,500+ sites", footprintiq: "500+ (curated, multi-tool)" },
      { feature: "False-positive rate", competitor: "High (raw output)", footprintiq: "Low (AI-filtered)" },
      { feature: "Setup required", competitor: "Python + CLI", footprintiq: "None (web-based)" },
      { feature: "Result quality", competitor: "Quantity-focused", footprintiq: "Quality-focused" },
      { feature: "Reporting", competitor: "HTML/JSON export", footprintiq: "Dashboard + PDF/CSV" },
      { feature: "Price", competitor: "Free (self-hosted)", footprintiq: "Free tier + premium" },
    ],
    faqs: [
      { q: "Is Maigret better than FootprintIQ?", a: "Maigret covers more sites but produces more false positives. FootprintIQ prioritises accuracy and usability over raw volume." },
      { q: "Does FootprintIQ include Maigret?", a: "Yes. Maigret is a core scanning engine in FootprintIQ's multi-tool pipeline." },
      { q: "Why does FootprintIQ show fewer results than Maigret?", a: "FootprintIQ filters out false positives and low-confidence matches, delivering only actionable results." },
      { q: "Can I run Maigret scans through FootprintIQ?", a: "Yes. FootprintIQ automatically runs Maigret as part of every username scan, alongside other tools." },
      { q: "Which should I choose for professional investigations?", a: "FootprintIQ is recommended for professional use due to its reporting, ethical compliance, and result validation features." },
      { q: "Is Maigret safe?", a: "Maigret is safe software, but its high-volume scanning can trigger rate limits. FootprintIQ manages this automatically." },
    ],
    relatedTools: ["/username-search", "/maigret-scanner", "/digital-footprint-checker"],
    relatedGuides: ["/guides/how-to-trace-a-username", "/guides/what-is-username-osint", "/best-osint-tools"],
  },
  {
    slug: "spiderfoot",
    name: "SpiderFoot",
    category: "OSINT Suite",
    primaryKeyword: "SpiderFoot vs FootprintIQ",
    description: "Compare SpiderFoot and FootprintIQ for digital footprint analysis. Evaluate scope, ease of use, and ethical positioning.",
    intro: "SpiderFoot is a comprehensive open-source OSINT automation tool that goes beyond username searching to include IP reconnaissance, domain analysis, and network scanning. FootprintIQ focuses specifically on identity exposure — usernames, emails, and phone numbers — with a privacy-first approach.",
    pros: ["Comprehensive OSINT suite (IPs, domains, emails, usernames)", "200+ data source modules", "Self-hosted or SaaS options", "Automation and API support"],
    cons: ["Complex setup and steep learning curve", "Broad scope can be overwhelming", "Enterprise-focused pricing for SaaS", "Not focused on individual privacy"],
    whoItsFor: "SpiderFoot suits security teams running broad-scope investigations. FootprintIQ is designed for individuals and professionals focused specifically on digital identity exposure and privacy risk.",
    ethicalPositioning: "SpiderFoot is a general-purpose OSINT tool that can gather very broad intelligence. FootprintIQ intentionally limits its scope to ethical, identity-focused scanning — it never performs network reconnaissance, IP scanning, or domain enumeration.",
    features: [
      { feature: "Scope", competitor: "Full OSINT suite", footprintiq: "Identity exposure focus" },
      { feature: "Username scanning", competitor: "One of many modules", footprintiq: "Core feature (multi-tool)" },
      { feature: "Setup complexity", competitor: "High", footprintiq: "None (web-based)" },
      { feature: "Target audience", competitor: "Security teams", footprintiq: "Individuals + professionals" },
      { feature: "Ethical focus", competitor: "General OSINT", footprintiq: "Privacy-first, identity only" },
      { feature: "Price", competitor: "Free (self-hosted) / $$$ SaaS", footprintiq: "Free tier + affordable plans" },
    ],
    faqs: [
      { q: "Is SpiderFoot the same as FootprintIQ?", a: "No. SpiderFoot is a general OSINT suite covering many intelligence types. FootprintIQ focuses specifically on username, email, and phone exposure." },
      { q: "Can SpiderFoot replace FootprintIQ?", a: "SpiderFoot can perform username searches, but with less focus and fewer identity-specific features like AI filtering and privacy scoring." },
      { q: "Which is easier to use?", a: "FootprintIQ is significantly easier — it's a web app requiring no setup. SpiderFoot requires installation and configuration." },
      { q: "Is SpiderFoot free?", a: "The open-source version is free but requires self-hosting. Their SaaS product (SpiderFoot HX) is enterprise-priced." },
      { q: "Which should I use for personal privacy audits?", a: "FootprintIQ is purpose-built for personal privacy audits. SpiderFoot is better suited for enterprise security investigations." },
      { q: "Does FootprintIQ use SpiderFoot?", a: "FootprintIQ may use SpiderFoot modules as part of its scanning pipeline, alongside other specialised tools." },
    ],
    relatedTools: ["/username-search", "/digital-footprint-checker", "/osint-playground"],
    relatedGuides: ["/best-osint-tools", "/guides/what-is-username-osint", "/osint-techniques"],
  },
  {
    slug: "namechk",
    name: "Namechk",
    category: "Username Checker",
    primaryKeyword: "Namechk vs FootprintIQ",
    description: "Compare Namechk and FootprintIQ for username availability and OSINT scanning. See which tool better serves your needs.",
    intro: "Namechk is a simple, web-based tool for checking username availability across social networks and domain registrars. It's designed for brand registration, not OSINT investigation. FootprintIQ takes a fundamentally different approach — it analyses digital exposure and identity risk, not just availability.",
    pros: ["Simple, fast interface", "Domain name checking included", "Good for brand registration", "Free to use"],
    cons: ["Availability only — no OSINT analysis", "No confidence scoring or filtering", "Limited platform coverage", "No privacy or exposure assessment"],
    whoItsFor: "Namechk is for marketers and brand managers registering new handles. FootprintIQ is for anyone assessing digital exposure, privacy risk, or conducting ethical OSINT investigations.",
    ethicalPositioning: "Namechk answers 'is this username taken?' — FootprintIQ answers 'what does this username reveal about someone's digital presence?' Both are legitimate tools, but they serve very different purposes.",
    features: [
      { feature: "Primary purpose", competitor: "Username availability", footprintiq: "Digital exposure analysis" },
      { feature: "Platform coverage", competitor: "~100 sites", footprintiq: "500+ sites" },
      { feature: "Confidence scoring", competitor: "No", footprintiq: "AI-powered" },
      { feature: "Privacy risk assessment", competitor: "No", footprintiq: "Yes (exposure scoring)" },
      { feature: "Domain checking", competitor: "Yes", footprintiq: "No (identity focus)" },
      { feature: "Price", competitor: "Free", footprintiq: "Free tier + premium" },
    ],
    faqs: [
      { q: "Is Namechk an OSINT tool?", a: "Not really. Namechk checks username availability for brand registration. It doesn't analyse digital exposure or correlate identities." },
      { q: "Can I use Namechk for privacy audits?", a: "Namechk shows where a username is taken, but doesn't provide exposure analysis, confidence scores, or actionable privacy insights." },
      { q: "Which has better platform coverage?", a: "FootprintIQ checks 500+ platforms with multi-tool scanning. Namechk covers approximately 100 sites." },
      { q: "Is Namechk free?", a: "Yes. Namechk is free to use. FootprintIQ also offers a free tier with more comprehensive results." },
      { q: "Should I use both tools?", a: "If you're registering a new brand, Namechk can help with availability. For understanding existing digital exposure, FootprintIQ is the better choice." },
      { q: "Which is more accurate?", a: "For availability checking, both are accurate. For OSINT and exposure analysis, only FootprintIQ provides this functionality." },
    ],
    relatedTools: ["/username-availability-checker", "/username-search", "/social-media-account-finder"],
    relatedGuides: ["/guides/why-username-reuse-is-risky", "/guides/what-is-username-osint", "/glossary/username-osint"],
  },
  {
    slug: "pimeyes",
    name: "PimEyes",
    category: "Face Search Engine",
    primaryKeyword: "PimEyes alternative",
    description: "Looking for a PimEyes alternative? Compare PimEyes face search with FootprintIQ's ethical digital footprint scanning approach.",
    intro: "PimEyes is a reverse face search engine that finds where a person's photo appears online. It's powerful but raises significant privacy concerns. FootprintIQ takes an entirely different approach — scanning by username, email, or phone number rather than biometric data, which avoids the ethical issues inherent in face recognition.",
    pros: ["Powerful reverse image/face search", "Finds photos across the web", "Useful for finding unauthorised image use"],
    cons: ["Major privacy and surveillance concerns", "Expensive premium plans", "Can be misused for stalking", "No username or email scanning", "Facial recognition raises legal issues in many jurisdictions"],
    whoItsFor: "PimEyes serves users needing reverse face search (e.g., finding unauthorised image use). FootprintIQ serves users needing digital identity exposure analysis without biometric data.",
    ethicalPositioning: "FootprintIQ deliberately does not use facial recognition or biometric data. We believe identity exposure analysis should be possible without the privacy risks inherent in face search technology. Our approach protects individual privacy while still providing comprehensive digital footprint intelligence.",
    features: [
      { feature: "Search method", competitor: "Face/photo upload", footprintiq: "Username, email, phone" },
      { feature: "Privacy risk", competitor: "High (biometric data)", footprintiq: "Low (text-based)" },
      { feature: "Legal concerns", competitor: "Varies by jurisdiction", footprintiq: "Minimal (public data)" },
      { feature: "Ethical positioning", competitor: "Controversial", footprintiq: "Privacy-first" },
      { feature: "Use cases", competitor: "Image abuse detection", footprintiq: "Identity exposure audit" },
      { feature: "Price", competitor: "$$$ (premium only)", footprintiq: "Free tier available" },
    ],
    faqs: [
      { q: "Is FootprintIQ a PimEyes alternative?", a: "They solve different problems. PimEyes searches by face; FootprintIQ searches by username, email, or phone. If you need identity exposure analysis without biometrics, FootprintIQ is the ethical choice." },
      { q: "Does FootprintIQ use facial recognition?", a: "No. FootprintIQ never uses facial recognition or biometric data. We search by username, email, and phone number only." },
      { q: "Is PimEyes legal?", a: "PimEyes legality varies by jurisdiction. Facial recognition raises significant privacy concerns under GDPR and similar regulations." },
      { q: "Which is more ethical?", a: "FootprintIQ avoids biometric data entirely, making it inherently more privacy-friendly than face search tools." },
      { q: "Can FootprintIQ find photos of someone?", a: "FootprintIQ finds where a username appears across platforms, which may include profiles with photos. However, it does not perform reverse image searches." },
      { q: "Why not just add face search to FootprintIQ?", a: "We believe facial recognition poses unacceptable privacy risks for individuals. Our ethical charter prohibits biometric scanning." },
    ],
    relatedTools: ["/username-search", "/digital-footprint-checker", "/reverse-username-search"],
    relatedGuides: ["/ethical-osint-charter", "/resources/responsible-osint", "/glossary/digital-footprint"],
  },
];

/** Lookup a comparison entry by slug */
export function getComparisonEntry(slug: string): ComparisonEntry | undefined {
  return comparisonPages.find((c) => c.slug === slug);
}

/** Get all comparison slugs */
export function getAllComparisonSlugs(): string[] {
  return comparisonPages.map((c) => c.slug);
}
