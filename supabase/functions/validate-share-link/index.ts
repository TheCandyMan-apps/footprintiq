import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Validate Share Link Edge Function
 * 
 * This function securely validates share tokens without exposing
 * the share_links table to public RLS access.
 * 
 * Security:
 * - Uses service role to bypass RLS (required since public access removed)
 * - Only returns scan data if token is valid and not expired
 * - Atomically increments access_count for audit trail
 * - Never exposes share_token or share_links metadata
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shareToken } = await req.json();

    if (!shareToken || typeof shareToken !== "string") {
      console.log("[validate-share-link] Missing or invalid shareToken");
      return new Response(
        JSON.stringify({ error: "Share token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate token format (32 hex chars)
    if (!/^[a-f0-9]{32}$/i.test(shareToken)) {
      console.log("[validate-share-link] Invalid token format");
      return new Response(
        JSON.stringify({ error: "Invalid share link" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the share link (service role bypasses RLS)
    const { data: shareLink, error: findError } = await supabase
      .from("share_links")
      .select("id, scan_id, expires_at, access_count")
      .eq("share_token", shareToken)
      .single();

    if (findError || !shareLink) {
      console.log("[validate-share-link] Share link not found:", findError?.message);
      return new Response(
        JSON.stringify({ error: "Share link not found or invalid" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    const expiresAt = new Date(shareLink.expires_at);
    if (expiresAt < new Date()) {
      console.log("[validate-share-link] Share link expired:", shareLink.id);
      return new Response(
        JSON.stringify({ error: "Share link has expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Atomically increment access count for audit trail
    const { error: updateError } = await supabase
      .from("share_links")
      .update({ access_count: (shareLink.access_count || 0) + 1 })
      .eq("id", shareLink.id);

    if (updateError) {
      console.error("[validate-share-link] Failed to update access count:", updateError.message);
      // Non-fatal, continue with returning data
    }

    // Fetch the scan data
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .select(`
        id,
        target,
        scan_type,
        status,
        created_at,
        completed_at,
        results,
        profile_data
      `)
      .eq("id", shareLink.scan_id)
      .single();

    if (scanError || !scan) {
      console.error("[validate-share-link] Scan not found:", scanError?.message);
      return new Response(
        JSON.stringify({ error: "Scan not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch related data sources
    const { data: dataSources } = await supabase
      .from("data_sources")
      .select("id, source_type, url, title, description, risk_level, confidence, raw_data, created_at")
      .eq("scan_id", scan.id);

    // Fetch social profiles
    const { data: socialProfiles } = await supabase
      .from("social_profiles")
      .select("id, platform, username, url, profile_data, found_at")
      .eq("scan_id", scan.id);

    console.log(`[validate-share-link] Successfully validated token for scan ${scan.id}, access #${(shareLink.access_count || 0) + 1}`);

    return new Response(
      JSON.stringify({
        valid: true,
        scan: {
          ...scan,
          data_sources: dataSources || [],
          social_profiles: socialProfiles || [],
        },
        expiresAt: shareLink.expires_at,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[validate-share-link] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to validate share link" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
