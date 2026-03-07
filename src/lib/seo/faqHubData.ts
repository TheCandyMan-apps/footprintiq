/**
 * FAQ hub data — aggregates best FAQs from registries with source attribution.
 */

import type { FAQ } from "./contentRegistry";

export interface FAQHubEntry {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  intro: string;
  sections: {
    heading: string;
    sourcePath: string;
    sourceLabel: string;
    faqs: FAQ[];
  }[];
}

export const faqHubs: FAQHubEntry[] = [
  {
    slug: "username-search",
    title: "Username Search FAQ",
    seoTitle: "Username Search FAQ – Common Questions Answered | FootprintIQ",
    description: "Answers to the most common questions about username search, OSINT scanning, accuracy, legality, and privacy.",
    intro: "Got questions about username search tools? Below are the most frequently asked questions, sourced from our tool pages, guides, and platform-specific scanners.",
    sections: [
      {
        heading: "General Username Search",
        sourcePath: "/username-search",
        sourceLabel: "Username Search Tool",
        faqs: [
          { q: "How does a username search work?", a: "FootprintIQ checks a username across 500+ public platforms using ethical OSINT techniques, returning matched profiles and exposure indicators." },
          { q: "Is username search free?", a: "Yes. FootprintIQ offers a free tier that lets you run username scans without creating an account." },
          { q: "Can a username search find deleted accounts?", a: "Username searches check live, public data. Deleted accounts typically do not appear, though cached references on third-party sites may surface." },
          { q: "Will the person know I searched their username?", a: "No. FootprintIQ only queries public data — no notifications are sent to profile owners." },
        ],
      },
      {
        heading: "Accuracy & False Positives",
        sourcePath: "/is-username-search-accurate",
        sourceLabel: "Is Username Search Accurate?",
        faqs: [
          { q: "How accurate is a username search?", a: "Accuracy depends on username uniqueness. Common handles may return false positives, which our AI filters help reduce." },
          { q: "What are false positives in username search?", a: "False positives occur when a different person uses the same username on another platform. FootprintIQ's AI filtering reduces these significantly." },
        ],
      },
      {
        heading: "Legality & Ethics",
        sourcePath: "/guides/what-is-username-osint",
        sourceLabel: "What Is Username OSINT?",
        faqs: [
          { q: "Is username searching legal?", a: "Yes, when limited to publicly accessible data. FootprintIQ follows ethical OSINT principles and only queries public sources." },
          { q: "Is this the same as doxxing?", a: "No. FootprintIQ only surfaces publicly available data and follows strict ethical OSINT guidelines. It is designed for self-assessment, risk evaluation, and authorised investigations." },
        ],
      },
      {
        heading: "Platform-Specific",
        sourcePath: "/platforms",
        sourceLabel: "Platform Hub",
        faqs: [
          { q: "Can I search an Instagram username without an account?", a: "Yes. FootprintIQ checks public data across platforms — you don't need an Instagram account to run a scan." },
          { q: "Can I find where a TikTok username is used elsewhere?", a: "Yes. FootprintIQ checks 500+ platforms for the same username, showing where the handle appears publicly." },
          { q: "Can I find someone's other accounts from their Reddit username?", a: "FootprintIQ checks 500+ platforms for the same handle. If the person reuses their Reddit username elsewhere, those profiles will appear." },
        ],
      },
    ],
  },
  {
    slug: "digital-footprint",
    title: "Digital Footprint FAQ",
    seoTitle: "Digital Footprint FAQ – Your Questions Answered | FootprintIQ",
    description: "Answers to common questions about digital footprints, online exposure, privacy audits, and data broker removal.",
    intro: "Understanding your digital footprint is the first step to protecting your privacy. Here are the most common questions we receive, with answers from our tools, guides, and research.",
    sections: [
      {
        heading: "Understanding Digital Footprints",
        sourcePath: "/glossary/digital-footprint",
        sourceLabel: "Digital Footprint (Glossary)",
        faqs: [
          { q: "What is a digital footprint?", a: "A digital footprint is the trail of data created by your online activity — including social profiles, search history, forum posts, and data broker entries." },
          { q: "Why does my digital footprint matter?", a: "It affects your privacy, security, and reputation. Employers, scammers, and data brokers can all use your digital footprint." },
        ],
      },
      {
        heading: "Checking Your Footprint",
        sourcePath: "/digital-footprint-checker",
        sourceLabel: "Digital Footprint Checker",
        faqs: [
          { q: "How do I check my digital footprint?", a: "Use FootprintIQ's free digital footprint checker to scan your username or email across 500+ platforms." },
          { q: "How often should I check my digital footprint?", a: "We recommend quarterly checks, or immediately after a data breach notification." },
          { q: "Is checking my digital footprint free?", a: "Yes. FootprintIQ offers a free basic scan with no sign-up required." },
        ],
      },
      {
        heading: "Reducing Your Footprint",
        sourcePath: "/guides/how-to-remove-old-accounts",
        sourceLabel: "How to Remove Old Accounts",
        faqs: [
          { q: "Can I delete my digital footprint?", a: "You can reduce it significantly by removing old accounts, opting out of data brokers, and adjusting privacy settings. Complete deletion is rarely possible." },
          { q: "How do I find old accounts I've forgotten about?", a: "Run a username and email scan to discover accounts you may have forgotten. FootprintIQ checks 500+ platforms." },
          { q: "How do I remove myself from data brokers?", a: "Submit opt-out requests directly to each broker. FootprintIQ helps identify which brokers have your data." },
        ],
      },
    ],
  },
  {
    slug: "username-searches",
    title: "Username Searches FAQ",
    seoTitle: "Username Searches FAQ – Find Accounts & Protect Privacy | FootprintIQ",
    description: "Answers to common questions about username searches, how they reveal social media accounts, OSINT tracking techniques, and how to protect your online identity.",
    intro: "Username searches are one of the most effective ways to map someone's online presence. Below are the most frequently asked questions about how username lookups work, what they reveal, and how to stay protected.",
    sections: [
      {
        heading: "How Username Searches Work",
        sourcePath: "/usernames",
        sourceLabel: "Username Search Tool",
        faqs: [
          { q: "How can I search a username online?", a: "Enter a username into FootprintIQ's search tool and it checks 500+ public platforms simultaneously — including social networks, forums, gaming sites, and dating apps — returning every publicly accessible profile that matches the handle." },
          { q: "Can usernames reveal social media accounts?", a: "Yes. Most people reuse the same username across multiple platforms. A single search can surface Instagram, TikTok, Reddit, Twitter, Discord, and dozens of other social media accounts linked to that handle." },
          { q: "Are usernames unique across websites?", a: "No. Each platform enforces uniqueness only within its own system. The same username can be registered by different people on different sites, which is why false-positive filtering — like FootprintIQ's LENS AI — is essential for accurate results." },
          { q: "What platforms does a username search cover?", a: "FootprintIQ checks 500+ platforms including major social networks, forums, developer sites, gaming platforms, dating apps, and niche communities. Coverage is continuously updated as new platforms emerge." },
        ],
      },
      {
        heading: "OSINT & Investigation Techniques",
        sourcePath: "/how-investigators-trace-usernames",
        sourceLabel: "How Investigators Trace Usernames",
        faqs: [
          { q: "How do OSINT investigators track usernames?", a: "Investigators use automated tools to check a username across hundreds of platforms simultaneously, then correlate the results — matching profile photos, bios, linked accounts, and registration dates — to build a verified identity map." },
          { q: "Can a username search find deleted accounts?", a: "Username searches query live, public data. Deleted accounts typically don't appear, but cached references on third-party sites, web archives, or breach databases may still surface evidence of the former account." },
        ],
      },
      {
        heading: "Privacy & Protection",
        sourcePath: "/digital-footprint-checker",
        sourceLabel: "Digital Footprint Checker",
        faqs: [
          { q: "How can I protect my online identity?", a: "Use unique usernames for sensitive accounts, enable two-factor authentication, regularly audit your digital footprint with tools like FootprintIQ, and opt out of data brokers that aggregate your public information." },
          { q: "Will someone know if I search their username?", a: "No. FootprintIQ only queries publicly available data — no login is performed, no notifications are sent, and no interaction occurs with the target's accounts." },
        ],
      },
    ],
  },
];

export function getFAQHub(slug: string): FAQHubEntry | undefined {
  return faqHubs.find((h) => h.slug === slug);
}
