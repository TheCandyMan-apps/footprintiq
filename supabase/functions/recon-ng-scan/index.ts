import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReconNgRequest {
  workspaceId: string;
  target: string;
  targetType: 'username' | 'email' | 'ip' | 'domain';
  modules?: string[];
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { workspaceId, target, targetType, modules = [] } = await req.json() as ReconNgRequest;

    console.log('Starting Recon-ng scan:', { workspaceId, target, targetType, modules });

    // Default modules based on target type
    const defaultModules: Record<string, string[]> = {
      username: ['recon/profiles-profiles/twitter_mention', 'recon/profiles-profiles/namechk'],
      email: ['recon/contacts-contacts/pgp_search', 'recon/contacts-contacts/haveibeenpwned'],
      ip: ['recon/hosts-hosts/reverse_resolve', 'recon/hosts-hosts/shodan_ip'],
      domain: ['recon/domains-hosts/google_site_web', 'recon/domains-contacts/whois_pocs'],
    };

    const selectedModules = modules.length > 0 ? modules : defaultModules[targetType] || [];

    // Check credits (10 credits per scan)
    const { data: balance } = await supabase.rpc('get_credits_balance', {
      _workspace_id: workspaceId
    });

    if (!balance || balance < 10) {
      throw new Error('Insufficient credits. This scan requires 10 credits.');
    }

    // Create scan record
    const { data: scan, error: insertError } = await supabase
      .from('recon_ng_scans')
      .insert({
        workspace_id: workspaceId,
        user_id: user.id,
        target,
        target_type: targetType,
        modules: selectedModules,
        status: 'running',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const scanId = scan.id;

    // Start async processing
    processReconNgScan(scanId, workspaceId, target, targetType, selectedModules).catch(console.error);

    return new Response(
      JSON.stringify({ success: true, scanId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Recon-ng scan error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processReconNgScan(
  scanId: string,
  workspaceId: string,
  target: string,
  targetType: string,
  modules: string[]
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const channel = supabase.channel(`recon_ng_progress_${scanId}`);

  try {
    // Broadcast initial status
    await channel.send({
      type: 'broadcast',
      event: 'progress',
      payload: {
        scanId,
        status: 'running',
        message: 'Initializing Recon-ng scan...',
        progress: 0,
      },
    });

    // Mock execution (replace with actual Recon-ng worker call)
    const results = [];
    const correlations = [];

    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      
      await channel.send({
        type: 'broadcast',
        event: 'progress',
        payload: {
          scanId,
          status: 'running',
          message: `Running module: ${module}`,
          progress: Math.round(((i + 1) / modules.length) * 100),
          completedModules: i + 1,
          totalModules: modules.length,
        },
      });

      // Simulate module execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock results
      const mockResults = generateMockResults(module, target, targetType);
      results.push(...mockResults);

      // Generate correlations
      if (mockResults.length > 0) {
        correlations.push({
          module,
          count: mockResults.length,
          description: `Found ${mockResults.length} results from ${module}`,
          confidence: 'medium',
        });
      }
    }

    // Deduct credits
    await supabase.rpc('spend_credits', {
      _workspace_id: workspaceId,
      _cost: 10,
      _reason: 'recon-ng scan',
      _meta: { scan_id: scanId, target, modules: modules.length }
    });

    // Update scan with results
    await supabase
      .from('recon_ng_scans')
      .update({
        status: 'completed',
        total_results: results.length,
        results,
        correlations,
        completed_at: new Date().toISOString(),
      })
      .eq('id', scanId);

    // Broadcast completion
    await channel.send({
      type: 'broadcast',
      event: 'progress',
      payload: {
        scanId,
        status: 'completed',
        message: 'Scan completed successfully',
        progress: 100,
        totalResults: results.length,
      },
    });

    console.log(`Recon-ng scan ${scanId} completed with ${results.length} results`);

  } catch (error) {
    console.error('Error processing Recon-ng scan:', error);

    await supabase
      .from('recon_ng_scans')
      .update({
        status: 'failed',
        error_message: error.message,
      })
      .eq('id', scanId);

    await channel.send({
      type: 'broadcast',
      event: 'progress',
      payload: {
        scanId,
        status: 'failed',
        message: `Scan failed: ${error.message}`,
        progress: 0,
      },
    });
  }
}

function generateMockResults(module: string, target: string, targetType: string) {
  // Mock data generation
  const results = [];
  const count = Math.floor(Math.random() * 5) + 1;

  for (let i = 0; i < count; i++) {
    results.push({
      module,
      type: targetType,
      value: `${target}_result_${i + 1}`,
      source: module.split('/')[0],
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}
