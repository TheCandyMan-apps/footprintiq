import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthEmailRequest {
  type: 'password_reset' | 'welcome' | 'verification';
  email: string;
  redirectUrl?: string;
}

const logStep = (step: string, details?: any) => {
  console.log(`[send-auth-email] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin caller
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const body: AuthEmailRequest = await req.json();
    const { type, email, redirectUrl } = body;

    logStep('Processing auth email request', { type, email, adminId: user.id });

    let subject: string;
    let htmlContent: string;

    const baseUrl = redirectUrl || 'https://footprintiq.app';

    switch (type) {
      case 'password_reset':
        // Generate a password reset link using Supabase Admin API
        const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: `${baseUrl}/auth/reset-password`,
          },
        });

        if (resetError) {
          logStep('Error generating reset link', { error: resetError.message });
          throw new Error(`Failed to generate reset link: ${resetError.message}`);
        }

        const resetLink = resetData?.properties?.action_link;
        logStep('Generated reset link', { hasLink: !!resetLink });

        subject = 'Reset Your FootprintIQ Password';
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">FootprintIQ</h1>
              <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Digital Intelligence Platform</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
              <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
              <p>We received a request to reset the password for your FootprintIQ account.</p>
              <p>Click the button below to reset your password. This link will expire in 24 hours.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetLink}" style="color: #3b82f6; word-break: break-all;">${resetLink}</a>
              </p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e2e8f0; border-top: none;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} FootprintIQ. All rights reserved.<br>
                <a href="${baseUrl}" style="color: #64748b;">footprintiq.app</a>
              </p>
            </div>
          </body>
          </html>
        `;
        break;

      case 'welcome':
        subject = 'Welcome to FootprintIQ';
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to FootprintIQ</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">FootprintIQ</h1>
              <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Digital Intelligence Platform</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
              <h2 style="color: #1e293b; margin-top: 0;">Welcome to FootprintIQ!</h2>
              <p>Your account has been successfully created. You now have access to our comprehensive digital footprint analysis platform.</p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0; font-size: 16px;">What you can do:</h3>
                <ul style="color: #475569; margin: 0; padding-left: 20px;">
                  <li>Run username, email, and phone scans</li>
                  <li>Discover your digital footprint</li>
                  <li>Get AI-powered intelligence reports</li>
                  <li>Monitor for data breaches</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/dashboard" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Go to Dashboard
                </a>
              </div>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e2e8f0; border-top: none;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} FootprintIQ. All rights reserved.<br>
                <a href="${baseUrl}" style="color: #64748b;">footprintiq.app</a>
              </p>
            </div>
          </body>
          </html>
        `;
        break;

      case 'verification':
        // Generate a magic link for email verification
        const { data: verifyData, error: verifyError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${baseUrl}/dashboard`,
          },
        });

        if (verifyError) {
          throw new Error(`Failed to generate verification link: ${verifyError.message}`);
        }

        const verifyLink = verifyData?.properties?.action_link;

        subject = 'Verify Your FootprintIQ Email';
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">FootprintIQ</h1>
              <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Digital Intelligence Platform</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
              <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email</h2>
              <p>Please verify your email address to complete your FootprintIQ registration.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyLink}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Verify Email
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px;">This link will expire in 24 hours.</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e2e8f0; border-top: none;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} FootprintIQ. All rights reserved.<br>
                <a href="${baseUrl}" style="color: #64748b;">footprintiq.app</a>
              </p>
            </div>
          </body>
          </html>
        `;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send email via Resend
    logStep('Sending email via Resend', { to: email, subject });

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FootprintIQ <noreply@footprintiq.app>',
        to: [email],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      logStep('Resend API error', { status: resendResponse.status, error: errorText });
      throw new Error(`Resend API error: ${errorText}`);
    }

    const resendResult = await resendResponse.json();
    logStep('Email sent successfully', { resendId: resendResult.id });

    return new Response(
      JSON.stringify({
        success: true,
        message: `${type} email sent successfully`,
        emailId: resendResult.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('Error', { message: errorMessage });

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
