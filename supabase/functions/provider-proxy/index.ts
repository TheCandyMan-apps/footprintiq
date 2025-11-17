import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Authenticate user via JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'missing_authorization_header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verify authentication (we don't need user object, just validation)
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.75.0');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'invalid_or_expired_token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let { provider, target, type, options = {} } = await req.json();
    
    // Normalize legacy provider names
    if (provider === 'whatsmyname') {
      console.log('[provider-proxy] Normalizing whatsmyname -> sherlock');
      provider = 'sherlock';
    }
    
    console.log(`[provider-proxy] ${provider} request for ${target} (${type}) by user ${user.id}`);

    let result: any;

    switch (provider) {
      case 'hibp':
        result = await callHIBP(target);
        break;
      case 'intelx':
        result = await callIntelX(target);
        break;
      case 'dehashed':
        result = await callDeHashed(target, type);
        // Map to UFM
        result = { findings: normalizeDeHashed(result, target) };
        break;
      case 'censys':
        result = await callCensys(target, type);
        break;
      case 'binaryedge':
        result = await callBinaryEdge(target);
        break;
      case 'otx':
        result = await callOTX(target, type);
        break;
      case 'otx_feed':
        result = await collectOtxFeed();
        break;
      case 'shodan_feed':
        result = await collectShodanFeed(options.query || 'vuln');
        break;
      case 'greynoise_feed':
        result = await collectGreyNoiseFeed();
        break;
      case 'hunter':
        result = await callHunter(target);
        break;
      case 'fullhunt':
        result = await callFullHunt(target);
        break;
      case 'apify':
        result = await callApify(target, options.platform);
        break;
      case 'apify-social':
        result = await callApifyRunner('xtech/social-media-finder-pro', target, { searchTerm: target });
        // Map to UFM
        result = { findings: normalizeApifyResults(result, 'apify-social', 'presence.hit') };
        break;
      case 'apify-osint':
        result = await callApifyRunner('epctex/osint-scraper', target, { keywords: [target], modules: ['pastebin', 'github_gist', 'codepad'] });
        // Map to UFM
        result = { findings: normalizeApifyResults(result, 'apify-osint', 'leak.paste') };
        break;
      case 'apify-darkweb':
        result = await callApifyRunner('epctex/darkweb-scraper', target, { keywords: [target], maxDepth: options.darkwebDepth || 2 });
        // Map to UFM
        result = { findings: normalizeApifyResults(result, 'apify-darkweb', 'darkweb.hit') };
        break;
      case 'googlecse':
        result = await callGoogleCSE(target);
        break;
      case 'darksearch':
        result = await callDarkSearch(target);
        break;
      case 'securitytrails':
        result = await callSecurityTrails(target);
        break;
      case 'urlscan':
        result = await callURLScan(target);
        break;
      case 'whoisxml':
        result = await callWHOISXML(target);
        break;
      case 'abstract_phone':
        result = await callAbstractPhone(target);
        break;
      case 'abstract_ipgeo':
        result = await callAbstractIPGeo(target);
        break;
      case 'abstract_company':
        result = await callAbstractCompany(target);
        break;
      case 'abuseipdb':
        result = await callAbuseIPDB(target);
        break;
      case 'virustotal':
        result = await callVirusTotal(target, type);
        break;
      case 'fullcontact':
        result = await callFullContact(target, type);
        break;
      case 'pipl':
        result = await callPipl(target, type);
        break;
      case 'clearbit':
        result = await callClearbit(target, type);
        break;
      case 'shodan':
        result = await callShodan(target);
        break;
      case 'sherlock': {
        // Only valid for username scans
        if (type !== 'username') {
          console.log('[Sherlock] Skipping - not a username scan');
          result = { findings: [] };
          break;
        }
        console.log(`[Sherlock] Starting scan for username: ${target}`);
        
        try {
          const payload = { username: target };
          console.log(`[Sherlock] Calling worker with payload:`, payload);
          
          const data = await callOsintWorker('whatsmyname', payload);
          console.log(`[Sherlock] Raw worker response:`, JSON.stringify(data).substring(0, 500));
          
          const results = (data?.results ?? []) as any[];
          console.log(`[Sherlock] Extracted ${results.length} results from worker response`);
          
          // Defensive filtering for valid URLs
          const validResults = results.filter(r => {
            const hasUrl = !!(r.url || r.url_user || r.url_main);
            if (!hasUrl) {
              console.warn(`[Sherlock] Skipping result without URL:`, JSON.stringify(r).substring(0, 200));
            }
            return hasUrl;
          });
          
          console.log(`[Sherlock] ${validResults.length} valid results after URL filtering`);
          
          // Create provider_error if no valid results
          if (validResults.length === 0 && results.length > 0) {
            const now = new Date().toISOString();
            const errorFinding = {
              provider: 'sherlock',
              kind: 'provider_error',
              severity: 'warn' as const,
              confidence: 0.5,
              observedAt: now,
              reason: 'Worker returned results but all were missing URLs',
              evidence: [
                { key: 'error', value: 'No valid URLs in worker response' },
                { key: 'username', value: target },
                { key: 'raw_result_count', value: String(results.length) },
              ],
              meta: { rawResults: results.slice(0, 3) },
            };
            result = { findings: [errorFinding] };
            break;
          }
          
          if (validResults.length === 0) {
            console.warn(`[Sherlock] Worker returned 0 results for username: ${target}`);
            const now = new Date().toISOString();
            const errorFinding = {
              provider: 'sherlock',
              kind: 'provider_error',
              severity: 'warn' as const,
              confidence: 0.5,
              observedAt: now,
              reason: 'Sherlock returned no data for this username',
              evidence: [
                { key: 'status', value: 'no_results' },
                { key: 'username', value: target },
              ],
              meta: data,
            };
            result = { findings: [errorFinding] };
            break;
          }
          
          // Map to UFM findings with flexible URL field
          const findings = validResults.map((item) => ({
            provider: 'sherlock',
            kind: 'presence.hit',
            severity: 'info' as const,
            confidence: item.confidence ?? 0.7,
            observedAt: new Date().toISOString(),
            evidence: [
              { key: 'site', value: item.site || item.name || 'unknown' },
              { key: 'url', value: item.url || item.url_user || item.url_main || '' },
              { key: 'username', value: target },
              { key: 'status', value: item.status || 'found' },
            ],
            meta: item,
          }));
          
          console.log(`[Sherlock] Mapped to ${findings.length} UFM findings`);
          if (findings.length > 0) {
            console.log(`[Sherlock] First finding:`, JSON.stringify(findings[0]).substring(0, 500));
          }
          
          result = { findings };
        } catch (error: any) {
          console.error(`[Sherlock] Worker error:`, error);
          
          const now = new Date().toISOString();
          const errorFinding = {
            provider: 'sherlock',
            kind: 'provider_error',
            severity: 'warn' as const,
            confidence: 0.5,
            observedAt: now,
            reason: error.message || 'Sherlock worker failed',
            evidence: [
              { key: 'error', value: error.message || 'unknown error' },
              { key: 'username', value: target },
            ],
            meta: { error: String(error) },
          };
          
          result = { findings: [errorFinding] };
        }
        break;
      }
      case 'holehe': {
        // Only valid for email scans
        if (type !== 'email') {
          result = { findings: [] };
          break;
        }
        const data = await callOsintWorker('holehe', { email: target });
        const results = (data?.results ?? []) as any[];
        const now = new Date().toISOString();
        const findings = results.map((item) => ({
          provider: 'holehe',
          kind: 'presence.hit',
          severity: item.exists ? ('medium' as const) : ('info' as const),
          confidence: item.exists ? 0.9 : 0.5,
          observedAt: now,
          evidence: [
            { key: 'service', value: item.name || 'unknown' },
            { key: 'exists', value: String(item.exists) },
            { key: 'email', value: target },
            ...(item.emailrecovery ? [{ key: 'emailrecovery', value: String(item.emailrecovery) }] : []),
            ...(item.phoneNumber ? [{ key: 'phoneNumber', value: String(item.phoneNumber) }] : []),
          ],
          meta: item,
        }));
        result = { findings };
        break;
      }
      case 'gosearch': {
        // Username focused
        if (type !== 'username') {
          result = { findings: [] };
          break;
        }
        const data = await callOsintWorker('gosearch', { username: target });
        const results = (data?.results ?? []) as any[];
        const now = new Date().toISOString();
        const findings = results.map((item) => ({
          provider: 'gosearch',
          kind: 'presence.hit',
          severity: 'low' as const,
          confidence: 0.8,
          observedAt: now,
          evidence: [
            { key: 'site', value: item.site || 'unknown' },
            { key: 'url', value: item.url || '' },
            { key: 'username', value: target },
            ...(item.category ? [{ key: 'category', value: String(item.category) }] : []),
          ],
          meta: item,
        }));
        result = { findings };
        break;
      }
      default:
        console.warn(`[provider-proxy] Unknown provider: ${provider}`);
        result = { findings: [] };
    }

    // Normalize response to UFM format
    const normalizedResult = { findings: Array.isArray(result) ? result : result.findings || [] };

    return new Response(JSON.stringify(normalizedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[provider-proxy] Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callOsintWorker(
  tool: 'whatsmyname' | 'holehe' | 'gosearch',
  payload: { username?: string; email?: string }
): Promise<any> {
  const workerUrl = Deno.env.get('OSINT_WORKER_URL');
  const workerToken = Deno.env.get('OSINT_WORKER_TOKEN');

  if (!workerUrl || !workerToken) {
    console.error('[OSINT Worker] Missing configuration:', { 
      hasUrl: !!workerUrl, 
      hasToken: !!workerToken 
    });
    throw new Error('OSINT worker not configured');
  }

  const target = payload.username || payload.email || 'unknown';
  console.log(`[OSINT Worker] Calling ${tool} for target: ${target}`);
  console.log(`[OSINT Worker] Worker URL:`, workerUrl);
  console.log(`[OSINT Worker] Request payload:`, JSON.stringify({
    tool,
    ...payload,
    token: '***' // Redacted for security
  }, null, 2));

  // Check worker health first
  try {
    const healthUrl = new URL('/health', workerUrl).toString();
    const healthResp = await fetch(healthUrl);
    console.log(`[OSINT Worker] Health check status:`, healthResp.status);
  } catch (healthError) {
    console.warn(`[OSINT Worker] Health check failed:`, healthError);
  }

  const fullUrl = new URL('/scan', workerUrl).toString();
  const resp = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tool,
      ...payload,
      token: workerToken,
    }),
  });

  console.log(`[OSINT Worker] Response status:`, resp.status);

  if (!resp.ok) {
    const text = await resp.text();
    console.error(`[OSINT Worker] ${tool} error:`, resp.status, text);
    
    // Return structured error instead of throwing
    return {
      error: 'provider_unavailable',
      status: resp.status,
      body: text,
      tool,
    };
  }

  const responseText = await resp.text();
  console.log(`[OSINT Worker] Raw response (first 500 chars):`, responseText.substring(0, 500));
  
  const data = JSON.parse(responseText);
  console.log(`[OSINT Worker] Parsed data structure:`, JSON.stringify({
    hasResults: !!data?.results,
    resultsType: Array.isArray(data?.results) ? 'array' : typeof data?.results,
    resultsLength: Array.isArray(data?.results) ? data.results.length : 0,
    keys: Object.keys(data || {}),
  }, null, 2));

  if (data?.results && Array.isArray(data.results) && data.results.length > 0) {
    console.log(`[OSINT Worker] First result sample:`, JSON.stringify(data.results[0], null, 2));
  }

  return data;
}

