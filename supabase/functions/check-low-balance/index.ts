import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return new Response(
        JSON.stringify({ error: "Workspace ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking low balance for workspace: ${workspaceId}`);

    // Get alert settings
    const { data: settings, error: settingsError } = await supabase
      .from("credit_alert_settings")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    if (settingsError || !settings || !settings.enabled) {
      console.log("No alert settings or alerts disabled");
      return new Response(
        JSON.stringify({ message: "Alerts not configured or disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current balance
    const { data: balanceData, error: balanceError } = await supabase
      .rpc("get_credits_balance", { _workspace_id: workspaceId });

    if (balanceError) {
      console.error("Error fetching balance:", balanceError);
      throw balanceError;
    }

    const currentBalance = balanceData || 0;
    console.log(`Current balance: ${currentBalance}, Threshold: ${settings.threshold}`);

    // Check if balance is below threshold
    if (currentBalance <= settings.threshold) {
      // Check if we've already sent an alert in the last 24 hours
      const { data: recentAlerts } = await supabase
        .from("credit_alerts_log")
        .select("*")
        .eq("workspace_id", workspaceId)
        .gte("alerted_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("alerted_at", { ascending: false })
        .limit(1);

      if (recentAlerts && recentAlerts.length > 0) {
        console.log("Alert already sent in the last 24 hours");
        return new Response(
          JSON.stringify({ message: "Alert already sent recently" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get workspace owner email
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("owner_id")
        .eq("id", workspaceId)
        .single();

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      const { data: authUser } = await supabase.auth.admin.getUserById(workspace.owner_id);
      const userEmail = authUser?.user?.email;

      if (!userEmail) {
        console.warn("Could not find user email");
        throw new Error("User email not found");
      }

      // Send alert email
      await resend.emails.send({
        from: "Credits Alert <onboarding@resend.dev>",
        to: [userEmail],
        subject: `⚠️ Low Credit Balance Alert - ${currentBalance} Credits Remaining`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Low Credit Balance</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 18px; margin-bottom: 20px;">Your credit balance is running low!</p>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                  <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #92400e;">Current Status</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #78350f;">Current Balance:</td>
                      <td style="padding: 8px 0; font-weight: bold; text-align: right; font-size: 24px; color: #ef4444;">${currentBalance} credits</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #78350f;">Alert Threshold:</td>
                      <td style="padding: 8px 0; font-weight: bold; text-align: right;">${settings.threshold} credits</td>
                    </tr>
                  </table>
                </div>

                <p style="margin-top: 30px;">To continue using our services without interruption, please purchase more credits.</p>
                
                <div style="text-align: center; margin-top: 40px;">
                  <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || 'https://your-app.lovable.app'}/billing" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Purchase Credits
                  </a>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                  <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">Need help? Contact our support team.</p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">You're receiving this because your balance dropped below ${settings.threshold} credits.</p>
                </div>
              </div>

              <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                <p style="margin: 5px 0;">This is an automated alert for low credit balance.</p>
                <p style="margin: 5px 0;">You can adjust alert settings in your workspace preferences.</p>
              </div>
            </body>
          </html>
        `,
      });

      // Log the alert
      await supabase.from("credit_alerts_log").insert({
        workspace_id: workspaceId,
        balance: currentBalance,
        threshold: settings.threshold,
      });

      console.log(`✅ Low balance alert sent to ${userEmail}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Alert sent",
          balance: currentBalance,
          threshold: settings.threshold
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "Balance above threshold",
        balance: currentBalance,
        threshold: settings.threshold
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking low balance:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
