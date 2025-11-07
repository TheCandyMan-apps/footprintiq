import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[darkweb-monitor] Starting daily dark web monitoring');

    // Fetch active targets that need checking
    const { data: targets, error: targetsError } = await supabaseService
      .from('darkweb_targets')
      .select('*')
      .eq('active', true)
      .or(`last_checked.is.null,last_checked.lt.${new Date(Date.now() - 24 * 3600000).toISOString()}`);

    if (targetsError) throw targetsError;

    if (!targets || targets.length === 0) {
      console.log('[darkweb-monitor] No targets to check');
      return ok({ checked: 0, newFindings: 0 });
    }

    console.log(`[darkweb-monitor] Checking ${targets.length} targets`);

    let newFindingsCount = 0;

    for (const target of targets) {
      try {
        console.log(`[darkweb-monitor] Processing target ${target.id}: ${target.value}`);

        // Check consent for darkweb monitoring
        const { data: consent } = await supabaseService
          .from('sensitive_consents')
          .select('categories')
          .eq('workspace_id', target.workspace_id)
          .eq('user_id', target.user_id)
          .single();

        const allowedCategories = consent?.categories || [];
        if (!allowedCategories.includes('darkweb')) {
          console.warn(`[darkweb-monitor] Skipping target ${target.id}: no darkweb consent`);
          continue;
        }

        // Determine target type and run appropriate searches
        const isEmail = target.value.includes('@');
        const isDomain = target.value.includes('.') && !isEmail;
        const isUsername = !isEmail && !isDomain;

        let allFindings: any[] = [];

        // 1. Dark web scraper (always run)
        try {
          const { data: darkwebData } = await supabaseService.functions.invoke(
            'darkweb/darkweb-scraper',
            {
              body: {
                searchQuery: target.value,
                targetId: target.id,
                workspaceId: target.workspace_id,
              },
            }
          );
          if (darkwebData?.findings) {
            allFindings.push(...darkwebData.findings);
          }
        } catch (err) {
          console.error(`[darkweb-monitor] Dark web scraper failed for ${target.id}:`, err);
        }

        // 2. OSINT paste site scraper (for all types)
        try {
          const { data: osintData } = await supabaseService.functions.invoke(
            'darkweb/osint-scraper',
            {
              body: {
                searchQuery: target.value,
                targetId: target.id,
                workspaceId: target.workspace_id,
              },
            }
          );
          if (osintData?.findings) {
            allFindings.push(...osintData.findings);
          }
        } catch (err) {
          console.error(`[darkweb-monitor] OSINT scraper failed for ${target.id}:`, err);
        }

        // 3. Social media search (for usernames only)
        if (isUsername) {
          try {
            const { data: socialData } = await supabaseService.functions.invoke(
              'darkweb/social-media-search',
              {
                body: {
                  username: target.value,
                  targetId: target.id,
                  workspaceId: target.workspace_id,
                },
              }
            );
            if (socialData?.findings) {
              allFindings.push(...socialData.findings);
            }
          } catch (err) {
            console.error(`[darkweb-monitor] Social media search failed for ${target.id}:`, err);
          }
        }

        const findings = allFindings;

        // Upsert findings to avoid duplicate key errors
        for (const finding of findings) {
          const { error: insertError } = await supabaseService
            .from('darkweb_findings')
            .upsert({
              target_id: target.id,
              provider: finding.provider,
              url: finding.evidence.find((e: any) => e.key === 'url')?.value || '',
              meta: finding.meta || {},
              observed_at: finding.observedAt,
              is_new: true,
            }, {
              onConflict: 'target_id,provider,url',
              ignoreDuplicates: false, // Update if exists
            });

          if (!insertError) {
            newFindingsCount++;
          }
        }

        // Update last_checked
        await supabaseService
          .from('darkweb_targets')
          .update({ last_checked: new Date().toISOString() })
          .eq('id', target.id);

        // Consume credits for Pro plan (1 credit per hit)
        if (findings.length > 0) {
          await supabaseService.from('credits_ledger').insert({
            workspace_id: target.workspace_id,
            delta: -findings.length,
            reason: 'darkweb_scan',
            ref_id: target.id,
          });
        }

        // Send alert email for new findings
        if (findings.length > 0) {
          await supabaseService.functions.invoke('send-monitoring-alert', {
            body: {
              workspace_id: target.workspace_id,
              target,
              findings: findings.slice(0, 10), // Top 10
            },
          });
        }

      } catch (error) {
        console.error(`[darkweb-monitor] Target ${target.id} error:`, error);
      }
    }

    console.log(`[darkweb-monitor] Completed: ${newFindingsCount} new findings`);

    return ok({
      checked: targets.length,
      newFindings: newFindingsCount,
    });

  } catch (error) {
    console.error('[darkweb-monitor] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
