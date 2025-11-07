import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrainingResult {
  success: boolean;
  modelVersion: string;
  accuracy?: number;
  samplesProcessed: number;
  patterns?: {
    commonProviders: string[];
    lowConfidenceThreshold: number;
    categoryPatterns: Record<string, number>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if request is from cron (automated) or user (manual)
    const authHeader = req.headers.get('Authorization');
    const isCronJob = authHeader === `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`;
    
    // If not cron, verify admin access
    if (!isCronJob) {
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: { user } } = await supabase.auth.getUser(authHeader.split('Bearer ')[1]);
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid user' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user is admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!userRole || userRole.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const body = req.method === 'POST' ? await req.json() : {};
    const { feedbackType } = body;
    console.log('Starting ML training for feedback type:', feedbackType);

    // Fetch all false positive feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .eq('reason', feedbackType || 'false_positive');

    if (feedbackError) throw feedbackError;

    console.log(`Processing ${feedback.length} feedback samples...`);

    // Analyze patterns in false positives
    const patterns = {
      commonProviders: [] as string[],
      lowConfidenceThreshold: 0,
      categoryPatterns: {} as Record<string, number>,
    };

    // Group by item name (provider/platform)
    const providerCounts: Record<string, number> = {};
    const confidenceScores: number[] = [];

    for (const item of feedback) {
      // Track provider frequency
      if (!providerCounts[item.item_name]) {
        providerCounts[item.item_name] = 0;
      }
      providerCounts[item.item_name]++;

      // Track confidence scores
      if (item.confidence_score) {
        confidenceScores.push(item.confidence_score);
      }

      // Track category patterns (if available)
      if (item.item_type) {
        if (!patterns.categoryPatterns[item.item_type]) {
          patterns.categoryPatterns[item.item_type] = 0;
        }
        patterns.categoryPatterns[item.item_type]++;
      }
    }

    // Identify most common false positive providers
    const sortedProviders = Object.entries(providerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([provider]) => provider);

    patterns.commonProviders = sortedProviders;

    // Calculate low confidence threshold (75th percentile of false positives)
    if (confidenceScores.length > 0) {
      confidenceScores.sort((a, b) => a - b);
      const percentile75Index = Math.floor(confidenceScores.length * 0.75);
      patterns.lowConfidenceThreshold = Math.round(confidenceScores[percentile75Index]);
    }

    // Calculate model accuracy based on confidence distribution
    const lowConfidenceCount = confidenceScores.filter(score => score < patterns.lowConfidenceThreshold).length;
    const accuracy = (lowConfidenceCount / confidenceScores.length) * 100;

    // Store training results in database (for future reference)
    const modelVersion = `v${Date.now()}`;
    const { error: insertError } = await supabase
      .from('ml_training_results')
      .insert({
        model_version: modelVersion,
        training_type: 'false_positive_detection',
        samples_processed: feedback.length,
        accuracy: accuracy,
        patterns: patterns,
        trained_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error storing training results:', insertError);
      // Continue anyway - don't fail the training
    }

    // Update ML config with new thresholds
    const newThresholds = {
      low: Math.max(30, patterns.lowConfidenceThreshold - 15),
      medium: patterns.lowConfidenceThreshold,
      high: Math.min(95, patterns.lowConfidenceThreshold + 15)
    };

    await supabase
      .from('ml_config')
      .upsert({
        config_key: 'confidence_thresholds',
        config_value: newThresholds,
        updated_at: new Date().toISOString()
      }, { onConflict: 'config_key' });

    await supabase
      .from('ml_config')
      .upsert({
        config_key: 'false_positive_patterns',
        config_value: patterns,
        updated_at: new Date().toISOString()
      }, { onConflict: 'config_key' });

    console.log('Updated ML config with new thresholds:', newThresholds);

    const result: TrainingResult = {
      success: true,
      modelVersion,
      accuracy,
      samplesProcessed: feedback.length,
      patterns,
    };

    console.log('ML training complete:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('ML training error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Training failed'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
