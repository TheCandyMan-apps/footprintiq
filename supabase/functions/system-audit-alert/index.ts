import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { failureRate } = await req.json();

    console.log(`Sending admin alert for ${failureRate}% failure rate`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "FootprintIQ System Audit <onboarding@resend.dev>",
        to: ["admin@footprintiq.app"],
        subject: `⚠️ System Audit Alert: ${failureRate.toFixed(1)}% Failure Rate`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .alert-box { 
                background: #fee; 
                border-left: 4px solid #c00; 
                padding: 15px; 
                margin: 20px 0; 
              }
              .metrics { 
                background: #f5f5f5; 
                padding: 15px; 
                border-radius: 8px; 
                margin: 20px 0; 
              }
              .metric-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 8px 0; 
                border-bottom: 1px solid #ddd; 
              }
              .cta { 
                background: #007bff; 
                color: white; 
                padding: 12px 24px; 
                text-decoration: none; 
                border-radius: 5px; 
                display: inline-block; 
                margin-top: 20px; 
              }
              .footer { 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #ddd; 
                font-size: 12px; 
                color: #666; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 style="color: #c00;">⚠️ System Audit Alert</h1>
              
              <div class="alert-box">
                <h2 style="margin: 0 0 10px 0; color: #c00;">High Failure Rate Detected</h2>
                <p style="margin: 0; font-size: 18px;">
                  System audit has detected a failure rate of <strong>${failureRate.toFixed(1)}%</strong>, 
                  which exceeds the 2% threshold for premium launch confidence.
                </p>
              </div>

              <div class="metrics">
                <h3 style="margin-top: 0;">System Health Metrics</h3>
                <div class="metric-row">
                  <span>Failure Rate:</span>
                  <strong style="color: #c00;">${failureRate.toFixed(1)}%</strong>
                </div>
                <div class="metric-row">
                  <span>Threshold:</span>
                  <strong>2.0%</strong>
                </div>
                <div class="metric-row">
                  <span>Status:</span>
                  <strong style="color: #c00;">⚠️ Requires Attention</strong>
                </div>
                <div class="metric-row">
                  <span>Alert Time:</span>
                  <strong>${new Date().toLocaleString()}</strong>
                </div>
              </div>

              <h3>Recommended Actions</h3>
              <ol>
                <li>Review system audit dashboard for detailed failure analysis</li>
                <li>Check RLS policies for security vulnerabilities</li>
                <li>Verify provider health (Maigret, SpiderFoot, Stripe)</li>
                <li>Audit tier/credit synchronization</li>
                <li>Test critical scan flows</li>
              </ol>

              <a href="https://footprintiq.app/admin/system-audit" class="cta">
                View System Audit Dashboard
              </a>

              <div class="footer">
                <p>This is an automated alert from FootprintIQ System Audit.</p>
                <p>Do not reply to this email.</p>
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

    const emailData = await emailResponse.json();
    console.log("Admin alert sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Failed to send admin alert:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Alert failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
