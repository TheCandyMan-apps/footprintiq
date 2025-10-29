import { supabase } from '@/integrations/supabase/client';

export interface EnhancedReportOptions {
  caseId?: string;
  entityIds?: string[];
  templateId?: string;
  reportType: 'executive' | 'technical' | 'compliance' | 'custom';
  includeTimeline?: boolean;
  includeGraph?: boolean;
  includeForecast?: boolean;
  clientId?: string;
  branding?: {
    logo?: string;
    companyName?: string;
    signatureBlock?: string;
  };
}

export async function generateEnhancedReport(options: EnhancedReportOptions) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: options,
    });

    if (error) throw error;

    return {
      success: true,
      report: data.report,
      hashManifest: data.hashManifest,
      processingTime: data.processingTime,
    };
  } catch (error) {
    console.error('Error generating enhanced report:', error);
    throw error;
  }
}

export async function scheduleReport(
  reportConfig: EnhancedReportOptions,
  schedule: string,
  clientId: string
) {
  try {
    const { data, error } = await supabase
      .from('client_reports')
      .insert({
        client_id: clientId,
        report_type: reportConfig.reportType,
        title: `Scheduled ${reportConfig.reportType} Report`,
        content: reportConfig as any,
        schedule,
        next_generation_at: calculateNextRun(schedule),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error scheduling report:', error);
    throw error;
  }
}

function calculateNextRun(schedule: string): string {
  const now = new Date();
  
  if (schedule === 'weekly') {
    now.setDate(now.getDate() + 7);
  } else if (schedule === 'monthly') {
    now.setMonth(now.getMonth() + 1);
  } else if (schedule === 'daily') {
    now.setDate(now.getDate() + 1);
  }
  
  return now.toISOString();
}

export async function downloadReportPDF(reportId: string) {
  try {
    // Fetch the report
    const { data: report } = await supabase
      .from('client_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (!report) throw new Error('Report not found');

    // Generate PDF (simplified - would use jsPDF in practice)
    const htmlContent = generateReportHTML(report);
    
    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title}-${report.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
}

function generateReportHTML(report: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${report.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .footer {
      border-top: 1px solid #ccc;
      padding-top: 20px;
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .hash {
      font-family: monospace;
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${report.title}</h1>
    <p>Report Type: ${report.report_type}</p>
    <p>Generated: ${new Date(report.created_at).toLocaleString()}</p>
  </div>
  
  <div class="section">
    <h2>Executive Summary</h2>
    <p>${report.content?.executiveSummary || 'No summary available'}</p>
  </div>
  
  <div class="section">
    <h2>Statistics</h2>
    <ul>
      <li>Total Findings: ${report.content?.statistics?.totalFindings || 0}</li>
      <li>Critical Findings: ${report.content?.statistics?.criticalFindings || 0}</li>
      <li>Entities Analyzed: ${report.content?.statistics?.entitiesAnalyzed || 0}</li>
      <li>Timeline Events: ${report.content?.statistics?.timelineEvents || 0}</li>
    </ul>
  </div>
  
  ${report.content?.findings ? `
  <div class="section">
    <h2>Key Findings</h2>
    ${report.content.findings.slice(0, 10).map((f: any) => `
      <div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid ${
        f.severity === 'critical' ? '#ef4444' : 
        f.severity === 'high' ? '#f97316' : '#3b82f6'
      };">
        <strong>${f.title}</strong>
        <p>${f.description || ''}</p>
        <small>Severity: ${f.severity}</small>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  <div class="footer">
    <p><strong>Document Integrity Hash:</strong></p>
    <div class="hash">${report.hash_manifest || 'N/A'}</div>
    <p style="margin-top: 20px;">
      Generated by FootprintIQ Intelligence Platform<br>
      This report is confidential and intended for authorized recipients only.
    </p>
  </div>
</body>
</html>
  `.trim();
}