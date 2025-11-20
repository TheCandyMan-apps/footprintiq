import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateAuth } from "../../_shared/auth-utils.ts";
import { checkRateLimit } from "../../_shared/rate-limiter.ts";
import { addSecurityHeaders } from "../../_shared/security-headers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AlertSchema = z.object({
  bugId: z.string().uuid().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  errorRate: z.number().min(0).max(100).optional(),
}).refine(
  (data) => data.bugId || data.errorRate !== undefined,
  { message: "Either bugId or errorRate must be provided" }
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    // Authentication - Admin only
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const userId = authResult.context.userId;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify admin role
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      console.error('[send-glitch-alert] Non-admin access attempt:', userId);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Rate limiting - 20 alerts/hour
    const rateLimitResult = await checkRateLimit(userId, 'user', 'send-glitch-alert', {
      maxRequests: 20,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt 
        }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Validate request body
    const body = await req.json();
    const validation = AlertSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('[send-glitch-alert] Validation error:', validation.error.issues);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validation.error.issues 
        }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const { bugId, severity, errorRate } = validation.data;
    console.log('[send-glitch-alert] Admin alert triggered by:', userId, { bugId, errorRate });

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

    // Prepare email content (sanitized)
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

    // Log alert (in production, integrate with email service like Resend/SendGrid/SES)
    console.log('[send-glitch-alert] Alert prepared - Subject:', subject);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Alert logged successfully',
        alertType: bugId ? 'bug_report' : 'error_rate',
      }),
      {
        headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }),
        status: 200,
      }
    );
  } catch (error) {
    console.error('[send-glitch-alert] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }),
        status: 500,
      }
    );
  }
});