async function callProvider(name: string, body: any) {
  // Map to actual provider implementations
  const { target, type, options = {} } = body;
  
  switch (name) {
    case 'fullcontact':
      return await callFullContact(target, type);
    case 'pipl':
      return await callPipl(target, options);
    case 'clearbit':
      return await callClearbit(target, type);
    case 'shodan':
      return await callShodan(target);
    default:
      throw new Error(`Provider ${name} not implemented`);
  }
}

async function callFullContact(target: string, type: string) {
  const API_KEY = Deno.env.get('FULLCONTACT_API_KEY');
  if (!API_KEY) return { findings: [] };

  try {
    const endpoint = type === 'email' ? 'person.enrich' : 'company.enrich';
    const response = await fetch(`https://api.fullcontact.com/v3/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(type === 'email' ? { email: target } : { domain: target }),
    });

    if (!response.ok) return { findings: [] };
    const data = await response.json();
    
    return {
      findings: [{
        provider: 'fullcontact',
        kind: 'presence.hit',
        severity: 'info',
        confidence: 0.85,
        observedAt: new Date().toISOString(),
        evidence: [
          { key: 'name', value: data.fullName || '' },
          { key: 'location', value: data.location || '' },
        ].filter(e => e.value),
        meta: data,
      }]
    };
  } catch (e) {
    console.error('[fullcontact] Error:', e);
    return { findings: [] };
  }
}

async function callPipl(target: string, type: string) {
  const API_KEY = Deno.env.get('PIPL_API_KEY');
  if (!API_KEY) return { findings: [] };

  try {
    // Build query parameters based on type
    const params = new URLSearchParams({ key: API_KEY });
    if (type === 'email') {
      params.append('email', target);
    } else if (type === 'phone') {
      params.append('phone', target);
    } else if (type === 'username') {
      params.append('username', target);
    } else {
      params.append('email', target); // default to email
    }

    const response = await fetch(`https://api.pipl.com/search/?${params.toString()}`);
    if (!response.ok) return { findings: [] };
    const data = await response.json();
    
    return {
      findings: data.person ? [{
        provider: 'pipl',
        kind: 'presence.hit',
        severity: 'medium',
        confidence: 0.9,
        observedAt: new Date().toISOString(),
        evidence: [
          { key: 'names', value: data.person.names?.map((n: any) => n.display).join(', ') || '' },
        ].filter(e => e.value),
        meta: data.person,
      }] : []
    };
  } catch (e) {
    console.error('[pipl] Error:', e);
    return { findings: [] };
  }
}

async function callClearbit(target: string, type: string) {
  const API_KEY = Deno.env.get('CLEARBIT_API_KEY');
  if (!API_KEY) return { findings: [] };

  try {
    const endpoint = type === 'email' 
      ? `https://person.clearbit.com/v2/people/find?email=${encodeURIComponent(target)}`
      : `https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(target)}`;
    
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });

    if (!response.ok) return { findings: [] };
    const data = await response.json();
    
    return {
      findings: [{
        provider: 'clearbit',
        kind: 'presence.hit',
        severity: 'info',
        confidence: 0.9,
        observedAt: new Date().toISOString(),
        evidence: [
          { key: 'name', value: data.name || data.person?.name?.fullName || '' },
          { key: 'domain', value: data.domain || '' },
        ].filter(e => e.value),
        meta: data,
      }]
    };
  } catch (e) {
    console.error('[clearbit] Error:', e);
    return { findings: [] };
  }
}

