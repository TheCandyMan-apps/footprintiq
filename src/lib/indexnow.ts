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
  // Research pages
  "/research/username-reuse-report-2026",
  "/research/fact-sheet",
  "/press",
  // Guides
  "/guides/how-username-search-tools-work",
  // AI Hub
  "/ai",
  "/ai/digital-exposure",
  "/ai/digital-footprint",
  "/ai/what-is-osint",
  "/ai/what-is-identity-profiling",
  "/ai/what-are-data-brokers",
  "/ai-answers-hub",
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
