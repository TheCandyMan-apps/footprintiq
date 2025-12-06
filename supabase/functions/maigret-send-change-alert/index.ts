import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRequest {
  changeIds: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'Email service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: AlertRequest = await req.json();
    const { changeIds } = body;

    if (!changeIds || changeIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No change IDs provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📧 Sending alerts for ${changeIds.length} changes`);

    // Fetch changes with details
    const { data: changes, error: changesError } = await supabase
      .from('maigret_profile_changes')
      .select('*')
      .in('id', changeIds);

    if (changesError || !changes || changes.length === 0) {
      console.error('Error fetching changes:', changesError);
      throw new Error('Failed to fetch changes');
    }

    // Group changes by username and workspace
    const changesByUsername = new Map<string, any[]>();
    for (const change of changes) {
      const key = `${change.username}:${change.workspace_id}`;
      if (!changesByUsername.has(key)) {
        changesByUsername.set(key, []);
      }
      changesByUsername.get(key)!.push(change);
    }

    const emailsSent = [];

    // Send email for each username
    for (const [key, usernameChanges] of changesByUsername) {
      const [username, workspaceId] = key.split(':');

      // Get monitored username config for alert email
      const { data: monitoredUsername } = await supabase
        .from('maigret_monitored_usernames')
        .select('alert_email, email_alerts_enabled, user_id')
        .eq('username', username)
        .eq('workspace_id', workspaceId)
        .single();

      if (!monitoredUsername?.email_alerts_enabled) {
        console.log(`⏭️  Skipping alerts for ${username} (alerts disabled)`);
        continue;
      }

      // Get user email if alert_email not specified
      let alertEmail = monitoredUsername.alert_email;
      if (!alertEmail && monitoredUsername.user_id) {
        const { data: userData } = await supabase.auth.admin.getUserById(monitoredUsername.user_id);
        alertEmail = userData?.user?.email;
      }

      if (!alertEmail) {
        console.log(`⚠️  No alert email for ${username}`);
        continue;
      }

      // Build email content
      const changesList = usernameChanges
        .map(change => {
          const emoji =
            change.change_type === 'created' ? '✨'
            : change.change_type === 'deleted' ? '🗑️'
            : '📝';

          let details = '';
          if (change.change_type === 'created') {
            details = `Found at: ${change.change_details.url || 'N/A'}`;
          } else if (change.change_type === 'deleted') {
            details = `Previously at: ${change.change_details.previousUrl || 'N/A'}`;
          } else if (change.change_type === 'modified') {
            details = `URL changed from ${change.change_details.oldUrl || 'N/A'} to ${change.change_details.newUrl || 'N/A'}`;
          }

          return `
            <li style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-left: 4px solid #0066cc; border-radius: 4px;">
              <strong>${emoji} ${change.site}</strong>
              <br/>
              <span style="color: #666; font-size: 14px;">
                Change: ${change.change_type.toUpperCase()}
                <br/>
                ${details}
              </span>
            </li>
          `;
        })
        .join('');

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔔 Profile Changes Detected</h1>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              We detected <strong>${usernameChanges.length} change${usernameChanges.length > 1 ? 's' : ''}</strong> 
              to the username <strong style="color: #0066cc;">${username}</strong>:
            </p>

            <ul style="list-style: none; padding: 0; margin: 20px 0;">
              ${changesList}
            </ul>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>What's next?</strong>
              </p>
              <p style="color: #666; font-size: 14px; margin: 10px 0 20px 0;">
                Review these changes in your FootprintIQ dashboard to investigate any suspicious activity or track profile updates.
              </p>
              
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('/functions', '')}/dashboard/maigret" 
                 style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                View Changes in Dashboard
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #666; font-size: 12px;">
              <p style="margin: 5px 0;">
                <strong>FootprintIQ</strong> - Username Monitoring
              </p>
              <p style="margin: 5px 0;">
                To stop receiving alerts for this username, disable monitoring in your dashboard.
              </p>
            </div>

          </div>
        </body>
        </html>
      `;

      try {
        const emailResponse = await resend.emails.send({
          from: 'FootprintIQ Alerts <onboarding@resend.dev>',
          to: [alertEmail],
          subject: `🔔 ${usernameChanges.length} Profile Change${usernameChanges.length > 1 ? 's' : ''} Detected: ${username}`,
          html: emailHtml,
        });

        console.log(`✅ Email sent to ${alertEmail}:`, emailResponse);
        emailsSent.push(alertEmail);

        // Mark changes as email_sent
        const { error: updateError } = await supabase
          .from('maigret_profile_changes')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
          })
          .in('id', usernameChanges.map(c => c.id));

        if (updateError) {
          console.error('Error updating email_sent status:', updateError);
        }
      } catch (emailError) {
        console.error(`Failed to send email to ${alertEmail}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailsSent.length,
        recipients: emailsSent,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Error in maigret-send-change-alert:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
