import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type TrialEmailType = 'trial_started' | 'trial_ending' | 'trial_converted';

interface TrialEmailRequest {
  type: TrialEmailType;
  email: string;
  trialEndsAt?: string;
  scansUsed?: number;
  scansRemaining?: number;
  workspaceId?: string;
  nextBillingDate?: string;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[send-trial-email][${timestamp}] ${step}`, details ? JSON.stringify(details) : '');
};

const getEmailContent = (type: TrialEmailType, data: TrialEmailRequest) => {
  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.6;
    color: #1f2937;
    max-width: 600px;
    margin: 0 auto;
  `;

  const headerStyles = `
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    padding: 40px 30px;
    text-align: center;
    border-radius: 12px 12px 0 0;
  `;

  const buttonStyles = `
    display: inline-block;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    margin: 20px 0;
  `;

  const footerStyles = `
    background: #f3f4f6;
    padding: 20px 30px;
    text-align: center;
    font-size: 12px;
    color: #6b7280;
    border-radius: 0 0 12px 12px;
  `;

  const trialEndDate = data.trialEndsAt 
    ? new Date(data.trialEndsAt).toLocaleDateString('en-GB', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'in 72 hours';

  switch (type) {
    case 'trial_started':
      return {
        subject: 'Welcome to Pro Preview - Your 72-Hour Access Starts Now',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="${baseStyles}">
            <div style="${headerStyles}">
              <h1 style="color: white; margin: 0; font-size: 26px;">Welcome to Pro Preview</h1>
              <p style="color: #94a3b8; margin: 10px 0 0 0;">Your 72-hour access starts now</p>
            </div>
            
            <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                You now have temporary access to FootprintIQ Pro, including deeper context, 
                confidence scoring, and linked identity analysis.
              </p>
              
              <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1e40af;">What's Included</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 8px;">Up to <strong>3 Pro scans</strong> during your preview</li>
                  <li style="margin-bottom: 8px;">Full Pro insights on all preview scans</li>
                  <li style="margin-bottom: 8px;">Context enrichment & confidence scoring</li>
                  <li style="margin-bottom: 8px;">Linked identity correlation</li>
                </ul>
              </div>
              
              <div style="background: #fefce8; border: 1px solid #fde047; padding: 15px 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-size: 14px; color: #854d0e;">
                  <strong>Trial ends:</strong> ${trialEndDate}<br>
                  <span style="font-size: 13px;">Your subscription will automatically continue unless you cancel.</span>
                </p>
              </div>
              
              <div style="text-align: center;">
                <a href="https://footprintiq.app/scan" style="${buttonStyles}">
                  Start Your First Pro Scan
                </a>
              </div>
              
              <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 30px;">
                Ethical OSINT only • Public data sources • No monitoring
              </p>
            </div>
            
            <div style="${footerStyles}">
              <p style="margin: 0;">© ${new Date().getFullYear()} FootprintIQ. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">
                <a href="https://footprintiq.app" style="color: #3b82f6; text-decoration: none;">footprintiq.app</a>
              </p>
            </div>
          </body>
          </html>
        `,
      };

    case 'trial_ending':
      const scansText = data.scansRemaining !== undefined 
        ? `You have ${data.scansRemaining} Pro scan${data.scansRemaining !== 1 ? 's' : ''} remaining.`
        : '';
      
      return {
        subject: 'Pro Preview Update - 24 Hours Remaining',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="${baseStyles}">
            <div style="${headerStyles}">
              <h1 style="color: white; margin: 0; font-size: 26px;">24 Hours Remaining</h1>
              <p style="color: #94a3b8; margin: 10px 0 0 0;">Your Pro Preview update</p>
            </div>
            
            <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Just a friendly heads-up: your Pro Preview ends tomorrow.
              </p>
              
              ${scansText ? `<p style="font-size: 15px; color: #374151; margin-bottom: 20px;">${scansText}</p>` : ''}
              
              <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 10px 0; color: #166534;">What happens next</h3>
                <p style="margin: 0; color: #374151;">
                  Your subscription will automatically continue to Pro unless you cancel. 
                  <strong>No action needed</strong> if you want to keep Pro access.
                </p>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin: 20px 0;">
                Want to cancel? You can do so anytime from your billing settings.
              </p>
              
              <div style="text-align: center;">
                <a href="https://footprintiq.app/settings/billing" style="${buttonStyles}">
                  Manage Your Preview
                </a>
              </div>
            </div>
            
            <div style="${footerStyles}">
              <p style="margin: 0;">© ${new Date().getFullYear()} FootprintIQ. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">
                <a href="https://footprintiq.app" style="color: #3b82f6; text-decoration: none;">footprintiq.app</a>
              </p>
            </div>
          </body>
          </html>
        `,
      };

    case 'trial_converted':
      return {
        subject: 'Welcome to FootprintIQ Pro',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="${baseStyles}">
            <div style="${headerStyles}">
              <h1 style="color: white; margin: 0; font-size: 26px;">Welcome to Pro</h1>
              <p style="color: #94a3b8; margin: 10px 0 0 0;">Your subscription is now active</p>
            </div>
            
            <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Congratulations! Your Pro Preview has been converted to a full Pro subscription.
              </p>
              
              <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1e40af;">What's Unlocked</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 8px;">Unlimited Pro scans</li>
                  <li style="margin-bottom: 8px;">Full context enrichment on all findings</li>
                  <li style="margin-bottom: 8px;">Advanced confidence scoring</li>
                  <li style="margin-bottom: 8px;">Linked identity analysis</li>
                  <li style="margin-bottom: 8px;">Priority support</li>
                </ul>
              </div>
              
              ${data.nextBillingDate ? `
                <p style="font-size: 14px; color: #6b7280; margin: 20px 0;">
                  <strong>Next billing date:</strong> ${new Date(data.nextBillingDate).toLocaleDateString('en-GB', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="https://footprintiq.app/scan" style="${buttonStyles}">
                  Explore Pro Features
                </a>
              </div>
              
              <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 30px;">
                Manage your subscription anytime at 
                <a href="https://footprintiq.app/settings/billing" style="color: #3b82f6;">footprintiq.app/settings/billing</a>
              </p>
            </div>
            
            <div style="${footerStyles}">
              <p style="margin: 0;">© ${new Date().getFullYear()} FootprintIQ. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">
                <a href="https://footprintiq.app" style="color: #3b82f6; text-decoration: none;">footprintiq.app</a>
              </p>
            </div>
          </body>
          </html>
        `,
      };

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: TrialEmailRequest = await req.json();
    
    logStep('Processing trial email', { type: data.type, email: data.email });

    if (!data.type || !data.email) {
      logStep('ERROR: Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing type or email' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check for duplicate emails (prevent spam)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if we sent this email type in the last 24 hours
    const { data: recentEmail } = await supabase
      .from('email_notifications')
      .select('id')
      .eq('recipient', data.email)
      .eq('notification_type', data.type)
      .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (recentEmail) {
      logStep('Duplicate email prevented', { type: data.type, email: data.email });
      return new Response(JSON.stringify({ success: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { subject, html } = getEmailContent(data.type, data);

    const emailResponse = await resend.emails.send({
      from: "FootprintIQ <noreply@footprintiq.app>",
      to: [data.email],
      subject,
      html,
    });

    const resendId = (emailResponse as any)?.data?.id || (emailResponse as any)?.id || null;
    logStep('Email sent successfully', { type: data.type, resendId });

    // Log the email with resend_id for webhook tracking
    await supabase.from('email_notifications').insert({
      recipient: data.email,
      type: data.type,
      subject,
      resend_id: resendId,
      metadata: {
        workspace_id: data.workspaceId,
        trial_ends_at: data.trialEndsAt,
        scans_used: data.scansUsed,
      },
    });

    return new Response(JSON.stringify({ success: true, resendId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    logStep('ERROR: Failed to send email', { error: error.message });
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