async function callShodan(target: string) {
  const API_KEY = Deno.env.get('SHODAN_API_KEY');
  if (!API_KEY) return { findings: [] };

  try {
    const response = await fetch(`https://api.shodan.io/shodan/host/${target}?key=${API_KEY}`);
    if (!response.ok) return { findings: [] };
    const data = await response.json();
    
    return {
      findings: [{
        provider: 'shodan',
        kind: 'presence.hit',
        severity: data.ports?.length > 10 ? 'medium' : 'low',
        confidence: 0.95,
        observedAt: new Date().toISOString(),
        evidence: [
          { key: 'ip', value: data.ip_str || '' },
          { key: 'org', value: data.org || '' },
          { key: 'ports', value: data.ports?.slice(0, 20).join(', ') || '' },
        ].filter(e => e.value),
        meta: data,
      }]
    };
  } catch (e) {
    console.error('[shodan] Error:', e);
    return { findings: [] };
  }
}

async function callHIBP(email: string) {
  const API_KEY = Deno.env.get('HIBP_API_KEY');
  if (!API_KEY) return { findings: [] };

  try {
    const response = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          'hibp-api-key': API_KEY,
          'User-Agent': 'FootprintIQ-Server',
        },
      }
    );

    if (response.status === 404) return { findings: [] };
    if (!response.ok) throw new Error(`HIBP API error: ${response.status}`);

    const breaches = await response.json();
    
    // Normalize HIBP breaches to UFM format
    const findings = breaches.map((breach: any) => ({
      provider: 'hibp',
      kind: 'breach.hit',
      severity: breach.IsSensitive ? 'high' : 'medium',
      confidence: 0.95,
      observedAt: breach.AddedDate || new Date().toISOString(),
      evidence: [
        { key: 'breach', value: breach.Name || breach.Title },
        { key: 'date', value: breach.BreachDate },
        { key: 'compromised', value: breach.DataClasses?.join(', ') || '' },
      ].filter(e => e.value),
      meta: {
        title: breach.Title,
        domain: breach.Domain,
        description: breach.Description,
        pwnCount: breach.PwnCount,
        dataClasses: breach.DataClasses,
      },
    }));
    
    return { findings };
  } catch (e) {
    console.error('[hibp] Error:', e);
    return { findings: [] };
  }
}

