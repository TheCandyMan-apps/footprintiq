import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[darkweb-weekly-summary] Generating weekly summaries');

    // Get all workspaces with active dark web targets
    const { data: workspaces, error: wsError } = await supabase
      .from('darkweb_targets')
      .select('workspace_id')
      .eq('active', true)
      .not('workspace_id', 'is', null);

    if (wsError) throw wsError;

    const uniqueWorkspaceIds = [...new Set(workspaces?.map(w => w.workspace_id) || [])];

    let emailsSent = 0;

    for (const workspaceId of uniqueWorkspaceIds) {
      try {
        // Get findings from last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600000).toISOString();
        
        const { data: findings, error: findingsError } = await supabase
          .from('darkweb_findings')
          .select(`
            *,
            darkweb_targets!inner(value, type)
          `)
          .eq('darkweb_targets.workspace_id', workspaceId)
          .gte('observed_at', sevenDaysAgo)
          .order('observed_at', { ascending: false });

        if (findingsError) throw findingsError;

        if (!findings || findings.length === 0) {
          console.log(`[darkweb-weekly-summary] No findings for workspace ${workspaceId}`);
          continue;
        }

        // Get workspace owner email
        const { data: workspace } = await supabase
          .from('workspaces')
          .select('owner_id, name')
          .eq('id', workspaceId)
          .single();

        if (!workspace) continue;

        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('user_id', workspace.owner_id)
          .single();

        if (!profile?.email) continue;

        // Group findings by target
        const grouped = findings.reduce((acc: any, f: any) => {
          const target = f.darkweb_targets.value;
          if (!acc[target]) acc[target] = [];
          acc[target].push(f);
          return acc;
        }, {});

        // Generate email HTML
        const summary = Object.entries(grouped)
          .map(([target, finds]: [string, any]) => {
            return `
              <div style="margin: 20px 0; padding: 15px; border-left: 3px solid #ef4444; background: #fef2f2;">
                <h3 style="margin: 0 0 10px 0; color: #991b1b;">${target}</h3>
                <p style="margin: 0 0 10px 0; font-weight: bold;">${finds.length} new finding(s)</p>
                <ul style="margin: 0; padding-left: 20px;">
                  ${finds.slice(0, 5).map((f: any) => `
                    <li style="margin: 5px 0;">
                      <strong>${f.provider}:</strong> ${f.url || 'Unknown URL'}
                    </li>
                  `).join('')}
                  ${finds.length > 5 ? `<li style="margin: 5px 0; color: #6b7280;">+ ${finds.length - 5} more</li>` : ''}
                </ul>
              </div>
            `;
          })
          .join('');

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #111827; margin-bottom: 20px;">Dark Web Monitoring - Weekly Summary</h1>
              <p>Hello ${profile.full_name || 'there'},</p>
              <p>Here's your weekly dark web monitoring summary for <strong>${workspace.name}</strong>:</p>
              <div style="margin: 30px 0;">
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #374151;">Summary</h2>
                  <p style="margin: 0;"><strong>${findings.length}</strong> total findings across <strong>${Object.keys(grouped).length}</strong> monitored target(s)</p>
                </div>
                ${summary}
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  This is an automated weekly summary from FootprintIQ.<br>
                  <a href="https://footprintiq.app/monitoring" style="color: #6366f1;">Manage your monitoring settings</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Send via Resend
        if (RESEND_API_KEY) {
          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'FootprintIQ <alerts@footprintiq.app>',
              to: [profile.email],
              subject: `Dark Web Weekly Summary - ${findings.length} findings`,
              html: emailHtml,
            }),
          });

          if (resendResponse.ok) {
            emailsSent++;
            console.log(`[darkweb-weekly-summary] Email sent to ${profile.email}`);
          } else {
            const error = await resendResponse.text();
            console.error(`[darkweb-weekly-summary] Resend error:`, error);
          }
        }

        // Mark findings as notified
        await supabase
          .from('darkweb_findings')
          .update({ notified_at: new Date().toISOString() })
          .in('id', findings.map((f: any) => f.id));

      } catch (error) {
        console.error(`[darkweb-weekly-summary] Error for workspace ${workspaceId}:`, error);
      }
    }

    console.log(`[darkweb-weekly-summary] Completed: ${emailsSent} emails sent`);

    return ok({
      workspaces: uniqueWorkspaceIds.length,
      emailsSent,
    });

  } catch (error) {
    console.error('[darkweb-weekly-summary] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
