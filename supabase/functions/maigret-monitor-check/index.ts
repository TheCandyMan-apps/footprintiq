import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Scheduled function to check monitored usernames for changes
 * Called by pg_cron every hour
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

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';

    console.log('🔄 Starting periodic Maigret monitoring check');

    // Get all monitored usernames that need checking
    const { data: monitoredUsernames, error: fetchError } = await supabase
      .from('maigret_monitored_usernames')
      .select('*')
      .or(`last_checked_at.is.null,last_checked_at.lt.${new Date(Date.now() - 60 * 60 * 1000).toISOString()}`); // Check if never checked or > 1 hour ago

    if (fetchError) {
      console.error('Error fetching monitored usernames:', fetchError);
      throw fetchError;
    }

    if (!monitoredUsernames || monitoredUsernames.length === 0) {
      console.log('✅ No usernames need checking at this time');
      return new Response(
        JSON.stringify({
          success: true,
          checked: 0,
          message: 'No usernames need checking',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${monitoredUsernames.length} usernames to check`);

    const results = [];

    // Check each username
    for (const monitored of monitoredUsernames) {
      try {
        console.log(`  Checking username: ${monitored.username}`);

        // Call providers-maigret to get current state
        const scanResponse = await fetch(`${SUPABASE_URL}/functions/v1/providers-maigret`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({
            usernames: [monitored.username],
            sites: monitored.sites_filter || undefined,
            timeout: 60,
          }),
        });

        if (!scanResponse.ok) {
          console.error(`  ❌ Scan failed for ${monitored.username}: ${scanResponse.status}`);
          continue;
        }

        const scanData = await scanResponse.json();
        const findings = scanData.findings || [];

        console.log(`  ✅ Got ${findings.length} findings for ${monitored.username}`);

        // Store snapshot
        await fetch(`${SUPABASE_URL}/functions/v1/maigret-store-snapshot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            username: monitored.username,
            workspaceId: monitored.workspace_id,
            findings: findings.map((f: any) => ({
              site: f.evidence.site,
              url: f.evidence.url,
              status: f.evidence.status || 'found',
              confidence: f.confidence,
              rawData: f,
            })),
          }),
        });

        // Detect changes
        const changesResponse = await fetch(`${SUPABASE_URL}/functions/v1/maigret-detect-changes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            username: monitored.username,
            workspaceId: monitored.workspace_id,
            currentFindings: findings.map((f: any) => ({
              site: f.evidence.site,
              url: f.evidence.url,
              status: f.evidence.status || 'found',
              confidence: f.confidence,
            })),
          }),
        });

        if (changesResponse.ok) {
          const changesData = await changesResponse.json();
          console.log(`  📊 Detected ${changesData.changeCount} changes`);

          // Send email alerts if there are changes
          if (changesData.changeCount > 0 && monitored.email_alerts_enabled) {
            const changeIds = changesData.changes.map((c: any) => c.id);
            
            // Get the actual change IDs from the database (since detect-changes doesn't return them)
            const { data: recentChanges } = await supabase
              .from('maigret_profile_changes')
              .select('id')
              .eq('username', monitored.username)
              .eq('workspace_id', monitored.workspace_id)
              .eq('email_sent', false)
              .limit(changesData.changeCount);

            if (recentChanges && recentChanges.length > 0) {
              await fetch(`${SUPABASE_URL}/functions/v1/maigret-send-change-alert`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                },
                body: JSON.stringify({
                  changeIds: recentChanges.map(c => c.id),
                }),
              });
            }
          }

          results.push({
            username: monitored.username,
            success: true,
            findings: findings.length,
            changes: changesData.changeCount,
          });
        }

        // Update last_checked_at
        await supabase
          .from('maigret_monitored_usernames')
          .update({ last_checked_at: new Date().toISOString() })
          .eq('id', monitored.id);

      } catch (error) {
        console.error(`  ❌ Error checking ${monitored.username}:`, error);
        results.push({
          username: monitored.username,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`✅ Completed monitoring check: ${results.filter(r => r.success).length}/${results.length} successful`);

    return new Response(
      JSON.stringify({
        success: true,
        checked: results.length,
        successful: results.filter(r => r.success).length,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Error in maigret-monitor-check:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
