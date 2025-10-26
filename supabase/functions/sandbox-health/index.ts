import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Deno.memoryUsage().heapUsed,
    version: "1.0.0",
  };

  return new Response(JSON.stringify(health), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
