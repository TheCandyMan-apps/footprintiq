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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId } = await req.json();

    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log("Starting ML analysis for user:", userId);

    // Fetch user's scan history
    const { data: scans, error: scansError } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (scansError) throw scansError;

    if (!scans || scans.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No scans found for analysis",
          predictions: [],
          patterns: [],
          anomalies: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate risk prediction
    const latestScan = scans[0];
    const avgPrivacyScore = scans.reduce((sum, s) => sum + (s.privacy_score || 0), 0) / scans.length;
    const totalRiskSources = latestScan.high_risk_count + latestScan.medium_risk_count;
    
    let predictedRiskLevel = 'low';
    let confidenceScore = 0.7;
    const factors: string[] = [];
    const recommendations: string[] = [];

    if (totalRiskSources > 10) {
      predictedRiskLevel = 'high';
      confidenceScore = 0.85;
      factors.push('High number of risk sources detected');
      recommendations.push('Prioritize removal of high-risk data sources');
    } else if (totalRiskSources > 5) {
      predictedRiskLevel = 'medium';
      confidenceScore = 0.78;
      factors.push('Moderate exposure across multiple sources');
      recommendations.push('Review and address medium-risk sources');
    } else {
      factors.push('Low overall risk exposure');
      recommendations.push('Maintain current privacy practices');
    }

    if (avgPrivacyScore < 50) {
      factors.push('Privacy score below recommended threshold');
      recommendations.push('Implement recommended privacy improvements');
    }

    // Insert risk prediction
    const { error: predError } = await supabase
      .from('risk_predictions')
      .insert({
        user_id: userId,
        scan_id: latestScan.id,
        predicted_risk_level: predictedRiskLevel,
        confidence_score: confidenceScore,
        factors,
        recommendations
      });

    if (predError) console.error("Error inserting prediction:", predError);

    // Detect patterns
    const patterns: any[] = [];
    
    // Pattern: Consistent high-risk sources
    if (scans.filter(s => s.high_risk_count > 3).length >= 3) {
      patterns.push({
        pattern_type: 'consistent_high_risk',
        description: 'Consistently high number of high-risk sources detected across multiple scans',
        severity: 'high',
        affected_scans: scans.slice(0, 3).map(s => s.id),
        occurrence_count: scans.filter(s => s.high_risk_count > 3).length
      });
    }

    // Pattern: Increasing exposure
    if (scans.length >= 3) {
      const recentTotal = scans[0].total_sources_found;
      const oldTotal = scans[scans.length - 1].total_sources_found;
      if (recentTotal > oldTotal * 1.5) {
        patterns.push({
          pattern_type: 'increasing_exposure',
          description: 'Digital footprint is expanding significantly over time',
          severity: 'medium',
          affected_scans: [scans[0].id, scans[scans.length - 1].id],
          occurrence_count: 1
        });
      }
    }

    // Insert patterns
    for (const pattern of patterns) {
      const { error: patternError } = await supabase
        .from('detected_patterns')
        .insert({
          user_id: userId,
          ...pattern
        });

      if (patternError) console.error("Error inserting pattern:", patternError);
    }

    // Detect anomalies
    const anomalies: any[] = [];

    // Anomaly: Sudden spike in sources
    if (scans.length >= 2) {
      const recentSources = scans[0].total_sources_found;
      const previousSources = scans[1].total_sources_found;
      
      if (recentSources > previousSources * 2) {
        anomalies.push({
          anomaly_type: 'source_spike',
          description: `Sudden increase in data sources: ${previousSources} → ${recentSources}`,
          severity: 'high',
          scan_id: scans[0].id
        });
      }
    }

    // Anomaly: High-risk spike
    if (latestScan.high_risk_count > 5 && scans.length >= 2) {
      const previousHighRisk = scans[1].high_risk_count;
      if (latestScan.high_risk_count > previousHighRisk * 1.5) {
        anomalies.push({
          anomaly_type: 'risk_spike',
          description: 'Unusual increase in high-risk data sources',
          severity: 'critical',
          scan_id: latestScan.id
        });
      }
    }

    // Insert anomalies
    for (const anomaly of anomalies) {
      const { error: anomalyError } = await supabase
        .from('anomalies')
        .insert({
          user_id: userId,
          ...anomaly
        });

      if (anomalyError) console.error("Error inserting anomaly:", anomalyError);
    }

    // Generate trend forecast
    if (scans.length >= 3) {
      const trendData = scans.slice(0, 5).map(s => ({
        date: s.created_at,
        sources: s.total_sources_found,
        privacy_score: s.privacy_score,
        high_risk: s.high_risk_count
      }));

      // Simple linear projection
      const avgGrowth = (scans[0].total_sources_found - scans[scans.length - 1].total_sources_found) / scans.length;
      const predictedSources = Math.max(0, scans[0].total_sources_found + avgGrowth);

      const { error: forecastError } = await supabase
        .from('trend_forecasts')
        .insert({
          user_id: userId,
          forecast_type: 'source_growth',
          predicted_values: {
            sources: Math.round(predictedSources),
            trend: avgGrowth > 0 ? 'increasing' : 'decreasing',
            historical_data: trendData
          },
          forecast_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });

      if (forecastError) console.error("Error inserting forecast:", forecastError);
    }

    // Generate behavior analytics
    const scanFrequency = scans.length;
    const avgTimeBetweenScans = scans.length >= 2 
      ? (new Date(scans[0].created_at).getTime() - new Date(scans[scans.length - 1].created_at).getTime()) / (scans.length - 1) / (1000 * 60 * 60 * 24)
      : 0;

    const insights: string[] = [];
    if (scanFrequency >= 5) {
      insights.push('Active privacy monitoring - scanning regularly');
    }
    if (avgTimeBetweenScans < 7 && scanFrequency >= 3) {
      insights.push('High engagement - checking privacy status frequently');
    }
    if (predictedRiskLevel === 'low') {
      insights.push('Effective privacy management - maintaining low risk levels');
    }

    const { error: behaviorError } = await supabase
      .from('user_behavior_analytics')
      .insert({
        user_id: userId,
        behavior_type: 'scan_frequency',
        metrics: {
          total_scans: scanFrequency,
          avg_days_between_scans: avgTimeBetweenScans.toFixed(1),
          engagement_level: scanFrequency >= 5 ? 'high' : scanFrequency >= 3 ? 'medium' : 'low'
        },
        insights,
        period_start: scans[scans.length - 1].created_at,
        period_end: scans[0].created_at
      });

    if (behaviorError) console.error("Error inserting behavior analytics:", behaviorError);

    console.log("ML analysis completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "ML analysis completed",
        summary: {
          predictions_generated: 1,
          patterns_detected: patterns.length,
          anomalies_found: anomalies.length,
          forecasts_created: scans.length >= 3 ? 1 : 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ml-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
