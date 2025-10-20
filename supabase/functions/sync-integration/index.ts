import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { integration_id, action } = await req.json();

    // Get user integration
    const { data: userIntegration, error: intError } = await supabase
      .from('user_integrations')
      .select('*, integration_catalog(*)')
      .eq('id', integration_id)
      .eq('user_id', user.id)
      .single();

    if (intError || !userIntegration) {
      throw new Error('Integration not found');
    }

    console.log(`Processing ${action} for ${userIntegration.integration_catalog.name}`);

    let result: any = { success: false };

    // Handle different integration types
    switch (userIntegration.integration_catalog.category) {
      case 'siem':
        result = await syncSIEMEvents(supabase, user.id, userIntegration);
        break;
      case 'ticketing':
        result = await syncTickets(supabase, user.id, userIntegration);
        break;
      case 'communication':
        result = await sendNotification(supabase, user.id, userIntegration);
        break;
      default:
        result = { success: true, message: 'Generic sync completed' };
    }

    // Log the sync
    await supabase.from('integration_logs').insert({
      user_integration_id: integration_id,
      sync_type: action,
      status: result.success ? 'success' : 'failed',
      records_synced: result.count || 0,
      error_message: result.error || null,
      metadata: result.metadata || {},
    });

    // Update last sync
    if (result.success) {
      await supabase
        .from('user_integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', integration_id);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

async function syncSIEMEvents(supabase: any, userId: string, integration: any) {
  try {
    // Get recent high-risk scans
    const { data: scans, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .gte('high_risk_count', 5)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Create SIEM events for each high-risk scan
    const events = scans.map((scan: any) => ({
      user_id: userId,
      integration_id: integration.id,
      event_type: 'high_risk_scan',
      severity: 'high',
      source: 'FootprintIQ',
      title: `High Risk Scan Detected`,
      description: `Scan found ${scan.high_risk_count} high-risk data sources`,
      raw_data: scan,
    }));

    const { error: insertError } = await supabase
      .from('siem_events')
      .insert(events);

    if (insertError) throw insertError;

    return {
      success: true,
      count: events.length,
      message: `Exported ${events.length} events to SIEM`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function syncTickets(supabase: any, userId: string, integration: any) {
  try {
    // Get open cases without tickets
    const { data: cases, error } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('priority', { ascending: false })
      .limit(5);

    if (error) throw error;

    // Create ticket integration records (simulated)
    const tickets = cases.map((caseItem: any) => ({
      user_id: userId,
      integration_id: integration.id,
      case_id: caseItem.id,
      external_ticket_id: `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticket_url: `https://example.com/tickets/${caseItem.id}`,
      status: 'open',
      priority: caseItem.priority,
      metadata: { case_title: caseItem.title },
    }));

    const { error: insertError } = await supabase
      .from('ticket_integrations')
      .insert(tickets);

    if (insertError) throw insertError;

    return {
      success: true,
      count: tickets.length,
      message: `Created ${tickets.length} tickets`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function sendNotification(supabase: any, userId: string, integration: any) {
  try {
    // Get recent unread alerts
    const { data: alerts, error } = await supabase
      .from('monitoring_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    // Simulate sending notifications
    console.log(`Would send ${alerts.length} notifications via ${integration.integration_catalog.name}`);

    return {
      success: true,
      count: alerts.length,
      message: `Sent ${alerts.length} notifications`,
      metadata: { alerts: alerts.length },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
