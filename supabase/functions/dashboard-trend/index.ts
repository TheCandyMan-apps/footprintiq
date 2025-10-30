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

    console.log('Fetching trend data', { from, to, workspace });

    const { data: scans, error: scansError } = await supabase
      .from('scans')
      .select('created_at, low_risk_count, medium_risk_count, high_risk_count')
      .eq('user_id', workspace)
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: true });

    if (scansError) throw scansError;

    // Group by day
    const dayMap = new Map<string, { low: number; medium: number; high: number }>();
    
    scans?.forEach((scan) => {
      const day = scan.created_at.split('T')[0];
      const current = dayMap.get(day) || { low: 0, medium: 0, high: 0 };
      
      dayMap.set(day, {
        low: current.low + (scan.low_risk_count || 0),
        medium: current.medium + (scan.medium_risk_count || 0),
        high: current.high + (scan.high_risk_count || 0),
      });
    });

    // Convert to array and add forecast (simple linear projection)
    const series = Array.from(dayMap.entries()).map(([ts, counts]) => ({
      ts,
      ...counts,
    }));

    // Add simple forecast for next 3 days
    if (series.length >= 3) {
      const lastThree = series.slice(-3);
      const avgGrowth = {
        low: (lastThree[2].low - lastThree[0].low) / 2,
        medium: (lastThree[2].medium - lastThree[0].medium) / 2,
        high: (lastThree[2].high - lastThree[0].high) / 2,
      };

      for (let i = 1; i <= 3; i++) {
        const lastDate = new Date(series[series.length - 1].ts);
        lastDate.setDate(lastDate.getDate() + i);
        const last = series[series.length - 1];

        series.push({
          ts: lastDate.toISOString().split('T')[0],
          low: Math.max(0, last.low + avgGrowth.low * i),
          medium: Math.max(0, last.medium + avgGrowth.medium * i),
          high: Math.max(0, last.high + avgGrowth.high * i),
          forecast: true,
        } as any);
      }
    }

    console.log(`Trend computed: ${series.length} data points`);

    return new Response(JSON.stringify(series), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error computing trend:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
