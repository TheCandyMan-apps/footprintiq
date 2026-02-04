import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ProviderStatus = 'success' | 'failed' | 'skipped' | 'not_configured' | 'tier_restricted';

interface ProviderResult {
  status: ProviderStatus;
  findingsCount: number;
  latencyMs: number;
  message?: string;
}

interface Finding {
  scan_id: string;
  workspace_id: string;
  provider: string;
  kind: string;
  severity: string;
  confidence: number;
  evidence: Array<{ key: string; value: string }>;
  observed_at: string;
  meta: Record<string, unknown>;
}

function generateFindingKey(provider: string, kind: string, unique: string): string {
  return `${provider}_${kind}_${unique.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { scanId, name, workspaceId, providers = ['predictasearch'], userPlan = 'free' } = body;

    if (!name || !scanId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, scanId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[name-intel] Starting scan for "${name.slice(0, 10)}***" (scanId: ${scanId})`);
    console.log(`[name-intel] Requested providers: ${providers.join(', ')}`);
    console.log(`[name-intel] User plan: ${userPlan}`);

    const findings: Finding[] = [];
    const providerResults: Record<string, ProviderResult> = {};

    // Helper to log scan events
    const logScanEvent = async (providerId: string, stage: string, status: string, errorMessage?: string) => {
      try {
        await supabase.from('scan_events').insert({
          scan_id: scanId,
          provider: providerId,
          stage,
          status,
          error_message: errorMessage || null,
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error(`[name-intel] Failed to log scan event for ${providerId}:`, e);
      }
    };

    // Helper to broadcast progress
    const broadcastProgress = async (message: string, completed: number) => {
      try {
        const channel = supabase.channel(`scan_progress:${scanId}`);
        await channel.send({
          type: 'broadcast',
          event: 'provider_complete',
          payload: {
            scanId,
            message,
            completedProviders: completed,
            totalProviders: providers.length,
          },
        });
      } catch (e) {
        console.error('[name-intel] Failed to broadcast progress:', e);
      }
    };

    // ==================== PredictaSearch Provider ====================
    if (providers.includes('predictasearch')) {
      const startTime = Date.now();
      const PREDICTA_KEY = Deno.env.get('PREDICTA_SEARCH_API_KEY');

      if (!PREDICTA_KEY) {
        console.log('[name-intel] PREDICTA_SEARCH_API_KEY not configured');
        providerResults['predictasearch'] = { status: 'not_configured', findingsCount: 0, latencyMs: 0, message: 'API key not configured' };
        await logScanEvent('predictasearch', 'execution', 'not_configured', 'PREDICTA_SEARCH_API_KEY not set');
      } else {
        try {
          console.log(`[name-intel] Calling PredictaSearch for name: "${name.slice(0, 10)}***"`);
          
          const response = await fetch('https://dev.predictasearch.com/api/search', {
            method: 'POST',
            headers: {
              'x-api-key': PREDICTA_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: name,
              query_type: 'name',
              networks: ['all']
            }),
          });

          const latency = Date.now() - startTime;

          if (response.ok) {
            const data = await response.json();
            console.log(`[name-intel] PredictaSearch raw response length: ${JSON.stringify(data).length}`);

            // Normalize the flat array response
            const results = Array.isArray(data) ? data : [];
            let findingsAdded = 0;

            // Process profiles
            results.forEach((item: any) => {
              if (item.source === 'hudsonrock' || item.breach_name || item.date_compromised) {
                // Breach finding
                findings.push({
                  scan_id: scanId,
                  workspace_id: workspaceId,
                  provider: 'predictasearch',
                  kind: 'breach.hit',
                  severity: 'high',
                  confidence: 0.85,
                  evidence: [
                    { key: 'Name', value: name },
                    { key: 'Source', value: item.source || 'breach' },
                    { key: 'Breach', value: item.breach_name || 'Unknown' },
                    ...(item.date_compromised ? [{ key: 'Date', value: item.date_compromised }] : []),
                    ...(item.email ? [{ key: 'Email', value: item.email }] : []),
                  ],
                  observed_at: new Date().toISOString(),
                  meta: {
                    finding_key: generateFindingKey('predictasearch', 'breach', item.breach_name || name),
                    type: 'breach',
                    title: `Breach: ${item.breach_name || 'Unknown'}`,
                    description: `Found in ${item.source || 'breach database'}`,
                    raw_data: item,
                  },
                });
                findingsAdded++;
              } else {
                // Social profile finding
                const platform = item.platform || item.source || 'unknown';
                const username = item.username || item.handle || '';
                const profileUrl = item.link || item.url || '';
                
                if (platform && (username || profileUrl)) {
                  findings.push({
                    scan_id: scanId,
                    workspace_id: workspaceId,
                    provider: 'predictasearch',
                    kind: 'social.profile',
                    severity: 'medium',
                    confidence: item.is_verified ? 0.95 : 0.75,
                    evidence: [
                      { key: 'Name', value: name },
                      { key: 'Platform', value: platform },
                      ...(username ? [{ key: 'Username', value: username }] : []),
                      ...(profileUrl ? [{ key: 'URL', value: profileUrl }] : []),
                      ...(item.name ? [{ key: 'Display Name', value: item.name }] : []),
                      ...(item.email ? [{ key: 'Email', value: item.email }] : []),
                      ...(item.is_verified ? [{ key: 'Verified', value: 'true' }] : []),
                    ],
                    observed_at: new Date().toISOString(),
                    meta: {
                      finding_key: generateFindingKey('predictasearch', 'profile', `${platform}_${username}`),
                      type: 'social_profile',
                      title: `${platform}: ${username || 'Profile Found'}`,
                      description: `Profile found on ${platform} for name "${name}"`,
                      avatar: item.pfp_image,
                      followers: item.followers_count,
                      following: item.following_count,
                      url: profileUrl,
                      raw_data: item,
                    },
                  });
                  findingsAdded++;
                }
              }
            });

            console.log(`[name-intel] PredictaSearch found ${findingsAdded} results from ${results.length} items`);
            providerResults['predictasearch'] = { status: 'success', findingsCount: findingsAdded, latencyMs: latency };
            await logScanEvent('predictasearch', 'execution', 'success');

            // Log credit balance
            const creditBalance = response.headers.get('x-credit-balance');
            if (creditBalance) {
              console.log(`[name-intel] PredictaSearch credits remaining: ${creditBalance}`);
            }
          } else {
            console.error(`[name-intel] PredictaSearch API error: ${response.status}`);
            providerResults['predictasearch'] = { status: 'failed', findingsCount: 0, latencyMs: latency, message: `HTTP ${response.status}` };
            await logScanEvent('predictasearch', 'execution', 'failed', `HTTP ${response.status}`);
          }
        } catch (error) {
          console.error('[name-intel] PredictaSearch error:', error);
          providerResults['predictasearch'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime, message: error instanceof Error ? error.message : 'Unknown error' };
          await logScanEvent('predictasearch', 'execution', 'failed', error instanceof Error ? error.message : 'Unknown error');
        }
      }
      await broadcastProgress('Name search complete', Object.keys(providerResults).length);
    }

    // ==================== Store Findings ====================
    if (findings.length > 0) {
      console.log(`[name-intel] Inserting ${findings.length} findings`);
      const { error: insertError } = await supabase.from('findings').insert(findings);

      if (insertError) {
        console.error('[name-intel] Error inserting findings:', insertError);
      } else {
        console.log(`[name-intel] Successfully inserted ${findings.length} findings`);
      }
    } else {
      console.log('[name-intel] No findings to insert');
    }

    // Update scan with provider results
    const totalFindings = findings.length;
    const { error: updateError } = await supabase
      .from('scans')
      .update({
        provider_counts: providerResults,
        status: totalFindings > 0 ? 'completed' : 'completed_empty',
        completed_at: new Date().toISOString(),
      })
      .eq('id', scanId);

    if (updateError) {
      console.error('[name-intel] Error updating scan:', updateError);
    }

    // Broadcast completion
    try {
      const channel = supabase.channel(`scan_progress:${scanId}`);
      await channel.send({
        type: 'broadcast',
        event: 'scan_complete',
        payload: {
          scanId,
          status: totalFindings > 0 ? 'completed' : 'completed_empty',
          findingsCount: totalFindings,
          providerResults,
        },
      });
    } catch (e) {
      console.error('[name-intel] Failed to broadcast completion:', e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        scanId,
        findingsCount: totalFindings,
        providerResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[name-intel] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
