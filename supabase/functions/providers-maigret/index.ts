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

interface MaigretFinding {
  type: 'profile_presence';
  title: string;
  severity: 'info' | 'low' | 'medium';
  provider: 'maigret';
  confidence: number;
  evidence: {
    site: string;
    url: string;
    username: string;
    status?: string;
  };
  remediation?: string;
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

  const WORKER_URL = Deno.env.get('MAIGRET_WORKER_URL') ?? '';
  const WORKER_TOKEN = Deno.env.get('WORKER_TOKEN') ?? '';

  if (!WORKER_URL || !WORKER_TOKEN) {
    console.error('❌ Missing Maigret worker configuration');
    return new Response(
      JSON.stringify({ 
        findings: [],
        error: 'Maigret worker not configured'
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

    console.log(`🔍 Calling Maigret worker for ${body.usernames.length} username(s)`);

    // Construct payload matching Cloud Run worker's expected format
    const workerPayload = {
      username: body.usernames[0], // Worker expects single username, not array
      batch_id: body.scanId || crypto.randomUUID(),
      workspace_id: body.workspaceId || null,
      platforms: (body.sites && body.sites.length > 0) ? body.sites : undefined,
      timeout: body.timeout || 60,
      with_tor: Deno.env.get('TOR_ENABLED') === 'true',
    };

    console.log(`📤 Sending to worker:`, JSON.stringify(workerPayload, null, 2));

    // Call the Maigret worker
    const workerResponse = await fetch(`${WORKER_URL}/scan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WORKER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workerPayload),
      signal: AbortSignal.timeout(90000), // 90s timeout
    });

    if (!workerResponse.ok) {
      const errorText = await workerResponse.text().catch(() => 'Unable to read error response');
      console.error(`❌ Maigret worker returned ${workerResponse.status}:`, errorText);
      return new Response(
        JSON.stringify({ 
          findings: [],
          error: `Worker returned ${workerResponse.status}: ${errorText}`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workerData = await workerResponse.json();

    // Support multiple worker response shapes: results[], summary[], or findings[]
    const rawArray: any[] = Array.isArray(workerData?.results)
      ? workerData.results
      : Array.isArray(workerData?.summary)
      ? workerData.summary
      : Array.isArray(workerData?.findings)
      ? workerData.findings
      : [];

    console.log(`✅ Maigret worker returned ${rawArray.length} item(s)`);

    // Transform worker results to UFM-compliant findings
    const findings: any[] = [];

    for (const item of rawArray) {
      // If already UFM-like, pass through with sane defaults
      if (item && Array.isArray(item.evidence)) {
        findings.push({
          provider: item.provider ?? 'maigret',
          kind: item.kind ?? 'presence.hit',
          severity: item.severity ?? 'info',
          confidence: item.confidence ?? 0.7,
          observedAt: item.observedAt ?? new Date().toISOString(),
          evidence: item.evidence,
          meta: item.meta ?? item,
        });
        continue;
      }

      // Legacy maigret result shape -> normalize
      if (item?.site && item?.url) {
        findings.push({
          provider: 'maigret',
          kind: 'presence.hit',
          severity: 'info',
          confidence: item.confidence ?? 0.7,
          observedAt: new Date().toISOString(),
          evidence: [
            { key: 'site', value: item.site },
            { key: 'url', value: item.url },
            { key: 'username', value: item.username || body.usernames[0] },
            { key: 'status', value: item.status || 'found' },
          ],
          meta: item,
        });
      }
    }

    console.log(`📊 Transformed ${findings.length} findings`);

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
            username: body.usernames[0],
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
