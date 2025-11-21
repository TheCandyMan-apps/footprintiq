import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/secure.ts';

const THRESHOLDS = [20, 5, 0];

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });

  try {
    const { workspaceId, balance } = await req.json();
    if (!workspaceId || balance === undefined) {
      return new Response(JSON.stringify({ error: 'Missing workspaceId or balance' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find applicable threshold
    let threshold: number | null = null;
    for (const t of THRESHOLDS) {
      if (balance <= t) {
        threshold = t;
        break;
      }
    }

    if (threshold === null) {
      return new Response(JSON.stringify({ sent: false, reason: 'No threshold crossed' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Check if we've already sent this notification
    const { data: existing } = await supabase
      .from('email_notifications')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('notification_type', 'low_credits')
      .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (existing) {
      return new Response(JSON.stringify({ sent: false, reason: 'Already sent in last 24h' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get workspace owner email
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single();

    if (!workspace) {
      return new Response(JSON.stringify({ error: 'Workspace not found' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const { data: { user } } = await supabase.auth.admin.getUserById(workspace.owner_id);
    if (!user?.email) {
      return new Response(JSON.stringify({ error: 'User email not found' }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Send email via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      const subject = threshold === 0 
        ? '⚠️ FootprintIQ Credits Depleted' 
        : `⚠️ Low Credits Alert: ${balance} remaining`;
      
      const body = threshold === 0
        ? `Your FootprintIQ workspace has run out of credits. Scans are paused. Please upgrade or purchase credits to continue.`
        : `Your FootprintIQ workspace has ${balance} credits remaining. Consider topping up to avoid interruption.`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FootprintIQ <notifications@footprintiq.app>',
          to: [user.email],
          subject,
          html: `<p>${body}</p><p><a href="https://footprintiq.app/buy-credits">Buy Credits</a></p>`,
        }),
      });
    }

    // Record notification
    await supabase.from('email_notifications').insert({
      workspace_id: workspaceId,
      notification_type: 'low_credits',
      sent_at: new Date().toISOString(),
      recipient_email: user.email,
      metadata: { threshold, balance },
    });

    return new Response(JSON.stringify({ sent: true, threshold, email: user.email }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('notify-low-credits error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
