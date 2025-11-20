import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const PDFRequestSchema = z.object({
  scanId: z.string().uuid("Invalid scan ID format")
});

// Security helpers
async function validateAuth(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

async function checkRateLimit(supabase: any, userId: string, endpoint: string) {
  const { data: rateLimit } = await supabase.rpc('check_rate_limit', {
    p_identifier: userId,
    p_identifier_type: 'user',
    p_endpoint: endpoint,
    p_max_requests: 20,
    p_window_seconds: 3600
  });

  if (!rateLimit?.allowed) {
    const error = new Error('Rate limit exceeded');
    (error as any).status = 429;
    (error as any).resetAt = rateLimit?.reset_at;
    throw error;
  }
}

function addSecurityHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...corsHeaders,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    ...headers,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authentication
    const user = await validateAuth(req, supabaseClient);
    const userId = user.id;

    // Rate limiting - 20 PDFs per hour
    await checkRateLimit(supabaseClient, userId, 'generate-pdf-report');

    // Validate request body
    const body = await req.json();
    const { scanId } = PDFRequestSchema.parse(body);

    console.log('[generate-pdf-report] Generating PDF for scan:', { scanId, userId });

    // Fetch scan data with ownership check
    const { data: scan, error } = await supabaseClient
      .from("scans")
      .select("*, data_sources(*), social_profiles(*)")
      .eq("id", scanId)
      .eq("user_id", userId)
      .single();

    if (error || !scan) {
      console.error('[generate-pdf-report] Scan not found:', error);
      throw new Error("Scan not found or access denied");
    }

    // Generate HTML report
    const html = generateHTMLReport(scan);

    const duration = Date.now() - startTime;
    console.log('[generate-pdf-report] PDF HTML generated in', duration, 'ms');

    // Note: For production, integrate with a PDF generation service
    // For now, return HTML that can be converted client-side
    return new Response(JSON.stringify({ html, scan, duration }), {
      headers: addSecurityHeaders({ "Content-Type": "application/json" }),
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error("[generate-pdf-report] Error:", {
      message: error.message,
      duration,
      timestamp: new Date().toISOString()
    });

    const status = error.status || 500;
    const message = error.message || 'PDF generation failed';

    return new Response(
      JSON.stringify({ 
        error: message,
        ...(error.resetAt && { retryAfter: error.resetAt })
      }),
      {
        status,
        headers: addSecurityHeaders({ "Content-Type": "application/json" }),
      }
    );
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
