/**
 * Authority cluster content registry.
 * Provides metadata for programmatic page generation, internal linking,
 * schema generation, and sitemap inclusion.
 *
 * Each entry includes path, title, description, primaryKeyword, FAQs, and related paths.
 */

import { CANONICAL_BASE } from "./sitemapRoutes";

export interface FAQ {
  q: string;
  a: string;
}

export interface ContentEntry {
  path: string;
  title: string;
  description: string;
  primaryKeyword: string;
  faqs: FAQ[];
  related: string[];
}

// ── Tool Pages ─────────────────────────────────────────
export const toolPages: ContentEntry[] = [
  {
    path: "/username-search",
    title: "Username Search – Find Where a Username Appears Online | FootprintIQ",
    description: "Search a username across 500+ platforms to find matching profiles, exposure risks, and digital footprint signals. Free, ethical, privacy-first.",
    primaryKeyword: "username search",
    faqs: [
      { q: "How does a username search work?", a: "FootprintIQ checks a username across 500+ public platforms using ethical OSINT techniques, returning matched profiles and exposure indicators." },
      { q: "Is username search free?", a: "Yes. FootprintIQ offers a free tier that lets you run username scans without creating an account." },
      { q: "Can a username search find deleted accounts?", a: "Username searches check live, public data. Deleted accounts typically do not appear, though cached references on third-party sites may surface." },
    ],
    related: ["/reverse-username-search", "/find-someone-by-username", "/guides/what-is-username-osint", "/glossary/username-osint", "/check-username-across-platforms"],
  },
  {
    path: "/reverse-username-search",
    title: "Reverse Username Search – Trace a Handle Across Platforms | FootprintIQ",
    description: "Run a reverse username search to find all public accounts linked to a handle. Ethical OSINT scanning across 500+ sites.",
    primaryKeyword: "reverse username search",
    faqs: [
      { q: "What is a reverse username search?", a: "A reverse username search takes a known handle and checks hundreds of platforms to find matching public profiles and mentions." },
      { q: "Is reverse username searching legal?", a: "Yes, when limited to publicly accessible data. FootprintIQ only queries public sources and follows ethical OSINT principles." },
    ],
    related: ["/username-search", "/find-someone-by-username", "/guides/how-to-trace-a-username", "/glossary/username-osint", "/research/username-reuse-statistics"],
  },
  {
    path: "/find-someone-by-username",
    title: "Find Someone by Username – Locate Public Profiles | FootprintIQ",
    description: "Find someone by username across social media and public platforms. Ethical, privacy-first digital footprint discovery.",
    primaryKeyword: "find someone by username",
    faqs: [
      { q: "Can I find someone using just their username?", a: "Yes. A single username can be checked across 500+ platforms to locate matching public profiles." },
      { q: "Is this the same as doxxing?", a: "No. FootprintIQ only surfaces publicly available data and follows strict ethical OSINT guidelines. It is designed for self-assessment, risk evaluation, and authorised investigations." },
    ],
    related: ["/username-search", "/reverse-username-search", "/check-username-across-platforms", "/guides/how-to-trace-a-username", "/glossary/digital-footprint"],
  },
  {
    path: "/where-is-this-username-used",
    title: "Where Is This Username Used? – Check Across 500+ Sites | FootprintIQ",
    description: "Check where a username is used across 500+ platforms. Discover public profiles, exposure signals, and digital footprint data.",
    primaryKeyword: "where is this username used",
    faqs: [
      { q: "How many platforms does this check?", a: "FootprintIQ scans over 500 public platforms including social media, forums, developer sites, and more." },
      { q: "Will the person know I searched their username?", a: "No. FootprintIQ only queries public data — no notifications are sent to profile owners." },
    ],
    related: ["/username-search", "/check-username-across-platforms", "/guides/why-username-reuse-is-risky", "/glossary/username-osint"],
  },
  {
    path: "/search-username-online",
    title: "Search Username Online – Free Multi-Platform Scan | FootprintIQ",
    description: "Search any username online across 500+ sites. Find matching profiles and assess digital exposure with our free ethical OSINT tool.",
    primaryKeyword: "search username online",
    faqs: [
      { q: "Is this tool really free?", a: "Yes. The basic username scan is free — no sign-up required." },
      { q: "What kind of results will I get?", a: "You'll see a list of platforms where the username was found, along with profile URLs, confidence scores, and exposure indicators." },
    ],
    related: ["/username-search", "/reverse-username-search", "/social-media-account-finder", "/glossary/digital-footprint"],
  },
  {
    path: "/username-availability-checker",
    title: "Username Availability Checker – Check if a Handle is Taken | FootprintIQ",
    description: "Check whether a username is available or already claimed across popular social media and online platforms.",
    primaryKeyword: "username availability checker",
    faqs: [
      { q: "How is this different from a username search?", a: "A username search finds existing profiles. An availability checker tells you whether a handle is free to register on specific platforms." },
      { q: "Can I check availability on all platforms at once?", a: "FootprintIQ checks across 500+ platforms simultaneously, showing which ones already have the username claimed." },
    ],
    related: ["/username-checker", "/username-search", "/guides/why-username-reuse-is-risky", "/glossary/username-osint"],
  },
  {
    path: "/social-media-account-finder",
    title: "Social Media Account Finder – Discover Public Profiles | FootprintIQ",
    description: "Find public social media accounts linked to a username or handle. Scan across Instagram, TikTok, Twitter, Reddit, and 500+ more platforms.",
    primaryKeyword: "social media account finder",
    faqs: [
      { q: "What social media platforms are covered?", a: "FootprintIQ covers 500+ platforms including Instagram, TikTok, X (Twitter), Reddit, LinkedIn, YouTube, Discord, and many more." },
      { q: "Does this show private accounts?", a: "No. Only publicly visible profiles are returned. Private or restricted accounts are not accessed." },
    ],
    related: ["/social-media-finder", "/find-social-media-accounts", "/username-search", "/glossary/digital-footprint", "/guides/what-is-username-osint"],
  },
  {
    path: "/digital-footprint-checker",
    title: "Digital Footprint Checker – Audit Your Online Presence | FootprintIQ",
    description: "Check your digital footprint across 500+ platforms. Find public profiles, exposure risks, and data broker listings with our free privacy tool.",
    primaryKeyword: "digital footprint checker",
    faqs: [
      { q: "What is a digital footprint?", a: "Your digital footprint is the trail of data you leave online — including social profiles, forum posts, data broker entries, and breach records." },
      { q: "How often should I check my digital footprint?", a: "We recommend quarterly checks, or immediately after a data breach notification." },
    ],
    related: ["/check-my-digital-footprint", "/digital-footprint-scanner", "/guides/how-to-remove-old-accounts", "/glossary/digital-footprint", "/research/username-reuse-statistics"],
  },
  {
    path: "/check-my-digital-footprint",
    title: "Check My Digital Footprint – Free Online Exposure Scan | FootprintIQ",
    description: "Run a free digital footprint scan. See what personal data is publicly visible, find old accounts, and reduce your online exposure.",
    primaryKeyword: "check my digital footprint",
    faqs: [
      { q: "Is the digital footprint check free?", a: "Yes. A basic scan is free and requires no account." },
      { q: "What data does the scan find?", a: "It surfaces public profiles, potential data broker listings, and breach exposure associated with your username or email." },
    ],
    related: ["/digital-footprint-checker", "/digital-footprint-scanner", "/audit-your-digital-footprint", "/glossary/digital-footprint", "/datasets/username-reuse"],
  },
];

