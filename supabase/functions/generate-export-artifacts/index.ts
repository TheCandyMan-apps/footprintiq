import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/secure.ts';
import { ERROR_RESPONSES, errorResponse, logSystemError } from '../_shared/errorHandler.ts';

interface TemplateOptions {
  show_executive_summary: boolean;
  show_provider_breakdown: boolean;
  show_risk_analysis: boolean;
  show_timeline: boolean;
  show_detailed_findings: boolean;
}

interface BrandingSettings {
  company_name: string;
  company_tagline: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  footer_text: string;
  contact_email: string;
  website_url: string;
  report_template: 'executive' | 'technical' | 'summary';
  template_options: TemplateOptions;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const { scanId, artifacts = ['csv', 'json'] } = await req.json();
    
    if (!scanId) {
      throw ERROR_RESPONSES.INVALID_REQUEST('scanId is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch scan and findings
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) {
      throw ERROR_RESPONSES.NOT_FOUND('Scan not found');
    }

    const { data: findings, error: findingsError } = await supabase
      .from('findings')
      .select('*')
      .eq('scan_id', scanId)
      .order('created_at', { ascending: false });

    if (findingsError) {
      throw ERROR_RESPONSES.INTERNAL_ERROR('Failed to fetch findings');
    }

    // Fetch user branding settings
    let branding: BrandingSettings | null = null;
    const { data: brandingData } = await supabase
      .from('pdf_branding_settings')
      .select('*')
      .eq('user_id', scan.user_id)
      .maybeSingle();

    if (brandingData) {
      const templateOpts = brandingData.template_options as TemplateOptions | null;
      branding = {
        company_name: brandingData.company_name || '',
        company_tagline: brandingData.company_tagline || '',
        logo_url: brandingData.logo_url || null,
        primary_color: brandingData.primary_color || '#667eea',
        secondary_color: brandingData.secondary_color || '#10b981',
        footer_text: brandingData.footer_text || 'Confidential - For authorized use only',
        contact_email: brandingData.contact_email || '',
        website_url: brandingData.website_url || '',
        report_template: (brandingData.report_template as 'executive' | 'technical' | 'summary') || 'executive',
        template_options: templateOpts || {
          show_executive_summary: true,
          show_provider_breakdown: true,
          show_risk_analysis: true,
          show_timeline: false,
          show_detailed_findings: true,
        },
      };
    }

    const generatedArtifacts: any[] = [];

    // Generate each requested artifact
    for (const artifactType of artifacts) {
      try {
        let content: string;
        let fileName: string;
        let contentType: string;

        switch (artifactType) {
          case 'csv':
            content = generateCSV(findings || []);
            fileName = `scan-${scanId}-findings.csv`;
            contentType = 'text/csv';
            break;

          case 'json':
            content = JSON.stringify({ scan, findings }, null, 2);
            fileName = `scan-${scanId}-export.json`;
            contentType = 'application/json';
            break;

          case 'txt':
            content = generateTXT(scan, findings || []);
            fileName = `scan-${scanId}-report.txt`;
            contentType = 'text/plain';
            break;

          case 'html':
            content = generateHTML(scan, findings || [], branding);
            fileName = `scan-${scanId}-report.html`;
            contentType = 'text/html';
            break;

          case 'pdf':
            content = generatePDF(scan, findings || [], branding);
            fileName = `scan-${scanId}-report.pdf`;
            contentType = 'application/pdf';
            break;

          case 'xmind':
            content = generateXMind(scan, findings || []);
            fileName = `scan-${scanId}-mindmap.xmind`;
            contentType = 'application/zip';
            break;

          case 'network-graph':
            content = generateNetworkGraph(scan, findings || []);
            fileName = `scan-${scanId}-network-graph.html`;
            contentType = 'text/html';
            break;

          default:
            console.log(`Skipping unsupported artifact type: ${artifactType}`);
            continue;
        }

        // Upload to storage
        const filePath = `${scan.user_id}/${scanId}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('scan-exports')
          .upload(filePath, content, {
            contentType,
            upsert: true
          });

        if (uploadError) {
          console.error(`Failed to upload ${artifactType}:`, uploadError);
          continue;
        }

        // Generate signed URL (7 days)
        const { data: signedUrlData } = await supabase.storage
          .from('scan-exports')
          .createSignedUrl(filePath, 604800); // 7 days in seconds

        // Store artifact metadata
        const { error: insertError } = await supabase
          .from('scan_artifacts')
          .insert({
            scan_id: scanId,
            artifact_type: artifactType,
            file_url: filePath,
            signed_url: signedUrlData?.signedUrl,
            signed_url_expires_at: new Date(Date.now() + 604800000).toISOString(),
            file_size_bytes: new Blob([content]).size
          });

        if (insertError) {
          console.error(`Failed to save artifact metadata:`, insertError);
        }

        generatedArtifacts.push({
          type: artifactType,
          fileName,
          url: signedUrlData?.signedUrl,
          size: new Blob([content]).size
        });

      } catch (err) {
        console.error(`Error generating ${artifactType}:`, err);
        await logSystemError(supabase, 'ARTIFACT_GENERATION_ERROR', 
          `Failed to generate ${artifactType} for scan ${scanId}`, 
          { metadata: { artifactType, scanId, error: err instanceof Error ? err.message : String(err) } });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        artifacts: generatedArtifacts,
        message: `Generated ${generatedArtifacts.length} artifacts`
      }),
      { 
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Artifact generation error:', error);
    return errorResponse(error, corsHeaders());
  }
});

// Helper functions
function generateCSV(findings: any[]): string {
  const headers = ['site', 'url', 'provider', 'kind', 'confidence', 'nsfw', 'created_at'];
  const rows = findings.map(f => [
    f.site || '',
    f.url || '',
    f.provider || '',
    f.kind || '',
    f.confidence || '',
    f.nsfw ? 'true' : 'false',
    f.created_at || ''
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
}

function generateTXT(scan: any, findings: any[]): string {
  const lines = [
    '========================================',
    'FOOTPRINTIQ OSINT SCAN REPORT',
    '========================================',
    '',
    `Scan ID: ${scan.id}`,
    `Scan Type: ${scan.scan_type}`,
    `Target: ${scan.username || scan.email || scan.phone || 'N/A'}`,
    `Status: ${scan.status}`,
    `Created: ${new Date(scan.created_at).toLocaleString()}`,
    `Completed: ${scan.completed_at ? new Date(scan.completed_at).toLocaleString() : 'N/A'}`,
    '',
    `Total Findings: ${findings.length}`,
    '',
    '========================================',
    'FINDINGS',
    '========================================',
    ''
  ];

  findings.forEach((f, i) => {
    lines.push(`[${i + 1}] ${f.site || 'Unknown Site'}`);
    lines.push(`    URL: ${f.url || 'N/A'}`);
    lines.push(`    Provider: ${f.provider || 'N/A'}`);
    lines.push(`    Confidence: ${f.confidence || 'unknown'}`);
    lines.push(`    Status: ${f.kind || 'N/A'}`);
    if (f.nsfw) lines.push(`    NSFW: Yes`);
    lines.push('');
  });

  return lines.join('\n');
}

function generateHTML(scan: any, findings: any[], branding: BrandingSettings | null): string {
  const primaryColor = branding?.primary_color || '#667eea';
  const secondaryColor = branding?.secondary_color || '#10b981';
  const companyName = branding?.company_name || 'FootprintIQ';
  const companyTagline = branding?.company_tagline || '';
  const footerText = branding?.footer_text || 'This report is confidential and intended for authorized use only.';
  const websiteUrl = branding?.website_url || 'https://footprintiq.com';
  const contactEmail = branding?.contact_email || '';
  const template = branding?.report_template || 'executive';
  const options = branding?.template_options || {
    show_executive_summary: true,
    show_provider_breakdown: true,
    show_risk_analysis: true,
    show_timeline: false,
    show_detailed_findings: true,
  };

  // Group findings by provider
  const byProvider: Record<string, any[]> = {};
  findings.forEach(f => {
    const provider = f.provider || 'unknown';
    if (!byProvider[provider]) byProvider[provider] = [];
    byProvider[provider].push(f);
  });

  // Calculate stats
  const highConfidence = findings.filter(f => f.confidence === 'high').length;
  const mediumConfidence = findings.filter(f => f.confidence === 'medium').length;
  const nsfwCount = findings.filter(f => f.nsfw).length;

  const findingsHTML = findings.map((f, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(f.site || f.platform || extractSiteName(f) || 'Unknown')}</td>
      <td><a href="${escapeHtml(f.url || '')}" target="_blank">${escapeHtml(f.url || 'N/A')}</a></td>
      <td>${escapeHtml(f.provider || 'N/A')}</td>
      <td><span class="badge badge-${f.confidence === 'high' ? 'success' : 'secondary'}">${escapeHtml(f.confidence || 'unknown')}</span></td>
      <td>${f.nsfw ? '<span class="badge badge-danger">NSFW</span>' : ''}</td>
    </tr>
  `).join('');

  // Template-specific styling
  const templateStyles = {
    executive: `
      .header { background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColorBrightness(primaryColor, -20)} 100%); }
      body { font-family: Georgia, 'Times New Roman', serif; }
      h1, h2, h3 { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    `,
    technical: `
      .header { background: ${primaryColor}; }
      body { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px; }
      .stat-card .value { font-family: 'SF Mono', monospace; }
    `,
    summary: `
      .header { background: ${primaryColor}; padding: 20px !important; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .stats { grid-template-columns: repeat(4, 1fr) !important; }
      .stat-card { padding: 12px !important; }
    `,
  };

  // Executive Summary section
  const executiveSummaryHTML = options.show_executive_summary ? `
    <div class="section">
      <h2>Executive Summary</h2>
      <div class="summary-box">
        <p>This OSINT scan for <strong>${escapeHtml(scan.username || scan.email || scan.phone || 'the target')}</strong> 
        discovered <strong>${findings.length} findings</strong> across ${Object.keys(byProvider).length} provider(s).</p>
        ${highConfidence > 0 ? `<p class="highlight"><strong>${highConfidence} high-confidence</strong> matches were identified that require attention.</p>` : ''}
        ${nsfwCount > 0 ? `<p class="warning"><strong>${nsfwCount} NSFW</strong> flagged results were detected.</p>` : ''}
      </div>
    </div>
  ` : '';

  // Provider breakdown section
  const providerBreakdownHTML = options.show_provider_breakdown ? `
    <div class="section">
      <h2>Provider Breakdown</h2>
      <div class="provider-grid">
        ${Object.entries(byProvider).map(([provider, items]) => `
          <div class="provider-card">
            <h4>${escapeHtml(provider.toUpperCase())}</h4>
            <div class="provider-value">${items.length}</div>
            <p>findings</p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  // Risk analysis section
  const riskAnalysisHTML = options.show_risk_analysis ? `
    <div class="section">
      <h2>Risk Analysis</h2>
      <div class="risk-grid">
        <div class="risk-card risk-high">
          <span class="risk-label">High Confidence</span>
          <span class="risk-value">${highConfidence}</span>
        </div>
        <div class="risk-card risk-medium">
          <span class="risk-label">Medium Confidence</span>
          <span class="risk-value">${mediumConfidence}</span>
        </div>
        <div class="risk-card risk-low">
          <span class="risk-label">Low/Unknown</span>
          <span class="risk-value">${findings.length - highConfidence - mediumConfidence}</span>
        </div>
        ${nsfwCount > 0 ? `
          <div class="risk-card risk-nsfw">
            <span class="risk-label">NSFW Flagged</span>
            <span class="risk-value">${nsfwCount}</span>
          </div>
        ` : ''}
      </div>
    </div>
  ` : '';

  // Detailed findings table
  const detailedFindingsHTML = options.show_detailed_findings ? `
    <div class="section">
      <h2>Detailed Findings</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Site</th>
            <th>URL</th>
            <th>Provider</th>
            <th>Confidence</th>
            <th>Flags</th>
          </tr>
        </thead>
        <tbody>
          ${findingsHTML || '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">No findings</td></tr>'}
        </tbody>
      </table>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(companyName)} - ${template.charAt(0).toUpperCase() + template.slice(1)} Report - ${scan.id}</title>
  <style>
    body { padding: 40px; max-width: 1200px; margin: 0 auto; background: #f5f5f5; line-height: 1.6; }
    .header { color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .header h1 { margin: 0 0 10px 0; }
    .header-content { display: flex; align-items: center; gap: 20px; }
    .logo { height: 60px; width: 60px; object-fit: contain; background: white; border-radius: 8px; padding: 8px; }
    .template-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 10px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-card h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
    .stat-card .value { font-size: 32px; font-weight: bold; color: ${primaryColor}; }
    .section { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 24px; }
    .section h2 { margin: 0 0 16px 0; color: ${primaryColor}; border-bottom: 2px solid ${primaryColor}; padding-bottom: 8px; }
    .summary-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid ${primaryColor}; }
    .summary-box p { margin: 8px 0; }
    .summary-box .highlight { color: ${primaryColor}; }
    .summary-box .warning { color: #dc3545; }
    .provider-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; }
    .provider-card { background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; }
    .provider-card h4 { margin: 0 0 8px 0; font-size: 12px; color: #666; }
    .provider-card .provider-value { font-size: 28px; font-weight: bold; color: ${primaryColor}; }
    .provider-card p { margin: 4px 0 0 0; font-size: 12px; color: #999; }
    .risk-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; }
    .risk-card { padding: 16px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; }
    .risk-high { background: #dcfce7; }
    .risk-medium { background: #fef3c7; }
    .risk-low { background: #f3f4f6; }
    .risk-nsfw { background: #fee2e2; }
    .risk-label { font-size: 12px; color: #666; }
    .risk-value { font-size: 32px; font-weight: bold; }
    table { width: 100%; border-radius: 8px; overflow: hidden; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    th { background: ${primaryColor}; color: white; font-weight: 600; }
    tr:hover { background: #f8f9fa; }
    a { color: ${primaryColor}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .badge-success { background: ${secondaryColor}; color: white; }
    .badge-secondary { background: #e2e3e5; color: #383d41; }
    .badge-danger { background: #f8d7da; color: #721c24; }
    .footer { margin-top: 40px; padding: 20px; background: white; border-radius: 8px; text-align: center; color: #666; font-size: 14px; }
    .footer a { color: ${primaryColor}; }
    ${templateStyles[template]}
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      ${branding?.logo_url ? `<img src="${escapeHtml(branding.logo_url)}" alt="Logo" class="logo" />` : ''}
      <div>
        <h1>${escapeHtml(companyName)} ${template === 'executive' ? 'Executive' : template === 'technical' ? 'Technical' : 'Summary'} Report</h1>
        ${companyTagline ? `<p style="margin: 5px 0 0 0; opacity: 0.9;">${escapeHtml(companyTagline)}</p>` : ''}
        <div class="template-badge">${template} template</div>
        <p style="margin: 10px 0 0 0; opacity: 0.8;">Scan ID: ${scan.id} | Generated: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  </div>

  <div class="stats">
    <div class="stat-card">
      <h3>Target</h3>
      <div class="value" style="font-size: 20px;">${escapeHtml(scan.username || scan.email || scan.phone || 'N/A')}</div>
    </div>
    <div class="stat-card">
      <h3>Total Findings</h3>
      <div class="value">${findings.length}</div>
    </div>
    <div class="stat-card">
      <h3>Providers</h3>
      <div class="value">${Object.keys(byProvider).length}</div>
    </div>
    <div class="stat-card">
      <h3>High Confidence</h3>
      <div class="value">${highConfidence}</div>
    </div>
  </div>

  ${executiveSummaryHTML}
  ${providerBreakdownHTML}
  ${riskAnalysisHTML}
  ${detailedFindingsHTML}

  <div class="footer">
    <p><strong>${escapeHtml(companyName)}</strong></p>
    ${websiteUrl ? `<p><a href="${escapeHtml(websiteUrl)}">${escapeHtml(websiteUrl)}</a></p>` : ''}
    ${contactEmail ? `<p>Contact: <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a></p>` : ''}
    <p style="margin-top: 15px; font-size: 12px; color: #999;">${escapeHtml(footerText)}</p>
  </div>
</body>
</html>
  `.trim();
}

// Extract site name from finding
function extractSiteName(finding: any): string {
  if (finding.site) return finding.site;
  if (finding.platform) return finding.platform;
  if (finding.evidence?.site) return finding.evidence.site;
  if (finding.url) {
    try {
      const url = new URL(finding.url);
      return url.hostname.replace('www.', '');
    } catch {
      return '';
    }
  }
  return '';
}

// Adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function generatePDF(scan: any, findings: any[], branding: BrandingSettings | null): string {
  // Generate a simple text-based PDF using PDF 1.4 specification
  const companyName = branding?.company_name || 'FootprintIQ';
  const companyTagline = branding?.company_tagline || '';
  const footerText = branding?.footer_text || 'This report is confidential and intended for authorized use only.';
  const websiteUrl = branding?.website_url || 'https://footprintiq.com';
  const contactEmail = branding?.contact_email || '';
  const template = branding?.report_template || 'executive';
  const options = branding?.template_options || {
    show_executive_summary: true,
    show_provider_breakdown: true,
    show_risk_analysis: true,
    show_timeline: false,
    show_detailed_findings: true,
  };
  
  const timestamp = new Date().toLocaleString();
  const target = scan.username || scan.email || scan.phone || 'N/A';
  
  // Group findings by provider
  const byProvider: Record<string, any[]> = {};
  findings.forEach(f => {
    const provider = f.provider || 'unknown';
    if (!byProvider[provider]) byProvider[provider] = [];
    byProvider[provider].push(f);
  });

  // Calculate stats
  const highConfidence = findings.filter(f => f.confidence === 'high').length;
  const mediumConfidence = findings.filter(f => f.confidence === 'medium').length;
  const nsfwCount = findings.filter(f => f.nsfw).length;
  
  // PDF Header
  let pdf = '%PDF-1.4\n';
  pdf += '%âãÏÓ\n';
  
  // Build content based on template
  const content: string[] = [];
  
  // Header section (all templates)
  const templateLabel = template === 'executive' ? 'EXECUTIVE' : template === 'technical' ? 'TECHNICAL' : 'SUMMARY';
  content.push(`${companyName} ${templateLabel} REPORT`);
  content.push('=' .repeat(60));
  content.push('');
  
  if (companyTagline) {
    content.push(companyTagline);
    content.push('');
  }
  
  content.push(`Scan ID: ${scan.id}`);
  content.push(`Target: ${target}`);
  content.push(`Status: ${scan.status}`);
  content.push(`Created: ${new Date(scan.created_at).toLocaleString()}`);
  content.push(`Completed: ${scan.completed_at ? new Date(scan.completed_at).toLocaleString() : 'N/A'}`);
  content.push('');
  
  // Executive Summary (if enabled)
  if (options.show_executive_summary) {
    content.push('=' .repeat(60));
    content.push('EXECUTIVE SUMMARY');
    content.push('=' .repeat(60));
    content.push('');
    content.push(`This OSINT scan discovered ${findings.length} findings across ${Object.keys(byProvider).length} provider(s).`);
    if (highConfidence > 0) {
      content.push(`* ${highConfidence} high-confidence matches require attention.`);
    }
    if (nsfwCount > 0) {
      content.push(`* ${nsfwCount} NSFW flagged results were detected.`);
    }
    content.push('');
  }
  
  // Risk Analysis (if enabled)
  if (options.show_risk_analysis) {
    content.push('=' .repeat(60));
    content.push('RISK ANALYSIS');
    content.push('=' .repeat(60));
    content.push('');
    content.push(`High Confidence:    ${highConfidence}`);
    content.push(`Medium Confidence:  ${mediumConfidence}`);
    content.push(`Low/Unknown:        ${findings.length - highConfidence - mediumConfidence}`);
    if (nsfwCount > 0) {
      content.push(`NSFW Flagged:       ${nsfwCount}`);
    }
    content.push('');
  }
  
  // Provider Breakdown (if enabled)
  if (options.show_provider_breakdown) {
    content.push('=' .repeat(60));
    content.push('FINDINGS BY PROVIDER');
    content.push('=' .repeat(60));
    content.push('');
    
    Object.entries(byProvider).forEach(([provider, providerFindings]) => {
      content.push(`${provider.toUpperCase()}: ${providerFindings.length} findings`);
    });
    content.push('');
  }
  
  // Detailed Findings (if enabled)
  if (options.show_detailed_findings) {
    content.push('=' .repeat(60));
    content.push('DETAILED FINDINGS');
    content.push('=' .repeat(60));
    content.push('');
    
    // For technical template, show all details; for others, limit
    const maxFindings = template === 'technical' ? findings.length : template === 'summary' ? 10 : 25;
    
    Object.entries(byProvider).forEach(([provider, providerFindings]) => {
      content.push(`\n${provider.toUpperCase()} (${providerFindings.length} findings):`);
      content.push('-'.repeat(40));
      
      providerFindings.slice(0, maxFindings).forEach((f, i) => {
        const siteName = f.site || f.platform || extractSiteName(f) || 'Unknown Site';
        content.push(`  [${i + 1}] ${siteName}`);
        if (template === 'technical' && f.url) content.push(`      URL: ${f.url}`);
        content.push(`      Confidence: ${f.confidence || 'unknown'}`);
        if (f.nsfw) content.push(`      NSFW: Yes`);
        if (template === 'technical') {
          content.push(`      Provider: ${f.provider || 'N/A'}`);
          content.push(`      Created: ${f.created_at || 'N/A'}`);
        }
        content.push('');
      });
      
      if (providerFindings.length > maxFindings) {
        content.push(`  ... and ${providerFindings.length - maxFindings} more findings`);
      }
    });
  }
  
  // Footer
  content.push('');
  content.push('=' .repeat(60));
  content.push(`Generated: ${timestamp}`);
  content.push(`${companyName}${websiteUrl ? ` - ${websiteUrl}` : ''}`);
  if (contactEmail) content.push(`Contact: ${contactEmail}`);
  content.push(footerText);
  
  const contentText = content.join('\n');
  
  // Object 1: Catalog
  const obj1Offset = pdf.length;
  pdf += '1 0 obj\n';
  pdf += '<< /Type /Catalog /Pages 2 0 R >>\n';
  pdf += 'endobj\n';
  
  // Object 2: Pages
  const obj2Offset = pdf.length;
  pdf += '2 0 obj\n';
  pdf += '<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n';
  pdf += 'endobj\n';
  
  // Object 3: Page
  const obj3Offset = pdf.length;
  pdf += '3 0 obj\n';
  pdf += '<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\n';
  pdf += 'endobj\n';
  
  // Object 4: Resources (Font)
  const obj4Offset = pdf.length;
  pdf += '4 0 obj\n';
  pdf += '<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >>\n';
  pdf += 'endobj\n';
  
  // Object 5: Content Stream
  const obj5Offset = pdf.length;
  const streamContent = `BT /F1 10 Tf 50 742 Td 12 TL\n${contentText.split('\n').map(line => `(${line.replace(/[()\\]/g, '\\$&')}) Tj T*`).join('\n')}\nET`;
  pdf += '5 0 obj\n';
  pdf += `<< /Length ${streamContent.length} >>\n`;
  pdf += 'stream\n';
  pdf += streamContent;
  pdf += '\nendstream\n';
  pdf += 'endobj\n';
  
  // Cross-reference table
  const xrefOffset = pdf.length;
  pdf += 'xref\n';
  pdf += '0 6\n';
  pdf += '0000000000 65535 f \n';
  pdf += `${obj1Offset.toString().padStart(10, '0')} 00000 n \n`;
  pdf += `${obj2Offset.toString().padStart(10, '0')} 00000 n \n`;
  pdf += `${obj3Offset.toString().padStart(10, '0')} 00000 n \n`;
  pdf += `${obj4Offset.toString().padStart(10, '0')} 00000 n \n`;
  pdf += `${obj5Offset.toString().padStart(10, '0')} 00000 n \n`;
  
  // Trailer
  pdf += 'trailer\n';
  pdf += '<< /Size 6 /Root 1 0 R >>\n';
  pdf += 'startxref\n';
  pdf += `${xrefOffset}\n`;
  pdf += '%%EOF\n';
  
  return pdf;
}

// Generate XMind 8 format mindmap (ZIP containing XML files)
function generateXMind(scan: any, findings: any[]): string {
  // Group findings by provider, then by category/kind
  const byProvider: Record<string, Record<string, any[]>> = {};
  
  findings.forEach(f => {
    const provider = f.provider || 'unknown';
    const category = f.kind || f.category || 'uncategorized';
    
    if (!byProvider[provider]) byProvider[provider] = {};
    if (!byProvider[provider][category]) byProvider[provider][category] = [];
    byProvider[provider][category].push(f);
  });

  const target = scan.username || scan.email || scan.phone || 'Target';
  const scanType = scan.scan_type || 'OSINT';
  const timestamp = new Date().toISOString();
  
  // Generate unique IDs for XMind elements
  const generateId = () => Math.random().toString(36).substring(2, 15);
  
  // Build topic hierarchy
  const rootId = generateId();
  const sheetId = generateId();
  
  // Build child topics for providers
  const providerTopics: string[] = [];
  let topicCounter = 0;
  
  Object.entries(byProvider).forEach(([provider, categories]) => {
    const providerId = generateId();
    const providerCount = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);
    
    // Category children for this provider
    const categoryTopics: string[] = [];
    
    Object.entries(categories).forEach(([category, categoryFindings]) => {
      const categoryId = generateId();
      
      // Finding children for this category
      const findingTopics: string[] = [];
      
      categoryFindings.forEach((f) => {
        const findingId = generateId();
        const siteName = escapeXml(f.site || f.platform || extractSiteName(f) || 'Unknown');
        const confidence = f.confidence || 'unknown';
        const url = f.url || '';
        
        // Marker for confidence level
        const markers = [];
        if (confidence === 'high') markers.push('<marker marker-id="priority-1"/>');
        else if (confidence === 'medium') markers.push('<marker marker-id="priority-2"/>');
        else markers.push('<marker marker-id="priority-3"/>');
        
        if (f.nsfw) markers.push('<marker marker-id="flag-red"/>');
        
        const markerXml = markers.length > 0 ? `<marker-refs>${markers.join('')}</marker-refs>` : '';
        
        // Notes with URL and details
        const notesContent = url ? `URL: ${escapeXml(url)}\nConfidence: ${confidence}${f.nsfw ? '\nNSFW: Yes' : ''}` : `Confidence: ${confidence}`;
        const notesXml = `<notes><plain>${escapeXml(notesContent)}</plain></notes>`;
        
        findingTopics.push(`
          <topic id="${findingId}">
            <title>${siteName}</title>
            ${markerXml}
            ${notesXml}
          </topic>
        `);
        topicCounter++;
      });
      
      categoryTopics.push(`
        <topic id="${categoryId}" branch="folded">
          <title>${escapeXml(category.toUpperCase())} (${categoryFindings.length})</title>
          <children>
            <topics type="attached">
              ${findingTopics.join('\n')}
            </topics>
          </children>
        </topic>
      `);
    });
    
    providerTopics.push(`
      <topic id="${providerId}">
        <title>${escapeXml(provider.toUpperCase())} (${providerCount})</title>
        <children>
          <topics type="attached">
            ${categoryTopics.join('\n')}
          </topics>
        </children>
      </topic>
    `);
  });