async function callIntelX(query: string) {
  const API_KEY = Deno.env.get('INTELX_API_KEY');
  if (!API_KEY) return { findings: [] };

  try {
    const response = await fetch('https://2.intelx.io/intelligent/search', {
      method: 'POST',
      headers: {
        'x-key': API_KEY,
        'Content-Type': 'application/json',
        'User-Agent': 'FootprintIQ-Server',
      },
      body: JSON.stringify({
        term: query,
        maxresults: 100,
        media: 0,
        sort: 4,
      }),
    });

    if (!response.ok) throw new Error(`IntelX API error: ${response.status}`);
    
    const data = await response.json();
    const results = data.records || [];
    
    // Normalize IntelX results to UFM format
    const findings = results.map((record: any) => ({
      provider: 'intelx',
      kind: 'darkweb.hit',
      severity: 'high',
      confidence: 0.85,
      observedAt: record.date || new Date().toISOString(),
      evidence: [
        { key: 'source', value: record.bucket || 'darkweb' },
        { key: 'type', value: record.mediactype || '' },
        { key: 'preview', value: record.name || record.title || '' },
      ].filter(e => e.value),
      meta: {
        systemid: record.systemid,
        bucket: record.bucket,
        added: record.added,
        size: record.size,
      },
    }));
    
    return { findings };
  } catch (e) {
    console.error('[intelx] Error:', e);
    return { findings: [] };
  }
}