// ── Guide Pages ────────────────────────────────────────
export const guidePages: ContentEntry[] = [
  {
    path: "/guides/what-is-username-osint",
    title: "What Is Username OSINT? A Beginner's Guide | FootprintIQ",
    description: "Learn what username OSINT is, how it works, and why it matters for privacy and security. A clear, ethical introduction for beginners.",
    primaryKeyword: "what is username osint",
    faqs: [
      { q: "What does OSINT stand for?", a: "OSINT stands for Open Source Intelligence — the practice of collecting and analysing publicly available information." },
      { q: "Is username OSINT legal?", a: "Yes, when conducted ethically using publicly accessible data. FootprintIQ follows strict ethical guidelines." },
    ],
    related: ["/username-search", "/glossary/username-osint", "/guides/how-to-trace-a-username", "/what-is-osint"],
  },
  {
    path: "/guides/how-to-trace-a-username",
    title: "How to Trace a Username Across Platforms | FootprintIQ",
    description: "Step-by-step guide to tracing a username across social media and online platforms using ethical OSINT techniques.",
    primaryKeyword: "how to trace a username",
    faqs: [
      { q: "Can I trace a username for free?", a: "Yes. FootprintIQ's free tier lets you trace a username across 500+ platforms without signing up." },
      { q: "What tools do investigators use to trace usernames?", a: "Common tools include Maigret, Sherlock, and WhatsMyName. FootprintIQ combines multiple tools into a single pipeline." },
    ],
    related: ["/reverse-username-search", "/username-search", "/guides/what-is-username-osint", "/glossary/username-osint", "/ai-answers/how-investigators-trace-usernames"],
  },
  {
    path: "/guides/why-username-reuse-is-risky",
    title: "Why Username Reuse Is Risky – Privacy Guide | FootprintIQ",
    description: "Understand why reusing the same username across platforms increases your digital exposure and what you can do to reduce the risk.",
    primaryKeyword: "username reuse risk",
    faqs: [
      { q: "Why is username reuse a security risk?", a: "Reusing a username makes it easy to link your accounts across platforms, creating a comprehensive profile of your online activity." },
      { q: "How can I reduce username reuse risk?", a: "Use unique handles for sensitive accounts, run a username scan to see your current exposure, and consider changing high-risk handles." },
    ],
    related: ["/username-reuse-risk", "/ai-answers/why-username-reuse-is-risky", "/research/username-reuse-statistics", "/username-search", "/glossary/digital-footprint"],
  },
  {
    path: "/guides/how-to-remove-old-accounts",
    title: "How to Remove Old Online Accounts – Step-by-Step | FootprintIQ",
    description: "Learn how to find and delete old online accounts that are still publicly visible. Reduce your digital footprint with this practical guide.",
    primaryKeyword: "remove old accounts",
    faqs: [
      { q: "How do I find old accounts I've forgotten about?", a: "Run a username and email scan to discover accounts you may have forgotten. FootprintIQ checks 500+ platforms." },
      { q: "Can I delete accounts I no longer have access to?", a: "In many cases, yes. Most platforms offer account recovery or deletion request options, even without login credentials." },
    ],
    related: ["/delete-social-media-accounts", "/check-my-digital-footprint", "/digital-footprint-checker", "/glossary/data-broker", "/guides/why-username-reuse-is-risky"],
  },
];

