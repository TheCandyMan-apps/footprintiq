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

    // Fetch scan data with findings
    const { data: scan, error } = await supabaseClient
      .from("scans")
      .select(`
        id,
        user_id,
        username,
        email,
        phone,
        scan_type,
        status,
        created_at,
        privacy_score,
        findings(
          id,
          provider,
          kind,
          title,
          confidence,
          evidence
        )
      `)
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
  const findings = scan.findings || [];
  const target = scan.username || scan.email || scan.phone || 'Unknown';
  
  // Group findings by provider
  const groupedFindings = findings.reduce((acc: any, f: any) => {
    if (!acc[f.provider]) acc[f.provider] = [];
    acc[f.provider].push(f);
    return acc;
  }, {});
  
  // Calculate risk metrics
  const highRisk = findings.filter((f: any) => f.confidence && f.confidence < 0.3).length;
  const mediumRisk = findings.filter((f: any) => f.confidence && f.confidence >= 0.3 && f.confidence < 0.7).length;
  const lowRisk = findings.filter((f: any) => f.confidence && f.confidence >= 0.7).length;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>FootprintIQ Report - ${target}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .score { font-size: 48px; font-weight: bold; margin: 20px 0; }
        .section { margin: 30px 0; page-break-inside: avoid; }
        .section h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .finding { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .finding h3 { margin: 0 0 10px 0; color: #333; }
        .evidence { font-size: 14px; color: #666; margin: 5px 0; }
        .provider-section { margin: 20px 0; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { text-align: center; padding: 15px; background: white; border-radius: 8px; }
        .stat-number { font-size: 36px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔍 FootprintIQ Privacy Report</h1>
        <div class="score">Privacy Score: ${scan.privacy_score || "N/A"}</div>
        <p><strong>Target:</strong> ${target}</p>
        <p><strong>Scan Type:</strong> ${scan.scan_type || 'Unknown'}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      </div>
      
      <div class="section">
        <h2>📊 Summary</h2>
        <div class="stats">
          <div class="stat-box">
            <div class="stat-number">${findings.length}</div>
            <div>Total Findings</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${highRisk}</div>
            <div>High Risk</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${mediumRisk}</div>
            <div>Medium Risk</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${lowRisk}</div>
            <div>Low Risk</div>
          </div>
        </div>
      </div>
      
      ${Object.entries(groupedFindings).map(([provider, providerFindings]: [string, any]) => {
        const providerHtml = providerFindings.slice(0, 20).map((finding: any) => {
          const evidence = Array.isArray(finding.evidence) ? finding.evidence : [];
          
          // Extract site/platform name from evidence
          const siteEvidence = evidence.find((e: any) => e.key === 'site');
          const platformEvidence = evidence.find((e: any) => e.key === 'platform');
          const usernameEvidence = evidence.find((e: any) => e.key === 'username');
          const urlEvidence = evidence.find((e: any) => e.key === 'url');
          const breachEvidence = evidence.find((e: any) => e.key === 'breach');
          
          // Build a meaningful title - prioritize site/platform/breach over generic title
          const siteName = siteEvidence?.value || platformEvidence?.value || breachEvidence?.value;
          const displayTitle = siteName || finding.title || finding.kind || 'Finding';
          
          // Build subtitle info
          const subtitle = usernameEvidence ? '@' + usernameEvidence.value : '';
          
          let findingHtml = '<div class="finding">';
          findingHtml += '<h3>' + displayTitle + (subtitle ? ' (' + subtitle + ')' : '') + '</h3>';
          findingHtml += '<div class="evidence">';
          if (finding.confidence) {
            findingHtml += '<p><strong>Confidence:</strong> ' + Math.round(finding.confidence * 100) + '%</p>';
          }
          if (urlEvidence) {
            findingHtml += '<p><strong>URL:</strong> <a href="' + urlEvidence.value + '">' + urlEvidence.value + '</a></p>';
          }
          findingHtml += '<p><strong>Type:</strong> ' + finding.kind + '</p>';
          findingHtml += '</div></div>';
          
          return findingHtml;
        }).join('');
        
        let sectionHtml = '<div class="section provider-section">';
        sectionHtml += '<h2>🔎 ' + provider.charAt(0).toUpperCase() + provider.slice(1) + ' Results</h2>';
        sectionHtml += '<p><strong>' + providerFindings.length + '</strong> findings from this provider</p>';
        sectionHtml += providerHtml;
        if (providerFindings.length > 20) {
          sectionHtml += '<p><em>...and ' + (providerFindings.length - 20) + ' more findings</em></p>';
        }
        sectionHtml += '</div>';
        
        return sectionHtml;
      }).join('')}
      
      ${findings.length === 0 ? '<div class="section"><p>No findings available for this scan.</p></div>' : ''}
      
      <div class="section">
        <h2>ℹ️ About This Report</h2>
        <p>This report was generated by FootprintIQ, an OSINT and digital footprint investigation platform.</p>
        <p><strong>Report ID:</strong> ${scan.id}</p>
        <p><strong>Scan Status:</strong> ${scan.status}</p>
      </div>
    </body>
    </html>
  `;
}
