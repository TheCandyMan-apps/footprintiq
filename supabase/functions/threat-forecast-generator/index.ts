import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    console.log('[threat-forecast] Starting threat forecast generation');

    // Fetch recent scan data for analysis
    const { data: recentScans, error: scansError } = await supabase
      .from('scans')
      .select('*, data_sources(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (scansError) throw scansError;

    // Aggregate threat data by type and time
    const threatsByDay = new Map<string, number>();
    const threatsByType = new Map<string, number[]>();

    recentScans?.forEach(scan => {
      const day = new Date(scan.created_at).toISOString().split('T')[0];
      threatsByDay.set(day, (threatsByDay.get(day) || 0) + 1);
    });

    // Generate forecast using AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const historicalData = Array.from(threatsByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30); // Last 30 days

    const prompt = `Analyze the following historical threat detection data and generate a 7-day forecast:

Historical Data (Last 30 Days):
${historicalData.map(([date, count]) => `${date}: ${count} threats`).join('\n')}

Generate a JSON forecast with the following structure:
{
  "predictions": [day1, day2, day3, day4, day5, day6, day7],
  "confidence_intervals": {
    "lower": [lower_bound_day1, ...],
    "upper": [upper_bound_day1, ...]
  },
  "trend": "increasing|stable|decreasing",
  "risk_level": "low|medium|high|critical",
  "factors": ["factor1", "factor2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert cybersecurity analyst specializing in threat forecasting. Provide accurate, data-driven predictions based on historical patterns.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const forecastText = aiData.choices[0].message.content;

    // Parse AI response
    const jsonMatch = forecastText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse AI forecast');

    const predictionData = JSON.parse(jsonMatch[0]);

    // Calculate confidence intervals if not provided
    if (!predictionData.confidence_intervals) {
      predictionData.confidence_intervals = {
        lower: predictionData.predictions.map((v: number) => Math.max(0, v * 0.7)),
        upper: predictionData.predictions.map((v: number) => v * 1.3)
      };
    }

    // Store forecast in database
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    const { error: insertError } = await supabase
      .from('threat_forecasts')
      .insert({
        user_id: user.id,
        forecast_type: 'threat_detection_volume',
        prediction_data: predictionData,
        confidence_intervals: predictionData.confidence_intervals,
        model_used: 'gemini-2.5-flash-timeseries',
        forecast_horizon_days: 7,
        valid_until: validUntil.toISOString(),
      });

    if (insertError) throw insertError;

    console.log('[threat-forecast] Forecast generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        forecast: predictionData,
        message: 'Threat forecast generated successfully',
      }),
      {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[threat-forecast] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
