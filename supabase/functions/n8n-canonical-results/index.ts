import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  generateCanonicalKey,
  normalizePlatformName,
  classifyPageType,
  selectPrimaryUrl,
  mergeUrlVariants,
  aggregateSeverity,
  aggregateConfidence,
  categorizePlatform,
  extractUsernameFromUrl,
  adjustForSearchPageType,
  type UrlVariant,
  type CanonicalResult,
  type PageType,
} from "../_shared/canonical.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-callback-token",
};

/**
 * Normalize incoming result from various payload formats (n8n vs documented)
 * 
 * n8n sends:      platform_name, canonical_username, primary_url, source_providers
 * Documented:     platform, username, url, provider
 */
interface NormalizedResult {
  platform: string;
  username: string;
  url: string;
  provider: string;
  severity: string;
  confidence: number;
  is_verified: boolean;
  verification_status: string | null;
  finding_id: string | null;
  risk_score: number | null;
  ai_summary: string | null;
  remediation_priority: string | null;
  observed_at: string;
  page_type: string | null; // Preserve if n8n already classified
  url_variants: UrlVariant[];
}

function normalizeIncomingResult(item: Record<string, unknown>): NormalizedResult | null {
  // Map platform: accept platform, platform_name
  const platform = (item.platform || item.platform_name) as string | undefined;
  
  // Map URL: accept url, primary_url
  const url = (item.url || item.primary_url) as string | undefined;
  
  // Map username: accept username, canonical_username, or extract from URL
  let username = (item.username || item.canonical_username) as string | undefined;
  if (!username && url && platform) {
    username = extractUsernameFromUrl(url, platform) || undefined;
  }
  
  // Determine provider from multiple sources:
  // 1. Direct provider field
  // 2. source_providers array (first element)
  // 3. url_variants array (first element's provider)
  // 4. Default to 'ai'
  let provider = item.provider as string | undefined;
  if (!provider) {
    const sourceProviders = item.source_providers as string[] | undefined;
    if (sourceProviders && sourceProviders.length > 0) {
      provider = sourceProviders[0];
    }
  }
  if (!provider) {
    const urlVariants = item.url_variants as Array<{ provider?: string }> | undefined;
    if (urlVariants && urlVariants.length > 0 && urlVariants[0].provider) {
      provider = urlVariants[0].provider;
    }
  }
  if (!provider) {
    provider = 'ai';
  }
  
  // Validate required fields
  if (!platform || !url) {
    return null; // Invalid item - missing required fields
  }
  
  // Handle url_variants - could be already structured or need parsing
  let urlVariants: UrlVariant[] = [];
  if (Array.isArray(item.url_variants)) {
    urlVariants = (item.url_variants as Array<Record<string, unknown>>).map((v) => ({
      url: (v.url as string) || '',
      page_type: (v.page_type as PageType) || 'unknown',
      provider: (v.provider as string) || provider,
      is_verified: (v.is_verified as boolean) || false,
      verification_status: (v.verification_status as string) || null,
      last_verified_at: (v.last_verified_at as string) || null,
      source_finding_id: (v.source_finding_id as string) || null,
      priority: (v.priority as number) || 5,
    }));
  }
  
  return {
    platform,
    username: username || 'unknown',
    url,
    provider,
    severity: (item.severity as string) || 'info',
    confidence: (item.confidence as number) ?? 0.5,
    is_verified: (item.is_verified as boolean) || false,
    verification_status: (item.verification_status as string) || null,
    finding_id: (item.finding_id as string) || null,
    risk_score: (item.risk_score as number) || null,
    ai_summary: (item.ai_summary as string) || null,
    remediation_priority: (item.remediation_priority as string) || null,
    observed_at: (item.observed_at as string) || new Date().toISOString(),
    page_type: (item.page_type as string) || null, // Preserve if n8n already classified
    url_variants: urlVariants,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate callback token
    const callbackToken = req.headers.get("x-callback-token");
    const expectedToken = Deno.env.get("N8N_CALLBACK_TOKEN");
    
    if (!expectedToken) {
      console.error("[n8n-canonical-results] N8N_CALLBACK_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Server misconfiguration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (callbackToken !== expectedToken) {
      console.warn("[n8n-canonical-results] Invalid callback token");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body - accept BOTH payload formats
    const body = await req.json();
    const { scanId, workspaceId } = body;
    
    // Detailed logging for debugging
    console.log(`[n8n-canonical-results] Received payload keys: ${Object.keys(body).join(', ')}`);
    console.log(`[n8n-canonical-results] scanId: ${scanId}, workspaceId: ${workspaceId}`);
    
    // Accept BOTH 'results' (documented) and 'canonicalResults' (n8n sends)
    const rawResults: Record<string, unknown>[] = body.results || body.canonicalResults || [];
    
    console.log(`[n8n-canonical-results] Incoming results count: ${rawResults.length}`);

    if (!scanId || !workspaceId) {
      console.error("[n8n-canonical-results] Missing scanId or workspaceId");
      return new Response(
        JSON.stringify({ error: "Missing scanId or workspaceId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!rawResults || rawResults.length === 0) {
      console.log("[n8n-canonical-results] No results to process");
      return new Response(
        JSON.stringify({ success: true, processed: 0, inserted: 0, invalid: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize all incoming results and track validation failures
    const invalidItems: Array<{ index: number; preview: string; reason: string }> = [];
    const normalizedResults: NormalizedResult[] = [];
    
    for (let i = 0; i < rawResults.length; i++) {
      const item = rawResults[i];
      const normalized = normalizeIncomingResult(item);
      
      if (!normalized) {
        // Log first 3 invalid items for debugging
        if (invalidItems.length < 3) {
          const preview = JSON.stringify(item).slice(0, 200);
          const hasPlatform = !!(item.platform || item.platform_name);
          const hasUrl = !!(item.url || item.primary_url);
          invalidItems.push({ 
            index: i, 
            preview,
            reason: `Missing: ${!hasPlatform ? 'platform ' : ''}${!hasUrl ? 'url' : ''}`.trim()
          });
        }
      } else {
        normalizedResults.push(normalized);
      }
    }
    
    console.log(`[n8n-canonical-results] Validation: ${normalizedResults.length} valid, ${rawResults.length - normalizedResults.length} invalid`);
    if (invalidItems.length > 0) {
      console.warn(`[n8n-canonical-results] First invalid items:`, JSON.stringify(invalidItems));
    }
    
    if (normalizedResults.length === 0) {
      console.warn("[n8n-canonical-results] All items failed validation");
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: rawResults.length, 
          inserted: 0, 
          invalid: rawResults.length,
          invalidSamples: invalidItems 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Group results by canonical_key
    const groupedResults = new Map<string, {
      platform: string;
      username: string;
      variants: UrlVariant[];
      severities: string[];
      confidences: number[];
      findingIds: string[];
      providers: string[];
      riskScores: number[];
      aiSummaries: string[];
      remediationPriorities: string[];
      observedAt: string;
      preClassifiedPageType: string | null;
    }>();

    for (const result of normalizedResults) {
      // Normalize platform name
      const platform = normalizePlatformName(result.platform);
      const username = result.username;
      const canonicalKey = generateCanonicalKey(platform, username);

      // Use pre-classified page_type if provided by n8n, otherwise classify
      const pageType = (result.page_type as PageType) || classifyPageType(result.url);

      // Create URL variant from result
      const variant: UrlVariant = {
        url: result.url,
        page_type: pageType,
        provider: result.provider,
        is_verified: result.is_verified,
        verification_status: result.verification_status,
        last_verified_at: result.is_verified ? new Date().toISOString() : null,
        source_finding_id: result.finding_id,
        priority: pageType === 'profile' ? 1 : pageType === 'directory' ? 2 : pageType === 'api' ? 3 : pageType === 'search' ? 4 : 5,
      };
      
      // Also include any pre-existing url_variants from the payload
      const allVariants = [variant, ...result.url_variants];

      // Group or create entry
      if (groupedResults.has(canonicalKey)) {
        const group = groupedResults.get(canonicalKey)!;
        for (const v of allVariants) {
          group.variants = mergeUrlVariants(group.variants, v);
        }
        if (result.severity) group.severities.push(result.severity);
        if (result.confidence) group.confidences.push(result.confidence);
        if (result.finding_id) group.findingIds.push(result.finding_id);
        if (result.provider) group.providers.push(result.provider);
        if (result.risk_score) group.riskScores.push(result.risk_score);
        if (result.ai_summary) group.aiSummaries.push(result.ai_summary);
        if (result.remediation_priority) group.remediationPriorities.push(result.remediation_priority);
        // Keep pre-classified page type if we don't have one yet
        if (!group.preClassifiedPageType && result.page_type) {
          group.preClassifiedPageType = result.page_type;
        }
      } else {
        groupedResults.set(canonicalKey, {
          platform,
          username,
          variants: allVariants,
          severities: result.severity ? [result.severity] : [],
          confidences: result.confidence ? [result.confidence] : [],
          findingIds: result.finding_id ? [result.finding_id] : [],
          providers: result.provider ? [result.provider] : [],
          riskScores: result.risk_score ? [result.risk_score] : [],
          aiSummaries: result.ai_summary ? [result.ai_summary] : [],
          remediationPriorities: result.remediation_priority ? [result.remediation_priority] : [],
          observedAt: result.observed_at,
          preClassifiedPageType: result.page_type,
        });
      }
    }

    console.log(`[n8n-canonical-results] Grouped into ${groupedResults.size} canonical results`);

    // Upsert each canonical result
    let upsertedCount = 0;
    let errorCount = 0;

    for (const [canonicalKey, group] of groupedResults) {
      try {
        // Select primary URL
        const primaryVariant = selectPrimaryUrl(group.variants);
        const primaryUrl = primaryVariant?.url || null;
        // Use pre-classified page type if available, otherwise use from primary variant
        const pageType = (group.preClassifiedPageType as PageType) || primaryVariant?.page_type || 'unknown';

        // Aggregate values
        const rawSeverity = aggregateSeverity(group.severities);
        const rawConfidence = aggregateConfidence(group.confidences);
        
        // Adjust confidence/severity for search pages
        const { confidence, severity } = adjustForSearchPageType(pageType, rawConfidence, rawSeverity);
        
        const riskScore = group.riskScores.length > 0 ? Math.max(...group.riskScores) : null;
        const aiSummary = group.aiSummaries[0] || null;
        const remediationPriority = group.remediationPriorities[0] || null;
        const platformCategory = categorizePlatform(group.platform);

        // Unique providers and finding IDs
        const uniqueProviders = [...new Set(group.providers)];
        const uniqueFindingIds = [...new Set(group.findingIds)];

        // Check for existing record to merge variants
        const { data: existing } = await supabase
          .from("canonical_results")
          .select("id, url_variants, source_finding_ids, source_providers")
          .eq("scan_id", scanId)
          .eq("canonical_key", canonicalKey)
          .maybeSingle();

        let mergedVariants = group.variants;
        let mergedFindingIds = uniqueFindingIds;
        let mergedProviders = uniqueProviders;

        if (existing) {
          // Merge with existing variants
          const existingVariants = (existing.url_variants as UrlVariant[]) || [];
          for (const variant of group.variants) {
            mergedVariants = mergeUrlVariants(existingVariants, variant);
          }
          mergedFindingIds = [...new Set([...(existing.source_finding_ids || []), ...uniqueFindingIds])];
          mergedProviders = [...new Set([...(existing.source_providers || []), ...uniqueProviders])];
        }

        // Reselect primary after merge
        const finalPrimaryVariant = selectPrimaryUrl(mergedVariants);
        const finalPrimaryUrl = finalPrimaryVariant?.url || null;
        const finalPageType = (group.preClassifiedPageType as PageType) || finalPrimaryVariant?.page_type || 'unknown';
        const finalIsVerified = finalPrimaryVariant?.is_verified || false;
        const finalVerificationStatus = finalPrimaryVariant?.verification_status || null;

        // Upsert
        const { error } = await supabase
          .from("canonical_results")
          .upsert({
            scan_id: scanId,
            workspace_id: workspaceId,
            canonical_key: canonicalKey,
            platform_name: group.platform,
            canonical_username: group.username,
            primary_url: finalPrimaryUrl,
            page_type: finalPageType,
            url_variants: mergedVariants,
            severity,
            confidence,
            is_verified: finalIsVerified,
            verification_status: finalVerificationStatus,
            risk_score: riskScore,
            ai_summary: aiSummary,
            remediation_priority: remediationPriority,
            platform_category: platformCategory,
            source_finding_ids: mergedFindingIds,
            source_providers: mergedProviders,
            processing_pipeline: 'n8n',
            observed_at: group.observedAt,
          }, {
            onConflict: 'scan_id,canonical_key',
          });

        if (error) {
          console.error(`[n8n-canonical-results] Upsert error for ${canonicalKey}:`, error);
          errorCount++;
        } else {
          upsertedCount++;
        }
      } catch (err) {
        console.error(`[n8n-canonical-results] Error processing ${canonicalKey}:`, err);
        errorCount++;
      }
    }

    console.log(`[n8n-canonical-results] Completed: ${upsertedCount} upserted, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: rawResults.length,
        inserted: upsertedCount,
        invalid: rawResults.length - normalizedResults.length,
        errors: errorCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("[n8n-canonical-results] Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
