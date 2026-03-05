/**
 * Platform pages registry for programmatic SEO.
 * Each entry generates a /platforms/:slug/username-search page.
 */

import type { FAQ } from "./contentRegistry";

export interface PlatformEntry {
  slug: string;
  name: string;
  primaryKeyword: string;
  description: string;
  /** What users can expect to find */
  whatYoullFind: string[];
  /** Limitations / what can't be found */
  limitations: string[];
  faqs: FAQ[];
  relatedTools: string[];
  relatedGuides: string[];
}

/** Slug normaliser — maps aliases to canonical slugs */
const SLUG_ALIASES: Record<string, string> = {
  twitter: "x-twitter",
  x: "x-twitter",
  fb: "facebook",
  ig: "instagram",
  yt: "youtube",
  tg: "telegram",
  snap: "snapchat",
};

export function normaliseSlug(input: string): string {
  const lower = input.toLowerCase().trim();
  return SLUG_ALIASES[lower] ?? lower;
}

/** Legacy route → canonical platform path mapping */
export const LEGACY_PLATFORM_REDIRECTS: Record<string, string> = {
  "/instagram-username-search": "/platforms/instagram/username-search",
  "/tiktok-username-search": "/platforms/tiktok/username-search",
  "/twitter-username-search": "/platforms/x-twitter/username-search",
  "/discord-username-search": "/platforms/discord/username-search",
  "/snapchat-username-search": "/platforms/snapchat/username-search",
  "/reddit-username-search": "/platforms/reddit/username-search",
  "/linkedin-username-search": "/platforms/linkedin/username-search",
  "/telegram-username-search": "/platforms/telegram/username-search",
  "/youtube-username-search": "/platforms/youtube/username-search",
  "/facebook-search-without-login": "/platforms/facebook/username-search",
};