async function callDeHashed(target: string, type: string) {
  const API_KEY = Deno.env.get('DEHASHED_API_KEY');
  const USERNAME = Deno.env.get('DEHASHED_API_KEY_USERNAME');
  if (!API_KEY || !USERNAME) return { findings: [] };

  try {
    // Format query based on type - DeHashed requires field:value format
    const fieldMap: Record<string, string> = {
      'email': 'email',
      'username': 'username',
      'name': 'name',
      'phone': 'phone',
      'domain': 'domain'
    };
    const field = fieldMap[type] || 'username';
    const query = `${field}:${target}`;
    
    const auth = btoa(`${USERNAME}:${API_KEY}`);
    const response = await fetch(
      `https://api.dehashed.com/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'User-Agent': 'FootprintIQ-Server',
        },
      }
    );

    if (response.status === 404) return { findings: [] };
    if (!response.ok) return { findings: [] };
    const data = await response.json();
    if (Array.isArray(data)) {
      return { findings: data };
    }
    return data?.findings ? data : { findings: [] };
  } catch (e) {
    console.error('[dehashed] Error:', e);
    return { findings: [] };
  }
}

async function callCensys(target: string, type: 'domain' | 'ip') {
  const API_KEY_UID = Deno.env.get('CENSYS_API_KEY_UID');
  const API_KEY_SECRET = Deno.env.get('CENSYS_API_KEY_SECRET');
  if (!API_KEY_UID || !API_KEY_SECRET) return { findings: [] };

  const auth = btoa(`${API_KEY_UID}:${API_KEY_SECRET}`);
  const query = type === 'domain' ? `services.dns.names: "${target}"` : `ip: "${target}"`;

  const response = await fetch(
    `https://search.censys.io/api/v2/hosts/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'FootprintIQ-Server',
      },
    }
  );

  if (!response.ok) throw new Error(`Censys API error: ${response.status}`);
  return await response.json();
}

async function callBinaryEdge(ip: string) {
  const API_KEY = Deno.env.get('BINARYEDGE_API_KEY');
  if (!API_KEY) return { findings: [] };

  const response = await fetch(`https://api.binaryedge.io/v2/query/ip/${ip}`, {
    headers: {
      'X-Key': API_KEY,
      'User-Agent': 'FootprintIQ-Server',
    },
  });

  if (!response.ok) throw new Error(`BinaryEdge API error: ${response.status}`);
  return await response.json();
}

async function callOTX(target: string, type: 'domain' | 'ip') {
  const API_KEY = Deno.env.get('ALIENVAULT_API_KEY');
  if (!API_KEY) return { findings: [] };

  const endpoint = type === 'domain' ? 'indicators/domain' : 'indicators/IPv4';
  const response = await fetch(
    `https://otx.alienvault.com/api/v1/${endpoint}/${target}/general`,
    {
      headers: {
        'X-OTX-API-KEY': API_KEY,
        'User-Agent': 'FootprintIQ-Server',
      },
    }
  );

  if (!response.ok) throw new Error(`OTX API error: ${response.status}`);
  return await response.json();
}

