import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const INDEXNOW_KEY = "fpiq-indexnow-2024-a1b2c3d4e5f6";
const HOST = "footprintiq.app";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: "urls array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit to 10,000 URLs per request (IndexNow limit)
    const urlList = urls.slice(0, 10000).map(url => 
      url.startsWith("http") ? url : `https://${HOST}${url}`
    );

    // IndexNow API endpoint
    const indexNowPayload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    };

    console.log(`Submitting ${urlList.length} URLs to IndexNow`);

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(indexNowPayload),
    });

    // IndexNow returns 200 for success, 202 for accepted
    if (response.ok || response.status === 202) {
      console.log(`IndexNow submission successful: ${urlList.length} URLs`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          submitted: urlList.length,
          message: "URLs submitted to IndexNow successfully" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const errorText = await response.text();
    console.error(`IndexNow submission failed: ${response.status} - ${errorText}`);
    
    return new Response(
      JSON.stringify({ error: "IndexNow submission failed", details: errorText }),
      { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("IndexNow error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
