import { supabase } from "@/integrations/supabase/client";

export interface EnrichmentResponse {
  success: boolean;
  error?: string;

  // Provenance
  sourceUrl?: string;
  fetchedAt?: string;

  // Parsed page metadata
  title?: string;
  description?: string;

  // Extracted content
  markdown?: string;
  html?: string;

  metadata?: Record<string, unknown>;
}

/**
 * Context Enrichment (Firecrawl)
 *
 * What this does:
 * - Fetches *publicly accessible* content from a URL the user *explicitly provides*
 * - Helps interpret findings, add context, and reduce false positives
 *
 * What this does NOT do:
 * - No discovery, no crawling, no monitoring, no background collection
 * - No “scan the internet” behavior
 * - No access-bypass: if a page requires login/paywall, it may fail or return limited content
 *
 * Privacy & safety:
 * - Only runs on direct user action (button click)
 * - Use the returned content as context; always verify at the source
 */
export const contextEnrichmentApi = {
  /**
   * Retrieve public content from a specific URL for contextual review.
   * User-initiated only — never used for automated discovery or monitoring.
   */
  async enrichUrl(url: string): Promise<EnrichmentResponse> {
    const normalized = normalizeHttpUrl(url);
    if (!normalized) {
      return {
        success: false,
        error: "Please enter a valid URL starting with http:// or https:// (example: https://example.com).",
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke("firecrawl-enrich", {
        body: { url: normalized },
      });

      if (error) {
        return {
          success: false,
          error: friendlyEnrichmentError(error.message),
          sourceUrl: normalized,
        };
      }

      // Be defensive: ensure data shape is what UI expects
      if (!data || typeof data !== "object") {
        return {
          success: false,
          error: "We couldn’t retrieve context from that page. Please try again.",
          sourceUrl: normalized,
        };
      }

      return {
        sourceUrl: normalized,
        ...data,
      } as EnrichmentResponse;
    } catch (e: unknown) {
      return {
        success: false,
        error: "Context fetch failed due to a network error. Please try again.",
        sourceUrl: normalizeHttpUrl(url) ?? url,
      };
    }
  },
};

/** Require explicit http(s) to avoid weird inputs + improve safety/clarity */
function normalizeHttpUrl(input: string): string | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;

  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Converts technical errors into user-friendly copy (UI can still show raw errors if desired) */
function friendlyEnrichmentError(message: string): string {
  const m = (message || "").toLowerCase();

  if (m.includes("timeout") || m.includes("timed out")) {
    return "That page took too long to respond. Try again, or use a different source.";
  }
  if (m.includes("403") || m.includes("forbidden")) {
    return "That page blocks automated access (403). Try opening it in your browser and using a different public source.";
  }
  if (m.includes("401") || m.includes("unauthorized")) {
    return "That page requires login (401). Context enrichment only works on public pages.";
  }
  if (m.includes("404") || m.includes("not found")) {
    return "We couldn’t find that page (404). Check the URL and try again.";
  }
  if (m.includes("paywall") || m.includes("subscription")) {
    return "That page appears to be paywalled. Context enrichment works best on public pages.";
  }

  // Default: keep it short + non-scary
  return "We couldn’t retrieve context from that page. Please try another public URL.";
}
