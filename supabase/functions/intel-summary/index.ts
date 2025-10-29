import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

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

    console.log('Fetching intelligence summary...');

    // Check cache first
    const { data: cached } = await supabase
      .from('intel_feed_cache')
      .select('*')
      .eq('feed_type', 'summary')
      .gt('expires_at', new Date().toISOString())
      .order('cached_at', { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      console.log('Returning cached intelligence summary');
      return new Response(
        JSON.stringify({ success: true, data: cached.data, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch fresh data
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Aggregate findings
    const { data: findings } = await supabase
      .from('findings')
      .select('severity, type, created_at')
      .gte('created_at', weekAgo.toISOString());

    // Aggregate anomalies
    const { data: anomalies } = await supabase
      .from('anomalies')
      .select('severity, anomaly_type, detected_at')
      .gte('detected_at', weekAgo.toISOString());

    // Aggregate threat intelligence
    const { data: threats } = await supabase
      .from('threat_intelligence')
      .select('threat_type, severity, discovered_at')
      .gte('discovered_at', weekAgo.toISOString());

    // Calculate statistics
    const stats = {
      totalFindings: findings?.length || 0,
      criticalFindings: findings?.filter(f => f.severity === 'critical').length || 0,
      highFindings: findings?.filter(f => f.severity === 'high').length || 0,
      totalAnomalies: anomalies?.length || 0,
      criticalAnomalies: anomalies?.filter(a => a.severity === 'critical').length || 0,
      totalThreats: threats?.length || 0,
      criticalThreats: threats?.filter(t => t.severity === 'critical').length || 0,
      
      // Trends
      findingsByDay: groupByDay(findings || []),
      anomaliesByDay: groupByDay(anomalies || []),
      threatsByType: groupBy(threats || [], 'threat_type'),
      findingsByType: groupBy(findings || [], 'type'),
    };

    // Calculate risk index
    const riskIndex = calculateRiskIndex(stats);

    const summaryData = {
      timestamp: now.toISOString(),
      period: '7-days',
      statistics: stats,
      riskIndex,
      trends: {
        findingsChange: calculateChange(stats.findingsByDay),
        anomaliesChange: calculateChange(stats.anomaliesByDay),
        riskIndexChange: '+2.3%', // Simplified for now
      },
    };

    // Cache the result
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    await supabase.from('intel_feed_cache').insert({
      feed_type: 'summary',
      data: summaryData,
      cached_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      source: 'internal',
    });

    console.log('Intelligence summary generated and cached');

    return new Response(
      JSON.stringify({ success: true, data: summaryData, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating intelligence summary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function groupByDay(items: any[]): Record<string, number> {
  const result: Record<string, number> = {};
  items.forEach(item => {
    const date = new Date(item.created_at || item.detected_at || item.discovered_at);
    const day = date.toISOString().split('T')[0];
    result[day] = (result[day] || 0) + 1;
  });
  return result;
}

function groupBy(items: any[], field: string): Record<string, number> {
  const result: Record<string, number> = {};
  items.forEach(item => {
    const value = item[field] || 'unknown';
    result[value] = (result[value] || 0) + 1;
  });
  return result;
}

function calculateRiskIndex(stats: any): number {
  const weights = {
    criticalFindings: 10,
    highFindings: 5,
    criticalAnomalies: 8,
    criticalThreats: 12,
  };

  const score = 
    stats.criticalFindings * weights.criticalFindings +
    stats.highFindings * weights.highFindings +
    stats.criticalAnomalies * weights.criticalAnomalies +
    stats.criticalThreats * weights.criticalThreats;

  return Math.min(100, Math.round(score / 10));
}

function calculateChange(byDay: Record<string, number>): string {
  const days = Object.keys(byDay).sort();
  if (days.length < 2) return '0%';
  
  const recent = byDay[days[days.length - 1]] || 0;
  const previous = byDay[days[days.length - 2]] || 1;
  
  const change = ((recent - previous) / previous) * 100;
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
}