// New feed collectors returning normalized indicators
async function collectOtxFeed() {
  const API_KEY = Deno.env.get('ALIENVAULT_API_KEY');
  if (!API_KEY) return [];

  const response = await fetch('https://otx.alienvault.com/api/v1/pulses/subscribed', {
    headers: { 'X-OTX-API-KEY': API_KEY, 'User-Agent': 'FootprintIQ-Server' },
  });
  if (!response.ok) throw new Error(`OTX API error: ${response.status}`);
  const data = await response.json();

  const indicators: any[] = [];
  for (const pulse of (data.results || []).slice(0, 100)) {
    for (const ind of pulse.indicators || []) {
      indicators.push({
        type: mapOtxType(ind.type),
        value: ind.indicator,
        indicatorType: ind.type,
        confidence: pulse.TLP === 'white' ? 0.7 : 0.9,
        severity: mapOtxSeverity(pulse.adversary || 'unknown'),
        source: `OTX Pulse: ${pulse.name}`,
        tags: pulse.tags || [],
        metadata: { pulse_id: pulse.id, created: pulse.created, adversary: pulse.adversary },
      });
    }
  }
  return indicators;
}

async function collectShodanFeed(query: string) {
  const API_KEY = Deno.env.get('SHODAN_API_KEY');
  if (!API_KEY) return [];

  const response = await fetch(
    `https://api.shodan.io/shodan/host/search?key=${API_KEY}&query=${encodeURIComponent(query)}`,
    { method: 'GET', headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );
  if (!response.ok) throw new Error(`Shodan API error: ${response.status}`);
  const data = await response.json();

  const indicators: any[] = [];
  for (const match of (data.matches || []).slice(0, 50)) {
    indicators.push({
      type: 'ip',
      value: match.ip_str,
      indicatorType: 'ipv4-addr',
      confidence: match.vulns ? 0.8 : 0.5,
      severity: match.vulns && Object.keys(match.vulns).length > 0 ? 'high' : 'medium',
      source: `Shodan: ${match.org || 'Unknown'}`,
      tags: match.tags || [],
      metadata: { port: match.port, org: match.org, hostnames: match.hostnames, vulns: match.vulns ? Object.keys(match.vulns) : [] },
    });
  }
  return indicators;
}

async function collectGreyNoiseFeed() {
  const API_KEY = Deno.env.get('GREYNOISE_API_KEY');
  if (!API_KEY) return [];

  const response = await fetch('https://api.greynoise.io/v3/community/ips', {
    headers: { 'key': API_KEY, 'User-Agent': 'FootprintIQ-Server' },
  });
  if (!response.ok) throw new Error(`GreyNoise API error: ${response.status}`);
  const data = await response.json();

  const indicators: any[] = [];
  for (const item of (data.ips || []).slice(0, 100)) {
    if (item.classification === 'malicious') {
      indicators.push({
        type: 'ip',
        value: item.ip,
        indicatorType: 'ipv4-addr',
        confidence: 0.85,
        severity: 'high',
        source: `GreyNoise: ${item.name || 'Malicious IP'}`,
        tags: item.tags || [],
        metadata: { classification: item.classification, first_seen: item.first_seen, last_seen: item.last_seen, actor: item.actor },
      });
    }
  }
  return indicators;
}

function mapOtxType(otxType: string): string {
  const mapping: Record<string, string> = {
    'IPv4': 'ip',
    'IPv6': 'ip',
    'domain': 'domain',
    'hostname': 'domain',
    'URL': 'url',
    'email': 'email',
    'FileHash-MD5': 'hash',
    'FileHash-SHA1': 'hash',
    'FileHash-SHA256': 'hash',
  };
  return mapping[otxType] || 'unknown';
}

function mapOtxSeverity(adversary: string): 'low' | 'medium' | 'high' | 'critical' {
  const lower = adversary.toLowerCase();
  if (lower.includes('apt') || lower.includes('nation')) return 'critical';
  if (lower.includes('ransomware') || lower.includes('trojan')) return 'high';
  if (lower.includes('malware') || lower.includes('botnet')) return 'medium';
  return 'low';
}

async function callHunter(domain: string) {
  const API_KEY = Deno.env.get('HUNTER_API_KEY');
  if (!API_KEY) return { findings: [] };

  const response = await fetch(
    `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${API_KEY}`,
    { headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );

  if (!response.ok) throw new Error(`Hunter API error: ${response.status}`);
  return await response.json();
}

async function callFullHunt(domain: string) {
  const API_KEY = Deno.env.get('FULLHUNT_API_KEY');
  if (!API_KEY) return { findings: [] };

  const response = await fetch(
    `https://fullhunt.io/api/v1/domain/${encodeURIComponent(domain)}/subdomains`,
    {
      headers: {
        'X-API-KEY': API_KEY,
        'User-Agent': 'FootprintIQ-Server',
      },
    }
  );

  if (!response.ok) throw new Error(`FullHunt API error: ${response.status}`);
  return await response.json();
}

async function callApify(username: string, platform: string) {
  const API_KEY = Deno.env.get('APIFY_API_KEY');
  if (!API_KEY) return { findings: [] };

  const actorMap: Record<string, string> = {
    instagram: 'apify/instagram-profile-scraper',
    twitter: 'apify/twitter-scraper',
    facebook: 'apify/facebook-pages-scraper',
    linkedin: 'apify/linkedin-profile-scraper',
  };

  const actorId = actorMap[platform.toLowerCase()];
  if (!actorId) throw new Error(`Unsupported platform: ${platform}`);

  const response = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        resultsLimit: 10,
      }),
    }
  );

  if (!response.ok) throw new Error(`Apify API error: ${response.status}`);
  return await response.json();
}

