import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Social Media Username Search via Apify
 * Uses xtech/social-media-finder-pro to search 300+ platforms
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { username, targetId, workspaceId } = await req.json();

    if (!username || !targetId || !workspaceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: username, targetId, workspaceId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[social-media-search] Searching for username: ${username}`);

    const apifyToken = Deno.env.get('APIFY_API_TOKEN');
    if (!apifyToken) {
      console.warn('[social-media-search] APIFY_API_TOKEN not configured - returning empty results');
      return new Response(
        JSON.stringify({
          findingsCount: 0,
          findings: [],
          message: 'Apify integration not configured',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const actorRunResponse = await fetch(
      'https://api.apify.com/v2/acts/xtech~social-media-finder-pro/runs?token=' + apifyToken,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          maxPlatforms: 300,
          includeNsfw: false,
        }),
      }
    );

    if (!actorRunResponse.ok) {
      const errorText = await actorRunResponse.text();
      console.error('[social-media-search] Apify run failed:', errorText);
      return new Response(
        JSON.stringify({
          findingsCount: 0,
          findings: [],
          error: `Apify error: ${actorRunResponse.status}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const runData = await actorRunResponse.json();
    const runId = runData.data?.id;

    if (!runId) {
      console.error('[social-media-search] No run ID returned');
      return new Response(
        JSON.stringify({ findingsCount: 0, findings: [], error: 'No run ID from Apify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[social-media-search] Apify run started: ${runId}`);

    // Wait for completion (max 3 minutes)
    let attempts = 0;
    let results: any[] = [];

    while (attempts < 36) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`
      );

      if (!statusResponse.ok) {
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      const status = statusData.data?.status;

      if (status === 'SUCCEEDED') {
        const resultsResponse = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyToken}`
        );

        if (resultsResponse.ok) {
          results = await resultsResponse.json();
        }
        break;
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        console.error(`[social-media-search] Apify run ${status}`);
        break;
      }

      attempts++;
    }

    console.log(`[social-media-search] Found ${results.length} social media profiles`);

    // Store findings in darkweb_findings
    const findings = results.map((result) => ({
      target_id: targetId,
      provider: 'apify-social',
      url: result.profileUrl || result.url,
      meta: {
        platform: result.platform,
        username: result.username,
        displayName: result.displayName,
        verified: result.verified,
        followers: result.followers,
      },
      observed_at: new Date().toISOString(),
      is_new: true,
      severity: 'low',
    }));

    if (findings.length > 0) {
      const { error: insertError } = await supabase
        .from('darkweb_findings')
        .upsert(findings, {
          onConflict: 'target_id,provider,url',
          ignoreDuplicates: true,
        });

      if (insertError) {
        console.error('[social-media-search] Insert error:', insertError);
      }
    }

    // Update target last_checked
    await supabase
      .from('darkweb_targets')
      .update({ last_checked: new Date().toISOString() })
      .eq('id', targetId);

    return new Response(
      JSON.stringify({
        findingsCount: findings.length,
        findings: findings.slice(0, 10),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[social-media-search] Error:', error);
    return new Response(
      JSON.stringify({
        findingsCount: 0,
        findings: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
