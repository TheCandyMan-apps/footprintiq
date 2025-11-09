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
  const WORKER_URL = Deno.env.get('RECON_NG_WORKER_URL') || 'http://localhost:8080';
  const WORKER_TOKEN = Deno.env.get('WORKER_TOKEN');

  try {
    // Broadcast initial status
    await channel.send({
      type: 'broadcast',
      event: 'progress',
      payload: {
        scanId,
        status: 'running',
        message: 'Connecting to Recon-ng worker...',
        progress: 0,
      },
    });

    console.log(`[ReconNG] Calling worker at ${WORKER_URL} for scan ${scanId}`);

    // Call actual Recon-ng worker
    const workerResponse = await fetch(`${WORKER_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKER_TOKEN}`,
      },
      body: JSON.stringify({
        target,
        modules,
        workspace: `scan_${scanId.substring(0, 8)}`,
      }),
    });

    if (!workerResponse.ok) {
      throw new Error(`Worker returned ${workerResponse.status}: ${await workerResponse.text()}`);
    }

    const workerData = await workerResponse.json();
    console.log(`[ReconNG] Worker response:`, workerData);

    if (!workerData.success) {
      throw new Error(workerData.error || 'Worker scan failed');
    }

    // Broadcast progress updates
    await channel.send({
      type: 'broadcast',
      event: 'progress',
      payload: {
        scanId,
        status: 'running',
        message: 'Processing scan results...',
        progress: 80,
        completedModules: modules.length,
        totalModules: modules.length,
      },
    });

    // Parse worker results
    const results = workerData.results || [];
    const hosts = workerData.hosts || [];
    const contacts = workerData.contacts || [];
    const locations = workerData.locations || [];

    // Generate correlations
    const correlations = [];
    const moduleGroups = new Map<string, any[]>();

    results.forEach((result: any) => {
      const module = result.module;
      if (!moduleGroups.has(module)) {
        moduleGroups.set(module, []);
      }
      moduleGroups.get(module)!.push(result);
    });

    moduleGroups.forEach((items, module) => {
      correlations.push({
        module,
        count: items.length,
        description: `Found ${items.length} ${items[0]?.type || 'results'} from ${module}`,
        confidence: items.length > 3 ? 'high' : items.length > 1 ? 'medium' : 'low',
        types: [...new Set(items.map(i => i.type))],
      });
    });

    // Add host/contact correlations
    if (hosts.length > 0) {
      correlations.push({
        module: 'hosts',
        count: hosts.length,
        description: `Discovered ${hosts.length} hosts/domains`,
        confidence: 'high',
      });
    }

    if (contacts.length > 0) {
      correlations.push({
        module: 'contacts',
        count: contacts.length,
        description: `Found ${contacts.length} contact emails`,
        confidence: 'medium',
      });
    }

    // Deduct credits
    await supabase.rpc('spend_credits', {
      _workspace_id: workspaceId,
      _cost: 10,
      _reason: 'recon-ng scan',
      _meta: { 
        scan_id: scanId, 
        target, 
        modules: modules.length,
        hosts: hosts.length,
        contacts: contacts.length,
        worker_url: WORKER_URL
      }
    });

    // Consolidate all results
    const allResults = [
      ...results,
      ...hosts.map((h: any) => ({ ...h, type: 'host', module: 'hosts' })),
      ...contacts.map((c: any) => ({ ...c, type: 'contact', module: 'contacts' })),
    ];

    // Update scan with results
    await supabase
      .from('recon_ng_scans')
      .update({
        status: 'completed',
        total_results: allResults.length,
        results: allResults,
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
        message: `Scan completed: ${allResults.length} results found`,
        progress: 100,
        totalResults: allResults.length,
        correlations: correlations.length,
      },
    });

    console.log(`[ReconNG] Scan ${scanId} completed: ${allResults.length} results, ${correlations.length} correlations`);

  } catch (error) {
    console.error('[ReconNG] Error processing scan:', error);

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
  } finally {
    // Clean up channel
    await supabase.removeChannel(channel);
  }
}
