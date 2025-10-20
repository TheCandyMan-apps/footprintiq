import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MonitoringAlertRequest {
  email: string;
  scanId: string;
  newFindings: any[];
  removedFindings: any[];
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, scanId, newFindings, removedFindings, userName }: MonitoringAlertRequest = await req.json();

    console.log('Sending monitoring alert to:', email);
    console.log('New findings:', newFindings.length);
    console.log('Removed findings:', removedFindings.length);

    const origin = req.headers.get("origin") || "https://footprintiq.com";
    const findingsHtml = newFindings.map(f => 
      `<li><strong>${f.name}</strong> - ${f.category} (Risk: ${f.risk_level})</li>`
    ).join('');

    const removedHtml = removedFindings.length > 0 
      ? `<h3 style="color: #16a34a; margin-top: 20px;">✓ Improvements Detected</h3>
         <p><strong>${removedFindings.length} data source(s) removed:</strong></p>
         <ul>${removedFindings.map(f => `<li>${f.name}</li>`).join('')}</ul>`
      : '';

    const emailResponse = await resend.emails.send({
      from: "FootprintIQ Alerts <alerts@resend.dev>",
      to: [email],
      subject: `🔔 Privacy Alert: ${newFindings.length} New Exposure${newFindings.length > 1 ? 's' : ''} Detected`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">🛡️ FootprintIQ</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Monitoring Alert</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              ${userName ? `<p>Hi ${userName},</p>` : '<p>Hello,</p>'}
              
              <p style="font-size: 16px; color: #dc2626; font-weight: 600;">
                Your scheduled scan has detected <strong>${newFindings.length} new data exposure${newFindings.length > 1 ? 's' : ''}</strong>.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="color: #dc2626; margin-top: 0;">⚠️ New Exposures Found</h3>
                <ul style="padding-left: 20px;">${findingsHtml}</ul>
              </div>
              
              ${removedHtml ? `<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">${removedHtml}</div>` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${origin}/results/${scanId}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View Full Report →
                </a>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #6b7280;">
                <p><strong>Next Steps:</strong></p>
                <ul style="padding-left: 20px;">
                  <li>Review the full report to understand the impact</li>
                  <li>Take action to remove high-risk exposures</li>
                  <li>Update your privacy settings where needed</li>
                </ul>
                
                <p style="margin-top: 20px;">
                  This is an automated alert from your FootprintIQ monitoring schedule. 
                  You can manage your monitoring settings in your dashboard.
                </p>
                
                <p style="margin-top: 20px; color: #9ca3af;">
                  Best regards,<br>
                  <strong>The FootprintIQ Team</strong>
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
              <p>© 2025 FootprintIQ. Protecting your digital privacy.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Monitoring alert sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending monitoring alert:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
