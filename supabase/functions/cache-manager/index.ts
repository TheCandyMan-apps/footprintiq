import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { CacheGetSchema, CacheSetSchema, safeParse } from "../_shared/validation.ts";
import { checkRateLimit, getClientIP, rateLimitResponse, RateLimits } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit check
    const clientIP = getClientIP(req);
    const allowed = await checkRateLimit(clientIP, {
      endpoint: "cache-manager",
      ...RateLimits.cache,
    });
    
    if (!allowed) {
      return rateLimitResponse(3600);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "get";

    // Get cached value
    if (action === "get" && req.method === "GET") {
      const key = url.searchParams.get("key");
      const validation = safeParse(CacheGetSchema, { key });
      
      if (!validation.success) {
        return new Response(
          JSON.stringify({ error: "Invalid cache key", details: validation.error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: entry } = await supabase
        .from("cache_entries")
        .select("*")
        .eq("cache_key", key)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (!entry) {
        return new Response(
          JSON.stringify({ hit: false, value: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update hit count and last accessed
      await supabase
        .from("cache_entries")
        .update({
          hit_count: entry.hit_count + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq("id", entry.id);

      return new Response(
        JSON.stringify({ hit: true, value: entry.cache_value }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Set cached value
    if (action === "set" && req.method === "POST") {
      const body = await req.json();
      const validation = safeParse(CacheSetSchema, body);
      
      if (!validation.success) {
        return new Response(
          JSON.stringify({ error: "Invalid cache data", details: validation.error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { key, value, type, ttl } = validation.data!;

      const ttlSeconds = ttl || 3600;
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

      await supabase
        .from("cache_entries")
        .upsert({
          cache_key: key,
          cache_value: value,
          cache_type: type || "query",
          ttl_seconds: ttlSeconds,
          expires_at: expiresAt.toISOString()
        }, {
          onConflict: "cache_key"
        });

      return new Response(
        JSON.stringify({ success: true, expires_at: expiresAt }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete cached value
    if (action === "delete" && req.method === "DELETE") {
      const key = url.searchParams.get("key");
      
      if (!key) {
        return new Response(
          JSON.stringify({ error: "Cache key required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("cache_entries")
        .delete()
        .eq("cache_key", key);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clear cache by type
    if (action === "clear" && req.method === "POST") {
      const { type } = await req.json();

      let query = supabase.from("cache_entries").delete();
      
      if (type) {
        query = query.eq("cache_type", type);
      } else {
        query = query.neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
      }

      const { error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cache statistics
    if (action === "stats" && req.method === "GET") {
      const { data: entries } = await supabase
        .from("cache_entries")
        .select("cache_type, hit_count");

      const stats = {
        total_entries: entries?.length || 0,
        by_type: {} as Record<string, { count: number; total_hits: number }>,
        total_hits: 0
      };

      entries?.forEach((entry: any) => {
        if (!stats.by_type[entry.cache_type]) {
          stats.by_type[entry.cache_type] = { count: 0, total_hits: 0 };
        }
        stats.by_type[entry.cache_type].count++;
        stats.by_type[entry.cache_type].total_hits += entry.hit_count;
        stats.total_hits += entry.hit_count;
      });

      return new Response(
        JSON.stringify(stats),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cleanup expired entries
    if (action === "cleanup" && req.method === "POST") {
      const { error } = await supabase.rpc("cleanup_expired_cache");
      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cache manager error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
