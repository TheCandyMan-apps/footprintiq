import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Hash and verify API key
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const { data: apiKeyData, error: keyError } = await supabaseClient
      .from("api_keys")
      .select("*")
      .eq("key_hash", keyHash)
      .eq("is_active", true)
      .single();

    if (keyError || !apiKeyData) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiration
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "API key expired" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update last used
    await supabaseClient
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKeyData.id);

    // Log API usage
    const startTime = Date.now();
    const url = new URL(req.url);
    const endpoint = url.pathname;

    // Handle different endpoints
    let responseData;
    let statusCode = 200;

    if (req.method === "GET" && endpoint.includes("/scans")) {
      const scanId = url.searchParams.get("id");
      
      if (scanId) {
        // Get specific scan
        const { data: scan, error } = await supabaseClient
          .from("scans")
          .select("*, data_sources(*), social_profiles(*)")
          .eq("id", scanId)
          .eq("user_id", apiKeyData.user_id)
          .single();

        if (error) {
          statusCode = 404;
          responseData = { error: "Scan not found" };
        } else {
          responseData = scan;
        }
      } else {
        // List scans
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const { data: scans, error } = await supabaseClient
          .from("scans")
          .select("*")
          .eq("user_id", apiKeyData.user_id)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) {
          statusCode = 500;
          responseData = { error: "Failed to fetch scans" };
        } else {
          responseData = { scans, count: scans?.length || 0 };
        }
      }
    } else {
      statusCode = 404;
      responseData = { error: "Endpoint not found" };
    }

    // Log usage
    await supabaseClient.from("api_usage").insert({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      endpoint,
      method: req.method,
      status_code: statusCode,
      response_time_ms: Date.now() - startTime,
    });

    return new Response(JSON.stringify(responseData), {
      status: statusCode,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