// ── Glossary Pages ─────────────────────────────────────
export const glossaryPages: ContentEntry[] = [
  {
    path: "/glossary/username-osint",
    title: "Username OSINT – Definition & How It Works | FootprintIQ",
    description: "What is username OSINT? Learn how open-source intelligence techniques are used to trace usernames across platforms.",
    primaryKeyword: "username osint",
    faqs: [
      { q: "What is username OSINT?", a: "Username OSINT is the practice of using publicly available data to trace a username across online platforms and correlate digital identities." },
    ],
    related: ["/guides/what-is-username-osint", "/username-search", "/what-is-osint", "/glossary/digital-footprint"],
  },
  {
    path: "/glossary/digital-footprint",
    title: "Digital Footprint – Definition & Why It Matters | FootprintIQ",
    description: "What is a digital footprint? Understand the data trail you leave online and why managing it matters for privacy and security.",
    primaryKeyword: "digital footprint",
    faqs: [
      { q: "What is a digital footprint?", a: "A digital footprint is the trail of data created by your online activity — including social profiles, search history, forum posts, and data broker entries." },
    ],
    related: ["/what-is-a-digital-footprint", "/check-my-digital-footprint", "/digital-footprint-checker", "/glossary/data-broker"],
  },
  {
    path: "/glossary/data-broker",
    title: "Data Broker – Definition & How to Opt Out | FootprintIQ",
    description: "What is a data broker? Learn how data brokers collect and sell personal information, and how to remove yourself from their databases.",
    primaryKeyword: "data broker",
    faqs: [
      { q: "What is a data broker?", a: "A data broker is a company that collects personal information from public sources, purchases, and scraping, then sells or licenses it to third parties." },
      { q: "How do I remove myself from data brokers?", a: "You can submit opt-out requests directly to each broker. FootprintIQ helps identify which brokers have your data." },
    ],
    related: ["/data-broker-removal-guide", "/remove-yourself-from-data-broker-sites", "/glossary/digital-footprint", "/digital-footprint-checker"],
  },
];

