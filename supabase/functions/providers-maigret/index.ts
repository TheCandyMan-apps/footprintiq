import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface MaigretRequest {
  usernames: string[];
  sites?: string[];
  timeout?: number;
  workspaceId?: string;
  scanId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Use unified OSINT worker
  const WORKER_URL = Deno.env.get('OSINT_WORKER_URL') ?? '';
  const WORKER_TOKEN = Deno.env.get('OSINT_WORKER_TOKEN') ?? '';

  if (!WORKER_URL || !WORKER_TOKEN) {
    console.error('❌ Missing OSINT worker configuration');
    return new Response(
      JSON.stringify({ 
        findings: [],
        error: 'OSINT worker not configured (OSINT_WORKER_URL or OSINT_WORKER_TOKEN missing)'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: MaigretRequest = await req.json();
    
    if (!body.usernames || !Array.isArray(body.usernames) || body.usernames.length === 0) {
      return new Response(
        JSON.stringify({ 
          findings: [],
          error: 'Invalid request: usernames array required'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const username = body.usernames[0];
    console.log(`🔍 Calling unified OSINT worker (maigret) for username: ${username}`);

    // Build scan URL
    const scanUrl = WORKER_URL.endsWith('/scan') ? WORKER_URL : `${WORKER_URL}/scan`;

    // Construct payload per unified worker contract
    const workerPayload = {
      tool: 'maigret',
      username,
      token: WORKER_TOKEN,
    };

    console.log(`📤 Sending to worker:`, JSON.stringify({ ...workerPayload, token: '***' }, null, 2));

    // Call the unified OSINT worker
    const workerResponse = await fetch(scanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workerPayload),
      signal: AbortSignal.timeout(120000), // 2 minute timeout
    });

    if (!workerResponse.ok) {
      const errorText = await workerResponse.text().catch(() => 'Unable to read error response');
      console.error(`❌ OSINT worker returned ${workerResponse.status}:`, errorText);
      return new Response(
        JSON.stringify({ 
          findings: [],
          error: `Worker returned ${workerResponse.status}: ${errorText.substring(0, 500)}`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workerData = await workerResponse.json();
    console.log(`📦 Raw worker response:`, JSON.stringify(workerData).substring(0, 500));

    // Extract results array per worker contract
    const rawArray: any[] = Array.isArray(workerData?.results) ? workerData.results : [];

    console.log(`✅ Worker returned ${rawArray.length} result(s) for username: "${username}"`);

    // Transform worker results to UFM-compliant findings
    const findings: any[] = [];

    for (const item of rawArray) {
      // Worker returns: { site, url, username, status, response_time, found, nsfw }
      if (item?.site && item?.url) {
        findings.push({
          provider: 'maigret',
          kind: 'presence.hit',
          severity: 'info',
          confidence: item.found === true ? 0.9 : 0.7,
          observedAt: new Date().toISOString(),
          evidence: [
            { key: 'site', value: item.site },
            { key: 'url', value: item.url },
            { key: 'username', value: item.username || username },
            { key: 'status', value: item.status || 'found' },
          ],
          meta: {
            ...item,
            nsfw: item.nsfw || false,
          },
        });
      }
    }

    console.log(`📊 Transformed ${findings.length} findings`);
    
    // If 0 findings, add a diagnostic finding to distinguish from errors
    if (findings.length === 0) {
      console.warn(`⚠️ Worker returned 0 findings for username: "${username}"`);
      findings.push({
        provider: 'maigret',
        kind: 'provider.empty_results',
        severity: 'info',
        confidence: 1.0,
        observedAt: new Date().toISOString(),
        evidence: [
          { key: 'message', value: 'No matching profiles found' },
          { key: 'username', value: username },
          { key: 'sites_checked', value: body.sites?.length ? String(body.sites.length) : 'all' },
        ],
        meta: {
          reason: 'legitimate_no_results',
          worker_url: WORKER_URL,
          checked_at: new Date().toISOString()
        }
      });
    }

    // If workspaceId and scanId provided, store snapshot for historical tracking
    if (body.workspaceId && body.scanId) {
      try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
        await fetch(`${SUPABASE_URL}/functions/v1/maigret-store-snapshot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            username: username,
            workspaceId: body.workspaceId,
            scanId: body.scanId,
            findings: findings.map(f => {
              const ev = Array.isArray(f.evidence) ? f.evidence : [];
              const get = (k: string) => ev.find((e: any) => e.key === k)?.value;
              return {
                site: get('site'),
                url: get('url'),
                status: get('status'),
                confidence: f.confidence,
                rawData: f,
              };
            }),
          }),
        });
        console.log('📸 Snapshot stored for historical tracking');
      } catch (snapshotError) {
        console.error('Failed to store snapshot:', snapshotError);
        // Don't fail the request if snapshot storage fails
      }
    }

    return new Response(
      JSON.stringify({ findings }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Maigret provider error:', error.message);
    
    // Always return gracefully
    return new Response(
      JSON.stringify({ 
        findings: [],
        error: error.message || 'Unknown error'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
