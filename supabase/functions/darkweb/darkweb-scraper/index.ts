import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';

/**
 * Dark Web Scraper via Apify
 * Uses epctex/darkweb-scraper for dark web-specific searches
 * Falls back gracefully if Apify is unavailable
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
      console.error('[darkweb-scraper] Missing required fields');
      return bad(400, 'Missing required fields: searchQuery, targetId, workspaceId');
    }

    console.log(`[darkweb-scraper] Starting search for: "${searchQuery}" (target: ${targetId})`);

    const apifyToken = Deno.env.get('APIFY_API_TOKEN');
    if (!apifyToken) {
      console.warn('[darkweb-scraper] APIFY_API_TOKEN not configured - returning empty results');
      // Return empty but valid response instead of error
      return ok({
        findingsCount: 0,
        criticalCount: 0,
        highCount: 0,
        findings: [],
        message: 'Apify integration not configured',
      });
    }

    console.log('[darkweb-scraper] Initiating Apify actor run');

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
      console.error('[darkweb-scraper] Apify run failed:', actorRunResponse.status, errorText);
      // Return empty results instead of failing
      return ok({
        findingsCount: 0,
        criticalCount: 0,
        highCount: 0,
        findings: [],
        error: `Apify error: ${actorRunResponse.status}`,
      });
    }

    const runData = await actorRunResponse.json();
    const runId = runData.data?.id;

    if (!runId) {
      console.error('[darkweb-scraper] No run ID returned from Apify');
      return ok({
        findingsCount: 0,
        criticalCount: 0,
        highCount: 0,
        findings: [],
        error: 'No run ID from Apify',
      });
    }

    console.log(`[darkweb-scraper] Apify run started: ${runId}`);

    // Wait for completion (max 3 minutes)
    let attempts = 0;
    const maxAttempts = 36;
    let results: any[] = [];
    let finalStatus = 'UNKNOWN';

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      try {
        const statusResponse = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`
        );

        if (!statusResponse.ok) {
          console.warn(`[darkweb-scraper] Status check failed (attempt ${attempts + 1}):`, statusResponse.status);
          attempts++;
          continue;
        }

        const statusData = await statusResponse.json();
        finalStatus = statusData.data?.status || 'UNKNOWN';

        console.log(`[darkweb-scraper] Run status (attempt ${attempts + 1}): ${finalStatus}`);

        if (finalStatus === 'SUCCEEDED') {
          const resultsResponse = await fetch(
            `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyToken}`
          );

          if (resultsResponse.ok) {
            results = await resultsResponse.json();
            console.log(`[darkweb-scraper] Retrieved ${results.length} results`);
          } else {
            console.warn('[darkweb-scraper] Failed to fetch results:', resultsResponse.status);
          }
          break;
        } else if (finalStatus === 'FAILED' || finalStatus === 'ABORTED' || finalStatus === 'TIMED-OUT') {
          console.error(`[darkweb-scraper] Apify run ${finalStatus}`);
          break;
        }
      } catch (pollErr) {
        console.warn(`[darkweb-scraper] Polling error (attempt ${attempts + 1}):`, pollErr);
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.warn('[darkweb-scraper] Polling timed out');
    }

    console.log(`[darkweb-scraper] Final: ${results.length} dark web results (status: ${finalStatus})`);

    // Determine severity
    const getSeverity = (result: any): string => {
      const type = result.type?.toLowerCase() || '';
      if (type.includes('api_key') || type.includes('credential') || type.includes('password') || type.includes('crypto_wallet')) {
        return 'critical';
      }
      if (type.includes('email') || type.includes('phone') || type.includes('ssn')) {
        return 'high';
      }
      return 'medium';
    };

    // Format findings
    const findings = results.map((result) => ({
      target_id: targetId,
      provider: 'apify-darkweb',
      url: result.url || result.source || `darkweb-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      meta: {
        type: result.type,
        breach: result.breach,
        database: result.database,
        leak_date: result.leakDate,
        snippet: result.snippet?.substring(0, 500),
        raw_title: result.title,
      },
      observed_at: new Date().toISOString(),
      is_new: true,
      severity: getSeverity(result),
    }));

    // Store findings
    if (findings.length > 0) {
      console.log(`[darkweb-scraper] Storing ${findings.length} findings in database`);

      const { error: insertError } = await supabase
        .from('darkweb_findings')
        .upsert(findings, {
          onConflict: 'target_id,provider,url',
          ignoreDuplicates: true,
        });

      if (insertError) {
        console.error('[darkweb-scraper] Insert error:', insertError);
      } else {
        console.log('[darkweb-scraper] Findings stored successfully');
      }
    }

    // Update target last_checked
    const { error: updateError } = await supabase
      .from('darkweb_targets')
      .update({ last_checked: new Date().toISOString() })
      .eq('id', targetId);

    if (updateError) {
      console.warn('[darkweb-scraper] Failed to update last_checked:', updateError);
    }

    return ok({
      findingsCount: findings.length,
      criticalCount: findings.filter(f => f.severity === 'critical').length,
      highCount: findings.filter(f => f.severity === 'high').length,
      findings: findings.slice(0, 10),
    });

  } catch (error) {
    console.error('[darkweb-scraper] Error:', error);
    // Return graceful error response
    return ok({
      findingsCount: 0,
      criticalCount: 0,
      highCount: 0,
      findings: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
