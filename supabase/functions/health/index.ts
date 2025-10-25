import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCircuitStatus } from "../_shared/providerRuntime.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const hasServiceKey = !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const hasUrl = !!Deno.env.get("SUPABASE_URL");
    const breakersOpen = getCircuitStatus();

    const health = {
      ok: true,
      timestamp: new Date().toISOString(),
      config: {
        hasServiceKey,
        hasUrl,
        // Never expose actual values
      },
      env: Deno.env.get("DENO_DEPLOYMENT_ID") ? "production" : "development",
      breakersOpen,
      budgets: {
        usedPct: 0, // TODO: Calculate from actual usage
      },
    };

    return new Response(JSON.stringify(health), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