export const platformPages: PlatformEntry[] = [
  {
    slug: "instagram",
    name: "Instagram",
    primaryKeyword: "Instagram username search",
    description: "Search an Instagram username across 500+ platforms to find connected public profiles, exposure signals, and digital footprint data.",
    whatYoullFind: [
      "Whether the same username appears on other social platforms, forums, and developer sites",
      "Public profile URLs where the handle is claimed",
      "Exposure indicators showing how visible this identity is online",
    ],
    limitations: [
      "Private Instagram accounts are not accessed — only public data is queried",
      "Matching a username does not confirm the same person owns every account",
      "Deleted or deactivated profiles will typically not appear",
    ],
    faqs: [
      { q: "Can I search an Instagram username without an account?", a: "Yes. FootprintIQ checks public data across platforms — you don't need an Instagram account to run a scan." },
      { q: "Will the Instagram user know I searched for them?", a: "No. FootprintIQ only queries publicly available data. No notifications are sent to profile owners." },
      { q: "Does this show private Instagram posts?", a: "No. Only publicly visible profile information is checked. Private posts, stories, and DMs are never accessed." },
      { q: "How accurate is an Instagram username search?", a: "Accuracy depends on username uniqueness. Common handles may return false positives, which our AI filters help reduce." },
      { q: "Can I find someone's real name from their Instagram username?", a: "FootprintIQ shows where a username appears publicly. If the person uses the same handle on a platform that displays their name, it may surface — but we never guarantee identity resolution." },
      { q: "Is it legal to search for an Instagram username?", a: "Yes. Searching publicly available data is legal. FootprintIQ follows ethical OSINT principles and only accesses public sources." },
    ],
    relatedTools: ["/username-search", "/social-media-account-finder", "/reverse-username-search"],
    relatedGuides: ["/guides/how-to-search-for-people-on-instagram", "/guides/what-is-username-osint", "/glossary/digital-footprint"],
  },
  {
    slug: "tiktok",
    name: "TikTok",
    primaryKeyword: "TikTok username search",
    description: "Search a TikTok username across 500+ public platforms. Find where the same handle is used and assess digital exposure.",
    whatYoullFind: [
      "Cross-platform presence of a TikTok username on social media, forums, and other sites",
      "Profile URLs and confidence scores for each match",
      "Digital exposure assessment based on handle reuse patterns",
    ],
    limitations: [
      "TikTok private accounts are not accessed",
      "Video content and comments are not scanned — only username presence is checked",
      "Username matches across platforms don't confirm the same person",
    ],
    faqs: [
      { q: "Can I find where a TikTok username is used elsewhere?", a: "Yes. FootprintIQ checks 500+ platforms for the same username, showing where the handle appears publicly." },
      { q: "Does this tool access TikTok's private API?", a: "No. FootprintIQ only queries publicly accessible data using ethical OSINT techniques." },
      { q: "Can I search TikTok without an account?", a: "Yes. No TikTok account is needed to run a username scan through FootprintIQ." },
      { q: "How do I check if a TikTok username is a scam account?", a: "Run a scan to see if the username appears on known scam-associated platforms. Cross-platform presence patterns can help assess legitimacy." },
      { q: "Is TikTok username search free?", a: "Yes. The basic scan is free and requires no sign-up." },
      { q: "What if the TikTok username is very common?", a: "Common usernames may return more matches. Our AI-powered false-positive filtering helps distinguish likely matches from coincidental ones." },
    ],
    relatedTools: ["/username-search", "/where-is-this-username-used", "/digital-footprint-checker"],
    relatedGuides: ["/guides/search-tiktok-without-account", "/guides/why-username-reuse-is-risky", "/glossary/username-osint"],
  },
  {
    slug: "reddit",
    name: "Reddit",
    primaryKeyword: "Reddit username search",
    description: "Search a Reddit username across 500+ platforms. Discover where the same handle is used and evaluate digital footprint exposure.",
    whatYoullFind: [
      "Other platforms where the same Reddit username appears",
      "Public profile links with match confidence scores",
      "Username reuse patterns that may indicate identity correlation",
    ],
    limitations: [
      "Deleted Reddit accounts and removed posts are not accessible",
      "Subreddit activity and comment history are not scanned",
      "Throwaway account usernames may have minimal cross-platform presence",
    ],
    faqs: [
      { q: "Can I find someone's other accounts from their Reddit username?", a: "FootprintIQ checks 500+ platforms for the same handle. If the person reuses their Reddit username elsewhere, those profiles will appear." },
      { q: "Does this access private Reddit messages?", a: "No. Only publicly visible data is queried. Private messages, upvote history, and saved posts are never accessed." },
      { q: "How useful is a Reddit username search?", a: "Very useful for digital footprint audits. Reddit users often reuse handles on developer platforms, forums, and social media." },
      { q: "Is searching for a Reddit username legal?", a: "Yes. Querying publicly available information is legal. FootprintIQ follows strict ethical OSINT guidelines." },
      { q: "Can I check my own Reddit exposure?", a: "Absolutely. Self-auditing is one of the primary use cases — enter your Reddit username to see your cross-platform digital footprint." },
      { q: "Will the Reddit user be notified?", a: "No. FootprintIQ only queries public data sources. No notifications are sent." },
    ],
    relatedTools: ["/username-search", "/check-username-across-platforms", "/username-availability-checker"],
    relatedGuides: ["/guides/how-to-trace-a-username", "/guides/how-to-remove-old-accounts", "/glossary/username-osint"],
  },
  {
    slug: "github",
    name: "GitHub",
    primaryKeyword: "GitHub username search",
    description: "Search a GitHub username across 500+ platforms. Identify cross-platform presence and assess digital exposure for developer identities.",
    whatYoullFind: [
      "Social media and forum accounts using the same GitHub username",
      "Developer ecosystem presence (GitLab, Stack Overflow, npm, etc.)",
      "Public profile URLs and exposure risk indicators",
    ],
    limitations: [
      "Private repositories and contributions are not accessed",
      "Email addresses linked to commits are not extracted",
      "Organisation membership details are not queried",
    ],
    faqs: [
      { q: "Can I find a developer's social media from their GitHub username?", a: "If the developer uses the same handle on social platforms, FootprintIQ will find those matches across 500+ sites." },
      { q: "Does this expose private GitHub repositories?", a: "No. Only publicly visible profile information is checked. Private repos, code, and commit history are never accessed." },
      { q: "Why search a GitHub username?", a: "Developers often reuse handles across professional and personal platforms. A search reveals your digital exposure across the developer ecosystem." },
      { q: "Is this useful for hiring or background checks?", a: "FootprintIQ is designed for self-assessment and authorised investigations. Always ensure you have proper authorisation before investigating others." },
      { q: "Can I audit my own developer footprint?", a: "Yes. Enter your GitHub username to see everywhere your handle appears publicly — ideal for pre-employment privacy audits." },
      { q: "How is this different from GitHub's built-in search?", a: "GitHub search only finds content within GitHub. FootprintIQ checks 500+ external platforms for the same username." },
    ],
    relatedTools: ["/username-search", "/digital-footprint-checker", "/reverse-username-search"],
    relatedGuides: ["/guides/what-is-username-osint", "/guides/why-username-reuse-is-risky", "/glossary/digital-footprint"],
  },
  {
    slug: "telegram",
    name: "Telegram",
    primaryKeyword: "Telegram username search",
    description: "Search a Telegram username across 500+ public platforms. Find connected accounts and assess digital footprint exposure.",
    whatYoullFind: [
      "Cross-platform presence of a Telegram handle on social media and forums",
      "Public profile matches with confidence scoring",
      "Exposure indicators for the searched handle",
    ],
    limitations: [
      "Telegram channel content and group memberships are not scanned",
      "Phone numbers linked to Telegram accounts are not accessed",
      "Bot usernames may return different results than personal accounts",
    ],
    faqs: [
      { q: "Can I find who owns a Telegram username?", a: "FootprintIQ shows where the same username appears across 500+ platforms. This can help identify cross-platform presence, but doesn't guarantee identity resolution." },
      { q: "Does this access Telegram messages?", a: "No. Only publicly visible username presence is checked. Messages, groups, and channels are never accessed." },
      { q: "Is Telegram username search useful for scam detection?", a: "Yes. Checking if a Telegram username appears on known platforms can help assess legitimacy and identify suspicious patterns." },
      { q: "Can I search without a Telegram account?", a: "Yes. No Telegram account is needed — FootprintIQ checks the username across external public platforms." },
      { q: "How do I protect my Telegram identity?", a: "Use a unique username for Telegram that isn't reused on other platforms. Run a scan to check your current exposure." },
      { q: "Is this legal?", a: "Yes. Searching publicly available data is legal. FootprintIQ follows ethical OSINT principles." },
    ],
    relatedTools: ["/username-search", "/social-media-account-finder", "/where-is-this-username-used"],
    relatedGuides: ["/guides/telegram-osint-search", "/guides/how-to-trace-a-username", "/glossary/username-osint"],
  },
  {
    slug: "discord",
    name: "Discord",
    primaryKeyword: "Discord username search",
    description: "Search a Discord username across 500+ public platforms. Discover where the same handle appears and evaluate digital exposure.",
    whatYoullFind: [
      "Other platforms where the Discord username is used",
      "Public profile URLs with match confidence levels",
      "Gaming and community platform presence patterns",
    ],
    limitations: [
      "Discord server memberships and messages are not accessed",
      "Discord discriminator tags (e.g., #1234) are not used in cross-platform matching",
      "Private or hidden profiles cannot be queried",
    ],
    faqs: [
      { q: "Can I find someone's other accounts from their Discord username?", a: "If they reuse the same handle, FootprintIQ will find matching profiles across 500+ platforms including gaming sites, forums, and social media." },
      { q: "Does this access Discord servers or messages?", a: "No. Only the username is checked across external public platforms. Discord's internal data is never accessed." },
      { q: "Is Discord username search useful for gaming communities?", a: "Yes. Gamers often reuse handles across Discord, Steam, Twitch, and other platforms. A scan reveals cross-platform presence." },
      { q: "Can I search a Discord username without an account?", a: "Yes. No Discord account is required to run a username scan." },
      { q: "How accurate are Discord username matches?", a: "Accuracy depends on username uniqueness. Our AI filters help reduce false positives from common handles." },
      { q: "Is this free?", a: "Yes. The basic scan is free and doesn't require sign-up." },
    ],
    relatedTools: ["/username-search", "/username-availability-checker", "/check-username-across-platforms"],
    relatedGuides: ["/guides/what-is-username-osint", "/guides/why-username-reuse-is-risky", "/glossary/digital-footprint"],
  },
  {
    slug: "snapchat",
    name: "Snapchat",
    primaryKeyword: "Snapchat username search",
    description: "Search a Snapchat username across 500+ public platforms. Find where the same handle is used and assess online exposure.",
    whatYoullFind: [
      "Cross-platform presence of a Snapchat handle on social media and other sites",
      "Profile URLs with match confidence scores",
      "Digital exposure assessment for the searched handle",
    ],
    limitations: [
      "Snapchat Stories, Snaps, and friend lists are not accessible",
      "Snap Map location data is never queried",
      "Bitmoji and display names are not searched",
    ],
    faqs: [
      { q: "Can I search a Snapchat username across other platforms?", a: "Yes. FootprintIQ checks 500+ platforms for the same handle, revealing cross-platform username presence." },
      { q: "Does this show Snapchat stories or photos?", a: "No. Only username presence across external platforms is checked. Snapchat content is never accessed." },
      { q: "Is Snapchat username search useful for parents?", a: "It can help parents understand their child's digital footprint by showing where a username appears publicly. Always discuss online safety openly." },
      { q: "Can someone find my real identity from my Snapchat username?", a: "If you reuse your Snapchat handle on platforms that display personal information, it could be correlated. A self-audit scan can show your exposure." },
      { q: "Is this service free?", a: "Yes. Basic username scans are free with no sign-up required." },
      { q: "Does the Snapchat user get notified?", a: "No. FootprintIQ queries public data only — no notifications are ever sent." },
    ],
    relatedTools: ["/username-search", "/social-media-account-finder", "/digital-footprint-checker"],
    relatedGuides: ["/guides/how-to-remove-old-accounts", "/guides/why-username-reuse-is-risky", "/glossary/digital-footprint"],
  },
  {
    slug: "youtube",
    name: "YouTube",
    primaryKeyword: "YouTube username search",
    description: "Search a YouTube username across 500+ platforms. Discover connected public profiles and evaluate digital footprint exposure.",
    whatYoullFind: [
      "Other platforms where the YouTube channel name or handle appears",
      "Public profile URLs with confidence scoring",
      "Cross-platform identity correlation signals",
    ],
    limitations: [
      "YouTube video content, comments, and watch history are not accessed",
      "Private or unlisted videos are never queried",
      "Channel subscriber data is not extracted",
    ],
    faqs: [
      { q: "Can I find a YouTuber's other social accounts?", a: "If they use the same handle across platforms, FootprintIQ will find those matches. Many creators reuse their channel name on Twitter, Instagram, and other sites." },
      { q: "Does this access YouTube analytics or private data?", a: "No. Only publicly visible username presence across external platforms is checked." },
      { q: "Is YouTube username search useful for brand research?", a: "Yes. Checking if a brand name or creator handle is used across platforms helps assess digital presence and potential impersonation." },
      { q: "Can I audit my own YouTube exposure?", a: "Yes. Enter your YouTube handle to see your cross-platform digital footprint." },
      { q: "How is this different from YouTube's search?", a: "YouTube search finds content within YouTube. FootprintIQ checks 500+ external platforms for the same username." },
      { q: "Is this free?", a: "Yes. Basic scans are free and require no account." },
    ],
    relatedTools: ["/username-search", "/reverse-username-search", "/where-is-this-username-used"],
    relatedGuides: ["/guides/what-is-username-osint", "/guides/how-to-trace-a-username", "/glossary/username-osint"],
  },
  {
    slug: "facebook",
    name: "Facebook",
    primaryKeyword: "Facebook username search",
    description: "Search a Facebook username across 500+ public platforms. Find where the same handle is used and assess digital exposure risk.",
    whatYoullFind: [
      "Cross-platform presence of a Facebook handle or vanity URL username",
      "Public profile matches on other social media and forums",
      "Exposure indicators based on username reuse patterns",
    ],
    limitations: [
      "Facebook friend lists, posts, and private profile data are not accessed",
      "Login-required content is never scraped",
      "Facebook profiles using real names without custom URLs may not match",
    ],
    faqs: [
      { q: "Can I search Facebook without logging in?", a: "FootprintIQ doesn't search within Facebook. It checks if the same username appears across 500+ external platforms." },
      { q: "Does this access private Facebook data?", a: "No. Only publicly visible data from external platforms is queried. Facebook's walled-garden content is never accessed." },
      { q: "How do I find a Facebook username?", a: "A Facebook username is the custom URL part (e.g., facebook.com/johndoe). You can find it on the profile page URL." },
      { q: "Is this useful for finding fake Facebook accounts?", a: "Checking cross-platform username presence can help assess whether an account is likely genuine or potentially fabricated." },
      { q: "Can I check my own Facebook exposure?", a: "Yes. Enter your Facebook username to see where the same handle appears across other platforms." },
      { q: "Is this legal and ethical?", a: "Yes. FootprintIQ only queries publicly available data and follows ethical OSINT principles." },
    ],
    relatedTools: ["/username-search", "/social-media-account-finder", "/check-if-someone-is-a-scammer"],
    relatedGuides: ["/how-to-delete-facebook-account", "/guides/what-is-username-osint", "/glossary/digital-footprint"],
  },
  {
    slug: "linkedin",
    name: "LinkedIn",
    primaryKeyword: "LinkedIn username search",
    description: "Search a LinkedIn username across 500+ public platforms. Discover cross-platform presence and evaluate professional digital exposure.",
    whatYoullFind: [
      "Other platforms where the LinkedIn handle or vanity URL appears",
      "Professional and personal platform overlap patterns",
      "Public profile URLs with match confidence",
    ],
    limitations: [
      "LinkedIn profile content, connections, and endorsements are not accessed",
      "Login-required data is never scraped",
      "LinkedIn profiles without custom URLs may not match by username",
    ],
    faqs: [
      { q: "Can I find someone's personal accounts from their LinkedIn username?", a: "If they reuse their LinkedIn vanity URL on personal platforms, FootprintIQ will find those matches." },
      { q: "Does this access LinkedIn profiles directly?", a: "No. FootprintIQ checks the username across 500+ external platforms. LinkedIn's own data is not scraped." },
      { q: "Is LinkedIn username search useful for pre-employment checks?", a: "For self-auditing, yes. Professionals can check their own cross-platform exposure before job applications." },
      { q: "How do I find my LinkedIn username?", a: "Your LinkedIn username is the custom URL part: linkedin.com/in/your-username. You can customise it in LinkedIn settings." },
      { q: "Is this free?", a: "Yes. Basic scans are free and require no sign-up." },
      { q: "Does searching violate LinkedIn's terms?", a: "FootprintIQ does not access LinkedIn directly. It checks the username string across other public platforms, which is perfectly legal." },
    ],
    relatedTools: ["/username-search", "/digital-footprint-checker", "/reverse-username-search"],
    relatedGuides: ["/guides/employers-digital-footprint", "/guides/what-is-username-osint", "/glossary/digital-footprint"],
  },
  {
    slug: "x-twitter",
    name: "X (Twitter)",
    primaryKeyword: "Twitter username search",
    description: "Search an X (Twitter) username across 500+ public platforms. Find connected accounts and assess digital footprint exposure.",
    whatYoullFind: [
      "Cross-platform presence of a Twitter/X handle on other social media and forums",
      "Profile URLs and confidence scores for username matches",
      "Digital exposure indicators based on handle reuse",
    ],
    limitations: [
      "Tweets, DMs, and follower lists are not accessed",
      "Protected (locked) accounts are not queried",
      "Historical usernames (before handle changes) are not tracked",
    ],
    faqs: [
      { q: "Can I search a Twitter username without an X account?", a: "Yes. FootprintIQ checks the username across external platforms — no X account is needed." },
      { q: "Does this show tweets or private data?", a: "No. Only username presence across 500+ external platforms is checked. Tweet content is never accessed." },
      { q: "Is this useful for finding impersonation accounts?", a: "Yes. Checking where a handle appears can help identify whether someone is impersonating a brand or public figure across platforms." },
      { q: "Can I search for old Twitter handles?", a: "You can search any handle. If the old username is still claimed on other platforms, it will appear in results." },
      { q: "How accurate is a Twitter username search?", a: "Accuracy depends on handle uniqueness. Short or common handles may return more matches, filtered by our AI confidence scoring." },
      { q: "Is this free and legal?", a: "Yes. Basic scans are free, and searching publicly available data is legal under ethical OSINT principles." },
    ],
    relatedTools: ["/username-search", "/where-is-this-username-used", "/social-media-account-finder"],
    relatedGuides: ["/guides/search-twitter-without-account", "/guides/how-to-trace-a-username", "/glossary/username-osint"],
  },
];

/** Lookup a platform entry by slug (with normalisation) */
export function getPlatformEntry(slug: string): PlatformEntry | undefined {
  const normalised = normaliseSlug(slug);
  return platformPages.find((p) => p.slug === normalised);
}

/** Get all platform slugs */
export function getAllPlatformSlugs(): string[] {
  return platformPages.map((p) => p.slug);
}
