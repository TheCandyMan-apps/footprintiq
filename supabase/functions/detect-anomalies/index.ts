import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "AI analysis is not configured. Please add LOVABLE_API_KEY in your backend secrets." 
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { scanId } = await req.json();

    if (!scanId) {
      return new Response(
        JSON.stringify({ error: "scanId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.split("Bearer ")[1]);
      userId = user?.id || null;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch scan data
    const { data: scan } = await supabase
      .from("scans")
      .select("*, findings:findings(*)")
      .eq("id", scanId)
      .eq("user_id", userId)
      .single();

    if (!scan) {
      return new Response(
        JSON.stringify({ error: "Scan not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build analysis context
    const context = {
      findingCount: scan.findings?.length || 0,
      riskScore: scan.risk_score,
      providers: scan.providers_queried || [],
      dataTypes: scan.findings?.map((f: any) => f.data_type).filter(Boolean) || [],
    };

    const systemPrompt = `You are an OSINT anomaly detection system. Analyze scan patterns and detect unusual behaviors or anomalies.

Return a JSON array of detected anomalies. Each anomaly must have:
- anomaly_type: "data_spike" | "unusual_provider" | "suspicious_pattern" | "behavioral_anomaly"
- severity: "low" | "medium" | "high" | "critical"
- description: Clear explanation of the anomaly
- metadata: Additional context

Output format (raw JSON array only):
[
  {
    "anomaly_type": "data_spike",
    "severity": "high",
    "description": "Unusual spike in social media accounts detected",
    "metadata": {"count": 25, "expected": 5}
  }
]`;

    const userPrompt = `Analyze this scan for anomalies:
Findings: ${context.findingCount}
Risk Score: ${context.riskScore}
Providers: ${context.providers.join(", ")}
Data Types: ${context.dataTypes.join(", ")}`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || "[]";

    // Parse AI response
    let anomalies = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        anomalies = JSON.parse(jsonMatch[0]);
      } else {
        anomalies = JSON.parse(content);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      anomalies = [];
    }

    // Store anomalies in database
    for (const anomaly of anomalies) {
      await supabase.from("anomalies").insert({
        user_id: userId,
        scan_id: scanId,
        anomaly_type: anomaly.anomaly_type,
        severity: anomaly.severity,
        description: anomaly.description,
        metadata: anomaly.metadata || {},
      });
    }

    return new Response(
      JSON.stringify({ anomalies }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Detect anomalies error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
