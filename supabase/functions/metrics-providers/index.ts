import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSpendSummary } from "../_shared/providerCosts.ts";
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
    const url = new URL(req.url);
    const providerId = url.searchParams.get("provider");
    
    const spendSummary = getSpendSummary(providerId || undefined);
    const circuits = getCircuitStatus();

    const metrics = {
      providers: spendSummary,
      circuits,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(metrics),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
