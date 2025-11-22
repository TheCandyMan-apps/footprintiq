import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeeklyDigestPayload {
  userId?: string; // If provided, send only to this user (for testing)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const body: WeeklyDigestPayload = await req.json().catch(() => ({}));
    
    // Get users who haven't opted out of email notifications
    let query = supabase
      .from('profiles')
      .select('user_id, email, full_name')
      .eq('email_notifications', true);
    
    if (body.userId) {
      query = query.eq('user_id', body.userId);
    }

    const { data: users, error: usersError } = await query;
    
    if (usersError) throw usersError;
    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users to send digest to' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const digestsSent = [];
    const errors = [];

    for (const user of users) {
      try {
        // Get watchlists for this user
        const { data: watchlists } = await supabase
          .from('watchlists')
          .select('id, identity_value, identity_type')
          .eq('user_id', user.user_id)
          .eq('is_active', true);

        if (!watchlists || watchlists.length === 0) {
          continue; // Skip users with no active monitoring
        }

        // Get findings from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentFindings } = await supabase
          .from('findings')
          .select('id, kind, severity, provider, created_at')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        const findingsCount = recentFindings?.length || 0;
        const highRiskCount = recentFindings?.filter(f => f.severity === 'high' || f.severity === 'critical').length || 0;

        // Check if we already sent a digest this week
        const { data: lastDigest } = await supabase
          .from('email_notifications')
          .select('sent_at')
          .eq('user_id', user.user_id)
          .eq('notification_type', 'weekly_digest')
          .gte('sent_at', sevenDaysAgo.toISOString())
          .order('sent_at', { ascending: false })
          .limit(1)
          .single();

        if (lastDigest) {
          console.log(`Skipping user ${user.user_id} - digest already sent this week`);
          continue;
        }

        // Prepare email content
        const emailContent = `
          <h2>Your Weekly FootprintIQ Digest</h2>
          <p>Hi ${user.full_name || 'there'},</p>
          <p>Here's what happened with your monitored identities this week:</p>
          <ul>
            <li><strong>${watchlists.length}</strong> identities monitored</li>
            <li><strong>${findingsCount}</strong> new findings discovered</li>
            <li><strong>${highRiskCount}</strong> high-risk findings</li>
          </ul>
          ${recentFindings && recentFindings.length > 0 ? `
            <h3>Notable Findings:</h3>
            <ul>
              ${recentFindings.slice(0, 5).map(f => `
                <li>
                  <span style="color: ${f.severity === 'high' || f.severity === 'critical' ? 'red' : 'orange'};">
                    ${f.severity?.toUpperCase() || 'MEDIUM'}
                  </span>: ${f.kind} (${f.provider})
                </li>
              `).join('')}
            </ul>
          ` : ''}
          <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/dashboard">View Full Dashboard</a></p>
          <p style="color: #666; font-size: 12px;">
            To stop receiving these weekly digests, visit your <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/settings/privacy">notification settings</a>.
          </p>
        `;

        // Send email (placeholder - integrate with actual email service)
        // In production, use Resend or similar service
        console.log(`Would send digest to ${user.email}:`, emailContent);

        // Log the notification
        await supabase
          .from('email_notifications')
          .insert({
            user_id: user.user_id,
            notification_type: 'weekly_digest',
            email_to: user.email,
            subject: 'Your Weekly FootprintIQ Digest',
            body: emailContent,
            sent_at: new Date().toISOString()
          });

        digestsSent.push(user.email);
      } catch (error) {
        console.error(`Error sending digest to ${user.email}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ email: user.email, error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: digestsSent.length,
        errors: errors.length,
        details: { digestsSent, errors }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Weekly digest error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
