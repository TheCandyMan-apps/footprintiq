import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/secure.ts';
import { ERROR_RESPONSES, errorResponse, logSystemError } from '../_shared/errorHandler.ts';

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
            content = generateHTML(scan, findings || []);
            fileName = `scan-${scanId}-report.html`;
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
  const headers = ['Site', 'URL', 'Status', 'Confidence', 'Provider', 'NSFW', 'Timestamp'];
  const rows = findings.map(f => [
    f.site || 'Unknown',
    f.url || '',
    f.kind || '',
    f.confidence || 'unknown',
    f.provider || '',
    f.nsfw ? 'Yes' : 'No',
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

function generateHTML(scan: any, findings: any[]): string {
  const findingsHTML = findings.map((f, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(f.site || 'Unknown')}</td>
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
  <title>FootprintIQ Scan Report - ${scan.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .header h1 { margin: 0 0 10px 0; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-card h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
    .stat-card .value { font-size: 32px; font-weight: bold; color: #667eea; }
    table { width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    th { background: #f8f9fa; font-weight: 600; color: #333; }
    tr:hover { background: #f8f9fa; }
    a { color: #667eea; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .badge-success { background: #d4edda; color: #155724; }
    .badge-secondary { background: #e2e3e5; color: #383d41; }
    .badge-danger { background: #f8d7da; color: #721c24; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>FootprintIQ OSINT Scan Report</h1>
    <p>Scan ID: ${scan.id}</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
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
    <p>Generated by FootprintIQ | <a href="https://footprintiq.com">footprintiq.com</a></p>
    <p>This report is confidential and intended for authorized use only.</p>
  </div>
</body>
</html>
  `.trim();
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
