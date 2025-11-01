import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad } from '../../_shared/secure.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[darkweb-monitor] Starting daily dark web monitoring');

    // Fetch active targets that need checking
    const { data: targets, error: targetsError } = await supabase
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
        // Call Apify dark web scraper
        const { data: apifyData, error: apifyError } = await supabase.functions.invoke(
          'providers/apify-runner',
          {
            body: {
              actorId: 'epctex/darkweb-scraper',
              input: {
                searchQuery: target.value,
                maxResults: 50,
              },
              timeoutSec: 180,
            },
          }
        );

        if (apifyError) {
          console.error(`[darkweb-monitor] Target ${target.id} failed:`, apifyError);
          continue;
        }

        const findings = apifyData.findings || [];

        // Insert new findings (dedupe by target_id + provider + url)
        for (const finding of findings) {
          const { error: insertError } = await supabase
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
              ignoreDuplicates: true,
            });

          if (!insertError) {
            newFindingsCount++;
          }
        }

        // Update last_checked
        await supabase
          .from('darkweb_targets')
          .update({ last_checked: new Date().toISOString() })
          .eq('id', target.id);

        // Consume credits for Pro plan (1 credit per hit)
        if (findings.length > 0) {
          await supabase.from('credits_ledger').insert({
            workspace_id: target.workspace_id,
            delta: -findings.length,
            reason: 'darkweb_scan',
            ref_id: target.id,
          });
        }

        // Send alert email for new findings
        if (findings.length > 0) {
          await supabase.functions.invoke('send-monitoring-alert', {
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
