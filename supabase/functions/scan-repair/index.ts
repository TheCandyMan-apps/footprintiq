import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create service role client for repairs (no auth required for this public function)
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { scanId } = await req.json();
    
    if (!scanId) {
      return new Response(
        JSON.stringify({ error: 'Missing scanId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[scan-repair] Repairing scan ${scanId}`);

    // Fetch existing findings for this scan
    const { data: findings, error: findingsError } = await supabaseService
      .from('findings')
      .select('provider, severity')
      .eq('scan_id', scanId);

    if (findingsError) {
      console.error('[scan-repair] Failed to fetch findings:', findingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch findings', details: findingsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[scan-repair] Found ${findings?.length || 0} existing findings`);

    // Compute provider counts from findings
    const providerCounts = (findings || []).reduce((acc, f) => {
      acc[f.provider] = (acc[f.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Compute severity stats
    const highRiskCount = (findings || []).filter(f => f.severity === 'high').length;
    const mediumRiskCount = (findings || []).filter(f => f.severity === 'medium').length;
    const lowRiskCount = (findings || []).filter(f => f.severity === 'low').length;
    const privacyScore = Math.max(0, Math.min(100, 100 - (highRiskCount * 10 + mediumRiskCount * 5 + lowRiskCount * 2)));

    console.log(`[scan-repair] Provider counts:`, providerCounts);
    console.log(`[scan-repair] Stats: high=${highRiskCount}, medium=${mediumRiskCount}, low=${lowRiskCount}, privacy=${privacyScore}`);

    // Update scan record to completed with computed stats
    const { error: updateError } = await supabaseService
      .from('scans')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        provider_counts: providerCounts,
        high_risk_count: highRiskCount,
        medium_risk_count: mediumRiskCount,
        low_risk_count: lowRiskCount,
        privacy_score: privacyScore,
        total_sources_found: findings?.length || 0
      })
      .eq('id', scanId);

    if (updateError) {
      console.error('[scan-repair] Failed to update scan:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update scan', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[scan-repair] Successfully repaired scan ${scanId}`);

    // Insert a system info finding noting the repair
    await supabaseService.from('findings').insert({
      scan_id: scanId,
      workspace_id: null, // Will be filled by trigger if needed
      provider: 'system',
      kind: 'info.repair',
      severity: 'info',
      confidence: 1.0,
      observed_at: new Date().toISOString(),
      evidence: [
        { key: 'action', value: 'scan_repair' },
        { key: 'repaired_at', value: new Date().toISOString() },
        { key: 'findings_count', value: String(findings?.length || 0) },
        { key: 'provider_counts', value: JSON.stringify(providerCounts) }
      ],
      meta: {}
    });

    return new Response(
      JSON.stringify({
        success: true,
        scanId,
        findingsCount: findings?.length || 0,
        providerCounts,
        stats: {
          high: highRiskCount,
          medium: mediumRiskCount,
          low: lowRiskCount,
          privacyScore
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[scan-repair] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
