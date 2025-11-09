import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/secure.ts';
import { retryWithBackoff } from '../_shared/retryWithBackoff.ts';

const SPIDERFOOT_API_URL = Deno.env.get('SPIDERFOOT_API_URL');
const SPIDERFOOT_API_KEY = Deno.env.get('SPIDERFOOT_API_KEY');

// Validate required environment variables
if (!SPIDERFOOT_API_URL || SPIDERFOOT_API_URL === 'http://localhost:5001') {
  console.error('SPIDERFOOT_API_URL is not configured or still points to localhost');
}

interface ScanRequest {
  target: string;
  target_type: 'email' | 'ip' | 'domain' | 'username' | 'phone';
  modules?: string[]; // e.g., ['sfp_dns', 'sfp_emailrep', 'passive']
  workspace_id: string;
}

interface SpiderFootScanResult {
  scan_id: string;
  status: string;
  total_events?: number;
  results?: any[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate SpiderFoot API URL
    if (!SPIDERFOOT_API_URL || SPIDERFOOT_API_URL.includes('localhost')) {
      console.error('SpiderFoot API URL not configured');
      return new Response(
        JSON.stringify({ error: 'SpiderFoot API is not configured. Please contact administrator.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { target, target_type, modules = [], workspace_id }: ScanRequest = await req.json();

    if (!target || !target_type || !workspace_id) {
      console.error('Missing required fields:', { target: !!target, target_type: !!target_type, workspace_id: !!workspace_id });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: target, target_type, workspace_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[SpiderFoot] Starting scan for ${target_type}: ${target}, workspace: ${workspace_id}, user: ${user.id}`);

    // Verify workspace membership
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspace_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      console.error('[SpiderFoot] Membership check failed:', membershipError);
      return new Response(
        JSON.stringify({ error: 'Not a member of this workspace' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[SpiderFoot] User role in workspace: ${membership.role}`);

    // Check credits (10 credits for SpiderFoot scan)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[SpiderFoot] Checking credits...');
    const { data: canSpend, error: creditsError } = await supabaseAdmin.rpc('spend_credits', {
      _workspace_id: workspace_id,
      _cost: 10,
      _reason: 'spiderfoot_scan',
      _meta: { target, target_type }
    });

    if (creditsError) {
      console.error('[SpiderFoot] Credits check error:', creditsError);
    }

    if (!canSpend) {
      console.warn('[SpiderFoot] Insufficient credits');
      return new Response(
        JSON.stringify({ error: 'Insufficient credits. SpiderFoot scans cost 10 credits.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[SpiderFoot] Credits deducted successfully');

    // Create scan record using admin client to bypass RLS
    console.log('[SpiderFoot] Creating scan record...');
    const { data: scanRecord, error: scanError } = await supabaseAdmin
      .from('spiderfoot_scans')
      .insert({
        workspace_id,
        user_id: user.id,
        target,
        target_type,
        modules,
        status: 'pending',
        credits_used: 10,
      })
      .select()
      .single();

    if (scanError) {
      console.error('[SpiderFoot] Failed to create scan record:', {
        error: scanError,
        code: scanError.code,
        message: scanError.message,
        details: scanError.details,
        hint: scanError.hint
      });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create scan record',
          details: scanError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Created scan record: ${scanRecord.id}`);

    // Start SpiderFoot scan (async)
    startSpiderFootScan(scanRecord.id, target, target_type, modules)
      .catch(err => console.error('SpiderFoot scan error:', err));

    // Return immediately with scan ID
    return new Response(
      JSON.stringify({
        success: true,
        scan_id: scanRecord.id,
        status: 'pending',
        message: 'SpiderFoot scan initiated',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SpiderFoot] Unhandled error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        type: error.name 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Start SpiderFoot scan (runs asynchronously)
 */
async function startSpiderFootScan(
  scanId: string,
  target: string,
  targetType: string,
  modules: string[]
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Update status to running
    await supabase
      .from('spiderfoot_scans')
      .update({ 
        status: 'running', 
        started_at: new Date().toISOString() 
      })
      .eq('id', scanId);

    // Broadcast initial progress
    await supabase.channel(`spiderfoot_progress_${scanId}`).send({
      type: 'broadcast',
      event: 'progress',
      payload: {
        status: 'running',
        completedProviders: 0,
        totalProviders: modules.length,
        totalFindings: 0,
        message: 'Starting SpiderFoot scan...',
        currentProviders: modules,
      },
    });

    console.log(`[${scanId}] Starting SpiderFoot API call`);

    // Call SpiderFoot API
    const scanResult = await callSpiderFootAPI(target, targetType, modules, scanId, supabase);

    console.log(`[${scanId}] SpiderFoot scan completed. Events: ${scanResult.total_events}`);

    // Parse and store results
    const correlations = extractCorrelations(scanResult.results || []);

    // Update scan with results
    await supabase
      .from('spiderfoot_scans')
      .update({
        status: 'completed',
        scan_id: scanResult.scan_id,
        total_events: scanResult.total_events || 0,
        results: scanResult.results || [],
        correlations,
        completed_at: new Date().toISOString(),
      })
      .eq('id', scanId);

    // Broadcast completion
    await supabase.channel(`spiderfoot_progress_${scanId}`).send({
      type: 'broadcast',
      event: 'progress',
      payload: {
        status: 'completed',
        completedProviders: modules.length,
        totalProviders: modules.length,
        totalFindings: scanResult.total_events || 0,
        message: 'Scan completed successfully!',
      },
    });

    console.log(`[${scanId}] Scan results stored successfully`);

  } catch (error) {
    console.error(`[${scanId}] SpiderFoot scan failed:`, error);

    // Update scan with error
    await supabase
      .from('spiderfoot_scans')
      .update({
        status: 'failed',
        error: error.message || 'Unknown error',
        completed_at: new Date().toISOString(),
      })
      .eq('id', scanId);

    // Broadcast error
    await supabase.channel(`spiderfoot_progress_${scanId}`).send({
      type: 'broadcast',
      event: 'progress',
      payload: {
        status: 'error',
        completedProviders: 0,
        totalProviders: modules.length,
        totalFindings: 0,
        message: `Scan failed: ${error.message}`,
      },
    });
  }
}

/**
 * Call SpiderFoot API
 */
async function callSpiderFootAPI(
  target: string,
  targetType: string,
  modules: string[],
  scanId: string,
  supabase: any
): Promise<SpiderFootScanResult> {
  // SpiderFoot API endpoint
  const url = `${SPIDERFOOT_API_URL}/api`;

  console.log(`Calling SpiderFoot API: ${url}`);

  // Start scan
  const startPayload = {
    scanname: `scan_${Date.now()}`,
    scantarget: target,
    modulelist: modules.length > 0 ? modules.join(',') : 'passive', // Default to passive modules
    typelist: mapTargetType(targetType),
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (SPIDERFOOT_API_KEY) {
    headers['Authorization'] = `Bearer ${SPIDERFOOT_API_KEY}`;
  }

  // Start the scan
  const startResponse = await fetch(`${url}?func=startscan`, {
    method: 'POST',
    headers,
    body: JSON.stringify(startPayload),
  });

  if (!startResponse.ok) {
    const errorText = await startResponse.text();
    throw new Error(`SpiderFoot API error: ${startResponse.status} - ${errorText}`);
  }

  const startResult = await startResponse.json();
  const spiderFootScanId = startResult.id || startResult.scan_id;

  console.log(`SpiderFoot scan started: ${spiderFootScanId}`);

  // Poll for results (with timeout)
  const maxAttempts = 60; // 5 minutes max
  const pollInterval = 5000; // 5 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    // Check scan status
    const statusResponse = await fetch(
      `${url}?func=scanstatus&id=${spiderFootScanId}`,
      { headers }
    );

    if (!statusResponse.ok) {
      continue;
    }

    const status = await statusResponse.json();

    console.log(`SpiderFoot scan status: ${status.status}, Events: ${status.total}`);

    // Broadcast progress update
    await supabase.channel(`spiderfoot_progress_${scanId}`).send({
      type: 'broadcast',
      event: 'progress',
      payload: {
        status: 'running',
        completedProviders: Math.floor((attempt / maxAttempts) * modules.length),
        totalProviders: modules.length,
        totalFindings: status.total || 0,
        message: `Scanning... (${status.total || 0} events found)`,
      },
    });

    if (status.status === 'FINISHED' || status.status === 'ERROR-FAILED') {
      // Get scan results
      const resultsResponse = await fetch(
        `${url}?func=scanresults&id=${spiderFootScanId}`,
        { headers }
      );

      if (!resultsResponse.ok) {
        throw new Error('Failed to fetch scan results');
      }

      const results = await resultsResponse.json();

      return {
        scan_id: spiderFootScanId,
        status: status.status,
        total_events: results.length || 0,
        results: results,
      };
    }
  }

  throw new Error('SpiderFoot scan timeout');
}

/**
 * Map target type to SpiderFoot type
 */
function mapTargetType(targetType: string): string {
  const typeMap: Record<string, string> = {
    email: 'EMAILADDR',
    ip: 'IP_ADDRESS',
    domain: 'INTERNET_NAME',
    username: 'USERNAME',
    phone: 'PHONE_NUMBER',
  };

  return typeMap[targetType] || 'INTERNET_NAME';
}

/**
 * Extract correlations from results
 */
function extractCorrelations(results: any[]): any[] {
  const correlations: any[] = [];

  // Group results by type and find interesting correlations
  const grouped = results.reduce((acc, result) => {
    const type = result.type || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(result);
    return acc;
  }, {} as Record<string, any[]>);

  // Example: Correlate IPs with domains
  if (grouped['IP_ADDRESS'] && grouped['INTERNET_NAME']) {
    grouped['IP_ADDRESS'].forEach((ip: any) => {
      grouped['INTERNET_NAME'].forEach((domain: any) => {
        if (ip.data && domain.data) {
          correlations.push({
            type: 'ip_domain_link',
            description: `IP ${ip.data} linked to domain ${domain.data}`,
            confidence: 'medium',
            evidence: [ip, domain],
          });
        }
      });
    });
  }

  // Example: Look for breach indicators
  const breachModules = ['sfp_haveibeenpwned', 'sfp_leak-lookup'];
  const breaches = results.filter(r => 
    breachModules.some(m => r.module?.includes(m))
  );

  if (breaches.length > 0) {
    correlations.push({
      type: 'breach_detected',
      description: `Found ${breaches.length} breach indicator(s)`,
      confidence: 'high',
      evidence: breaches,
    });
  }

  return correlations;
}
