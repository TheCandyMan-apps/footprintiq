import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const from = url.searchParams.get('from') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const to = url.searchParams.get('to') || new Date().toISOString();
    const workspace = url.searchParams.get('workspace') || user.id;

    console.log('Fetching KPIs', { from, to, workspace });

    // Calculate current period metrics
    const { data: currentScans, error: scansError } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', workspace)
      .gte('created_at', from)
      .lte('created_at', to);

    if (scansError) throw scansError;

    const scans = currentScans?.length || 0;
    const findings = currentScans?.reduce((sum, scan) => sum + (scan.result_count || 0), 0) || 0;
    const high = currentScans?.reduce((sum, scan) => sum + (scan.high_risk_count || 0), 0) || 0;

    // Dark web mentions
    const { count: darkweb } = await supabase
      .from('darkweb_findings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', workspace)
      .gte('created_at', from)
      .lte('created_at', to);

    // Success rate (scans completed successfully)
    const successRate = scans > 0 
      ? Math.round((currentScans?.filter(s => s.status === 'completed').length || 0) / scans * 100)
      : 100;

    // Estimated spend (mock for now)
    const spend = findings * 0.02; // $0.02 per finding

    // Calculate previous period for deltas
    const periodLength = new Date(to).getTime() - new Date(from).getTime();
    const prevFrom = new Date(new Date(from).getTime() - periodLength).toISOString();
    const prevTo = from;

    const { data: prevScans } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', workspace)
      .gte('created_at', prevFrom)
      .lte('created_at', prevTo);

    const prevScansCount = prevScans?.length || 0;
    const prevFindings = prevScans?.reduce((sum, scan) => sum + (scan.result_count || 0), 0) || 0;
    const prevHigh = prevScans?.reduce((sum, scan) => sum + (scan.high_risk_count || 0), 0) || 0;

    const { count: prevDarkweb } = await supabase
      .from('darkweb_findings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', workspace)
      .gte('created_at', prevFrom)
      .lte('created_at', prevTo);

    const prevSuccessRate = prevScansCount > 0
      ? Math.round((prevScans?.filter(s => s.status === 'completed').length || 0) / prevScansCount * 100)
      : 100;

    const prevSpend = prevFindings * 0.02;

    const kpis = {
      scans,
      findings,
      high,
      darkweb: darkweb || 0,
      successRate,
      spend,
      deltas: {
        scans: scans - prevScansCount,
        findings: findings - prevFindings,
        high: high - prevHigh,
        darkweb: (darkweb || 0) - (prevDarkweb || 0),
        successRate: successRate - prevSuccessRate,
        spend: spend - prevSpend,
      },
    };

    console.log('KPIs computed', kpis);

    return new Response(JSON.stringify(kpis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error computing KPIs:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
