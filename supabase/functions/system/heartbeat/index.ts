import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const checks: any = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      checks: {},
    };

    // Check database connectivity
    try {
      const { error } = await supabaseClient.from("workspaces" as any).select("count").limit(1);
      checks.checks.database = error ? "unhealthy" : "healthy";
    } catch {
      checks.checks.database = "unhealthy";
    }

    // Check recent API activity
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabaseClient
        .from("audit_log" as any)
        .select("count")
        .gte("timestamp", oneDayAgo)
        .limit(1);
      
      checks.checks.recent_activity = !error && data ? "healthy" : "low";
    } catch {
      checks.checks.recent_activity = "unknown";
    }

    // Check for recent errors (last hour)
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data, error } = await supabaseClient
        .from("audit_log" as any)
        .select("count")
        .eq("action", "error")
        .gte("timestamp", oneHourAgo);

      const errorCount = data?.[0]?.count || 0;
      checks.checks.error_rate = errorCount > 100 ? "high" : "normal";
      checks.error_count_last_hour = errorCount;
    } catch {
      checks.checks.error_rate = "unknown";
    }

    // Set overall status
    const hasUnhealthy = Object.values(checks.checks).some(
      (status) => status === "unhealthy" || status === "high"
    );
    checks.status = hasUnhealthy ? "degraded" : "healthy";

    // If unhealthy, send email alert (requires RESEND_API_KEY)
    if (checks.status === "degraded" && Deno.env.get("RESEND_API_KEY")) {
      const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@footprintiq.app";
      
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "FootprintIQ Heartbeat <alerts@footprintiq.app>",
            to: [adminEmail],
            subject: "⚠️ System Health Alert",
            html: `
              <h2>System Health Check Failed</h2>
              <p>Timestamp: ${checks.timestamp}</p>
              <p>Status: ${checks.status}</p>
              <h3>Check Results:</h3>
              <pre>${JSON.stringify(checks.checks, null, 2)}</pre>
            `,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send alert email:", emailError);
      }
    }

    return new Response(JSON.stringify(checks), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Heartbeat error:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
