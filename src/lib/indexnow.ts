import { supabase } from "@/integrations/supabase/client";

/**
 * IndexNow utility for FootprintIQ
 * Submit URLs to search engines for instant indexing
 * Supported engines: Bing, Yandex, Naver, Seznam
 */

// All public pages that should be indexed
export const INDEXNOW_URLS = [
  // Core pages
  "/",
  "/features",
  "/pricing",
  "/enterprise",
  "/about",
  "/blog",
  "/privacy",
  "/terms",
  "/responsible-use",
  "/how-we-source-data",
  "/docs/api",
  "/assistant",
  "/automated-removal",
  "/usernames",
  "/contact",
  "/careers",
  "/lens",
  "/trust",
  "/support",
  "/global-index",
  "/partners",
  "/resources",
  "/resources/webinars",
  "/sample-report",
  // Pillar pages
  "/digital-footprint-scanner",
  "/digital-footprint-check",
  "/username-search",
  "/email-breach-check",
  "/username-search-tools",
  "/email-breach-tools",
  "/what-is-a-digital-footprint",
  "/username-exposure",
  "/what-is-osint",
  // Educational pages
  "/reduce-digital-footprint",
  "/how-identity-theft-starts",
  "/digital-privacy-glossary",
  "/is-my-data-exposed",
  "/old-data-breaches",
  "/which-data-matters",
  "/stay-private-online",
  "/about-footprintiq",
  "/ethical-osint-for-individuals",
  "/ethical-osint",
  "/editorial-ethics-policy",
  "/ethical-osint-principles",
  "/ethical-osint-charter",
  // Research pages
  "/research/username-reuse-report-2026",
  "/research/fact-sheet",
  "/press",
  // Guides
  "/guides",
  "/guides/how-username-search-tools-work",
  "/guides/interpret-osint-results",
  "/guides/what-osint-results-mean",
  "/guides/is-osint-scan-worth-it",
  "/guides/free-vs-paid-osint-tools",
  "/guides/good-osint-scan-result",
  // AI Hub
  "/ai",
  "/ai/digital-exposure",
  "/ai/digital-footprint",
  "/ai/what-is-osint",
  "/ai/what-is-identity-profiling",
  "/ai/what-are-data-brokers",
  "/ai-answers-hub",
  "/ai-answers/what-is-a-username-osint-scan",
  "/ai-answers/why-username-reuse-is-risky",
  "/ai-answers/are-username-search-tools-accurate",
  "/ai-answers/is-username-osint-legal",
  "/ai-answers/ethical-osint-tools",
  "/ai-answers/common-osint-misconceptions",
  "/ai-answers/when-not-to-use-osint",
  "/ai-answers/what-is-an-identity-risk-score",
  "/ai-answers/does-osint-include-dark-web-data",
  // Platform-specific search pages
  "/search-username",
  "/tiktok-username-search",
  "/instagram-username-search",
  "/twitter-username-search",
  // Persona landing pages
  "/for/crypto",
  "/for/job-seekers",
  "/for/developers",
  "/for/executives",
  // Hub-to-action surfaces
  "/scan",
  // SEO Tool Pages
  "/social-media-finder",
  "/username-checker",
  "/reverse-username-search",
  "/username-lookup",
  "/account-finder",
  "/find-social-media-accounts",
  "/dark-web-monitoring",
  "/check-my-digital-footprint",
  "/remove-personal-information-from-internet",
  // Breach & Exposure
  "/username-reuse-risk",
  "/after-have-i-been-pwned-what-next",
  "/data-breach-cleanup-checklist",
  "/breach-vs-digital-footprint-risk",
  "/how-to-monitor-your-online-exposure-after-a-breach",
  "/best-way-to-monitor-your-online-exposure",
  "/how-to-remove-yourself-from-data-brokers",
  "/data-broker-opt-out-guide",
  "/continuous-exposure-monitoring-explained",
  "/digital-exposure-risk-explained",
  // Mainstream Entry Pages
  "/how-to-check-whats-publicly-visible-about-you",
  "/how-employers-check-your-online-presence",
  "/how-to-clean-up-your-digital-footprint",
  "/see-what-google-knows-about-you",
  // Privacy & Removal
  "/privacy-centre",
  "/remove-mylife-profile",
  "/data-broker-removal-guide",
  "/remove-spokeo-profile",
  "/remove-beenverified-profile",
  "/incogni-vs-diy-data-removal",
  "/remove-yourself-from-google-search",
  "/how-to-remove-your-address-from-google",
  "/privacy/google-content-removal",
  "/privacy/data-broker-removal-guide",
  "/resources/2026-data-broker-removal-checklist",
  // Comparison Cluster
  "/best-digital-footprint-scanner",
  "/aura-vs-footprintiq",
  "/deleteme-vs-footprintiq",
  "/incogni-vs-footprintiq",
  "/kanary-vs-footprintiq",
  "/usersearch-vs-footprintiq",
  "/people-search-vs-footprintiq",
  "/osint-suites-vs-footprintiq",
  "/osint-for-activists-journalists",
  // Mainstream Q&A Guides
  "/guides/check-whats-publicly-visible",
  "/guides/employers-digital-footprint",
  "/guides/clean-up-online-presence",
  "/guides/remove-from-data-brokers",
  "/guides/monitor-online-exposure",
  "/guides/what-google-knows-about-you",
  "/guides/telegram-osint-search",
  // Blog (key posts)
  "/blog/digital-exposure-report-2026",
  "/blog/what-is-osint",
  "/blog/how-data-brokers-work",
  "/blog/how-exposed-am-i-online",
  "/blog/remove-from-data-brokers-uk",
  "/blog/delete-old-accounts",
  "/blog/what-is-digital-footprint-check",
  "/blog/what-is-ethical-osint-scan",
  "/blog/exposure-mapping-before-removal",
  "/blog/public-vs-private-data-osint",
  "/blog/remove-from-data-brokers-guide",
  "/blog/is-footprintiq-data-broker",
  "/blog/remove-address-from-google",
  // Keyword Gap Pages (Batch 1)
  "/best-osint-tools",
  "/how-to-find-someone-online",
  "/comparisons/pimeyes-alternative",
  // Keyword Gap Pages (Batch 2)
  "/osint-techniques",
  "/check-username-across-platforms",
  "/comparisons/sherlock-vs-footprintiq",
  "/credential-reuse-risk",
  // AI Visibility Gap Pages (Batch 1)
  "/scan-my-online-presence",
  "/best-online-privacy-scanner",
  "/what-can-people-find-about-me",
  // AI Visibility Gap Pages (Batch 2)
  "/audit-your-digital-footprint",
  "/personal-data-exposure-scan",
  // Dating Profile & People Lookup Cluster
  "/find-dating-profiles",
  "/best-people-lookup-sites",
  "/search-dating-sites-by-email",
  // Account Deletion Cluster
  "/how-to-delete-facebook-account",
  "/delete-social-media-accounts",
  // People Search Engine Cluster
  "/best-person-search-engine",
  "/best-search-engine-for-finding-people",
  "/search-engines-to-find-people",
  // Reference-Grade Resources (AI Citation)
  "/resources/ethical-osint-framework",
  "/resources/doxxing-defense",
  "/resources/digital-footprint-mapping",
];

/**
 * Submit URLs to IndexNow for instant search engine notification
 * @param urls - Array of URLs to submit (defaults to all public pages)
 * @returns Promise with submission result
 */
export async function submitToIndexNow(urls: string[] = INDEXNOW_URLS) {
  const { data, error } = await supabase.functions.invoke("indexnow-submit", {
    body: { urls },
  });

  if (error) {
    console.error("IndexNow submission error:", error);
    throw error;
  }
  
  console.log("IndexNow submission result:", data);
  return data;
}

/**
 * Submit a single URL to IndexNow
 * Useful for when a specific page is updated
 * @param url - Single URL to submit
 */
export async function submitSingleUrlToIndexNow(url: string) {
  return submitToIndexNow([url]);
}
