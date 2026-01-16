import { supabase } from "@/integrations/supabase/client";

/**
 * IndexNow utility for FootprintIQ
 * Submit URLs to search engines for instant indexing
 * Supported engines: Bing, Yandex, Naver, Seznam
 */

// All public pages that should be indexed
export const INDEXNOW_URLS = [
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