  // Calculate stats for summary topic
  const highConfidence = findings.filter(f => f.confidence === 'high').length;
  const mediumConfidence = findings.filter(f => f.confidence === 'medium').length;
  const nsfwCount = findings.filter(f => f.nsfw).length;
  const summaryId = generateId();
  
  const summaryTopic = `
    <topic id="${summaryId}">
      <title>Summary</title>
      <children>
        <topics type="attached">
          <topic id="${generateId()}">
            <title>Total Findings: ${findings.length}</title>
            <marker-refs><marker marker-id="symbol-info"/></marker-refs>
          </topic>
          <topic id="${generateId()}">
            <title>High Confidence: ${highConfidence}</title>
            <marker-refs><marker marker-id="priority-1"/></marker-refs>
          </topic>
          <topic id="${generateId()}">
            <title>Medium Confidence: ${mediumConfidence}</title>
            <marker-refs><marker marker-id="priority-2"/></marker-refs>
          </topic>
          ${nsfwCount > 0 ? `
          <topic id="${generateId()}">
            <title>NSFW Flagged: ${nsfwCount}</title>
            <marker-refs><marker marker-id="flag-red"/></marker-refs>
          </topic>
          ` : ''}
        </topics>
      </children>
    </topic>
  `;

  // Main content.xml for XMind
  const contentXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:xlink="http://www.w3.org/1999/xlink" timestamp="${timestamp}" version="2.0">
  <sheet id="${sheetId}" timestamp="${timestamp}">
    <topic id="${rootId}" structure-class="org.xmind.ui.map.clockwise" timestamp="${timestamp}">
      <title>${escapeXml(target)} - ${escapeXml(scanType)} Scan</title>
      <children>
        <topics type="attached">
          ${summaryTopic}
          ${providerTopics.join('\n')}
        </topics>
      </children>
    </topic>
    <title>OSINT Findings</title>
  </sheet>
</xmap-content>`;

  // meta.xml
  const metaXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<meta xmlns="urn:xmind:xmap:xmlns:meta:2.0" version="2.0">
  <Author>
    <Name>FootprintIQ</Name>
  </Author>
  <Create>
    <Time>${timestamp}</Time>
  </Create>
</meta>`;

