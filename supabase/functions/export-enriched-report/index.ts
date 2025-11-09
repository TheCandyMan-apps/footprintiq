import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad, allowedOrigin } from '../_shared/secure.ts';
import { checkCredits, deductCredits } from '../_shared/credits.ts';

const EXPORT_COST = 10;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');
  if (!allowedOrigin(req)) return bad(403, 'forbidden');

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return bad(401, 'unauthorized');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) return bad(401, 'unauthorized');

    const { scanId, workspaceId } = await req.json();
    if (!scanId || !workspaceId) return bad(400, 'missing_parameters');

    // Check credits
    const creditCheck = await checkCredits(workspaceId, EXPORT_COST);
    if (!creditCheck.success) {
      return new Response(JSON.stringify({
        error: creditCheck.error,
        balance: creditCheck.balance,
        required: creditCheck.required
      }), {
        status: 402,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }

    // Fetch scan details
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) return bad(404, 'scan_not_found');

    // Fetch findings for this scan
    const { data: findings, error: findingsError } = await supabase
      .from('findings')
      .select('*')
      .eq('scan_id', scanId)
      .order('severity', { ascending: false });

    if (findingsError) {
      console.error('[export-enriched] Findings error:', findingsError);
      return bad(500, 'failed_to_fetch_findings');
    }

    // Fetch enrichments for all findings
    const findingIds = findings?.map(f => f.id) || [];
    const { data: enrichments } = await supabase
      .from('finding_enrichments')
      .select('*')
      .in('finding_id', findingIds);

    // Generate HTML report
    const htmlContent = generateHTMLReport(scan, findings || [], enrichments || []);

    // Use Lovable AI to generate a PDF summary (we'll use HTML to PDF conversion)
    // For now, we'll return the HTML and let the client handle PDF generation
    // In production, you'd use a service like Puppeteer or similar

    // Deduct credits
    const deductResult = await deductCredits(
      workspaceId,
      EXPORT_COST,
      `Enriched report export for scan ${scanId}`
    );

    if (!deductResult.success) {
      return new Response(JSON.stringify({
        error: 'credit_deduction_failed',
        balance: deductResult.balance
      }), {
        status: 402,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }

    // Return HTML content for client-side PDF generation
    return ok({
      html: htmlContent,
      credits_spent: EXPORT_COST,
      new_balance: deductResult.balance,
      scan_id: scanId,
      finding_count: findings?.length || 0,
      enrichment_count: enrichments?.length || 0
    });

  } catch (error) {
    console.error('[export-enriched] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'unknown_error');
  }
});

function generateHTMLReport(scan: any, findings: any[], enrichments: any[]): string {
  const enrichmentMap = new Map(enrichments.map(e => [e.finding_id, e]));
  
  const severityColors = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#ca8a04',
    low: '#2563eb',
    info: '#64748b'
  };

  const findingsHTML = findings.map(finding => {
    const enrichment = enrichmentMap.get(finding.id);
    const color = severityColors[finding.severity as keyof typeof severityColors] || '#64748b';

    return `
      <div style="margin-bottom: 30px; page-break-inside: avoid;">
        <div style="border-left: 4px solid ${color}; padding: 20px; background: #f9fafb; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
            <h3 style="margin: 0; color: #111827; font-size: 18px;">
              ${finding.provider_category || 'Finding'}
            </h3>
            <span style="background: ${color}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
              ${(finding.severity || 'info').toUpperCase()}
            </span>
          </div>
          
          <div style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">
            <strong>Provider:</strong> ${finding.provider || 'Unknown'} | 
            <strong>Confidence:</strong> ${Math.round((finding.confidence || 0) * 100)}%
          </div>

          ${finding.evidence && Array.isArray(finding.evidence) && finding.evidence.length > 0 ? `
            <div style="margin-top: 15px;">
              <h4 style="color: #374151; font-size: 14px; margin-bottom: 8px;">Evidence:</h4>
              <div style="background: white; padding: 12px; border-radius: 6px; font-size: 13px;">
                ${finding.evidence.map((ev: any) => 
                  `<div style="margin-bottom: 6px;"><strong>${ev.key}:</strong> ${ev.value}</div>`
                ).join('')}
              </div>
            </div>
          ` : ''}

          ${enrichment ? `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
              <h4 style="color: #059669; font-size: 16px; margin-bottom: 12px;">🤖 AI Enrichment</h4>
              
              <div style="margin-bottom: 15px;">
                <h5 style="color: #374151; font-size: 14px; margin-bottom: 6px;">Context:</h5>
                <p style="color: #4b5563; font-size: 13px; line-height: 1.6;">${enrichment.context}</p>
              </div>

              ${enrichment.attack_vectors && enrichment.attack_vectors.length > 0 ? `
                <div style="margin-bottom: 15px;">
                  <h5 style="color: #374151; font-size: 14px; margin-bottom: 6px;">⚠️ Attack Vectors:</h5>
                  <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 13px;">
                    ${enrichment.attack_vectors.map((v: string) => `<li style="margin-bottom: 4px;">${v}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${enrichment.remediation_steps && enrichment.remediation_steps.length > 0 ? `
                <div style="margin-bottom: 15px;">
                  <h5 style="color: #374151; font-size: 14px; margin-bottom: 6px;">✅ Remediation Steps:</h5>
                  <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 13px;">
                    ${enrichment.remediation_steps.map((s: string) => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
                  </ol>
                </div>
              ` : ''}

              ${enrichment.links && enrichment.links.length > 0 ? `
                <div>
                  <h5 style="color: #374151; font-size: 14px; margin-bottom: 6px;">🔗 Resources:</h5>
                  <ul style="margin: 0; padding-left: 20px; color: #2563eb; font-size: 13px;">
                    ${enrichment.links.map((l: any) => 
                      `<li style="margin-bottom: 4px;"><a href="${l.url}" style="color: #2563eb;">${l.title}</a></li>`
                    ).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>OSINT Enriched Report - ${scan.id}</title>
      <style>
        @page { margin: 1cm; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.5;
          color: #1f2937;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3, h4, h5 { margin-top: 0; }
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #3b82f6;">
        <h1 style="color: #1f2937; margin-bottom: 10px;">OSINT Enriched Report</h1>
        <p style="color: #6b7280; font-size: 14px;">
          Generated: ${new Date().toLocaleString()} | 
          Scan ID: ${scan.id.slice(0, 8)}...
        </p>
      </div>

      <div style="margin-bottom: 30px; padding: 20px; background: #eff6ff; border-radius: 8px;">
        <h2 style="color: #1e40af; margin-bottom: 15px;">Scan Summary</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <strong style="color: #374151;">Status:</strong> 
            <span style="color: #059669;">${scan.status || 'Completed'}</span>
          </div>
          <div>
            <strong style="color: #374151;">Total Findings:</strong> 
            <span>${findings.length}</span>
          </div>
          <div>
            <strong style="color: #374151;">Target:</strong> 
            <span>${scan.email || scan.phone || scan.first_name || 'N/A'}</span>
          </div>
          <div>
            <strong style="color: #374151;">Enrichments:</strong> 
            <span>${enrichments.length}</span>
          </div>
        </div>
      </div>

      <h2 style="color: #1f2937; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
        Findings & Enrichments
      </h2>

      ${findingsHTML || '<p style="color: #6b7280;">No findings available.</p>'}

      <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>This report contains AI-generated enrichments and should be used as part of a comprehensive analysis.</p>
        <p>Generated by OSINT Intelligence Platform</p>
      </div>
    </body>
    </html>
  `;
}
