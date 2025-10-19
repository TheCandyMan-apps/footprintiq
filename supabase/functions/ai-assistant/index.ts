import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, userId } = await req.json();

    if (!prompt || !userId) {
      throw new Error("Missing required fields: prompt and userId");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's recent scans for context
    const { data: scans } = await supabase
      .from("scans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch data sources from most recent scan
    let dataSources = [];
    if (scans && scans.length > 0) {
      const { data: sources } = await supabase
        .from("data_sources")
        .select("*")
        .eq("scan_id", scans[0].id);
      dataSources = sources || [];
    }

    // Build context for AI
    const contextData = {
      recentScans: scans?.length || 0,
      latestScan: scans?.[0] ? {
        privacyScore: scans[0].privacy_score,
        totalSources: scans[0].total_sources_found,
        highRisk: scans[0].high_risk_count,
        mediumRisk: scans[0].medium_risk_count,
        lowRisk: scans[0].low_risk_count,
      } : null,
      dataSources: dataSources.slice(0, 10).map(ds => ({
        name: ds.name,
        category: ds.category,
        riskLevel: ds.risk_level,
      })),
    };

    // Call Lovable AI with context
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a digital privacy and security analyst for FootprintIQ. 
You provide executive-level insights, trend analysis, and strategic recommendations based on digital footprint data.
Be concise, actionable, and focus on business impact.`;

    const userPrompt = `${prompt}

**User's Context:**
- Recent Scans: ${contextData.recentScans}
${contextData.latestScan ? `
- Latest Privacy Score: ${contextData.latestScan.privacyScore}/100
- Total Exposures: ${contextData.latestScan.totalSources}
- Risk Breakdown: ${contextData.latestScan.highRisk} high, ${contextData.latestScan.mediumRisk} medium, ${contextData.latestScan.lowRisk} low
` : ''}
${contextData.dataSources.length > 0 ? `
- Sample Data Sources: ${contextData.dataSources.map(ds => `${ds.name} (${ds.category}, ${ds.riskLevel} risk)`).join(', ')}
` : ''}

Provide a detailed, executive-level response with actionable insights.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Lovable AI error:", errorText);
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content || "No analysis generated";

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        contextUsed: contextData,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("AI Assistant error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
