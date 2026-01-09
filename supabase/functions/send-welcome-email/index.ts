import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[WELCOME-EMAIL] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting welcome email process");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      logStep("Invalid token or user not found", { error: userError?.message });
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if email is verified
    if (!user.email_confirmed_at) {
      logStep("Email not verified yet");
      return new Response(JSON.stringify({ error: "Email not verified", skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if welcome email already sent
    const { data: existingEmail } = await supabase
      .from("email_notifications")
      .select("id")
      .eq("recipient", user.email)
      .eq("type", "welcome_verified")
      .maybeSingle();

    if (existingEmail) {
      logStep("Welcome email already sent", { existingId: existingEmail.id });
      return new Response(JSON.stringify({ message: "Already sent", skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get user's name from profile if available
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, full_name")
      .eq("id", user.id)
      .maybeSingle();

    const userName = profile?.display_name || profile?.full_name || user.email?.split('@')[0] || 'there';

    // Create email notification record first (prevents duplicates)
    const { data: notification, error: insertError } = await supabase
      .from("email_notifications")
      .insert({
        recipient: user.email,
        type: "welcome_verified",
        subject: "Welcome to FootprintIQ – You're All Set!",
        metadata: { user_id: user.id, status: "pending" },
      })
      .select()
      .single();

    if (insertError) {
      logStep("Failed to create notification record", { error: insertError.message });
      // If it's a unique constraint violation, email was already queued
      if (insertError.code === '23505') {
        return new Response(JSON.stringify({ message: "Already queued", skipped: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      throw insertError;
    }

    logStep("Created notification record", { notificationId: notification.id });

    // Build welcome email HTML
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FootprintIQ</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0f; color: #e5e5e5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header with gradient -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center; border-bottom: 2px solid #3b82f6;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
        🎉 Welcome to FootprintIQ
      </h1>
      <p style="margin: 12px 0 0 0; font-size: 16px; color: #94a3b8;">
        Your account is now fully verified
      </p>
    </div>
    
    <!-- Main content -->
    <div style="background-color: #111827; padding: 40px 30px; border-radius: 0 0 16px 16px;">
      
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; color: #d1d5db;">
        Hi ${userName},
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; color: #d1d5db;">
        Thank you for verifying your email! Your FootprintIQ account is now fully activated and ready to help you discover and protect your digital footprint.
      </p>
      
      <!-- Features section -->
      <div style="background: linear-gradient(135deg, #1e293b 0%, #1a202c 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #374151;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
          🚀 What You Can Do Now
        </h2>
        
        <div style="margin-bottom: 12px; padding-left: 8px; border-left: 3px solid #3b82f6;">
          <p style="margin: 0; font-size: 14px; color: #d1d5db;">
            <strong style="color: #60a5fa;">Username Scans</strong> – Find where your identity appears across 300+ platforms
          </p>
        </div>
        
        <div style="margin-bottom: 12px; padding-left: 8px; border-left: 3px solid #10b981;">
          <p style="margin: 0; font-size: 14px; color: #d1d5db;">
            <strong style="color: #34d399;">Email Intelligence</strong> – Discover accounts linked to your email addresses
          </p>
        </div>
        
        <div style="margin-bottom: 12px; padding-left: 8px; border-left: 3px solid #8b5cf6;">
          <p style="margin: 0; font-size: 14px; color: #d1d5db;">
            <strong style="color: #a78bfa;">Phone Lookups</strong> – Check exposure from your phone numbers
          </p>
        </div>
        
        <div style="margin-bottom: 12px; padding-left: 8px; border-left: 3px solid #f59e0b;">
          <p style="margin: 0; font-size: 14px; color: #d1d5db;">
            <strong style="color: #fbbf24;">Breach Monitoring</strong> – Get alerted when your data appears in breaches
          </p>
        </div>
        
        <div style="padding-left: 8px; border-left: 3px solid #ef4444;">
          <p style="margin: 0; font-size: 14px; color: #d1d5db;">
            <strong style="color: #f87171;">Data Broker Removal</strong> – Request removal from data broker sites
          </p>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://footprintiq.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
          Start Your First Scan →
        </a>
      </div>
      
      <!-- Pro tip -->
      <div style="background-color: #1e293b; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; font-size: 14px; color: #94a3b8;">
          <strong style="color: #60a5fa;">💡 Pro Tip:</strong> Start with a username scan to quickly discover where your identity appears online. It's the fastest way to get a complete picture of your digital footprint.
        </p>
      </div>
      
      <!-- Help section -->
      <p style="font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; color: #9ca3af;">
        Need help getting started? Check out our <a href="https://footprintiq.app/help" style="color: #60a5fa; text-decoration: none;">Help Center</a> or reply to this email – we're here to help!
      </p>
      
      <p style="font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; color: #9ca3af;">
        Stay safe,<br>
        <strong style="color: #d1d5db;">The FootprintIQ Team</strong>
      </p>
      
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 24px 20px;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
        © ${new Date().getFullYear()} FootprintIQ. All rights reserved.
      </p>
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        <a href="https://footprintiq.app/privacy" style="color: #6b7280; text-decoration: none;">Privacy Policy</a>
        &nbsp;•&nbsp;
        <a href="https://footprintiq.app/terms" style="color: #6b7280; text-decoration: none;">Terms of Service</a>
      </p>
    </div>
    
  </div>
</body>
</html>
    `;

    // Send via Resend REST API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FootprintIQ <noreply@footprintiq.app>",
        to: [user.email!],
        subject: "Welcome to FootprintIQ – You're All Set! 🎉",
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const emailResponse = await resendResponse.json();

    logStep("Email sent via Resend", { resendId: emailResponse.id });

    // Update notification with success
    await supabase
      .from("email_notifications")
      .update({
        sent_at: new Date().toISOString(),
        resend_id: emailResponse.id,
        metadata: { user_id: user.id, status: "sent" },
      })
      .eq("id", notification.id);

    logStep("Welcome email process complete");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Welcome email sent",
        emailId: emailResponse.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    logStep("Error in welcome email function", { error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
