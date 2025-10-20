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
    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user) throw new Error("Unauthorized");

    const { scanId } = await req.json();

    // Fetch scan data
    const { data: scan, error } = await supabaseClient
      .from("scans")
      .select("*, data_sources(*), social_profiles(*)")
      .eq("id", scanId)
      .eq("user_id", user.id)
      .single();

    if (error || !scan) {
      throw new Error("Scan not found");
    }

    // Generate HTML report
    const html = generateHTMLReport(scan);

    // Note: For production, integrate with a PDF generation service
    // For now, return HTML that can be converted client-side
    return new Response(JSON.stringify({ html, scan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateHTMLReport(scan: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>FootprintIQ Report - ${scan.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; }
        .score { font-size: 48px; font-weight: bold; }
        .section { margin: 30px 0; }
        .finding { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .risk-high { border-left: 4px solid #ef4444; }
        .risk-medium { border-left: 4px solid #f59e0b; }
        .risk-low { border-left: 4px solid #10b981; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FootprintIQ Privacy Report</h1>
        <div class="score">Privacy Score: ${scan.privacy_score || "N/A"}</div>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="section">
        <h2>Summary</h2>
        <p>Total Sources Found: ${scan.total_sources_found}</p>
        <p>High Risk: ${scan.high_risk_count} | Medium Risk: ${scan.medium_risk_count} | Low Risk: ${scan.low_risk_count}</p>
      </div>
      
      <div class="section">
        <h2>Data Sources</h2>
        ${scan.data_sources?.map((source: any) => `
          <div class="finding risk-${source.risk_level}">
            <h3>${source.name}</h3>
            <p><strong>Category:</strong> ${source.category}</p>
            <p><strong>Risk Level:</strong> ${source.risk_level}</p>
            <p><strong>Data Found:</strong> ${source.data_found?.join(", ")}</p>
          </div>
        `).join("") || "No data sources found"}
      </div>
      
      <div class="section">
        <h2>Social Profiles</h2>
        ${scan.social_profiles?.map((profile: any) => `
          <div class="finding">
            <h3>${profile.platform}</h3>
            <p><strong>Username:</strong> ${profile.username}</p>
            <p><strong>Profile URL:</strong> <a href="${profile.profile_url}">${profile.profile_url}</a></p>
          </div>
        `).join("") || "No social profiles found"}
      </div>
    </body>
    </html>
  `;
}
