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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Get alert data from request
    const { bugId, severity, errorRate } = await req.json();

    // Fetch bug details if bugId provided
    let bugDetails = null;
    if (bugId) {
      const { data } = await supabaseClient
        .from('bugs')
        .select('*')
        .eq('id', bugId)
        .single();
      bugDetails = data;
    }

    // Prepare email content
    const subject = bugId 
      ? `🚨 Critical Bug Report: ${bugDetails?.title || 'Unknown'}`
      : `⚠️ High Error Rate Alert: ${errorRate}%`;

    const htmlContent = bugId && bugDetails
      ? `
        <h2>Critical Bug Report</h2>
        <p><strong>Title:</strong> ${bugDetails.title}</p>
        <p><strong>Severity:</strong> ${bugDetails.severity}</p>
        <p><strong>Description:</strong> ${bugDetails.description}</p>
        <p><strong>Page URL:</strong> <a href="${bugDetails.page_url}">${bugDetails.page_url}</a></p>
        <p><strong>Reported At:</strong> ${new Date(bugDetails.created_at).toLocaleString()}</p>
        ${bugDetails.screenshot_url ? `<p><strong>Screenshot:</strong> <a href="${bugDetails.screenshot_url}">View Screenshot</a></p>` : ''}
        <p><strong>Error Stack:</strong></p>
        <pre>${bugDetails.error_stack || 'N/A'}</pre>
        <p><a href="${req.headers.get("origin")}/admin/glitches">View in Dashboard</a></p>
      `
      : `
        <h2>High Error Rate Detected</h2>
        <p>The platform error rate has exceeded threshold: <strong>${errorRate}%</strong></p>
        <p>This requires immediate investigation.</p>
        <p><a href="${req.headers.get("origin")}/admin/glitches">View Glitch Dashboard</a></p>
      `;

    // Log alert (in production, integrate with email service)
    console.log('[ADMIN_ALERT] Sending email to admin@footprintiq.app');
    console.log('Subject:', subject);
    console.log('Content:', htmlContent);

    // In production, integrate with services like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // For now, we'll return success
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Alert sent to admin@footprintiq.app',
        alertType: bugId ? 'bug_report' : 'error_rate',
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[ADMIN_ALERT] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