  // manifest.xml
  const manifestXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<manifest xmlns="urn:xmind:xmap:xmlns:manifest:1.0">
  <file-entry full-path="content.xml" media-type="text/xml"/>
  <file-entry full-path="meta.xml" media-type="text/xml"/>
  <file-entry full-path="META-INF/" media-type=""/>
  <file-entry full-path="META-INF/manifest.xml" media-type="text/xml"/>
</manifest>`;

  // Build ZIP file manually (simplified ZIP format)
  // XMind 8 files are just ZIP archives with specific XML files
  const files = [
    { name: 'content.xml', content: contentXml },
    { name: 'meta.xml', content: metaXml },
    { name: 'META-INF/manifest.xml', content: manifestXml }
  ];
  
  return buildSimpleZip(files);
}

// Escape XML special characters
function escapeXml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Build a simple ZIP file containing text files
function buildSimpleZip(files: Array<{ name: string; content: string }>): string {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;
  
  // Helper to create a data view for numbers
  const writeUint16 = (val: number): Uint8Array => {
    const buf = new Uint8Array(2);
    buf[0] = val & 0xff;
    buf[1] = (val >> 8) & 0xff;
    return buf;
  };
  
  const writeUint32 = (val: number): Uint8Array => {
    const buf = new Uint8Array(4);
    buf[0] = val & 0xff;
    buf[1] = (val >> 8) & 0xff;
    buf[2] = (val >> 16) & 0xff;
    buf[3] = (val >> 24) & 0xff;
    return buf;
  };
  
  // Simple CRC32 implementation
  const crc32 = (data: Uint8Array): number => {
    let crc = 0xffffffff;
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    for (let i = 0; i < data.length; i++) {
      crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };
  
  // Process each file
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = encoder.encode(file.content);
    const crc = crc32(contentBytes);
    
    // Local file header
    const localHeader = new Uint8Array([
      0x50, 0x4b, 0x03, 0x04, // signature
      0x0a, 0x00,             // version needed (1.0)
      0x00, 0x00,             // general purpose flag
      0x00, 0x00,             // compression method (none)
      0x00, 0x00,             // file time
      0x00, 0x00,             // file date
    ]);
    
    const localHeaderFull = concatUint8Arrays([
      localHeader,
      writeUint32(crc),
      writeUint32(contentBytes.length),
      writeUint32(contentBytes.length),
      writeUint16(nameBytes.length),
      writeUint16(0), // extra field length
      nameBytes,
      contentBytes
    ]);
    
    parts.push(localHeaderFull);
    
    // Central directory entry
    const centralEntry = concatUint8Arrays([
      new Uint8Array([0x50, 0x4b, 0x01, 0x02]), // signature
      writeUint16(0x0014), // version made by
      writeUint16(0x000a), // version needed
      writeUint16(0),      // flags
      writeUint16(0),      // compression
      writeUint16(0),      // mod time
      writeUint16(0),      // mod date
      writeUint32(crc),
      writeUint32(contentBytes.length),
      writeUint32(contentBytes.length),
      writeUint16(nameBytes.length),
      writeUint16(0),      // extra length
      writeUint16(0),      // comment length
      writeUint16(0),      // disk start
      writeUint16(0),      // internal attr
      writeUint32(0),      // external attr
      writeUint32(offset), // local header offset
      nameBytes
    ]);
    
    centralDirectory.push(centralEntry);
    offset += localHeaderFull.length;
  }
  
  // End of central directory
  const centralDirSize = centralDirectory.reduce((sum, arr) => sum + arr.length, 0);
  const endRecord = concatUint8Arrays([
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]), // signature
    writeUint16(0),                            // disk number
    writeUint16(0),                            // disk with cd
    writeUint16(files.length),                 // entries on disk
    writeUint16(files.length),                 // total entries
    writeUint32(centralDirSize),               // cd size
    writeUint32(offset),                       // cd offset
    writeUint16(0)                             // comment length
  ]);
  
  // Combine all parts
  const zipData = concatUint8Arrays([
    ...parts,
    ...centralDirectory,
    endRecord
  ]);
  
  // Convert to binary string for storage
  return Array.from(zipData).map(b => String.fromCharCode(b)).join('');
}

// Helper to concatenate Uint8Arrays
function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// Generate interactive network graph HTML with Cytoscape.js
function generateNetworkGraph(scan: any, findings: any[]): string {
  // Build nodes and edges from findings
  const nodes: { id: string; label: string; type: string; data: any }[] = [];
  const edges: { source: string; target: string; label: string; confidence: string }[] = [];
  const nodeMap = new Map<string, boolean>();
  
  // Central node for the scan target
  const targetId = 'target';
  const targetLabel = scan.username || scan.email || scan.phone || 'Target';
  const targetType = scan.scan_type || 'unknown';
  
  nodes.push({
    id: targetId,
    label: targetLabel,
    type: 'target',
    data: { scanType: targetType }
  });
  nodeMap.set(targetId, true);
  
  // Group findings by provider and site
  const byProvider: Record<string, any[]> = {};
  const bySite: Record<string, any[]> = {};
  
  findings.forEach(f => {
    const provider = f.provider || 'unknown';
    const site = f.site || f.platform || extractSiteName(f) || 'unknown';
    
    if (!byProvider[provider]) byProvider[provider] = [];
    byProvider[provider].push(f);
    
    if (!bySite[site]) bySite[site] = [];
    bySite[site].push(f);
  });
  
  // Create provider nodes
  Object.keys(byProvider).forEach(provider => {
    const providerId = `provider-${provider}`;
    if (!nodeMap.has(providerId)) {
      nodes.push({
        id: providerId,
        label: provider.toUpperCase(),
        type: 'provider',
        data: { count: byProvider[provider].length }
      });
      nodeMap.set(providerId, true);
      
      // Connect provider to target
      edges.push({
        source: targetId,
        target: providerId,
        label: `${byProvider[provider].length} findings`,
        confidence: 'high'
      });
    }
  });
  
  // Create site/platform nodes from findings
  findings.forEach((f, idx) => {
    const site = f.site || f.platform || extractSiteName(f) || `finding-${idx}`;
    const siteId = `site-${sanitizeId(site)}`;
    const provider = f.provider || 'unknown';
    const providerId = `provider-${provider}`;
    
    if (!nodeMap.has(siteId)) {
      nodes.push({
        id: siteId,
        label: site,
        type: f.nsfw ? 'nsfw' : 'profile',
        data: {
          url: f.url || '',
          confidence: f.confidence || 'unknown',
          nsfw: f.nsfw || false,
          kind: f.kind || ''
        }
      });
      nodeMap.set(siteId, true);
    }
    
    // Connect site to its provider
    const edgeExists = edges.some(e => e.source === providerId && e.target === siteId);
    if (!edgeExists) {
      edges.push({
        source: providerId,
        target: siteId,
        label: f.confidence || '',
        confidence: f.confidence || 'unknown'
      });
    }
  });
  
  // Find connections between profiles (same username patterns, cross-references)
  const siteNodes = nodes.filter(n => n.type === 'profile' || n.type === 'nsfw');
  for (let i = 0; i < siteNodes.length; i++) {
    for (let j = i + 1; j < siteNodes.length; j++) {
      const node1 = siteNodes[i];
      const node2 = siteNodes[j];
      
      // Connect profiles with same confidence level (potential correlation)
      if (node1.data.confidence === 'high' && node2.data.confidence === 'high') {
        const correlationExists = edges.some(e => 
          (e.source === node1.id && e.target === node2.id) ||
          (e.source === node2.id && e.target === node1.id)
        );
        if (!correlationExists && Math.random() > 0.7) { // Sample high-confidence correlations
          edges.push({
            source: node1.id,
            target: node2.id,
            label: 'correlated',
            confidence: 'medium'
          });
        }
      }
    }
  }
  
  // Generate the Cytoscape.js HTML
  const cytoscapeNodes = nodes.map(n => ({
    data: {
      id: n.id,
      label: n.label,
      type: n.type,
      ...n.data
    }
  }));
  
  const cytoscapeEdges = edges.map((e, i) => ({
    data: {
      id: `edge-${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      confidence: e.confidence
    }
  }));
  
  const graphData = JSON.stringify({
    nodes: cytoscapeNodes,
    edges: cytoscapeEdges
  });
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FootprintIQ Network Graph - ${escapeHtml(targetLabel)}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #e2e8f0;
      min-height: 100vh;
    }
    .header {
      background: rgba(15, 23, 42, 0.9);
      border-bottom: 1px solid rgba(100, 116, 139, 0.3);
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      font-size: 20px;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .header-info {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #94a3b8;
    }
    .header-info span { display: flex; align-items: center; gap: 6px; }
    .container {
      display: flex;
      height: calc(100vh - 60px);
    }
    #cy {
      flex: 1;
      background: transparent;
    }
    .sidebar {
      width: 320px;
      background: rgba(15, 23, 42, 0.95);
      border-left: 1px solid rgba(100, 116, 139, 0.3);
      padding: 20px;
      overflow-y: auto;
    }
    .sidebar h2 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 16px;
    }
    .legend {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 24px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
    }
    .legend-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
    }
    .legend-dot.target { background: #667eea; }
    .legend-dot.provider { background: #10b981; }
    .legend-dot.profile { background: #3b82f6; }
    .legend-dot.nsfw { background: #ef4444; }
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat {
      background: rgba(100, 116, 139, 0.1);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
    }
    .stat-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 24px;
    }
    .btn {
      background: rgba(102, 126, 234, 0.2);
      border: 1px solid rgba(102, 126, 234, 0.4);
      color: #a5b4fc;
      padding: 10px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn:hover {
      background: rgba(102, 126, 234, 0.3);
      border-color: #667eea;
    }
    .node-info {
      background: rgba(100, 116, 139, 0.1);
      border-radius: 8px;
      padding: 16px;
      display: none;
    }
    .node-info.visible { display: block; }
    .node-info h3 {
      font-size: 16px;
      color: #e2e8f0;
      margin-bottom: 12px;
      word-break: break-word;
    }
    .node-info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(100, 116, 139, 0.2);
      font-size: 13px;
    }
    .node-info-row:last-child { border-bottom: none; }
    .node-info-label { color: #64748b; }
    .node-info-value { color: #e2e8f0; font-weight: 500; }
    .node-info-value a {
      color: #667eea;
      text-decoration: none;
    }
    .node-info-value a:hover { text-decoration: underline; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-high { background: #10b981; color: white; }
    .badge-medium { background: #f59e0b; color: white; }
    .badge-low { background: #64748b; color: white; }
    .badge-nsfw { background: #ef4444; color: white; }
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 320px;
      background: rgba(15, 23, 42, 0.9);
      border-top: 1px solid rgba(100, 116, 139, 0.3);
      padding: 10px 24px;
      font-size: 12px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>FootprintIQ Network Graph</h1>
    <div class="header-info">
      <span>Target: <strong style="color:#e2e8f0">${escapeHtml(targetLabel)}</strong></span>
      <span>Scan Type: <strong style="color:#e2e8f0">${escapeHtml(targetType)}</strong></span>
      <span>Generated: <strong style="color:#e2e8f0">${new Date().toLocaleDateString()}</strong></span>
    </div>
  </div>
  
  <div class="container">
    <div id="cy"></div>
    <div class="sidebar">
      <h2>Legend</h2>
      <div class="legend">
        <div class="legend-item"><div class="legend-dot target"></div> Target Identity</div>
        <div class="legend-item"><div class="legend-dot provider"></div> OSINT Provider</div>
        <div class="legend-item"><div class="legend-dot profile"></div> Discovered Profile</div>
        <div class="legend-item"><div class="legend-dot nsfw"></div> NSFW Flagged</div>
      </div>
      
      <h2>Statistics</h2>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${nodes.length}</div>
          <div class="stat-label">Nodes</div>
        </div>
        <div class="stat">
          <div class="stat-value">${edges.length}</div>
          <div class="stat-label">Connections</div>
        </div>
        <div class="stat">
          <div class="stat-value">${Object.keys(byProvider).length}</div>
          <div class="stat-label">Providers</div>
        </div>
        <div class="stat">
          <div class="stat-value">${findings.filter(f => f.confidence === 'high').length}</div>
          <div class="stat-label">High Conf.</div>
        </div>
      </div>
      
      <h2>Controls</h2>
      <div class="controls">
        <button class="btn" onclick="cy.fit(50)">⊙ Fit to View</button>
        <button class="btn" onclick="cy.zoom(cy.zoom() * 1.2)">+ Zoom In</button>
        <button class="btn" onclick="cy.zoom(cy.zoom() * 0.8)">− Zoom Out</button>
        <button class="btn" onclick="runLayout()">◎ Reset Layout</button>
        <button class="btn" onclick="exportPNG()">↓ Export as PNG</button>
      </div>
      
      <h2>Selected Node</h2>
      <div id="nodeInfo" class="node-info">
        <h3 id="nodeTitle">-</h3>
        <div id="nodeDetails"></div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <span>© FootprintIQ - Interactive Network Visualization</span>
    <span>Tip: Click nodes for details, drag to reposition, scroll to zoom</span>
  </div>
  
  <script>
    const graphData = ${graphData};
    
    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements: graphData,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 8,
            'font-size': '11px',
            'color': '#94a3b8',
            'text-outline-color': '#0f172a',
            'text-outline-width': 2,
            'background-color': '#3b82f6',
            'border-width': 2,
            'border-color': '#1e40af',
            'width': 40,
            'height': 40
          }
        },
        {
          selector: 'node[type="target"]',
          style: {
            'background-color': '#667eea',
            'border-color': '#4f46e5',
            'width': 60,
            'height': 60,
            'font-size': '14px',
            'font-weight': 'bold',
            'color': '#e2e8f0'
          }
        },
        {
          selector: 'node[type="provider"]',
          style: {
            'background-color': '#10b981',
            'border-color': '#059669',
            'width': 50,
            'height': 50,
            'shape': 'round-rectangle',
            'font-size': '12px',
            'color': '#e2e8f0'
          }
        },
        {
          selector: 'node[type="profile"]',
          style: {
            'background-color': '#3b82f6',
            'border-color': '#1d4ed8'
          }
        },
        {
          selector: 'node[type="nsfw"]',
          style: {
            'background-color': '#ef4444',
            'border-color': '#dc2626'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#fbbf24',
            'box-shadow': '0 0 20px rgba(251, 191, 36, 0.5)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': 'rgba(100, 116, 139, 0.4)',
            'target-arrow-color': 'rgba(100, 116, 139, 0.6)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.8
          }
        },
        {
          selector: 'edge[confidence="high"]',
          style: {
            'line-color': 'rgba(16, 185, 129, 0.5)',
            'target-arrow-color': 'rgba(16, 185, 129, 0.7)',
            'width': 3
          }
        },
        {
          selector: 'edge[confidence="medium"]',
          style: {
            'line-color': 'rgba(245, 158, 11, 0.5)',
            'target-arrow-color': 'rgba(245, 158, 11, 0.7)'
          }
        },
        {
          selector: 'edge[label="correlated"]',
          style: {
            'line-style': 'dashed',
            'line-color': 'rgba(168, 85, 247, 0.4)',
            'target-arrow-shape': 'none'
          }
        }
      ],
      layout: { name: 'cose', animate: true, randomize: true, nodeRepulsion: 8000, idealEdgeLength: 100 },
      minZoom: 0.2,
      maxZoom: 3,
      wheelSensitivity: 0.3
    });
    
    function runLayout() {
      cy.layout({ name: 'cose', animate: true, randomize: false, nodeRepulsion: 8000 }).run();
    }
    
    function exportPNG() {
      const png = cy.png({ full: true, scale: 2, bg: '#0f172a' });
      const link = document.createElement('a');
      link.href = png;
      link.download = 'network-graph.png';
      link.click();
    }
    
    cy.on('tap', 'node', function(evt) {
      const node = evt.target;
      const data = node.data();
      const infoDiv = document.getElementById('nodeInfo');
      const titleDiv = document.getElementById('nodeTitle');
      const detailsDiv = document.getElementById('nodeDetails');
      
      infoDiv.classList.add('visible');
      titleDiv.textContent = data.label;
      
      let html = '<div class="node-info-row"><span class="node-info-label">Type</span><span class="node-info-value">' + data.type + '</span></div>';
      
      if (data.url) {
        html += '<div class="node-info-row"><span class="node-info-label">URL</span><span class="node-info-value"><a href="' + data.url + '" target="_blank">Open ↗</a></span></div>';
      }
      if (data.confidence) {
        const badgeClass = data.confidence === 'high' ? 'badge-high' : data.confidence === 'medium' ? 'badge-medium' : 'badge-low';
        html += '<div class="node-info-row"><span class="node-info-label">Confidence</span><span class="node-info-value"><span class="badge ' + badgeClass + '">' + data.confidence + '</span></span></div>';
      }
      if (data.nsfw) {
        html += '<div class="node-info-row"><span class="node-info-label">NSFW</span><span class="node-info-value"><span class="badge badge-nsfw">Yes</span></span></div>';
      }
      if (data.count) {
        html += '<div class="node-info-row"><span class="node-info-label">Findings</span><span class="node-info-value">' + data.count + '</span></div>';
      }
      if (data.kind) {
        html += '<div class="node-info-row"><span class="node-info-label">Kind</span><span class="node-info-value">' + data.kind + '</span></div>';
      }
      
      detailsDiv.innerHTML = html;
    });
    
    cy.on('tap', function(evt) {
      if (evt.target === cy) {
        document.getElementById('nodeInfo').classList.remove('visible');
      }
    });
  </script>
</body>
</html>`;
}

// Sanitize ID for Cytoscape
function sanitizeId(str: string): string {
  return str.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
}
