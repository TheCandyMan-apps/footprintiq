import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad, allowedOrigin } from '../_shared/secure.ts';
import { checkCredits, deductCredits } from '../_shared/credits.ts';

const EXPORT_COST = 10;

// HTML escaping function to prevent XSS
function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// URL sanitization to prevent javascript: and other malicious protocols
function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return escapeHtml(url);
    }
  } catch {
    // Invalid URL
  }
  return '#';
}

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

    // Fetch social profiles for this scan (this is where the actual results are stored)
    const { data: socialProfiles, error: profilesError } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('scan_id', scanId)
      .order('platform', { ascending: true });

    if (profilesError) {
      console.error('[export-enriched] Social profiles error:', profilesError);
    }

    // Fetch from findings table as well (for enrichments)
    const { data: findings, error: findingsError } = await supabase
      .from('findings')
      .select('*')
      .eq('scan_id', scanId)
      .order('severity', { ascending: false });

    if (findingsError) {
      console.error('[export-enriched] Findings error:', findingsError);
    }

    // Fetch enrichments for all findings
    const findingIds = findings?.map(f => f.id) || [];
    const { data: enrichments } = await supabase
      .from('finding_enrichments')
      .select('*')
      .in('finding_id', findingIds.length > 0 ? findingIds : ['none']);

    // Fetch user's branding settings
    const { data: branding } = await supabase
      .from('pdf_branding_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Generate HTML report with social profiles as primary data
    const htmlContent = generateHTMLReport(scan, socialProfiles || [], findings || [], enrichments || [], branding);

    // Deduct credits
    const deductResult = await deductCredits(
      workspaceId,
      EXPORT_COST,
      'export',
      { scan_id: scanId, export_type: 'enriched_report' }
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
      profile_count: socialProfiles?.length || 0,
      finding_count: findings?.length || 0,
      enrichment_count: enrichments?.length || 0
    });

  } catch (error) {
    console.error('[export-enriched] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'unknown_error');
  }
});