async function callGoogleCSE(query: string) {
  const API_KEY = Deno.env.get('GOOGLE_CSE_API_KEY');
  const CX = Deno.env.get('GOOGLE_CSE_CX');
  if (!API_KEY || !CX) return { findings: [] };

  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(query)}`,
    { headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );

  if (!response.ok) throw new Error(`Google CSE API error: ${response.status}`);
  return await response.json();
}

async function callDarkSearch(query: string) {
  const API_KEY = Deno.env.get('DARKSEARCH_API_KEY');
  if (!API_KEY) return { findings: [] };

  const response = await fetch(
    `https://darksearch.io/api/search?query=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'FootprintIQ-Server',
      },
    }
  );

  if (!response.ok) throw new Error(`DarkSearch API error: ${response.status}`);
  return await response.json();
}

async function callSecurityTrails(domain: string) {
  const API_KEY = Deno.env.get('SECURITYTRAILS_API_KEY');
  if (!API_KEY) return { findings: [] };

  const response = await fetch(
    `https://api.securitytrails.com/v1/domain/${encodeURIComponent(domain)}`,
    {
      headers: {
        'APIKEY': API_KEY,
        'User-Agent': 'FootprintIQ-Server',
      },
    }
  );

  if (!response.ok) throw new Error(`SecurityTrails API error: ${response.status}`);
  return await response.json();
}

async function callURLScan(url: string) {
  const API_KEY = Deno.env.get('URLSCAN_API_KEY');
  if (!API_KEY) return { findings: [] };

  const response = await fetch('https://urlscan.io/api/v1/scan/', {
    method: 'POST',
    headers: {
      'API-Key': API_KEY,
      'Content-Type': 'application/json',
      'User-Agent': 'FootprintIQ-Server',
    },
    body: JSON.stringify({ url, visibility: 'private' }),
  });

  if (!response.ok) throw new Error(`URLScan API error: ${response.status}`);
  return await response.json();
}

