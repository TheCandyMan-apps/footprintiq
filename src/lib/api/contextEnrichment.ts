import { supabase } from '@/integrations/supabase/client';

export interface EnrichmentResponse {
  success: boolean;
  error?: string;
  sourceUrl?: string;
  fetchedAt?: string;
  title?: string;
  description?: string;
  markdown?: string;
  html?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Contextual enrichment API for retrieving publicly available content
 * from user-selected URLs to support interpretation and reduce false positives.
 * 
 * This is NOT a discovery or monitoring tool - it only operates on URLs
 * explicitly provided by the user.
 */
export const contextEnrichmentApi = {
  /**
   * Retrieve public content from a specific URL for contextual review.
   * User-initiated only - never used for automated discovery.
   */
  async enrichUrl(url: string): Promise<EnrichmentResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-enrich', {
      body: { url },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