function generateHTMLReport(
  scan: any, 
  socialProfiles: any[], 
  findings: any[], 
  enrichments: any[],
  branding: any
): string {
  const enrichmentMap = new Map(enrichments.map(e => [e.finding_id, e]));
  
  // Use branding colors or defaults
  const primaryColor = branding?.primary_color || '#3b82f6';
  const secondaryColor = branding?.secondary_color || '#6366f1';
  const companyName = branding?.company_name || 'FootprintIQ';
  const tagline = branding?.tagline || 'OSINT Intelligence Platform';
  const footerText = branding?.footer_text || 'This report was generated automatically and should be used as part of a comprehensive analysis.';
  const contactEmail = branding?.contact_email || '';
  const websiteUrl = branding?.website_url || '';
  
  const riskColors = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#ca8a04',
    low: '#2563eb',
    info: '#64748b'
  };

  // Group social profiles by risk level
  const profilesByRisk = {
    high: socialProfiles.filter(p => p.confidence_score >= 80),
    medium: socialProfiles.filter(p => p.confidence_score >= 50 && p.confidence_score < 80),
    low: socialProfiles.filter(p => p.confidence_score < 50)
  };

  const profilesHTML = socialProfiles.map(profile => {
    const confidence = profile.confidence_score || 0;
    const riskLevel = confidence >= 80 ? 'high' : confidence >= 50 ? 'medium' : 'low';
    const color = riskColors[riskLevel as keyof typeof riskColors] || '#64748b';

    return `
      <div style="margin-bottom: 16px; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid ${color};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h4 style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">
            ${escapeHtml(profile.platform) || 'Unknown Platform'}
          </h4>
          <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
            ${confidence}% confidence
          </span>
        </div>
        <div style="color: #4b5563; font-size: 14px; margin-bottom: 8px;">
          <strong>Username:</strong> @${escapeHtml(profile.username) || 'N/A'}
        </div>
        ${profile.profile_url ? `
          <div style="color: #3b82f6; font-size: 13px; word-break: break-all;">
            <a href="${sanitizeUrl(profile.profile_url)}" style="color: ${primaryColor};">${escapeHtml(profile.profile_url)}</a>
          </div>
        ` : ''}
        ${profile.bio ? `
          <div style="margin-top: 8px; color: #6b7280; font-size: 13px; font-style: italic;">
            "${escapeHtml(profile.bio)}"
          </div>
        ` : ''}
        ${profile.full_name ? `
          <div style="margin-top: 4px; color: #374151; font-size: 13px;">
            <strong>Name:</strong> ${escapeHtml(profile.full_name)}
          </div>
        ` : ''}
        <div style="margin-top: 8px; color: #9ca3af; font-size: 12px;">
          Source: ${escapeHtml(profile.source) || 'OSINT'} | First seen: ${new Date(profile.first_seen).toLocaleDateString()}
        </div>
      </div>
    `;
  }).join('');

  const findingsHTML = findings.map(finding => {
    const enrichment = enrichmentMap.get(finding.id);
    const color = riskColors[finding.severity as keyof typeof riskColors] || '#64748b';

    return `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <div style="border-left: 4px solid ${color}; padding: 16px; background: #f9fafb; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <h4 style="margin: 0; color: #111827; font-size: 16px;">
              ${escapeHtml(finding.kind || finding.provider_category) || 'Finding'}
            </h4>
            <span style="background: ${color}; color: white; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">
              ${escapeHtml((finding.severity || 'info').toUpperCase())}
            </span>
          </div>
          
          <div style="color: #6b7280; font-size: 13px; margin-bottom: 12px;">
            <strong>Provider:</strong> ${escapeHtml(finding.provider) || 'Unknown'} | 
            <strong>Confidence:</strong> ${Math.round((finding.confidence || 0) * 100)}%
          </div>

          ${finding.evidence && typeof finding.evidence === 'object' ? `
            <div style="margin-top: 12px;">
              <h5 style="color: #374151; font-size: 13px; margin-bottom: 6px;">Evidence:</h5>
              <div style="background: white; padding: 10px; border-radius: 6px; font-size: 12px;">
                ${Object.entries(finding.evidence).map(([key, value]) => 
                  `<div style="margin-bottom: 4px;"><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}</div>`
                ).join('')}
              </div>
            </div>
          ` : ''}

          ${enrichment ? `
            <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #e5e7eb;">
              <h5 style="color: #059669; font-size: 14px; margin-bottom: 10px;">🤖 AI Enrichment</h5>
              
              ${enrichment.context ? `
                <div style="margin-bottom: 12px;">
                  <h6 style="color: #374151; font-size: 13px; margin-bottom: 4px;">Context:</h6>
                  <p style="color: #4b5563; font-size: 12px; line-height: 1.5;">${escapeHtml(enrichment.context)}</p>
                </div>
              ` : ''}

              ${enrichment.attack_vectors && enrichment.attack_vectors.length > 0 ? `
                <div style="margin-bottom: 12px;">
                  <h6 style="color: #374151; font-size: 13px; margin-bottom: 4px;">⚠️ Attack Vectors:</h6>
                  <ul style="margin: 0; padding-left: 18px; color: #4b5563; font-size: 12px;">
                    ${enrichment.attack_vectors.map((v: string) => `<li style="margin-bottom: 2px;">${escapeHtml(v)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${enrichment.remediation_steps && enrichment.remediation_steps.length > 0 ? `
                <div>
                  <h6 style="color: #374151; font-size: 13px; margin-bottom: 4px;">✅ Remediation Steps:</h6>
                  <ol style="margin: 0; padding-left: 18px; color: #4b5563; font-size: 12px;">
                    ${enrichment.remediation_steps.map((s: string) => `<li style="margin-bottom: 2px;">${escapeHtml(s)}</li>`).join('')}
                  </ol>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  const scanTarget = escapeHtml(scan.email || scan.phone || scan.username || scan.first_name) || 'N/A';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>OSINT Report - ${escapeHtml(scan.id)}</title>
      <style>
        @page { margin: 1cm; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.5;
          color: #1f2937;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        h1, h2, h3, h4, h5, h6 { margin-top: 0; }
      </style>
    </head>
    <body>
      <!-- Header with Branding -->
      <div style="text-align: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid ${primaryColor};">
        <h1 style="color: ${primaryColor}; margin-bottom: 8px; font-size: 28px;">${escapeHtml(companyName)}</h1>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">${escapeHtml(tagline)}</p>
        <h2 style="color: #1f2937; margin-top: 16px; margin-bottom: 8px; font-size: 22px;">OSINT Intelligence Report</h2>
        <p style="color: #9ca3af; font-size: 12px;">
          Generated: ${new Date().toLocaleString()} | 
          Scan ID: ${escapeHtml(scan.id.slice(0, 8))}...
        </p>
      </div>

      <!-- Scan Summary -->
      <div style="margin-bottom: 28px; padding: 20px; background: linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10); border-radius: 8px; border: 1px solid ${primaryColor}30;">
        <h2 style="color: ${primaryColor}; margin-bottom: 16px; font-size: 18px;">📋 Scan Summary</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <strong style="color: #374151;">Target:</strong> 
            <span style="color: #1f2937;">${scanTarget}</span>
          </div>
          <div>
            <strong style="color: #374151;">Status:</strong> 
            <span style="color: #059669; font-weight: 600;">${(scan.status || 'completed').toUpperCase()}</span>
          </div>
          <div>
            <strong style="color: #374151;">Profiles Found:</strong> 
            <span style="color: #1f2937; font-weight: 600;">${socialProfiles.length}</span>
          </div>
          <div>
            <strong style="color: #374151;">Privacy Score:</strong> 
            <span style="color: ${scan.privacy_score >= 70 ? '#059669' : scan.privacy_score >= 40 ? '#ca8a04' : '#dc2626'}; font-weight: 600;">
              ${scan.privacy_score || 0}/100
            </span>
          </div>
          ${scan.high_risk_count > 0 ? `
            <div>
              <strong style="color: #374151;">High Risk Items:</strong> 
              <span style="color: #dc2626; font-weight: 600;">${scan.high_risk_count}</span>
            </div>
          ` : ''}
          ${scan.medium_risk_count > 0 ? `
            <div>
              <strong style="color: #374151;">Medium Risk Items:</strong> 
              <span style="color: #ca8a04; font-weight: 600;">${scan.medium_risk_count}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Risk Summary -->
      ${socialProfiles.length > 0 ? `
        <div style="margin-bottom: 28px; padding: 16px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
          <h3 style="color: #991b1b; margin-bottom: 12px; font-size: 16px;">⚠️ Exposure Summary</h3>
          <div style="display: flex; gap: 24px; flex-wrap: wrap;">
            <div>
              <span style="font-size: 24px; font-weight: 700; color: #dc2626;">${profilesByRisk.high.length}</span>
              <span style="color: #6b7280; font-size: 13px;"> high confidence</span>
            </div>
            <div>
              <span style="font-size: 24px; font-weight: 700; color: #ca8a04;">${profilesByRisk.medium.length}</span>
              <span style="color: #6b7280; font-size: 13px;"> medium confidence</span>
            </div>
            <div>
              <span style="font-size: 24px; font-weight: 700; color: #2563eb;">${profilesByRisk.low.length}</span>
              <span style="color: #6b7280; font-size: 13px;"> low confidence</span>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Social Media Profiles Found -->
      ${socialProfiles.length > 0 ? `
        <h2 style="color: #1f2937; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; font-size: 18px;">
          🌐 Social Media Profiles (${socialProfiles.length})
        </h2>
        ${profilesHTML}
      ` : `
        <div style="padding: 24px; background: #f9fafb; border-radius: 8px; text-align: center; color: #6b7280;">
          <p>No social media profiles found for this scan.</p>
        </div>
      `}

      <!-- Additional Findings -->
      ${findings.length > 0 ? `
        <h2 style="color: #1f2937; margin-top: 32px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; font-size: 18px;">
          🔍 Additional Findings & Enrichments (${findings.length})
        </h2>
        ${findingsHTML}
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 11px;">
        <p style="margin-bottom: 8px;">${escapeHtml(footerText)}</p>
        ${contactEmail || websiteUrl ? `
          <p style="margin-bottom: 4px;">
            ${contactEmail ? `Contact: ${escapeHtml(contactEmail)}` : ''}
            ${contactEmail && websiteUrl ? ' | ' : ''}
            ${websiteUrl ? `<a href="${sanitizeUrl(websiteUrl)}" style="color: ${primaryColor};">${escapeHtml(websiteUrl)}</a>` : ''}
          </p>
        ` : ''}
        <p style="color: #d1d5db;">Generated by ${escapeHtml(companyName)}</p>
      </div>
    </body>
    </html>
  `;
}
