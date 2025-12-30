import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationEmailRequest {
  email?: string; // Optional - will use the authenticated user's email if not provided
}

const logStep = (step: string, details?: any) => {
  console.log(`[send-verification-email] ${step}`, details ? JSON.stringify(details) : '');
};

// Simple in-memory rate limiting (per function instance)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60000; // 60 seconds

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

    // Get authenticated user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    logStep('Authenticated user', { userId: user.id, email: user.email });

    // Check if already verified
    if (user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email already verified',
          alreadyVerified: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const userEmail = user.email;
    if (!userEmail) {
      throw new Error('No email associated with account');
    }

    // Rate limiting check
    const lastSent = rateLimitMap.get(userEmail);
    const now = Date.now();
    if (lastSent && (now - lastSent) < RATE_LIMIT_WINDOW_MS) {
      const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastSent)) / 1000);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Please wait ${waitSeconds} seconds before requesting another email`,
          retryAfter: waitSeconds
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Update rate limit
    rateLimitMap.set(userEmail, now);

    logStep('Generating verification link', { email: userEmail });

    // Generate email verification link using magiclink type
    // This will verify the email when clicked
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
      options: {
        redirectTo: 'https://footprintiq.app/dashboard',
      },
    });

    if (linkError) {
      logStep('Error generating link', { error: linkError.message });
      throw new Error(`Failed to generate verification link: ${linkError.message}`);
    }

    const verificationLink = linkData?.properties?.action_link;
    if (!verificationLink) {
      throw new Error('Failed to generate verification link');
    }

    logStep('Verification link generated', { hasLink: true });

    // Send email via Resend
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">FootprintIQ</h1>
          <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Digital Intelligence Platform</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email Address</h2>
          <p>Thanks for signing up for FootprintIQ! Please verify your email address to unlock full access to your scan results.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">This link will expire in 24 hours. If you didn't create an account with FootprintIQ, you can safely ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationLink}" style="color: #3b82f6; word-break: break-all;">${verificationLink}</a>
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e2e8f0; border-top: none;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} FootprintIQ. All rights reserved.<br>
            <a href="https://footprintiq.app" style="color: #64748b;">footprintiq.app</a>
          </p>
        </div>
      </body>
      </html>
    `;

    logStep('Sending verification email via Resend', { to: userEmail });

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FootprintIQ <noreply@footprintiq.app>',
        to: [userEmail],
        subject: 'Verify Your FootprintIQ Email',
        html: htmlContent,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      logStep('Resend API error', { status: resendResponse.status, error: errorText });
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const resendResult = await resendResponse.json();
    logStep('Verification email sent successfully', { emailId: resendResult.id });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification email sent',
        emailId: resendResult.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('Error', { message: errorMessage });

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
