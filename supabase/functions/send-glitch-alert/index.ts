import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertPayload {
  auditRun: {
    id: string;
    success_rate: number;
    failed: number;
    total_tests: number;
    created_at: string;
  };
  analysis: {
    patterns?: Array<{ description: string; severity: string }>;
    anomalies?: Array<{ description: string; impact: string }>;
    fixes?: Array<{ description: string; steps: string[] }>;
    priority_issues?: Array<{ description: string; severity: string }>;
    risk_assessment?: string;
    raw_analysis?: string;
  };
  failureRate: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AlertPayload = await req.json();
    const { auditRun, analysis, failureRate } = payload;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);

    console.log('[Glitch Alert] Sending alert email...');

    // Format analysis for email
    const formatAnalysis = (analysis: AlertPayload['analysis']) => {
      if (!analysis) return '<p>No AI analysis available</p>';

      let html = '';

      if (analysis.risk_assessment) {
        const riskColor = analysis.risk_assessment === 'critical' ? '#ef4444' 
          : analysis.risk_assessment === 'high' ? '#f59e0b'
          : analysis.risk_assessment === 'medium' ? '#eab308'
          : '#22c55e';
        
        html += `<div style="background: ${riskColor}20; border-left: 4px solid ${riskColor}; padding: 16px; margin: 16px 0;">
          <strong>Risk Assessment: ${analysis.risk_assessment.toUpperCase()}</strong>
        </div>`;
      }

      if (analysis.priority_issues && analysis.priority_issues.length > 0) {
        html += '<h3>🚨 Priority Issues</h3><ul>';
        analysis.priority_issues.forEach(issue => {
          html += `<li><strong>${issue.description}</strong> (${issue.severity})</li>`;
        });
        html += '</ul>';
      }

      if (analysis.patterns && analysis.patterns.length > 0) {
        html += '<h3>📊 Detected Patterns</h3><ul>';
        analysis.patterns.forEach(pattern => {
          html += `<li>${pattern.description} - <em>${pattern.severity}</em></li>`;
        });
        html += '</ul>';
      }

      if (analysis.anomalies && analysis.anomalies.length > 0) {
        html += '<h3>⚠️ Anomalies</h3><ul>';
        analysis.anomalies.forEach(anomaly => {
          html += `<li>${anomaly.description} - Impact: ${anomaly.impact}</li>`;
        });
        html += '</ul>';
      }

      if (analysis.fixes && analysis.fixes.length > 0) {
        html += '<h3>🔧 Suggested Fixes</h3>';
        analysis.fixes.forEach((fix, idx) => {
          html += `<div style="margin: 16px 0;">
            <strong>${idx + 1}. ${fix.description}</strong>
            ${fix.steps ? `<ol>${fix.steps.map(step => `<li>${step}</li>`).join('')}</ol>` : ''}
          </div>`;
        });
      }

      if (analysis.raw_analysis && !analysis.patterns && !analysis.anomalies) {
        html += `<div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <pre style="white-space: pre-wrap; font-size: 13px;">${analysis.raw_analysis}</pre>
        </div>`;
      }

      return html;
    };

    const emailResponse = await resend.emails.send({
      from: "FootprintIQ Alerts <alerts@footprintiq.app>",
      to: ["admin@footprintiq.app"],
      subject: `🚨 Glitch Alert: ${failureRate.toFixed(1)}% Failure Rate Detected`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0; }
            .stat-card { background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
            .stat-value { font-size: 24px; font-weight: bold; color: #111827; }
            .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; color: #6b7280; font-size: 14px; }
            h3 { color: #111827; margin-top: 24px; }
            ul, ol { margin: 8px 0; padding-left: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">⚠️ System Glitch Detected</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">AI-powered analysis has identified issues requiring attention</p>
            </div>
            <div class="content">
              <p><strong>Alert Triggered:</strong> ${new Date(auditRun.created_at).toLocaleString()}</p>
              
              <div class="stats">
                <div class="stat-card" style="border-left-color: ${auditRun.success_rate >= 95 ? '#22c55e' : '#ef4444'};">
                  <div class="stat-label">Success Rate</div>
                  <div class="stat-value">${auditRun.success_rate.toFixed(1)}%</div>
                </div>
                <div class="stat-card" style="border-left-color: #f59e0b;">
                  <div class="stat-label">Failure Rate</div>
                  <div class="stat-value">${failureRate.toFixed(1)}%</div>
                </div>
                <div class="stat-card" style="border-left-color: #ef4444;">
                  <div class="stat-label">Failed Tests</div>
                  <div class="stat-value">${auditRun.failed}</div>
                </div>
                <div class="stat-card" style="border-left-color: #3b82f6;">
                  <div class="stat-label">Total Tests</div>
                  <div class="stat-value">${auditRun.total_tests}</div>
                </div>
              </div>

              <h2 style="color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">🤖 AI Analysis (Grok)</h2>
              ${formatAnalysis(analysis)}

              <div style="margin-top: 32px; padding: 16px; background: #eff6ff; border-radius: 8px;">
                <strong>📋 Audit ID:</strong> <code>${auditRun.id}</code>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated alert from FootprintIQ's Glitch Detection System</p>
              <p>View full audit details in the admin dashboard</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('[Glitch Alert] Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error('[Glitch Alert] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
