/**
 * Topic hub data for /topics/* pages.
 * Each hub aggregates and links to the best related pages.
 */

import type { FAQ } from "./contentRegistry";

export interface TopicHubEntry {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  intro: string;
  popularPages: { path: string; label: string; description: string }[];
  faqs: FAQ[];
  relatedHubs: string[];
}

export const topicHubs: TopicHubEntry[] = [
  {
    slug: "username-search",
    title: "Username Search",
    seoTitle: "Username Search Hub – Find Any Username Online | FootprintIQ",
    description: "Everything you need to search, trace, and audit usernames across 500+ platforms. Free tools, guides, platform-specific scans, and expert FAQs.",
    intro: "Username search is the foundation of digital identity intelligence. Whether you're auditing your own exposure, verifying someone's online presence, or conducting authorised OSINT investigations, FootprintIQ provides the tools, guides, and platform-specific scanners to do it ethically and effectively.",
    popularPages: [
      { path: "/username-search", label: "Username Search Tool", description: "Scan any username across 500+ platforms" },
      { path: "/reverse-username-search", label: "Reverse Username Search", description: "Trace a handle back across platforms" },
      { path: "/find-someone-by-username", label: "Find Someone by Username", description: "Locate public profiles from a handle" },
      { path: "/check-username-across-platforms", label: "Check Username Across Platforms", description: "See where a handle is claimed" },
      { path: "/platforms/instagram/username-search", label: "Instagram Username Search", description: "Platform-specific scan for Instagram" },
      { path: "/platforms/tiktok/username-search", label: "TikTok Username Search", description: "Platform-specific scan for TikTok" },
      { path: "/platforms/reddit/username-search", label: "Reddit Username Search", description: "Platform-specific scan for Reddit" },
      { path: "/platforms/github/username-search", label: "GitHub Username Search", description: "Platform-specific scan for GitHub" },
      { path: "/guides/what-is-username-osint", label: "What Is Username OSINT?", description: "Beginner's guide to username intelligence" },
      { path: "/guides/how-to-trace-a-username", label: "How to Trace a Username", description: "Step-by-step tracing guide" },
      { path: "/glossary/username-osint", label: "Username OSINT (Glossary)", description: "Definition and how it works" },
      { path: "/compare", label: "Tool Comparisons", description: "Compare FootprintIQ with Sherlock, Maigret, and more" },
    ],
    faqs: [
      { q: "What is a username search?", a: "A username search checks whether a specific handle exists across hundreds of public platforms, revealing where the identity appears online." },
      { q: "Is username search free?", a: "Yes. FootprintIQ offers a free tier that lets you run username scans without creating an account." },
      { q: "How many platforms does FootprintIQ scan?", a: "FootprintIQ scans over 500 public platforms including social media, forums, developer sites, and more." },
      { q: "Can someone find out I searched for their username?", a: "No. FootprintIQ only queries public data — no notifications are sent to profile owners." },
      { q: "What tools does FootprintIQ use?", a: "FootprintIQ uses a multi-tool pipeline including Maigret, Sherlock, WhatsMyName, and other OSINT tools with AI-powered false-positive filtering." },
      { q: "Is username searching legal?", a: "Yes, when limited to publicly accessible data. FootprintIQ follows ethical OSINT principles and only queries public sources." },
    ],
    relatedHubs: ["/topics/digital-footprint", "/topics/osint-for-individuals", "/topics/scam-safety"],
  },
  {
    slug: "digital-footprint",
    title: "Digital Footprint",
    seoTitle: "Digital Footprint Hub – Audit & Reduce Your Online Exposure | FootprintIQ",
    description: "Learn how to check, audit, and reduce your digital footprint. Tools, guides, and expert advice for managing your online presence.",
    intro: "Your digital footprint is the trail of data you leave online — from social profiles and forum posts to data broker entries and breach records. Understanding and managing this footprint is essential for privacy, security, and professional reputation. FootprintIQ provides the tools and knowledge to take control.",
    popularPages: [
      { path: "/digital-footprint-checker", label: "Digital Footprint Checker", description: "Audit your online presence" },
      { path: "/check-my-digital-footprint", label: "Check My Digital Footprint", description: "Free exposure scan" },
      { path: "/digital-footprint-scanner", label: "Digital Footprint Scanner", description: "Comprehensive scanning tool" },
      { path: "/guides/how-to-remove-old-accounts", label: "How to Remove Old Accounts", description: "Step-by-step deletion guide" },
      { path: "/guides/reduce-digital-footprint", label: "Reduce Your Digital Footprint", description: "Practical reduction strategies" },
      { path: "/guides/clean-up-online-presence", label: "Clean Up Online Presence", description: "Cleanup best practices" },
      { path: "/glossary/digital-footprint", label: "Digital Footprint (Glossary)", description: "Definition and context" },
      { path: "/glossary/data-broker", label: "Data Broker (Glossary)", description: "What data brokers do" },
      { path: "/what-is-a-digital-footprint", label: "What Is a Digital Footprint?", description: "Educational overview" },
      { path: "/research/username-reuse-statistics", label: "Username Reuse Statistics", description: "Research on handle repetition" },
    ],
    faqs: [
      { q: "What is a digital footprint?", a: "Your digital footprint is the trail of data created by your online activity — including social profiles, search history, forum posts, and data broker entries." },
      { q: "How do I check my digital footprint?", a: "Use FootprintIQ's free digital footprint checker to scan your username or email across 500+ platforms." },
      { q: "How often should I audit my digital footprint?", a: "We recommend quarterly checks, or immediately after a data breach notification." },
      { q: "Can I delete my digital footprint?", a: "You can reduce it significantly by removing old accounts, opting out of data brokers, and adjusting privacy settings. Complete deletion is rarely possible." },
      { q: "Why does my digital footprint matter?", a: "It affects your privacy, security, and reputation. Employers, scammers, and data brokers can all use your digital footprint." },
      { q: "Is checking my digital footprint free?", a: "Yes. FootprintIQ offers a free basic scan with no sign-up required." },
    ],
    relatedHubs: ["/topics/username-search", "/topics/privacy-removal", "/topics/osint-for-individuals"],
  },
  {
    slug: "privacy-removal",
    title: "Privacy & Data Removal",
    seoTitle: "Privacy & Data Removal Hub – Remove Your Data Online | FootprintIQ",
    description: "Guides and tools for removing personal data from the internet. Learn how to opt out of data brokers, delete old accounts, and protect your privacy.",
    intro: "Taking control of your online privacy means actively removing personal data that shouldn't be public. From data broker opt-outs to social media account deletion, FootprintIQ provides step-by-step guidance and tools to help you reclaim your digital privacy.",
    popularPages: [
      { path: "/guides/how-to-remove-old-accounts", label: "Remove Old Accounts", description: "Find and delete forgotten accounts" },
      { path: "/guides/remove-from-data-brokers", label: "Remove from Data Brokers", description: "Opt-out guide for data brokers" },
      { path: "/remove-yourself-from-data-broker-sites", label: "Data Broker Removal Sites", description: "Site-specific removal instructions" },
      { path: "/data-broker-removal-guide", label: "Data Broker Removal Guide", description: "Comprehensive removal walkthrough" },
      { path: "/remove-personal-information-from-internet", label: "Remove Personal Information", description: "Internet-wide removal strategies" },
      { path: "/delete-social-media-accounts", label: "Delete Social Media Accounts", description: "Platform-by-platform deletion" },
      { path: "/privacy-centre", label: "Privacy Centre", description: "All privacy resources" },
      { path: "/glossary/data-broker", label: "Data Broker (Glossary)", description: "What data brokers are" },
      { path: "/comparisons/pimeyes", label: "PimEyes Alternative", description: "Privacy-first alternative to face search" },
      { path: "/resources/responsible-osint", label: "Responsible OSINT", description: "Ethical boundaries for data collection" },
    ],
    faqs: [
      { q: "How do I remove myself from data brokers?", a: "Submit opt-out requests directly to each broker. FootprintIQ helps identify which brokers have your data, then guides you through removal." },
      { q: "Can I remove everything about me from the internet?", a: "Complete removal is nearly impossible, but you can significantly reduce your exposure by deleting old accounts and opting out of data brokers." },
      { q: "How long does data broker removal take?", a: "Most brokers process opt-out requests within 30–45 days, though some may take longer." },
      { q: "Is data broker removal permanent?", a: "Not always. Some brokers re-collect data over time. Periodic re-checks are recommended." },
      { q: "What tools help with privacy removal?", a: "FootprintIQ identifies your exposure. For automated removal, services like Incogni and DeleteMe handle opt-outs on your behalf." },
      { q: "Should I delete old social media accounts?", a: "Yes, if they contain personal information you no longer want public. Even inactive accounts can appear in OSINT scans." },
    ],
    relatedHubs: ["/topics/digital-footprint", "/topics/username-search", "/topics/scam-safety"],
  },
  {
    slug: "osint-for-individuals",
    title: "OSINT for Individuals",
    seoTitle: "OSINT for Individuals – Ethical Intelligence for Everyone | FootprintIQ",
    description: "Learn how individuals can use ethical OSINT techniques for self-protection, privacy auditing, and online safety. No technical expertise required.",
    intro: "Open Source Intelligence (OSINT) isn't just for security professionals. Individuals can use ethical OSINT techniques to audit their own digital exposure, verify people they interact with online, and protect themselves from scams and identity theft. FootprintIQ makes these techniques accessible to everyone.",
    popularPages: [
      { path: "/username-search", label: "Username Search", description: "Scan a username across 500+ platforms" },
      { path: "/digital-footprint-checker", label: "Digital Footprint Checker", description: "Audit your online presence" },
      { path: "/for-individuals", label: "FootprintIQ for Individuals", description: "How we help everyday users" },
      { path: "/guides/what-is-username-osint", label: "What Is Username OSINT?", description: "Beginner's guide" },
      { path: "/ethical-osint-charter", label: "Ethical OSINT Charter", description: "Our ethical principles" },
      { path: "/ethical-osint-for-individuals", label: "Ethical OSINT for Individuals", description: "Personal use guidelines" },
      { path: "/resources/responsible-osint", label: "Responsible OSINT", description: "Boundaries and best practices" },
      { path: "/what-is-osint", label: "What Is OSINT?", description: "Clear explanation for beginners" },
      { path: "/verify-someone-online", label: "Verify Someone Online", description: "Check if someone is who they claim" },
      { path: "/can-someone-track-me-online", label: "Can Someone Track Me?", description: "Understand your trackability" },
    ],
    faqs: [
      { q: "What is OSINT?", a: "OSINT stands for Open Source Intelligence — the practice of collecting and analysing publicly available information for legitimate purposes." },
      { q: "Is OSINT legal for individuals?", a: "Yes. Searching publicly available data is legal. FootprintIQ follows strict ethical guidelines to ensure responsible use." },
      { q: "Can I use OSINT to check on someone?", a: "You can verify publicly available information about someone, but always ensure you have a legitimate reason and follow ethical guidelines." },
      { q: "Do I need technical skills for OSINT?", a: "No. FootprintIQ makes OSINT accessible through a simple web interface — no command-line or coding knowledge required." },
      { q: "How is OSINT different from hacking?", a: "OSINT only uses publicly available data. It never involves bypassing security, accessing private systems, or breaking authentication." },
      { q: "What can OSINT reveal about me?", a: "An OSINT scan can reveal your public profiles, username reuse patterns, data broker listings, and breach exposure." },
    ],
    relatedHubs: ["/topics/username-search", "/topics/digital-footprint", "/topics/scam-safety"],
  },
  {
    slug: "scam-safety",
    title: "Scam Safety & Verification",
    seoTitle: "Scam Safety Hub – Verify Identities & Spot Scams | FootprintIQ",
    description: "Protect yourself from online scams. Learn how to verify identities, spot warning signs, and use OSINT tools for personal safety.",
    intro: "Online scams are increasingly sophisticated, from romance fraud to impersonation schemes. FootprintIQ provides tools and guides to help you verify identities, spot red flags, and protect yourself and your family from digital fraud — all using ethical, publicly available data.",
    popularPages: [
      { path: "/check-if-someone-is-a-scammer", label: "Check If Someone Is a Scammer", description: "Verification techniques" },
      { path: "/romance-scam-warning-signs", label: "Romance Scam Warning Signs", description: "Red flags to watch for" },
      { path: "/verify-someone-online", label: "Verify Someone Online", description: "Identity verification guide" },
      { path: "/username-search", label: "Username Search", description: "Check a username across 500+ sites" },
      { path: "/find-someone-by-username", label: "Find Someone by Username", description: "Locate public profiles" },
      { path: "/find-dating-profiles", label: "Find Dating Profiles", description: "Dating platform searches" },
      { path: "/guides/what-is-username-osint", label: "What Is Username OSINT?", description: "Understand the tools" },
      { path: "/ethical-osint-charter", label: "Ethical OSINT Charter", description: "Responsible investigation principles" },
    ],
    faqs: [
      { q: "How can I check if someone is a scammer?", a: "Run their username through FootprintIQ to see their cross-platform presence. Scammers often have thin digital footprints or use newly created accounts." },
      { q: "What are common romance scam warning signs?", a: "Red flags include: refusing video calls, asking for money, claiming to be overseas military/oil workers, and using stolen photos." },
      { q: "Can FootprintIQ detect catfishing?", a: "FootprintIQ can reveal whether a username has a consistent online presence across platforms, which helps identify potentially fake identities." },
      { q: "Is it legal to investigate someone I suspect is a scammer?", a: "Yes. Checking publicly available information is legal. However, always follow ethical guidelines and report suspected fraud to authorities." },
      { q: "What should I do if I find a scam?", a: "Document the evidence, report it to the relevant platform, and contact local law enforcement or fraud reporting services." },
      { q: "Can scammers find information about me?", a: "Yes. Running a self-audit with FootprintIQ shows what scammers can find, helping you reduce your exposure." },
    ],
    relatedHubs: ["/topics/username-search", "/topics/osint-for-individuals", "/topics/digital-footprint"],
  },
];

export function getTopicHub(slug: string): TopicHubEntry | undefined {
  return topicHubs.find((h) => h.slug === slug);
}
