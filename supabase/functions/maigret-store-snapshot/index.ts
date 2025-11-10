import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SnapshotRequest {
  username: string;
  workspaceId: string;
  scanId?: string;
  findings: Array<{
    site: string;
    url?: string;
    status: string;
    confidence?: number;
    rawData?: any;
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

    const body: SnapshotRequest = await req.json();
    const { username, workspaceId, scanId, findings } = body;

    if (!username || !workspaceId || !findings || findings.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: username, workspaceId, and findings required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📸 Storing snapshot for username: ${username}, findings: ${findings.length}`);

    // Store each finding as a snapshot
    const snapshots = findings.map(finding => ({
      username,
      site: finding.site,
      url: finding.url || null,
      status: finding.status,
      confidence: finding.confidence || null,
      raw_data: finding.rawData || null,
      scan_id: scanId || null,
      workspace_id: workspaceId,
    }));

    const { data, error } = await supabase
      .from('maigret_profile_snapshots')
      .insert(snapshots)
      .select();

    if (error) {
      console.error('❌ Error storing snapshots:', error);
      throw error;
    }

    console.log(`✅ Stored ${data.length} snapshots`);

    return new Response(
      JSON.stringify({
        success: true,
        snapshotsStored: data.length,
        snapshots: data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Error in maigret-store-snapshot:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
