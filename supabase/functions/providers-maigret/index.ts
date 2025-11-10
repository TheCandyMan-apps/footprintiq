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
  const WORKER_TOKEN = Deno.env.get('MAIGRET_WORKER_TOKEN') ?? '';

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

    // Call the Maigret worker
    const workerResponse = await fetch(`${WORKER_URL}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WORKER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usernames: body.usernames,
        sites: body.sites,
        timeout: body.timeout || 60,
      }),
      signal: AbortSignal.timeout(90000), // 90s timeout
    });

    if (!workerResponse.ok) {
      console.error(`❌ Maigret worker returned ${workerResponse.status}`);
      return new Response(
        JSON.stringify({ 
          findings: [],
          error: `Worker returned ${workerResponse.status}`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workerData = await workerResponse.json();
    console.log(`✅ Maigret worker returned ${workerData.results?.length || 0} results`);

    // Transform worker results to UFM findings
    const findings: MaigretFinding[] = [];
    
    if (workerData.results && Array.isArray(workerData.results)) {
      for (const result of workerData.results) {
        if (result.site && result.url) {
          findings.push({
            type: 'profile_presence',
            title: `Profile found on ${result.site}`,
            severity: 'info',
            provider: 'maigret',
            confidence: result.confidence || 0.7,
            evidence: {
              site: result.site,
              url: result.url,
              username: result.username || body.usernames[0],
              status: result.status || 'found',
            },
            remediation: result.url ? `Review profile at ${result.url}` : undefined,
          });
        }
      }
    }

    console.log(`📊 Transformed ${findings.length} findings`);

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
