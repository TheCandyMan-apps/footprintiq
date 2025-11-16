import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { scanId } = await req.json();

    if (!scanId) {
      throw new Error("scanId is required");
    }

    console.log(`Generating comprehensive report for scan: ${scanId}`);

    // Fetch scan details
    const { data: scan, error: scanError } = await supabaseClient
      .from("scans")
      .select("*")
      .eq("id", scanId)
      .single();

    if (scanError || !scan) {
      throw new Error("Scan not found");
    }

    // Fetch findings with AI annotations
    const { data: findings, error: findingsError } = await supabaseClient
      .from("findings")
      .select("*")
      .eq("scan_id", scanId)
      .order("severity", { ascending: true });

    if (findingsError) {
      console.error("Error fetching findings:", findingsError);
    }

    // Fetch provider events for timeline
    const { data: providerEvents, error: eventsError } = await supabaseClient
      .from("scan_provider_events")
      .select("*")
      .eq("scan_id", scanId)
      .order("created_at", { ascending: true });

    if (eventsError) {
      console.error("Error fetching provider events:", eventsError);
    }

    // Fetch activity logs around scan time
    const scanTime = new Date(scan.created_at);
    const startTime = new Date(scanTime.getTime() - 5 * 60 * 1000); // 5 minutes before
    const endTime = new Date(scanTime.getTime() + 60 * 60 * 1000); // 1 hour after

    const { data: activityLogs, error: logsError } = await supabaseClient
      .from("activity_logs")
      .select("*, profiles(email, full_name)")
      .eq("user_id", user.id)
      .gte("created_at", startTime.toISOString())
      .lte("created_at", endTime.toISOString())
      .order("created_at", { ascending: false })
      .limit(50);

    if (logsError) {
      console.error("Error fetching activity logs:", logsError);
    }

    // Fetch PDF branding settings
    const { data: workspaces } = await supabaseClient
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1)
      .single();

    let branding = null;
    if (workspaces) {
      const { data: brandingData } = await supabaseClient
        .from("pdf_branding_settings")
        .select("*")
        .eq("workspace_id", workspaces.id)
        .single();

      branding = brandingData;
    }

    // Check if AI analysis exists
    const hasAIAnalysis = findings?.some((f: any) => f.meta?.ai);

    // If no AI analysis, trigger it (non-blocking)
    if (!hasAIAnalysis && findings && findings.length > 0) {
      console.log("Triggering AI analysis for scan");
      supabaseClient.functions.invoke("ai-scan-analysis", {
        body: { scanId },
      }).catch(err => console.error("AI analysis error:", err));
    }

    // Calculate summary statistics
    const stats = {
      totalFindings: findings?.length || 0,
      critical: findings?.filter((f: any) => f.severity === "critical").length || 0,
      high: findings?.filter((f: any) => f.severity === "high").length || 0,
      medium: findings?.filter((f: any) => f.severity === "medium").length || 0,
      low: findings?.filter((f: any) => f.severity === "low").length || 0,
      info: findings?.filter((f: any) => f.severity === "info").length || 0,
      providersExecuted: new Set(findings?.map((f: any) => f.provider)).size || 0,
      falsePositiveRate: findings?.length
        ? ((findings.filter((f: any) => f.meta?.ai?.falsePositive).length / findings.length) * 100).toFixed(1)
        : "0.0",
    };

    // Generate AI summary
    const aiSummary = await generateAISummary(supabaseClient, scan, stats, findings || []);

    // Structure response
    const reportData = {
      scan,
      findings: findings || [],
      providerEvents: providerEvents || [],
      activityLogs: activityLogs || [],
      branding,
      stats,
      aiSummary,
      generatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(reportData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error generating report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function generateAISummary(
  supabase: any,
  scan: any,
  stats: any,
  findings: any[]
): Promise<string> {
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return "AI summary unavailable - API key not configured.";
    }

    const topFindings = findings
      .filter(f => f.severity === "critical" || f.severity === "high")
      .slice(0, 5)
      .map(f => `- ${f.provider}: ${f.kind} (${f.severity})`)
      .join("\n");

    const prompt = `Generate a concise executive summary for this OSINT scan report:

Target: ${scan.username || scan.email || scan.phone || "Unknown"}
Scan Type: ${scan.scan_type}
Total Findings: ${stats.totalFindings}
Critical/High: ${stats.critical + stats.high}
Providers: ${stats.providersExecuted}

Top Findings:
${topFindings || "None"}

Provide a 3-4 sentence summary covering:
1. Overall risk assessment
2. Most significant discoveries
3. Key recommendations

Keep it professional and actionable.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an OSINT analyst generating executive summaries for intelligence reports. Be concise and professional.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status, await response.text());
      return "AI summary unavailable - API error.";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "AI summary generation failed.";
  } catch (error) {
    console.error("AI summary error:", error);
    return "AI summary unavailable.";
  }
}