async function callWHOISXML(domain: string) {
  const API_KEY = Deno.env.get('WHOISXML_API_KEY');
  if (!API_KEY) return { findings: [] };

  const response = await fetch(
    `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${API_KEY}&domainName=${encodeURIComponent(domain)}&outputFormat=JSON`,
    { headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );

  if (!response.ok) throw new Error(`WHOISXML API error: ${response.status}`);
  return await response.json();
}

async function callAbstractPhone(phone: string) {
  const API_KEY = Deno.env.get('ABSTRACT_API_KEY');
  if (!API_KEY) return { findings: [] };

  const response = await fetch(
    `https://phonevalidation.abstractapi.com/v1/?api_key=${API_KEY}&phone=${encodeURIComponent(phone)}`,
    { headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );

  if (!response.ok) throw new Error(`Abstract Phone API error: ${response.status}`);
  return await response.json();
}

async function callAbstractIPGeo(ip: string) {
  const API_KEY = Deno.env.get('ABSTRACT_API_KEY');
  if (!API_KEY) return { findings: [] };

  const response = await fetch(
    `https://ipgeolocation.abstractapi.com/v1/?api_key=${API_KEY}&ip_address=${encodeURIComponent(ip)}`,
    { headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );

  if (!response.ok) throw new Error(`Abstract IP Geo API error: ${response.status}`);
  return await response.json();
}

async function callAbstractCompany(domain: string) {
  const API_KEY = Deno.env.get('ABSTRACT_API_KEY');
  if (!API_KEY) return { findings: [] };

  const response = await fetch(
    `https://companyenrichment.abstractapi.com/v1/?api_key=${API_KEY}&domain=${encodeURIComponent(domain)}`,
    { headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );

  if (!response.ok) throw new Error(`Abstract Company API error: ${response.status}`);
  return await response.json();
}

async function callAbuseIPDB(ip: string) {
  const API_KEY = Deno.env.get('ABUSEIPDB_API_KEY');
  if (!API_KEY) return { findings: [] };

  const response = await fetch(
    `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&verbose`,
    {
      headers: {
        'Key': API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'FootprintIQ-Server',
      },
    }
  );

  if (!response.ok) throw new Error(`AbuseIPDB API error: ${response.status}`);
  return await response.json();
}

async function callApifyRunner(actorId: string, target: string, input: Record<string, any>) {
  const API_TOKEN = Deno.env.get('APIFY_API_TOKEN');
  if (!API_TOKEN) {
    console.log('[callApifyRunner] No APIFY_API_TOKEN configured, skipping');
    return { findings: [] };
  }

  try {
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/apify-run`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          workspaceId: 'system', // Use system workspace for provider-proxy calls
          actorSlug: actorId,
          payload: { ...input, searchTerm: target },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[callApifyRunner] Apify error ${response.status}:`, errorText);
      return { findings: [] };
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('[callApifyRunner] Exception:', error);
    return { findings: [] };
  }
}

// Normalizer functions for UFM mapping
function normalizeDeHashed(rawResult: any, target: string): any[] {
  const entries = rawResult?.entries || [];
  if (entries.length === 0) return [];
  
  return entries.slice(0, 50).map((entry: any) => ({
    provider: 'dehashed',
    kind: 'breach.credential',
    severity: (entry.password || entry.hashed_password) ? 'high' : 'medium',
    confidence: 0.9,
    observedAt: new Date().toISOString(),
    evidence: [
      { key: 'database', value: entry.database_name || '' },
      { key: 'email', value: entry.email || '' },
      { key: 'username', value: entry.username || '' },
      { key: 'name', value: entry.name || '' },
    ].filter(e => e.value),
    meta: {
      hasPassword: !!(entry.password || entry.hashed_password),
      database: entry.database_name,
    },
  }));
}

function normalizeWhatsMyName(rawResult: any, username: string): any[] {
  const hits = rawResult?.results || rawResult?.hits || [];
  if (!Array.isArray(hits) || hits.length === 0) return [];
  
  return hits.map((hit: any) => ({
    provider: 'whatsmyname',
    kind: 'presence.hit',
    severity: 'info',
    confidence: hit.confidence || 0.7,
    observedAt: new Date().toISOString(),
    evidence: [
      { key: 'site', value: hit.site || hit.name || '' },
      { key: 'url', value: hit.url || '' },
      { key: 'username', value: username },
    ].filter(e => e.value),
    meta: hit,
  }));
}

function normalizeApifyResults(rawResult: any, provider: string, kind: string): any[] {
  // Apify can return data in various shapes
  const items = rawResult?.items || rawResult?.results || rawResult?.data || [];
  if (!Array.isArray(items) || items.length === 0) return [];
  
  return items.slice(0, 100).map((item: any) => ({
    provider,
    kind,
    severity: kind.includes('darkweb') ? 'high' : 'medium',
    confidence: 0.75,
    observedAt: new Date().toISOString(),
    evidence: [
      { key: 'title', value: item.title || item.name || '' },
      { key: 'url', value: item.url || item.link || '' },
      { key: 'source', value: item.source || item.site || '' },
      { key: 'snippet', value: (item.snippet || item.text || item.description || '').slice(0, 200) },
    ].filter(e => e.value),
    meta: item,
  }));
}

async function callVirusTotal(target: string, type: 'domain' | 'ip' | 'url' | 'file') {
  const API_KEY = Deno.env.get('VIRUSTOTAL_API_KEY');
  if (!API_KEY) return { findings: [] };

  let endpoint = '';
  switch (type) {
    case 'domain':
      endpoint = `domains/${encodeURIComponent(target)}`;
      break;
    case 'ip':
      endpoint = `ip_addresses/${encodeURIComponent(target)}`;
      break;
    case 'url':
      endpoint = `urls/${btoa(target).replace(/=/g, '')}`;
      break;
    case 'file':
      endpoint = `files/${target}`;
      break;
  }

  const response = await fetch(`https://www.virustotal.com/api/v3/${endpoint}`, {
    headers: {
      'x-apikey': API_KEY,
      'User-Agent': 'FootprintIQ-Server',
    },
  });

  if (!response.ok) throw new Error(`VirusTotal API error: ${response.status}`);
  return await response.json();
}
