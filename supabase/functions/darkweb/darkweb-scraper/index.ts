import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';

/**
 * Dark Web Scraper via Apify
 * Uses epctex/darkweb-scraper for dark web-specific searches
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { searchQuery, targetId, workspaceId } = await req.json();

    if (!searchQuery || !targetId || !workspaceId) {
      return bad(400, 'Missing required fields: searchQuery, targetId, workspaceId');
    }

    console.log(`[darkweb-scraper] Searching dark web for: ${searchQuery}`);

    const apifyToken = Deno.env.get('APIFY_API_TOKEN');
    if (!apifyToken) {
      console.error('[darkweb-scraper] APIFY_API_TOKEN not configured');
      return bad(500, 'Apify integration not configured');
    }

    // Call Apify actor
    const actorRunResponse = await fetch(
      'https://api.apify.com/v2/acts/epctex~darkweb-scraper/runs?token=' + apifyToken,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery,
          maxResults: 50,
          includeEmails: true,
          includeApiKeys: true,
          includeCryptoWallets: true,
        }),
      }
    );

    if (!actorRunResponse.ok) {
      const errorText = await actorRunResponse.text();
      console.error('[darkweb-scraper] Apify run failed:', errorText);
      return bad(500, 'Failed to start Apify actor');
    }

    const runData = await actorRunResponse.json();
    const runId = runData.data.id;

    console.log(`[darkweb-scraper] Apify run started: ${runId}`);

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
      const status = statusData.data.status;

      if (status === 'SUCCEEDED') {
        const resultsResponse = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyToken}`
        );

        if (resultsResponse.ok) {
          results = await resultsResponse.json();
        }
        break;
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        console.error(`[darkweb-scraper] Apify run ${status}`);
        break;
      }

      attempts++;
    }

    console.log(`[darkweb-scraper] Found ${results.length} dark web results`);

    // Determine severity
    const getSeverity = (result: any): string => {
      if (result.type === 'api_key' || result.type === 'credentials' || result.type === 'crypto_wallet') {
        return 'critical';
      }
      if (result.type === 'email' || result.type === 'phone') {
        return 'high';
      }
      return 'medium';
    };

    // Store findings
    const findings = results.map((result) => ({
      target_id: targetId,
      provider: 'apify-darkweb',
      url: result.url || result.source,
      meta: {
        type: result.type,
        breach: result.breach,
        database: result.database,
        leak_date: result.leakDate,
        snippet: result.snippet?.substring(0, 500),
      },
      observed_at: new Date().toISOString(),
      is_new: true,
      severity: getSeverity(result),
    }));

    if (findings.length > 0) {
      const { error: insertError } = await supabase
        .from('darkweb_findings')
        .upsert(findings, {
          onConflict: 'target_id,provider,url',
          ignoreDuplicates: true,
        });

      if (insertError) {
        console.error('[darkweb-scraper] Insert error:', insertError);
      }
    }

    // Update target
    await supabase
      .from('darkweb_targets')
      .update({ last_checked: new Date().toISOString() })
      .eq('id', targetId);

    return ok({
      findingsCount: findings.length,
      criticalCount: findings.filter(f => f.severity === 'critical').length,
      highCount: findings.filter(f => f.severity === 'high').length,
      findings: findings.slice(0, 10),
    });

  } catch (error) {
    console.error('[darkweb-scraper] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
