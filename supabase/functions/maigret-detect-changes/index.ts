import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DetectChangesRequest {
  username: string;
  workspaceId: string;
  currentFindings: Array<{
    site: string;
    url?: string;
    status: string;
    confidence?: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: DetectChangesRequest = await req.json();
    const { username, workspaceId, currentFindings } = body;

    if (!username || !workspaceId || !currentFindings) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Detecting changes for username: ${username}`);

    // Get the most recent snapshot for each site
    const { data: previousSnapshots, error: snapshotError } = await supabase
      .from('maigret_profile_snapshots')
      .select('*')
      .eq('username', username)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (snapshotError) {
      console.error('Error fetching snapshots:', snapshotError);
      throw snapshotError;
    }

    if (!previousSnapshots || previousSnapshots.length === 0) {
      console.log('✅ No previous snapshots found - this is the first scan');
      return new Response(
        JSON.stringify({
          changes: [],
          firstScan: true,
          message: 'First scan for this username',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group previous snapshots by site (get most recent per site)
    const previousBySite = new Map();
    for (const snapshot of previousSnapshots) {
      if (!previousBySite.has(snapshot.site)) {
        previousBySite.set(snapshot.site, snapshot);
      }
    }

    // Current findings by site
    const currentBySite = new Map();
    for (const finding of currentFindings) {
      currentBySite.set(finding.site, finding);
    }

    const changes = [];
    const allSites = new Set([...previousBySite.keys(), ...currentBySite.keys()]);

    // Detect changes
    for (const site of allSites) {
      const previous = previousBySite.get(site);
      const current = currentBySite.get(site);

      if (!previous && current) {
        // Profile created (newly found)
        console.log(`  ✨ NEW: ${site}`);
        changes.push({
          username,
          site,
          change_type: 'created',
          old_snapshot_id: null,
          new_snapshot_id: null, // Will be filled after storing new snapshot
          change_details: {
            url: current.url,
            status: current.status,
          },
          workspace_id: workspaceId,
        });
      } else if (previous && !current) {
        // Profile deleted (no longer found)
        console.log(`  🗑️  DELETED: ${site}`);
        changes.push({
          username,
          site,
          change_type: 'deleted',
          old_snapshot_id: previous.id,
          new_snapshot_id: null,
          change_details: {
            previousUrl: previous.url,
            previousStatus: previous.status,
          },
          workspace_id: workspaceId,
        });
      } else if (previous && current) {
        // Check if something changed
        if (previous.url !== current.url || previous.status !== current.status) {
          console.log(`  📝 MODIFIED: ${site}`);
          changes.push({
            username,
            site,
            change_type: 'modified',
            old_snapshot_id: previous.id,
            new_snapshot_id: null,
            change_details: {
              oldUrl: previous.url,
              newUrl: current.url,
              oldStatus: previous.status,
              newStatus: current.status,
            },
            workspace_id: workspaceId,
          });
        }
      }
    }

    // Store changes in database
    if (changes.length > 0) {
      const { error: changeError } = await supabase
        .from('maigret_profile_changes')
        .insert(changes);

      if (changeError) {
        console.error('Error storing changes:', changeError);
        throw changeError;
      }

      console.log(`✅ Detected and stored ${changes.length} changes`);
    } else {
      console.log('✅ No changes detected');
    }

    return new Response(
      JSON.stringify({
        changes,
        changeCount: changes.length,
        firstScan: false,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Error in maigret-detect-changes:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
