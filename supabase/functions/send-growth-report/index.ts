import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ADMIN_EMAIL = "admin.footprintiq@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrialMetrics {
  totalTrials: number;
  activeTrials: number;
  convertedTrials: number;
  cancelledTrials: number;
  expiredTrials: number;
  conversionRate: number;
  avgScansUsed: number;
}

interface EmailMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  overallOpenRate: number;
  overallClickRate: number;
  byType: Record<string, { sent: number; delivered: number; opened: number; clicked: number }>;
}

async function getTrialMetrics(supabase: any, startDate: Date): Promise<TrialMetrics> {
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('trial_status, trial_scans_used')
    .gte('trial_started_at', startDate.toISOString());

  if (error) {
    console.error('Error fetching trial metrics:', error);
    return {
      totalTrials: 0,
      activeTrials: 0,
      convertedTrials: 0,
      cancelledTrials: 0,
      expiredTrials: 0,
      conversionRate: 0,
      avgScansUsed: 0,
    };
  }

  const trialWorkspaces = workspaces?.filter((w: any) => w.trial_status) || [];
  const totalTrials = trialWorkspaces.length;
  const activeTrials = trialWorkspaces.filter((w: any) => w.trial_status === 'active').length;
  const convertedTrials = trialWorkspaces.filter((w: any) => w.trial_status === 'converted').length;
  const cancelledTrials = trialWorkspaces.filter((w: any) => w.trial_status === 'cancelled').length;
  const expiredTrials = trialWorkspaces.filter((w: any) => w.trial_status === 'expired').length;
  
  const totalScans = trialWorkspaces.reduce((sum: number, w: any) => sum + (w.trial_scans_used || 0), 0);
  const avgScansUsed = totalTrials > 0 ? totalScans / totalTrials : 0;
  const conversionRate = totalTrials > 0 ? (convertedTrials / totalTrials) * 100 : 0;

  return {
    totalTrials,
    activeTrials,
    convertedTrials,
    cancelledTrials,
    expiredTrials,
    conversionRate,
    avgScansUsed,
  };
}

async function getEmailMetrics(supabase: any, startDate: Date): Promise<EmailMetrics> {
  const { data: emails, error } = await supabase
    .from('email_notifications')
    .select('*')
    .gte('sent_at', startDate.toISOString());

  if (error) {
    console.error('Error fetching email metrics:', error);
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalBounced: 0,
      overallOpenRate: 0,
      overallClickRate: 0,
      byType: {},
    };
  }

  const emailList = emails || [];
  const totalSent = emailList.length;
  const totalDelivered = emailList.filter((e: any) => e.delivered_at).length;
  const totalOpened = emailList.filter((e: any) => e.opened_at).length;
  const totalClicked = emailList.filter((e: any) => e.clicked_at).length;
  const totalBounced = emailList.filter((e: any) => e.bounced_at).length;

  const overallOpenRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
  const overallClickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;

  // Group by type
  const byType: Record<string, { sent: number; delivered: number; opened: number; clicked: number }> = {};
  emailList.forEach((e: any) => {
    const type = e.type || 'unknown';
    if (!byType[type]) {
      byType[type] = { sent: 0, delivered: 0, opened: 0, clicked: 0 };
    }
    byType[type].sent++;
    if (e.delivered_at) byType[type].delivered++;
    if (e.opened_at) byType[type].opened++;
    if (e.clicked_at) byType[type].clicked++;
  });

  return {
    totalSent,
    totalDelivered,
    totalOpened,
    totalClicked,
    totalBounced,
    overallOpenRate,
    overallClickRate,
    byType,
  };
}

