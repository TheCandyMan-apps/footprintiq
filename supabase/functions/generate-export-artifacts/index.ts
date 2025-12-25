import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/secure.ts';
import { ERROR_RESPONSES, errorResponse, logSystemError } from '../_shared/errorHandler.ts';

interface BrandingSettings {
  company_name: string;
  company_tagline: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  footer_text: string;
  contact_email: string;
  website_url: string;
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
      branding = {
        company_name: brandingData.company_name || '',
        company_tagline: brandingData.company_tagline || '',
        logo_url: brandingData.logo_url || null,
        primary_color: brandingData.primary_color || '#667eea',
        secondary_color: brandingData.secondary_color || '#10b981',
        footer_text: brandingData.footer_text || 'Confidential - For authorized use only',
        contact_email: brandingData.contact_email || '',
        website_url: brandingData.website_url || '',
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(companyName)} - Scan Report - ${scan.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColorBrightness(primaryColor, -20)} 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .header h1 { margin: 0 0 10px 0; }
    .header-content { display: flex; align-items: center; gap: 20px; }
    .logo { height: 60px; width: 60px; object-fit: contain; background: white; border-radius: 8px; padding: 8px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-card h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
    .stat-card .value { font-size: 32px; font-weight: bold; color: ${primaryColor}; }
    table { width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-collapse: collapse; }
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
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      ${branding?.logo_url ? `<img src="${escapeHtml(branding.logo_url)}" alt="Logo" class="logo" />` : ''}
      <div>
        <h1>${escapeHtml(companyName)} OSINT Scan Report</h1>
        ${companyTagline ? `<p style="margin: 5px 0 0 0; opacity: 0.9;">${escapeHtml(companyTagline)}</p>` : ''}
        <p style="margin: 10px 0 0 0; opacity: 0.8;">Scan ID: ${scan.id}</p>
        <p style="margin: 5px 0 0 0; opacity: 0.8;">Generated: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  </div>

  <div class="stats">
    <div class="stat-card">
      <h3>Target</h3>
      <div class="value">${escapeHtml(scan.username || scan.email || scan.phone || 'N/A')}</div>
    </div>
    <div class="stat-card">
      <h3>Total Findings</h3>
      <div class="value">${findings.length}</div>
    </div>
    <div class="stat-card">
      <h3>Scan Status</h3>
      <div class="value" style="font-size: 24px;">${escapeHtml(scan.status || 'N/A')}</div>
    </div>
    <div class="stat-card">
      <h3>Completed</h3>
      <div class="value" style="font-size: 18px;">${scan.completed_at ? new Date(scan.completed_at).toLocaleString() : 'N/A'}</div>
    </div>
  </div>

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
  // This creates a minimal but valid PDF with proper structure
  
  const companyName = branding?.company_name || 'FootprintIQ';
  const companyTagline = branding?.company_tagline || '';
  const footerText = branding?.footer_text || 'This report is confidential and intended for authorized use only.';
  const websiteUrl = branding?.website_url || 'https://footprintiq.com';
  const contactEmail = branding?.contact_email || '';
  
  const timestamp = new Date().toLocaleString();
  const target = scan.username || scan.email || scan.phone || 'N/A';
  
  // PDF Header
  let pdf = '%PDF-1.4\n';
  pdf += '%âãÏÓ\n'; // PDF binary marker
  
  // Content stream with report data
  const content = [
    `${companyName} OSINT Scan Report`,
    '=' .repeat(60),
    ''
  ];
  
  if (companyTagline) {
    content.push(companyTagline);
    content.push('');
  }
  
  content.push(
    `Scan ID: ${scan.id}`,
    `Target: ${target}`,
    `Status: ${scan.status}`,
    `Created: ${new Date(scan.created_at).toLocaleString()}`,
    `Completed: ${scan.completed_at ? new Date(scan.completed_at).toLocaleString() : 'N/A'}`,
    '',
    `Total Findings: ${findings.length}`,
    '',
    '=' .repeat(60),
    'FINDINGS BY PROVIDER',
    '=' .repeat(60),
    ''
  );
  
  // Group findings by provider
  const byProvider: Record<string, any[]> = {};
  findings.forEach(f => {
    const provider = f.provider || 'unknown';
    if (!byProvider[provider]) byProvider[provider] = [];
    byProvider[provider].push(f);
  });
  
  // Add provider sections
  Object.entries(byProvider).forEach(([provider, providerFindings]) => {
    content.push(`\n${provider.toUpperCase()} (${providerFindings.length} findings):`);
    content.push('-'.repeat(40));
    
    providerFindings.slice(0, 20).forEach((f, i) => {
      const siteName = f.site || f.platform || extractSiteName(f) || 'Unknown Site';
      content.push(`  [${i + 1}] ${siteName}`);
      if (f.url) content.push(`      URL: ${f.url}`);
      content.push(`      Confidence: ${f.confidence || 'unknown'}`);
      if (f.nsfw) content.push(`      NSFW: Yes`);
      content.push('');
    });
    
    if (providerFindings.length > 20) {
      content.push(`  ... and ${providerFindings.length - 20} more findings`);
    }
  });
  
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