// ── Research Pages ─────────────────────────────────────
export const researchPages: ContentEntry[] = [
  {
    path: "/research/username-reuse-statistics",
    title: "Username Reuse Statistics (2026) | FootprintIQ Research",
    description: "Data-driven research on username reuse patterns across 500+ platforms. Key findings on how handle repetition increases digital exposure.",
    primaryKeyword: "username reuse statistics",
    faqs: [
      { q: "How common is username reuse?", a: "Our research shows that over 60% of users reuse the same username across 3 or more platforms." },
      { q: "What is the main risk of username reuse?", a: "It allows easy cross-platform identity correlation, increasing exposure to profiling, social engineering, and targeted attacks." },
    ],
    related: ["/guides/why-username-reuse-is-risky", "/username-reuse-risk", "/ai-answers/why-username-reuse-is-risky", "/datasets/username-reuse"],
  },
];

// ── Dataset Pages ──────────────────────────────────────
export const datasetPages: ContentEntry[] = [
  {
    path: "/datasets/username-reuse",
    title: "Username Reuse Dataset – Aggregated Statistics | FootprintIQ",
    description: "Explore aggregated, anonymised statistics on username reuse patterns across 500+ platforms. Download data for research purposes.",
    primaryKeyword: "username reuse dataset",
    faqs: [
      { q: "Is the dataset anonymised?", a: "Yes. All data is fully anonymised and aggregated. No individual usernames or personal data are included." },
      { q: "Can I use this data for research?", a: "Yes. The dataset is available under a Creative Commons licence for academic and non-commercial research." },
    ],
    related: ["/research/username-reuse-statistics", "/guides/why-username-reuse-is-risky", "/glossary/username-osint"],
  },
];

// ── AI Answer Pages ────────────────────────────────────
export const aiAnswerPages: ContentEntry[] = [
  {
    path: "/ai-answers/what-is-a-username-osint-scan",
    title: "What Is a Username OSINT Scan? | FootprintIQ AI Answers",
    description: "A clear explanation of what a username OSINT scan is, how it works, and what results you can expect.",
    primaryKeyword: "username osint scan",
    faqs: [],
    related: ["/guides/what-is-username-osint", "/username-search", "/glossary/username-osint"],
  },
  {
    path: "/ai-answers/why-username-reuse-is-risky",
    title: "Why Username Reuse Is Risky | FootprintIQ AI Answers",
    description: "An explanation of how reusing the same username across platforms increases digital exposure over time.",
    primaryKeyword: "username reuse risk",
    faqs: [],
    related: ["/guides/why-username-reuse-is-risky", "/research/username-reuse-statistics", "/username-reuse-risk"],
  },
  {
    path: "/ai-answers/how-investigators-trace-usernames",
    title: "How Investigators Trace Usernames | FootprintIQ AI Answers",
    description: "Learn the ethical techniques investigators use to trace a username across platforms and correlate digital identities.",
    primaryKeyword: "how investigators trace usernames",
    faqs: [],
    related: ["/guides/how-to-trace-a-username", "/reverse-username-search", "/glossary/username-osint", "/osint-techniques"],
  },
];

// ── Lookup helpers ─────────────────────────────────────

/** All registry entries combined */
export const allContentEntries: ContentEntry[] = [
  ...toolPages,
  ...guidePages,
  ...glossaryPages,
  ...researchPages,
  ...datasetPages,
  ...aiAnswerPages,
];

/** Lookup a content entry by path */
export function getContentEntry(path: string): ContentEntry | undefined {
  return allContentEntries.find((e) => e.path === path);
}

/** Lookup title by path — returns the path if not found */
export function getPageTitle(path: string): string {
  const entry = getContentEntry(path);
  if (entry) {
    // Return just the main title part (before " | " or " – ")
    return entry.title.split(" | ")[0].split(" – ")[0];
  }
  // Fallback: convert path to readable title
  return path
    .replace(/^\//, "")
    .replace(/[-/]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Get related entries for a given path */
export function getRelatedEntries(path: string): ContentEntry[] {
  const entry = getContentEntry(path);
  if (!entry) return [];
  return entry.related
    .map((p) => getContentEntry(p))
    .filter((e): e is ContentEntry => !!e);
}
