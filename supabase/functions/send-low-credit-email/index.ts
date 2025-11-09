import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  to: string;
  credits: number;
  workspaceId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { to, credits, workspaceId }: EmailPayload = await req.json();

    // Check when last email was sent to avoid spam
    const { data: lastEmail } = await supabase
      .from('email_notifications')
      .select('sent_at')
      .eq('workspace_id', workspaceId)
      .eq('type', 'low_credits')
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    if (lastEmail) {
      const hoursSinceLastEmail = (Date.now() - new Date(lastEmail.sent_at).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastEmail < 24) {
        return new Response(
          JSON.stringify({ message: "Email already sent in last 24 hours" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "FootprintIQ <noreply@footprintiq.app>",
        to: [to],
        subject: "⚠️ Low Credits Alert – Top Up Now!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
                .credits-warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                .pack { background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
                .pack-title { font-weight: 600; font-size: 18px; margin-bottom: 5px; }
                .pack-price { color: #667eea; font-size: 24px; font-weight: 700; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">⚠️ Low Credits Alert</h1>
                </div>
                <div class="content">
                  <p>Hi there,</p>
                  
                  <div class="credits-warning">
                    <strong>You have ${credits} credits remaining.</strong>
                  </div>
                  
                  <p>Don't let your OSINT investigations slow down! Top up now and keep accessing premium features including:</p>
                  
                  <ul>
                    <li>🔍 Advanced Maigret username scanning</li>
                    <li>🌐 Dark web monitoring</li>
                    <li>🤖 AI-powered analysis</li>
                    <li>📊 Premium OSINT data sources</li>
                  </ul>

                  <h3>Top Up Options:</h3>

                  <div class="pack">
                    <div class="pack-title">🚀 OSINT Starter</div>
                    <div class="pack-price">$9</div>
                    <p style="margin: 5px 0; color: #6b7280;">500 credits • Perfect for regular users</p>
                  </div>

                  <div class="pack">
                    <div class="pack-title">⚡ Pro Pack</div>
                    <div class="pack-price">$29</div>
                    <p style="margin: 5px 0; color: #6b7280;">2,000 credits • Best value • ~138 advanced scans</p>
                  </div>

                  <center>
                    <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/settings/billing" class="cta-button">
                      Buy Credits Now →
                    </a>
                  </center>

                  <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                    Or upgrade to <strong>Pro ($15/mo)</strong> or <strong>Enterprise ($299/mo)</strong> for unlimited scans!
                  </p>
                </div>
                <div class="footer">
                  <p>FootprintIQ - Professional OSINT Platform</p>
                  <p>This email was sent because your credit balance is running low.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    // Log email notification
    await supabase.from('email_notifications').insert({
      workspace_id: workspaceId,
      type: 'low_credits',
      recipient: to,
      sent_at: new Date().toISOString(),
      metadata: { credits },
    });

    return new Response(
      JSON.stringify({ success: true, message: "Low credit email sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error sending low credit email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
