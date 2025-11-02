import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface AlertPayload {
  subscriptionId: string;
  findingId: string;
  keyword: string;
  severity: string;
  url: string;
  title: string;
  snippet: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');

  try {
    if (!RESEND_API_KEY) {
      console.error('[darkweb-alert] RESEND_API_KEY not configured');
      return bad(500, 'email_service_not_configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { subscriptionId, findingId, keyword, severity, url, title, snippet }: AlertPayload = await req.json();

    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('darkweb_subscriptions')
      .select('alert_email, workspace_id, user_id')
      .eq('id', subscriptionId)
      .eq('is_active', true)
      .single();

    if (subError || !subscription) {
      console.error('[darkweb-alert] Subscription not found:', subscriptionId);
      return bad(404, 'subscription_not_found');
    }

    // Check severity threshold
    const severityLevels: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    const { data: subDetails } = await supabase
      .from('darkweb_subscriptions')
      .select('severity_threshold')
      .eq('id', subscriptionId)
      .single();

    const threshold = severityLevels[subDetails?.severity_threshold || 'medium'] || 2;
    const currentSeverity = severityLevels[severity.toLowerCase()] || 1;

    if (currentSeverity < threshold) {
      console.log('[darkweb-alert] Severity below threshold, skipping alert');
      return ok({ skipped: true, reason: 'below_threshold' });
    }

    // Send email via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
          .content { background: #f7fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: 600; text-transform: uppercase; font-size: 12px; }
          .severity-critical { background: #fc8181; color: #742a2a; }
          .severity-high { background: #f6ad55; color: #7c2d12; }
          .severity-medium { background: #fbd38d; color: #744210; }
          .severity-low { background: #9ae6b4; color: #22543d; }
          .finding-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #718096; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🚨 Dark Web Alert</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">New finding matching your keyword: "${keyword}"</p>
          </div>
          <div class="content">
            <div class="alert-badge severity-${severity.toLowerCase()}">${severity} Severity</div>
            
            <div class="finding-box">
              <h2 style="margin-top: 0; color: #2d3748;">${title}</h2>
              <p style="color: #4a5568;"><strong>Source:</strong> ${url}</p>
              <p style="color: #4a5568;"><strong>Keyword:</strong> ${keyword}</p>
              ${snippet ? `<p style="background: #edf2f7; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 14px;">${snippet.substring(0, 200)}${snippet.length > 200 ? '...' : ''}</p>` : ''}
            </div>

            <h3 style="color: #2d3748;">⚠️ Recommended Actions:</h3>
            <ul style="color: #4a5568;">
              <li>Verify if this data relates to your organization</li>
              <li>Check for credential exposure or sensitive data</li>
              <li>Rotate any compromised credentials immediately</li>
              <li>Enable multi-factor authentication where applicable</li>
              <li>Monitor for unauthorized access attempts</li>
            </ul>

            <a href="${Deno.env.get('SUPABASE_URL')?.replace('//', '//app.')}/dark-web-monitoring" class="cta-button">View Full Report →</a>
          </div>
          <div class="footer">
            <p>This alert was sent because you subscribed to dark web monitoring for "${keyword}"</p>
            <p style="font-size: 12px; color: #a0aec0;">FootprintIQ • Powered by Advanced OSINT Intelligence</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FootprintIQ Alerts <alerts@footprintiq.app>',
        to: subscription.alert_email,
        subject: `🚨 Dark Web Alert: "${keyword}" - ${severity} Severity`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('[darkweb-alert] Resend error:', emailResponse.status, errorText);
      return bad(500, `email_send_failed: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log('[darkweb-alert] Email sent:', emailResult);

    // Record alert history
    await supabase.from('darkweb_alert_history').insert({
      subscription_id: subscriptionId,
      finding_id: findingId,
      alert_sent_to: subscription.alert_email,
      severity: severity,
      finding_summary: `${title} - ${snippet?.substring(0, 100)}`,
    });

    // Update last_alerted_at
    await supabase
      .from('darkweb_subscriptions')
      .update({ last_alerted_at: new Date().toISOString() })
      .eq('id', subscriptionId);

    return ok({ 
      sent: true, 
      email_id: emailResult.id,
      recipient: subscription.alert_email 
    });

  } catch (error) {
    console.error('[darkweb-alert] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'unknown_error');
  }
});