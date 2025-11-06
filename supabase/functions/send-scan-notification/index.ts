import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { Resend } from 'https://esm.sh/resend@2.0.0';
import { corsHeaders, ok, bad } from '../_shared/secure.ts';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface NotificationRequest {
  userId: string;
  scanId: string;
  scheduledScanId: string;
  targetValue: string;
  newFindingsCount: number;
  totalFindingsCount: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');

  try {
    const { userId, scanId, scheduledScanId, targetValue, newFindingsCount, totalFindingsCount }: NotificationRequest = await req.json();

    console.log(`[send-scan-notification] Sending notification to user ${userId} for scan ${scanId}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !user?.email) {
      console.error('[send-scan-notification] Error fetching user:', userError);
      return bad(404, 'User not found');
    }

    // Get scheduled scan details
    const { data: scheduledScan } = await supabase
      .from('scheduled_scans')
      .select('scan_type, frequency')
      .eq('id', scheduledScanId)
      .single();

    const scanTypeLabel = scheduledScan?.scan_type || 'target';
    const frequencyLabel = scheduledScan?.frequency || 'scheduled';

    // Send email
    const emailResponse = await resend.emails.send({
      from: 'FootprintIQ <notifications@footprintiq.com>',
      to: [user.email],
      subject: `🔍 New Findings Detected in Your ${frequencyLabel.charAt(0).toUpperCase() + frequencyLabel.slice(1)} Scan`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 32px 24px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .content {
                padding: 32px 24px;
              }
              .alert-box {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 16px;
                margin: 24px 0;
                border-radius: 4px;
              }
              .alert-box strong {
                color: #92400e;
                display: block;
                margin-bottom: 8px;
                font-size: 18px;
              }
              .stats {
                display: flex;
                gap: 16px;
                margin: 24px 0;
              }
              .stat-card {
                flex: 1;
                background: #f9fafb;
                border-radius: 8px;
                padding: 16px;
                text-align: center;
              }
              .stat-number {
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
              }
              .stat-label {
                font-size: 14px;
                color: #6b7280;
                margin-top: 4px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                margin: 24px 0;
                text-align: center;
              }
              .footer {
                background: #f9fafb;
                padding: 24px;
                text-align: center;
                font-size: 14px;
                color: #6b7280;
              }
              .scan-details {
                background: #f3f4f6;
                padding: 16px;
                border-radius: 6px;
                margin: 16px 0;
              }
              .scan-details p {
                margin: 8px 0;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔍 New Findings Detected</h1>
              </div>
              
              <div class="content">
                <div class="alert-box">
                  <strong>Alert: New Digital Footprint Detected</strong>
                  <p>Your ${frequencyLabel} scan has discovered new findings that may require your attention.</p>
                </div>

                <div class="scan-details">
                  <p><strong>Target:</strong> ${targetValue}</p>
                  <p><strong>Scan Type:</strong> ${scanTypeLabel}</p>
                  <p><strong>Frequency:</strong> ${frequencyLabel}</p>
                </div>

                <div class="stats">
                  <div class="stat-card">
                    <div class="stat-number">${newFindingsCount}</div>
                    <div class="stat-label">New Findings</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">${totalFindingsCount}</div>
                    <div class="stat-label">Total Findings</div>
                  </div>
                </div>

                <p>We've detected ${newFindingsCount} new ${newFindingsCount === 1 ? 'source' : 'sources'} containing your information since the last scan. Click below to review the findings and take action to protect your privacy.</p>

                <center>
                  <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/results/${scanId}" class="button">
                    View Detailed Results →
                  </a>
                </center>

                <h3 style="margin-top: 32px;">What Should You Do?</h3>
                <ul style="color: #4b5563; font-size: 14px;">
                  <li>Review the new findings to understand the scope of exposure</li>
                  <li>Take action to remove your information from high-risk sources</li>
                  <li>Update your privacy settings on platforms where you were found</li>
                  <li>Consider enabling stronger security measures</li>
                </ul>
              </div>

              <div class="footer">
                <p>This is an automated notification from your scheduled ${frequencyLabel} scan.</p>
                <p>To manage your scheduled scans or update notification preferences, visit your <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/dashboard" style="color: #667eea;">dashboard</a>.</p>
                <p style="margin-top: 16px; font-size: 12px;">© ${new Date().getFullYear()} FootprintIQ. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('[send-scan-notification] Email sent successfully:', emailResponse);

    return ok({
      message: 'Notification sent successfully',
      emailId: emailResponse.data?.id
    });

  } catch (error) {
    console.error('[send-scan-notification] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
