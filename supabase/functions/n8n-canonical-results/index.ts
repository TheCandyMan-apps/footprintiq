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
  type UrlVariant,
  type CanonicalResult,
  type PageType,
} from "../_shared/canonical.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-callback-token",
};

interface IncomingResult {
  platform: string;
  username: string;
  url: string;
  provider: string;
  severity?: string;
  confidence?: number;
  is_verified?: boolean;
  verification_status?: string;
  finding_id?: string;
  risk_score?: number;
  ai_summary?: string;
  remediation_priority?: string;
  observed_at?: string;
}

interface RequestBody {
  scanId: string;
  workspaceId: string;
  results: IncomingResult[];
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

    // Parse request body
    const body: RequestBody = await req.json();
    const { scanId, workspaceId, results } = body;

    if (!scanId || !workspaceId) {
      return new Response(
        JSON.stringify({ error: "Missing scanId or workspaceId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!results || !Array.isArray(results) || results.length === 0) {
      console.log("[n8n-canonical-results] No results to process");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[n8n-canonical-results] Processing ${results.length} results for scan ${scanId}`);

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
    }>();

    for (const result of results) {
      // Normalize platform and username
      const platform = normalizePlatformName(result.platform);
      const username = result.username || extractUsernameFromUrl(result.url, platform) || 'unknown';
      const canonicalKey = generateCanonicalKey(platform, username);

      // Classify page type
      const pageType = classifyPageType(result.url);

      // Create URL variant
      const variant: UrlVariant = {
        url: result.url,
        page_type: pageType,
        provider: result.provider || 'unknown',
        is_verified: result.is_verified || false,
        verification_status: result.verification_status || null,
        last_verified_at: result.is_verified ? new Date().toISOString() : null,
        source_finding_id: result.finding_id || null,
        priority: pageType === 'profile' ? 1 : pageType === 'directory' ? 2 : pageType === 'api' ? 3 : pageType === 'search' ? 4 : 5,
      };

      // Group or create entry
      if (groupedResults.has(canonicalKey)) {
        const group = groupedResults.get(canonicalKey)!;
        group.variants = mergeUrlVariants(group.variants, variant);
        if (result.severity) group.severities.push(result.severity);
        if (result.confidence) group.confidences.push(result.confidence);
        if (result.finding_id) group.findingIds.push(result.finding_id);
        if (result.provider) group.providers.push(result.provider);
        if (result.risk_score) group.riskScores.push(result.risk_score);
        if (result.ai_summary) group.aiSummaries.push(result.ai_summary);
        if (result.remediation_priority) group.remediationPriorities.push(result.remediation_priority);
      } else {
        groupedResults.set(canonicalKey, {
          platform,
          username,
          variants: [variant],
          severities: result.severity ? [result.severity] : [],
          confidences: result.confidence ? [result.confidence] : [],
          findingIds: result.finding_id ? [result.finding_id] : [],
          providers: result.provider ? [result.provider] : [],
          riskScores: result.risk_score ? [result.risk_score] : [],
          aiSummaries: result.ai_summary ? [result.ai_summary] : [],
          remediationPriorities: result.remediation_priority ? [result.remediation_priority] : [],
          observedAt: result.observed_at || new Date().toISOString(),
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
        const pageType = primaryVariant?.page_type || 'unknown';

        // Aggregate values
        const severity = aggregateSeverity(group.severities);
        const confidence = aggregateConfidence(group.confidences);
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
        const finalPageType = finalPrimaryVariant?.page_type || 'unknown';
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
        processed: results.length,
        canonicalResults: upsertedCount,
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
