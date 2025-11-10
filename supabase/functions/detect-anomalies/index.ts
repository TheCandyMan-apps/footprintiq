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

    // Fetch scan data safely (avoid .single() when row may not exist)
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .select("id, user_id")
      .eq("id", scanId)
      .eq("user_id", userId)
      .maybeSingle();

    if (scanError) {
      console.error("Scan fetch error:", scanError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch scan data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!scan) {
      return new Response(
        JSON.stringify({ error: "Scan not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch actual findings data for detailed analysis
    const { data: findingsData, error: findingsError } = await supabase
      .from("findings")
      .select("id, provider, kind, severity, confidence, evidence")
      .eq("scan_id", scanId);

    if (findingsError) {
      console.error("Findings fetch error:", findingsError);
    }

    const findings = findingsData || [];
    const findingsCount = findings.length;

    // Build analysis context
    const context = {
      findingCount: findingsCount ?? 0,
      riskScore: Number((scan as any)?.risk_score ?? 0),
      providers: Array.isArray((scan as any)?.providers_queried) ? (scan as any).providers_queried : [],
      dataTypes: [], // kept minimal; can be expanded to fetch distinct data types if needed
    };

    // Implement premium consistency logic
    let baseAnomalies = [];
    
    if (findingsCount === 0) {
      // No findings detected - possible bypass
      baseAnomalies.push({
        anomaly_type: "possible_bypass",
        severity: "medium",
        description: "Possible bypass detected: No findings returned despite scan execution. This could indicate evasion techniques, privacy tools, or incomplete data sources.",
        metadata: {
          findingsCount: 0,
          expectedMinimum: 1,
          scanId: scanId
        }
      });
    } else {
      // Findings present - low anomaly risk
      baseAnomalies.push({
        anomaly_type: "normal_operation",
        severity: "low",
        description: `Scan completed normally with ${findingsCount} findings detected. No bypass indicators.`,
        metadata: {
          findingsCount: findingsCount,
          scanId: scanId
        }
      });
    }

    // Use Grok for detailed analysis of findings
    const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
    let grokAnomalies = [];
    
    if (GROK_API_KEY && findings.length > 0) {
      try {
        const grokPrompt = `Analyze these ${findings.length} security findings for anomalies:

${findings.map((f: any, i: number) => `
Finding ${i + 1}:
- Provider: ${f.provider}
- Type: ${f.kind}
- Severity: ${f.severity}
- Confidence: ${f.confidence}
- Evidence: ${JSON.stringify(f.evidence).substring(0, 200)}
`).join('\n')}

Detect unusual patterns, suspicious correlations, or behavioral anomalies. Return JSON array only:
[{"anomaly_type": "type", "severity": "level", "description": "explanation", "metadata": {}}]`;

        const grokResponse = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROK_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "grok-beta",
            messages: [
              { role: "system", content: "You are an expert OSINT anomaly detector. Return only valid JSON arrays." },
              { role: "user", content: grokPrompt }
            ],
            temperature: 0.3,
          }),
        });

        if (grokResponse.ok) {
          const grokData = await grokResponse.json();
          const grokContent = grokData.choices[0]?.message?.content || "[]";
          
          try {
            const jsonMatch = grokContent.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              grokAnomalies = JSON.parse(jsonMatch[0]);
            }
          } catch (e) {
            console.error("Failed to parse Grok response:", grokContent);
          }
        }
      } catch (error) {
        console.error("Grok analysis error:", error);
      }
    }

    // Combine base anomalies with Grok insights
    const anomalies = [...baseAnomalies, ...grokAnomalies];


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
