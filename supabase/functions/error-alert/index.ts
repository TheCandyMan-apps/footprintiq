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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@footprintiq.app";

  if (!resendKey) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Check for new critical errors in the last 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: errors, error: fetchError } = await supabase
      .from("system_errors")
      .select("*")
      .gte("created_at", tenMinAgo)
      .in("severity", ["error", "critical"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (fetchError) {
      console.error("[error-alert] Fetch error:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!errors || errors.length === 0) {
      return new Response(JSON.stringify({ status: "ok", message: "No recent errors" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Also check for signup-related auth failures
    const { data: authFailures } = await supabase
      .from("activity_logs")
      .select("*")
      .gte("created_at", tenMinAgo)
      .eq("action", "signup_error")
      .limit(10);

    // Build error summary
    const errorSummary = errors.map((e: any) => 
      `<tr>
        <td style="padding:6px;border:1px solid #333">${e.severity}</td>
        <td style="padding:6px;border:1px solid #333">${e.function_name || "unknown"}</td>
        <td style="padding:6px;border:1px solid #333">${e.error_code}</td>
        <td style="padding:6px;border:1px solid #333">${e.error_message?.substring(0, 120)}</td>
        <td style="padding:6px;border:1px solid #333">${new Date(e.created_at).toLocaleString()}</td>
      </tr>`
    ).join("");

    const criticalCount = errors.filter((e: any) => e.severity === "critical").length;
    const errorCount = errors.filter((e: any) => e.severity === "error").length;
    const subject = criticalCount > 0
      ? `🔴 ${criticalCount} Critical Error(s) Detected`
      : `⚠️ ${errorCount} Error(s) in Last 10 Minutes`;

    const emailHtml = `
      <div style="font-family:sans-serif;max-width:700px;margin:0 auto;background:#111;color:#eee;padding:24px;border-radius:12px">
        <h2 style="color:#ff4444">${subject}</h2>
        <p>Detected <strong>${errors.length}</strong> error(s) in the last 10 minutes.</p>
        ${authFailures && authFailures.length > 0 
          ? `<p style="color:#ffaa00">⚠️ ${authFailures.length} auth/signup failure(s) also detected.</p>` 
          : ""}
        
        <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px">
          <thead>
            <tr style="background:#222">
              <th style="padding:8px;border:1px solid #333;text-align:left">Severity</th>
              <th style="padding:8px;border:1px solid #333;text-align:left">Function</th>
              <th style="padding:8px;border:1px solid #333;text-align:left">Code</th>
              <th style="padding:8px;border:1px solid #333;text-align:left">Message</th>
              <th style="padding:8px;border:1px solid #333;text-align:left">Time</th>
            </tr>
          </thead>
          <tbody>${errorSummary}</tbody>
        </table>
        
        <p style="margin-top:20px;color:#888;font-size:12px">
          FootprintIQ System Monitor • ${new Date().toISOString()}
        </p>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FootprintIQ Alerts <onboarding@resend.dev>",
        to: [adminEmail],
        subject,
        html: emailHtml,
      }),
    });

    const emailResult = await emailRes.json();

    return new Response(
      JSON.stringify({
        status: "alert_sent",
        error_count: errors.length,
        critical_count: criticalCount,
        email_result: emailResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[error-alert] Exception:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