function generateEmailHtml(trialMetrics: TrialMetrics, emailMetrics: EmailMetrics, periodLabel: string): string {
  const emailTypeRows = Object.entries(emailMetrics.byType)
    .map(([type, stats]) => {
      const openRate = stats.delivered > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(1) : '0.0';
      const clickRate = stats.delivered > 0 ? ((stats.clicked / stats.delivered) * 100).toFixed(1) : '0.0';
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${type.replace(/_/g, ' ')}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${stats.sent}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${stats.delivered}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${openRate}%</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${clickRate}%</td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>FootprintIQ Weekly Growth Report</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">📊 Weekly Growth Report</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">${periodLabel}</p>
        </div>

        <!-- Trial Conversion Section -->
        <div style="padding: 32px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
            🎯 Trial Conversion Metrics
          </h2>
          
          <!-- Conversion Rate Highlight -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Conversion Rate</div>
            <div style="color: #ffffff; font-size: 48px; font-weight: 700; margin: 8px 0;">${trialMetrics.conversionRate.toFixed(1)}%</div>
            <div style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">${trialMetrics.convertedTrials} of ${trialMetrics.totalTrials} trials converted</div>
          </div>

          <!-- Trial Stats Grid -->
          <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
            <div style="flex: 1; min-width: 140px; background-color: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
              <div style="color: #64748b; font-size: 13px;">Total Trials</div>
              <div style="color: #1f2937; font-size: 28px; font-weight: 700;">${trialMetrics.totalTrials}</div>
            </div>
            <div style="flex: 1; min-width: 140px; background-color: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
              <div style="color: #64748b; font-size: 13px;">Active</div>
              <div style="color: #0ea5e9; font-size: 28px; font-weight: 700;">${trialMetrics.activeTrials}</div>
            </div>
            <div style="flex: 1; min-width: 140px; background-color: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
              <div style="color: #64748b; font-size: 13px;">Converted</div>
              <div style="color: #10b981; font-size: 28px; font-weight: 700;">${trialMetrics.convertedTrials}</div>
            </div>
            <div style="flex: 1; min-width: 140px; background-color: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
              <div style="color: #64748b; font-size: 13px;">Cancelled</div>
              <div style="color: #ef4444; font-size: 28px; font-weight: 700;">${trialMetrics.cancelledTrials}</div>
            </div>
          </div>

          <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; border-radius: 0 8px 8px 0;">
            <strong style="color: #0369a1;">Avg Scans Used:</strong>
            <span style="color: #1f2937;"> ${trialMetrics.avgScansUsed.toFixed(1)} scans per trial</span>
          </div>
        </div>

        <!-- Email Performance Section -->
        <div style="padding: 0 32px 32px 32px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
            📧 Email Performance
          </h2>

          <!-- Overall Email Stats -->
          <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
            <div style="flex: 1; min-width: 100px; background-color: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
              <div style="color: #64748b; font-size: 12px;">Sent</div>
              <div style="color: #1f2937; font-size: 24px; font-weight: 700;">${emailMetrics.totalSent}</div>
            </div>
            <div style="flex: 1; min-width: 100px; background-color: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
              <div style="color: #64748b; font-size: 12px;">Delivered</div>
              <div style="color: #10b981; font-size: 24px; font-weight: 700;">${emailMetrics.totalDelivered}</div>
            </div>
            <div style="flex: 1; min-width: 100px; background-color: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
              <div style="color: #64748b; font-size: 12px;">Open Rate</div>
              <div style="color: #6366f1; font-size: 24px; font-weight: 700;">${emailMetrics.overallOpenRate.toFixed(1)}%</div>
            </div>
            <div style="flex: 1; min-width: 100px; background-color: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
              <div style="color: #64748b; font-size: 12px;">Click Rate</div>
              <div style="color: #8b5cf6; font-size: 24px; font-weight: 700;">${emailMetrics.overallClickRate.toFixed(1)}%</div>
            </div>
            <div style="flex: 1; min-width: 100px; background-color: ${emailMetrics.totalBounced > 0 ? '#fef2f2' : '#f8fafc'}; border-radius: 8px; padding: 16px; text-align: center;">
              <div style="color: #64748b; font-size: 12px;">Bounced</div>
              <div style="color: ${emailMetrics.totalBounced > 0 ? '#ef4444' : '#1f2937'}; font-size: 24px; font-weight: 700;">${emailMetrics.totalBounced}</div>
            </div>
          </div>

          <!-- Email Type Breakdown -->
          ${Object.keys(emailMetrics.byType).length > 0 ? `
            <h3 style="color: #374151; margin: 24px 0 16px 0; font-size: 16px;">Performance by Email Type</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 12px; text-align: left; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Type</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Sent</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Delivered</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Open %</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Click %</th>
                </tr>
              </thead>
              <tbody>
                ${emailTypeRows}
              </tbody>
            </table>
          ` : '<p style="color: #64748b; text-align: center;">No emails sent during this period.</p>'}
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #64748b; margin: 0; font-size: 14px;">
            This report was automatically generated by FootprintIQ.<br>
            <a href="https://footprintiq.io/admin" style="color: #0ea5e9; text-decoration: none;">View full dashboard →</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[growth-report] Starting weekly growth report generation");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const periodLabel = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    console.log(`[growth-report] Fetching metrics for period: ${periodLabel}`);

    // Fetch metrics
    const [trialMetrics, emailMetrics] = await Promise.all([
      getTrialMetrics(supabase, startDate),
      getEmailMetrics(supabase, startDate),
    ]);

    console.log("[growth-report] Trial metrics:", trialMetrics);
    console.log("[growth-report] Email metrics:", emailMetrics);

    // Generate email HTML
    const emailHtml = generateEmailHtml(trialMetrics, emailMetrics, periodLabel);

    // Send email
    const emailResponse = await resend.emails.send({
      from: "FootprintIQ <reports@footprintiq.io>",
      to: [ADMIN_EMAIL],
      subject: `📊 Weekly Growth Report - ${periodLabel}`,
      html: emailHtml,
    });

    console.log("[growth-report] Email sent successfully:", emailResponse);

    // Log the report to email_notifications
    await supabase.from('email_notifications').insert({
      user_id: null,
      workspace_id: null,
      type: 'growth_report',
      subject: `Weekly Growth Report - ${periodLabel}`,
      sent_at: new Date().toISOString(),
      resend_id: emailResponse.data?.id || null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        period: periodLabel,
        trialMetrics,
        emailMetrics,
        emailId: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[growth-report] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
