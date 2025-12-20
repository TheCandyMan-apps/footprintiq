import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
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
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[darkweb-monitor] Starting dark web monitoring scan');

    // Parse optional body for manual runs
    let requestedWorkspaceId: string | null = null;
    try {
      const body = await req.json();
      requestedWorkspaceId = body?.workspaceId || null;
    } catch {
      // No body or not JSON - running as cron job
    }

    // Fetch active targets that need checking
    let query = supabaseService
      .from('darkweb_targets')
      .select('*')
      .eq('active', true);

    // If workspace specified, only check that workspace's targets
    if (requestedWorkspaceId) {
      query = query.eq('workspace_id', requestedWorkspaceId);
      console.log(`[darkweb-monitor] Manual run for workspace: ${requestedWorkspaceId}`);
    } else {
      // For cron runs, only check targets not checked in last 24h
      query = query.or(`last_checked.is.null,last_checked.lt.${new Date(Date.now() - 24 * 3600000).toISOString()}`);
    }

    const { data: targets, error: targetsError } = await query;

    if (targetsError) {
      console.error('[darkweb-monitor] Failed to fetch targets:', targetsError);
      throw targetsError;
    }

    if (!targets || targets.length === 0) {
      console.log('[darkweb-monitor] No targets to check');
      return new Response(
        JSON.stringify({ checked: 0, newFindings: 0, checkedCount: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[darkweb-monitor] Found ${targets.length} targets to check`);

    let newFindingsCount = 0;
    let checkedCount = 0;

    for (const target of targets) {
      try {
        console.log(`[darkweb-monitor] Processing target ${target.id}: "${target.value}" (type: ${target.type})`);

        // Check consent for darkweb monitoring
        const { data: consent, error: consentError } = await supabaseService
          .from('sensitive_consents')
          .select('categories')
          .eq('workspace_id', target.workspace_id)
          .maybeSingle();

        if (consentError) {
          console.warn(`[darkweb-monitor] Consent check error for target ${target.id}:`, consentError);
        }

        const allowedCategories = consent?.categories || [];
        if (consent && !allowedCategories.includes('darkweb')) {
          console.log(`[darkweb-monitor] Skipping target ${target.id}: no darkweb consent`);
          continue;
        }

        console.log(`[darkweb-monitor] Consent check passed for target ${target.id}`);

        // Determine target type
        const isEmail = target.value.includes('@');
        const isDomain = target.value.includes('.') && !isEmail;
        const isUsername = !isEmail && !isDomain;

        console.log(`[darkweb-monitor] Target ${target.id} detected as: ${isEmail ? 'email' : isDomain ? 'domain' : 'username'}`);

        let allFindings: any[] = [];

        // 1. Dark web scraper (always run)
        try {
          console.log(`[darkweb-monitor] Invoking darkweb-scraper for target ${target.id}`);
          const { data: darkwebData, error: darkwebError } = await supabaseService.functions.invoke(
            'darkweb-scraper',
            {
              body: {
                searchQuery: target.value,
                targetId: target.id,
                workspaceId: target.workspace_id,
              },
            }
          );

          if (darkwebError) {
            console.error(`[darkweb-monitor] darkweb-scraper error for ${target.id}:`, darkwebError);
          } else if (darkwebData?.findings) {
            console.log(`[darkweb-monitor] darkweb-scraper returned ${darkwebData.findings.length} findings`);
            allFindings.push(...darkwebData.findings);
          } else {
            console.log(`[darkweb-monitor] darkweb-scraper returned no findings`);
          }
        } catch (err) {
          console.error(`[darkweb-monitor] Dark web scraper failed for ${target.id}:`, err);
        }

        // 2. OSINT paste site scraper (for all types)
        try {
          console.log(`[darkweb-monitor] Invoking darkweb-osint-scraper for target ${target.id}`);
          const { data: osintData, error: osintError } = await supabaseService.functions.invoke(
            'darkweb-osint-scraper',
            {
              body: {
                searchQuery: target.value,
                targetId: target.id,
                workspaceId: target.workspace_id,
              },
            }
          );

          if (osintError) {
            console.error(`[darkweb-monitor] osint-scraper error for ${target.id}:`, osintError);
          } else if (osintData?.findings) {
            console.log(`[darkweb-monitor] osint-scraper returned ${osintData.findings.length} findings`);
            allFindings.push(...osintData.findings);
          } else {
            console.log(`[darkweb-monitor] osint-scraper returned no findings`);
          }
        } catch (err) {
          console.error(`[darkweb-monitor] OSINT scraper failed for ${target.id}:`, err);
        }

        // 3. Social media search (for usernames only)
        if (isUsername) {
          try {
            console.log(`[darkweb-monitor] Invoking darkweb-social-search for username target ${target.id}`);
            const { data: socialData, error: socialError } = await supabaseService.functions.invoke(
              'darkweb-social-search',
              {
                body: {
                  username: target.value,
                  targetId: target.id,
                  workspaceId: target.workspace_id,
                },
              }
            );

            if (socialError) {
              console.error(`[darkweb-monitor] social-media-search error for ${target.id}:`, socialError);
            } else if (socialData?.findings) {
              console.log(`[darkweb-monitor] social-media-search returned ${socialData.findings.length} findings`);
              allFindings.push(...socialData.findings);
            } else {
              console.log(`[darkweb-monitor] social-media-search returned no findings`);
            }
          } catch (err) {
            console.error(`[darkweb-monitor] Social media search failed for ${target.id}:`, err);
          }
        }

        console.log(`[darkweb-monitor] Total findings for target ${target.id}: ${allFindings.length}`);

        // Store findings directly if they aren't already stored by sub-functions
        for (const finding of allFindings) {
          if (finding.target_id && finding.provider && finding.url) {
            const { error: insertError } = await supabaseService
              .from('darkweb_findings')
              .upsert({
                target_id: finding.target_id,
                provider: finding.provider,
                url: finding.url,
                meta: finding.meta || {},
                observed_at: finding.observed_at || new Date().toISOString(),
                is_new: true,
                severity: finding.severity || 'medium',
              }, {
                onConflict: 'target_id,provider,url',
                ignoreDuplicates: true,
              });

            if (!insertError) {
              newFindingsCount++;
            } else {
              console.warn(`[darkweb-monitor] Failed to upsert finding:`, insertError);
            }
          }
        }

        // Update last_checked
        const { error: updateError } = await supabaseService
          .from('darkweb_targets')
          .update({ last_checked: new Date().toISOString() })
          .eq('id', target.id);

        if (updateError) {
          console.error(`[darkweb-monitor] Failed to update last_checked for ${target.id}:`, updateError);
        } else {
          console.log(`[darkweb-monitor] Updated last_checked for target ${target.id}`);
        }

        checkedCount++;

        // Consume credits for Pro plan (1 credit per finding)
        if (allFindings.length > 0) {
          const { error: creditError } = await supabaseService.from('credits_ledger').insert({
            workspace_id: target.workspace_id,
            delta: -allFindings.length,
            reason: 'darkweb_scan',
            ref_id: target.id,
          });

          if (creditError) {
            console.warn(`[darkweb-monitor] Failed to deduct credits for ${target.id}:`, creditError);
          }
        }

        // Send alert email for new findings
        if (allFindings.length > 0) {
          try {
            await supabaseService.functions.invoke('send-monitoring-alert', {
              body: {
                workspace_id: target.workspace_id,
                target,
                findings: allFindings.slice(0, 10),
              },
            });
            console.log(`[darkweb-monitor] Sent alert for target ${target.id}`);
          } catch (alertErr) {
            console.warn(`[darkweb-monitor] Failed to send alert for ${target.id}:`, alertErr);
          }
        }

      } catch (error) {
        console.error(`[darkweb-monitor] Target ${target.id} processing error:`, error);
      }
    }

    console.log(`[darkweb-monitor] Completed: checked ${checkedCount} targets, found ${newFindingsCount} new findings`);

    return new Response(
      JSON.stringify({
        checked: checkedCount,
        checkedCount: checkedCount,
        newFindings: newFindingsCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[darkweb-monitor] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
