import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { safeFetch, errorResponse, ERROR_RESPONSES, safeJsonParse } from '../_shared/errorHandler.ts';

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

    let { provider, target, type, options = {}, workspaceId } = await req.json();
    
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
      case 'apify-social': {
        const apifyResp = await callApifyRunner('xtech/social-media-finder-pro', target, { searchTerm: target }, workspaceId);
        const findings = apifyResp?.findings || [];
        result = { findings };
        break;
      }
      case 'apify-osint': {
        const apifyResp = await callApifyRunner('epctex/osint-scraper', target, { keywords: [target], modules: ['pastebin', 'github_gist', 'codepad'] }, workspaceId);
        const findings = apifyResp?.findings || [];
        result = { findings };
        break;
      }
      case 'apify-darkweb': {
        const apifyResp = await callApifyRunner('epctex/darkweb-scraper', target, { keywords: [target], maxDepth: options.darkwebDepth || 2 }, workspaceId);
        const findings = apifyResp?.findings || [];
        result = { findings };
        break;
      }
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
      case 'ipqs_email':
        result = await callIPQSEmail(target);
        break;
      case 'ipqs_phone':
        result = await callIPQSPhone(target);
        break;
      case 'perplexity_osint':
        result = await callPerplexityOSINT(target, type, options);
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
      case 'pipl': {
        const apiKey = Deno.env.get('PIPL_API_KEY');
        const flagEnabled = Deno.env.get('VITE_FLAG_PIPL_PROVIDER') === 'true';
        
        if (!flagEnabled) {
          console.log('[pipl] Provider disabled via feature flag');
          const now = new Date().toISOString();
          result = {
            findings: [{
              provider: 'pipl',
              kind: 'provider.disabled',
              severity: 'info' as const,
              confidence: 1.0,
              observedAt: now,
              evidence: [
                { key: 'message', value: 'Pipl provider is currently disabled' },
                { key: 'reason', value: 'Feature flag not enabled' }
              ],
              meta: { flagged: true }
            }]
          };
          break;
        }
        
        if (!apiKey) {
          console.log('[pipl] API key not configured');
          const now = new Date().toISOString();
          result = {
            findings: [{
              provider: 'pipl',
              kind: 'provider.unconfigured',
              severity: 'info' as const,
              confidence: 1.0,
              observedAt: now,
              evidence: [
                { key: 'message', value: 'Pipl API key not configured' },
                { key: 'config_required', value: 'PIPL_API_KEY' }
              ],
              meta: { unconfigured: true }
            }]
          };
          break;
        }
        
        result = await callPipl(target, type);
        break;
      }
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
          
          // Robust extraction: support multiple response formats
          let raw = data?.results || data?.findings || data?.hits;
          
          // If still null/undefined, check if data is an object keyed by username
          if (!raw && data && typeof data === 'object' && !Array.isArray(data)) {
            const keys = Object.keys(data);
            console.log(`[Sherlock] No standard results field, checking username-keyed object with keys:`, keys);
            if (keys.length > 0 && Array.isArray(data[keys[0]])) {
              raw = data[keys[0]];
              console.log(`[Sherlock] Extracted from username-keyed object: ${raw.length} items`);
            }
          }
          
          const results = (raw ?? []) as any[];
          console.log(`[Sherlock] Extracted ${results.length} results from worker response (format: ${data?.results ? 'results' : data?.findings ? 'findings' : data?.hits ? 'hits' : 'username-keyed'})`);
          
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
              severity: 'info' as const,
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
          
          // Handle legitimate empty results with provider.empty_results
          if (validResults.length === 0) {
            console.warn(`[Sherlock] Worker returned 0 results for username: "${target}"`);
            const now = new Date().toISOString();
            const emptyResultFinding = {
              provider: 'sherlock',
              kind: 'provider.empty_results',
              severity: 'info' as const,
              confidence: 1.0,
              observedAt: now,
              evidence: [
                { key: 'message', value: 'No matching profiles found' },
                { key: 'username', value: target },
                { key: 'sites_checked', value: 'all' }
              ],
              meta: {
                reason: 'legitimate_no_results',
                checked_at: now
              }
            };
            result = { findings: [emptyResultFinding] };
            console.log(`[Sherlock] Created empty_results finding for legitimate no-match scenario`);
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
        // Only valid for username scans
        if (type !== 'username') {
          console.log('[GoSearch] Skipping - not a username scan');
          result = { findings: [] };
          break;
        }

        const username = target;
        const now = new Date().toISOString();
        
        // Check configuration
        const workerUrl = Deno.env.get('OSINT_WORKER_URL');
        const workerToken = Deno.env.get('OSINT_WORKER_TOKEN');
        
        if (!workerUrl || !workerToken) {
          console.warn('[GoSearch] OSINT worker not configured:', { hasUrl: !!workerUrl, hasToken: !!workerToken });
          result = {
            findings: [{
              provider: 'gosearch',
              kind: 'provider.unconfigured',
              severity: 'info' as const,
              confidence: 1.0,
              observedAt: now,
              evidence: [
                { key: 'message', value: 'GoSearch not configured' },
                { key: 'description', value: 'The GoSearch OSINT worker URL or token is not configured. Contact support to enable GoSearch.' },
                { key: 'missing', value: !workerUrl ? 'OSINT_WORKER_URL' : 'OSINT_WORKER_TOKEN' }
              ],
              meta: { provider: 'gosearch', unconfigured: true }
            }]
          };
          break;
        }

        console.log(`[GoSearch] Calling OSINT worker for username: ${username}`);

        try {
          // Call the worker
          const scanUrl = new URL('/scan', workerUrl).toString();
          const resp = await fetch(scanUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tool: 'gosearch',
              username,
              token: workerToken,
              strict: false, // Allow broader matches for better coverage
            }),
          });

          // Parse response safely
          const bodyText = await resp.text();
          let data: any;
          
          try {
            data = JSON.parse(bodyText);
          } catch (parseError) {
            console.error('[GoSearch] Failed to parse worker response as JSON:', parseError);
            result = {
              findings: [{
                provider: 'gosearch',
                kind: 'provider_error',
                severity: 'warning' as const,
                confidence: 0.5,
                observedAt: now,
                evidence: [
                  { key: 'error', value: 'Invalid JSON response from worker' },
                  { key: 'worker_status', value: String(resp.status) },
                  { key: 'worker_body', value: bodyText.slice(0, 2000) }
                ],
                meta: { provider: 'gosearch', tool: 'gosearch' }
              }]
            };
            break;
          }

          // Log execution report
          if (data?.meta) {
            const safeMeta = typeof data.meta === 'object' && data.meta !== null ? data.meta : {};
            console.log(`[GoSearch] Worker Execution Report:`, {
              fast_mode: safeMeta.fast_mode,
              workers: safeMeta.workers,
              strict_mode: safeMeta.strict_mode,
              return_code: safeMeta.return_code,
              stdout_lines: safeMeta.stdout_lines,
              parsed_count: safeMeta.parsed_count,
              sample_output: safeMeta.sample_output,
            });
          }

          // Handle errors
          if (!resp.ok || data?.error) {
            const errorMsg = data?.error ?? `GoSearch worker returned HTTP ${resp.status}. See admin logs for details.`;
            console.error('[GoSearch] Worker error:', { status: resp.status, error: data?.error, body: bodyText.slice(0, 500) });
            
            result = {
              findings: [{
                provider: 'gosearch',
                kind: 'provider_error',
                severity: 'warning' as const,
                confidence: 0.5,
                observedAt: now,
                evidence: [
                  { key: 'error', value: 'GoSearch provider error' },
                  { key: 'description', value: errorMsg },
                  { key: 'worker_status', value: String(resp.status) },
                  { key: 'worker_body', value: bodyText.slice(0, 2000) }
                ],
                meta: { 
                  provider: 'gosearch', 
                  tool: data?.tool ?? 'gosearch',
                  meta: data?.meta ?? null
                }
              }]
            };
            break;
          }

          // Handle missing or empty results array
          if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
            const checkedSites = data?.meta?.stdout_lines ?? null;
            console.log(`[GoSearch] No matching profiles found for username: ${username}`);
            
            result = {
              findings: [{
                provider: 'gosearch',
                kind: 'provider.empty_results',
                severity: 'info' as const,
                confidence: 1.0,
                observedAt: now,
                evidence: [
                  { key: 'message', value: 'GoSearch – no matching profiles' },
                  { key: 'description', value: 'GoSearch did not find any profiles for this username across its supported platforms.' },
                  { key: 'username', value: username },
                  ...(checkedSites ? [{ key: 'checked_sites', value: String(checkedSites) }] : [])
                ],
                meta: { 
                  provider: 'gosearch', 
                  tool: data?.tool ?? 'gosearch',
                  meta: data?.meta ?? null
                }
              }]
            };
            break;
          }

          // Map results to findings
          const rawResults = data.results;
          console.log(`[GoSearch] Worker returned ${rawResults.length} results`);
          if (data?.meta?.return_code !== undefined) {
            console.log(`[GoSearch] Worker exit code: ${data.meta.return_code}, parsed count: ${data.meta.parsed_count}`);
          }

          const findings = rawResults.map((hit: any) => ({
            provider: 'gosearch',
            kind: 'profile_presence',
            severity: 'info' as const,
            confidence: 0.8,
            observedAt: now,
            evidence: [
              { key: 'site', value: hit.site ?? 'Profile found via GoSearch' },
              { key: 'primary_url', value: hit.url || '' },
              { key: 'username', value: hit.username || username },
              { key: 'source', value: 'gosearch' }
            ],
            meta: { 
              provider: 'gosearch', 
              tool: data?.tool ?? 'gosearch',
              site: hit.site
            }
          }));

          result = { findings };
          console.log(`[GoSearch] Successfully mapped ${findings.length} findings`);
          
        } catch (error: any) {
          console.error('[GoSearch] Exception during worker call:', error);
          result = {
            findings: [{
              provider: 'gosearch',
              kind: 'provider_error',
              severity: 'warning' as const,
              confidence: 0.5,
              observedAt: now,
              evidence: [
                { key: 'error', value: 'GoSearch worker exception' },
                { key: 'description', value: error.message || 'Unknown error occurred while calling GoSearch worker' },
                { key: 'exception', value: String(error) }
              ],
              meta: { provider: 'gosearch', tool: 'gosearch' }
            }]
          };
        }
        
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

/**
 * Unified OSINT worker call helper
 * Uses the consolidated osint-multitool-worker for all tools
 */
async function callOsintWorker(
  tool: 'sherlock' | 'whatsmyname' | 'maigret' | 'holehe' | 'gosearch',
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
  console.log(`[OSINT Worker] Worker URL: ${workerUrl}`);

  // Build scan URL
  const scanUrl = workerUrl.endsWith('/scan') 
    ? workerUrl 
    : new URL('/scan', workerUrl).toString();
  
  // Prepare request body per worker contract
  const requestBody: any = {
    tool,
    ...payload,
    token: workerToken,
  };
  
  // GoSearch supports strict mode for false-positive suppression
  if (tool === 'gosearch') {
    requestBody.strict = false; // Allow broader matches for better coverage
    console.log(`[OSINT Worker] 🔍 GoSearch non-strict mode enabled for broader coverage`);
  }

  console.log(`[OSINT Worker] Request payload:`, JSON.stringify({
    ...requestBody,
    token: '***redacted***'
  }, null, 2));

  try {
    const resp = await fetch(scanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(120000), // 2 minute timeout
    });

    console.log(`[OSINT Worker] Response status: ${resp.status}`);

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`[OSINT Worker] ${tool} error: ${resp.status}`, text);
      
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

    // Log worker execution meta for debugging
    if (data?.meta) {
      const safeMeta = typeof data.meta === 'object' && data.meta !== null ? data.meta : {};
      console.log(`[OSINT Worker] Execution meta:`, JSON.stringify(safeMeta, null, 2));
    }

    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[OSINT Worker] ${tool} exception:`, errorMessage);
    
    return {
      error: errorMessage,
      tool,
      results: [],
    };
  }
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

// Helper to create unconfigured provider finding
function createUnconfiguredFinding(provider: string, configKey: string) {
  const now = new Date().toISOString();
  return {
    findings: [{
      provider,
      kind: 'provider.unconfigured',
      severity: 'info' as const,
      confidence: 1.0,
      observedAt: now,
      evidence: [
        { key: 'message', value: `${provider} API key not configured` },
        { key: 'config_required', value: configKey },
      ],
      meta: { unconfigured: true, timestamp: now }
    }]
  };
}

// Helper to create provider error finding
function createProviderErrorFinding(provider: string, error: any, target: string) {
  const now = new Date().toISOString();
  const message = error?.message || String(error);
  return {
    findings: [{
      provider,
      kind: 'provider.error',
      severity: 'warning' as const,
      confidence: 0.5,
      observedAt: now,
      evidence: [
        { key: 'error', value: message.slice(0, 200) },
        { key: 'target', value: target },
      ],
      meta: { error: true, timestamp: now }
    }]
  };
}

async function callFullContact(target: string, type: string) {
  const API_KEY = Deno.env.get('FULLCONTACT_API_KEY');
  if (!API_KEY) {
    console.log('[fullcontact] API key not configured');
    return createUnconfiguredFinding('fullcontact', 'FULLCONTACT_API_KEY');
  }

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
    return createProviderErrorFinding('fullcontact', e, target);
  }
}

async function callPipl(target: string, type: string) {
  const API_KEY = Deno.env.get('PIPL_API_KEY');
  if (!API_KEY) {
    console.log('[pipl] API key not configured');
    return createUnconfiguredFinding('pipl', 'PIPL_API_KEY');
  }

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
    return createProviderErrorFinding('pipl', e, target);
  }
}

async function callClearbit(target: string, type: string) {
  const API_KEY = Deno.env.get('CLEARBIT_API_KEY');
  if (!API_KEY) {
    console.log('[clearbit] API key not configured');
    return createUnconfiguredFinding('clearbit', 'CLEARBIT_API_KEY');
  }

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
    return createProviderErrorFinding('clearbit', e, target);
  }
}

async function callShodan(target: string) {
  const API_KEY = Deno.env.get('SHODAN_API_KEY');
  if (!API_KEY) {
    console.log('[shodan] API key not configured');
    return createUnconfiguredFinding('shodan', 'SHODAN_API_KEY');
  }

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
    return createProviderErrorFinding('shodan', e, target);
  }
}

async function callHIBP(email: string) {
  const API_KEY = Deno.env.get('HIBP_API_KEY');
  if (!API_KEY) {
    console.log('[hibp] API key not configured');
    return createUnconfiguredFinding('hibp', 'HIBP_API_KEY');
  }

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
    return createProviderErrorFinding('hibp', e, email);
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
  const API_KEY = Deno.env.get('ABSTRACTAPI_PHONE_VALIDATION_KEY');
  const now = new Date().toISOString();

  const apiKey = (API_KEY ?? '').trim();

  if (!apiKey) {
    console.log('[callAbstractPhone] ABSTRACTAPI_PHONE_VALIDATION_KEY not configured');
    return {
      findings: [{
        provider: 'abstract_phone',
        kind: 'provider.unconfigured',
        severity: 'info' as const,
        confidence: 1.0,
        observedAt: now,
        evidence: [
          { key: 'message', value: 'Abstract Phone API key not configured' },
          { key: 'config_required', value: 'ABSTRACTAPI_PHONE_VALIDATION_KEY' }
        ],
        meta: { unconfigured: true }
      }]
    };
  }

  try {
    // Normalize phone to E.164 format if needed
    let normalizedPhone = phone.replace(/[\s\-\(\)\.]/g, '');

    // If starts with 0 and looks like UK number (10-11 digits after 0), add +44
    if (normalizedPhone.startsWith('0') && normalizedPhone.length >= 10 && normalizedPhone.length <= 11) {
      normalizedPhone = '+44' + normalizedPhone.substring(1);
      console.log(`[callAbstractPhone] Normalized UK phone: ${phone} -> ${normalizedPhone}`);
    }
    // If no country code prefix, try to add one
    else if (!normalizedPhone.startsWith('+') && !normalizedPhone.startsWith('00')) {
      // Default to +44 for UK if 10-11 digits
      if (normalizedPhone.length >= 10 && normalizedPhone.length <= 11) {
        normalizedPhone = '+44' + normalizedPhone;
        console.log(`[callAbstractPhone] Added UK prefix: ${phone} -> ${normalizedPhone}`);
      }
    }

    console.log(`[callAbstractPhone] Validating phone: ${normalizedPhone}`);

    const response = await fetch(
      `https://phoneintelligence.abstractapi.com/v1/?api_key=${apiKey}&phone=${encodeURIComponent(normalizedPhone)}`,
      { headers: { 'User-Agent': 'FootprintIQ-Server' } }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[callAbstractPhone] API error: ${response.status} - ${errorText}`);
      return { 
        findings: [{
          provider: 'abstract_phone',
          kind: 'provider_error',
          severity: 'warn' as const,
          confidence: 0.5,
          observedAt: now,
          evidence: [
            { key: 'error', value: `Abstract Phone API error: ${response.status}` },
            { key: 'phone', value: normalizedPhone }
          ],
          meta: { error: errorText.slice(0, 200), status: response.status }
        }]
      };
    }
    
    const data = await response.json();
    console.log(`[callAbstractPhone] Response:`, JSON.stringify(data).substring(0, 300));
    
    // Convert raw API response to UFM findings format
    const findings: any[] = [];
    
    if (data.valid !== undefined) {
      findings.push({
        provider: 'abstract_phone',
        kind: 'phone.validation',
        severity: data.valid ? 'info' as const : 'low' as const,
        confidence: 0.85,
        observedAt: now,
        evidence: [
          { key: 'Phone Number', value: data.format?.international || normalizedPhone },
          { key: 'Valid', value: String(data.valid) },
          { key: 'Type', value: data.type || 'Unknown' },
          { key: 'Carrier', value: data.carrier || 'Unknown' },
          { key: 'Country', value: data.country?.name || 'Unknown' },
          { key: 'Country Code', value: data.country?.code || 'Unknown' },
          { key: 'Location', value: data.location || 'Unknown' },
        ].filter(e => e.value && e.value !== 'Unknown'),
        meta: {
          valid: data.valid,
          type: data.type,
          carrier: data.carrier,
          country: data.country,
          location: data.location,
          format: data.format
        }
      });
    }
    
    console.log(`[callAbstractPhone] Generated ${findings.length} findings`);
    return { findings };
    
  } catch (error: any) {
    console.error('[callAbstractPhone] Exception:', error);
    return { 
      findings: [{
        provider: 'abstract_phone',
        kind: 'provider_error',
        severity: 'warn' as const,
        confidence: 0.5,
        observedAt: now,
        evidence: [
          { key: 'error', value: error.message || 'Unknown error' },
          { key: 'phone', value: phone }
        ],
        meta: { error: String(error) }
      }]
    };
  }
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

async function callIPQSEmail(email: string) {
  const API_KEY = Deno.env.get('IPQS_API_KEY');
  if (!API_KEY) {
    console.log('[IPQS Email] No API key configured');
    return { 
      findings: [{
        provider: 'ipqs_email',
        kind: 'provider.unconfigured',
        severity: 'info' as const,
        confidence: 1.0,
        observedAt: new Date().toISOString(),
        evidence: [
          { key: 'message', value: 'IPQS API key not configured' },
          { key: 'config_required', value: 'IPQS_API_KEY' }
        ],
        meta: { unconfigured: true }
      }]
    };
  }

  try {
    const response = await fetch(
      `https://ipqualityscore.com/api/json/email/${API_KEY}/${encodeURIComponent(email)}`,
      { headers: { 'User-Agent': 'FootprintIQ-Server' } }
    );

    if (!response.ok) {
      console.error(`[IPQS Email] API error: ${response.status}`);
      return { findings: [] };
    }

    const data = await response.json();
    const now = new Date().toISOString();
    const findings: any[] = [];

    // Basic email validation finding
    if (data.valid !== undefined) {
      const riskLevel = data.fraud_score > 75 ? 'high' : data.fraud_score > 50 ? 'medium' : data.fraud_score > 25 ? 'low' : 'info';
      
      findings.push({
        provider: 'ipqs_email',
        kind: 'email.validation',
        severity: riskLevel,
        confidence: 0.85,
        observedAt: now,
        evidence: [
          { key: 'Email', value: email },
          { key: 'Valid', value: String(data.valid) },
          { key: 'Fraud Score', value: `${data.fraud_score}/100` },
          { key: 'Deliverable', value: data.deliverability || 'unknown' },
          { key: 'Domain Age', value: data.domain_age?.human || 'Unknown' },
          { key: 'First Seen', value: data.first_seen?.human || 'Unknown' },
          { key: 'SPF Record', value: String(data.spf_record || false) },
          { key: 'DMARC Record', value: String(data.dmarc_record || false) },
        ],
        meta: {
          fraud_score: data.fraud_score,
          recent_abuse: data.recent_abuse,
          suspect: data.suspect,
          deliverability: data.deliverability,
        }
      });
    }

    // Disposable email detection
    if (data.disposable) {
      findings.push({
        provider: 'ipqs_email',
        kind: 'email.disposable',
        severity: 'medium' as const,
        confidence: 0.9,
        observedAt: now,
        evidence: [
          { key: 'Email', value: email },
          { key: 'Disposable', value: 'true' },
          { key: 'Domain', value: email.split('@')[1] || '' },
        ],
        meta: { disposable: true }
      });
    }

    // Data leak detection
    if (data.leaked) {
      findings.push({
        provider: 'ipqs_email',
        kind: 'email.leaked',
        severity: 'high' as const,
        confidence: 0.85,
        observedAt: now,
        evidence: [
          { key: 'Email', value: email },
          { key: 'Leaked', value: 'true' },
          { key: 'First Seen', value: data.first_seen?.human || 'Unknown' },
        ],
        meta: { leaked: true, first_seen: data.first_seen }
      });
    }

    // Spam trap / honeypot detection
    if (data.honeypot || data.spam_trap_score !== 'none') {
      findings.push({
        provider: 'ipqs_email',
        kind: 'email.spam_trap',
        severity: 'medium' as const,
        confidence: 0.8,
        observedAt: now,
        evidence: [
          { key: 'Email', value: email },
          { key: 'Honeypot', value: String(data.honeypot || false) },
          { key: 'Spam Trap Score', value: data.spam_trap_score || 'none' },
        ],
        meta: { honeypot: data.honeypot, spam_trap_score: data.spam_trap_score }
      });
    }

    // Recent abuse detection
    if (data.recent_abuse) {
      findings.push({
        provider: 'ipqs_email',
        kind: 'email.abuse',
        severity: 'high' as const,
        confidence: 0.8,
        observedAt: now,
        evidence: [
          { key: 'Email', value: email },
          { key: 'Recent Abuse', value: 'true' },
          { key: 'Fraud Score', value: `${data.fraud_score}/100` },
        ],
        meta: { recent_abuse: true, fraud_score: data.fraud_score }
      });
    }

    console.log(`[IPQS Email] Generated ${findings.length} findings for ${email}`);
    return { findings };
  } catch (error) {
    console.error('[IPQS Email] Exception:', error);
    return { findings: [] };
  }
}

async function callIPQSPhone(phone: string) {
  const API_KEY = Deno.env.get('IPQS_API_KEY');
  if (!API_KEY) {
    console.log('[IPQS Phone] No API key configured');
    return { 
      findings: [{
        provider: 'ipqs_phone',
        kind: 'provider.unconfigured',
        severity: 'info' as const,
        confidence: 1.0,
        observedAt: new Date().toISOString(),
        evidence: [
          { key: 'message', value: 'IPQS API key not configured' },
          { key: 'config_required', value: 'IPQS_API_KEY' }
        ],
        meta: { unconfigured: true }
      }]
    };
  }

  try {
    // Clean phone number - remove spaces, dashes, parentheses, dots
    let cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Normalize to E.164 format for better API compatibility
    if (cleanPhone.startsWith('0') && cleanPhone.length >= 10 && cleanPhone.length <= 11) {
      cleanPhone = '44' + cleanPhone.substring(1); // UK format without +
      console.log(`[IPQS Phone] Normalized UK phone: ${phone} -> ${cleanPhone}`);
    }
    
    console.log(`[IPQS Phone] Validating phone: ${cleanPhone}`);
    
    const response = await fetch(
      `https://ipqualityscore.com/api/json/phone/${API_KEY}/${encodeURIComponent(cleanPhone)}`,
      { headers: { 'User-Agent': 'FootprintIQ-Server' } }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[IPQS Phone] API error: ${response.status} - ${errorText}`);
      
      // Return informative finding instead of empty
      const now = new Date().toISOString();
      return { 
        findings: [{
          provider: 'ipqs_phone',
          kind: 'provider_error',
          severity: 'warn' as const,
          confidence: 0.5,
          observedAt: now,
          evidence: [
            { key: 'error', value: `IPQS Phone API error: ${response.status}` },
            { key: 'phone', value: cleanPhone },
            { key: 'hint', value: response.status === 401 || response.status === 403 
              ? 'API key may not have phone validation permissions' 
              : 'API request failed' }
          ],
          meta: { error: errorText.slice(0, 200), status: response.status }
        }]
      };
    }

    const data = await response.json();
    console.log(`[IPQS Phone] Response:`, JSON.stringify(data).substring(0, 500));
    
    // Check for API-level error responses
    const msg = typeof data.message === 'string' ? data.message : '';
    const msgLooksLikeError = /unauthorized|invalid|forbidden|error|missing|expired/i.test(msg);
    if (data.success === false || data.error || msgLooksLikeError) {
      console.error(`[IPQS Phone] API returned error:`, data.error || msg || 'Unknown API error');
      const now = new Date().toISOString();
      return { 
        findings: [{
          provider: 'ipqs_phone',
          kind: 'provider_error',
          severity: 'warn' as const,
          confidence: 0.5,
          observedAt: now,
          evidence: [
            { key: 'error', value: data.message || 'Unknown API error' },
            { key: 'phone', value: cleanPhone },
            { key: 'hint', value: data.message?.includes('unauthorized') || data.message?.includes('key')
              ? 'API key may not have phone validation permissions - check IPQS subscription'
              : 'Check API configuration' }
          ],
          meta: { apiError: data.message, request_id: data.request_id }
        }]
      };
    }
    
    const now = new Date().toISOString();
    const findings: any[] = [];

    // Main phone intelligence finding
    if (data.valid !== undefined) {
      const riskLevel = data.fraud_score > 75 ? 'high' : data.fraud_score > 50 ? 'medium' : data.fraud_score > 25 ? 'low' : 'info';
      
      // Build location string
      const locationParts = [data.city, data.region, data.country].filter(Boolean);
      const location = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown';
      
      findings.push({
        provider: 'ipqs_phone',
        kind: 'phone.validation',
        severity: riskLevel,
        confidence: 0.85,
        observedAt: now,
        evidence: [
          { key: 'Phone Number', value: data.formatted || cleanPhone },
          { key: 'Valid', value: String(data.valid) },
          { key: 'Active', value: String(data.active || 'unknown') },
          { key: 'Carrier', value: data.carrier || 'Unknown' },
          { key: 'Line Type', value: data.line_type || 'Unknown' },
          { key: 'Location', value: location },
          { key: 'Fraud Score', value: `${data.fraud_score}/100` },
          { key: 'VoIP', value: String(data.VOIP || false) },
          { key: 'Prepaid', value: String(data.prepaid || false) },
        ],
        meta: {
          fraud_score: data.fraud_score,
          carrier: data.carrier,
          line_type: data.line_type,
          voip: data.VOIP,
          active: data.active,
          country: data.country,
          region: data.region,
          city: data.city,
        }
      });
    }

    // VoIP detection finding
    if (data.VOIP) {
      findings.push({
        provider: 'ipqs_phone',
        kind: 'phone.voip',
        severity: 'low' as const,
        confidence: 0.9,
        observedAt: now,
        evidence: [
          { key: 'Phone Number', value: data.formatted || cleanPhone },
          { key: 'VoIP', value: 'true' },
          { key: 'Carrier', value: data.carrier || 'Unknown' },
          { key: 'Line Type', value: data.line_type || 'VoIP' },
        ],
        meta: { voip: true, carrier: data.carrier }
      });
    }

    // Data leak detection
    if (data.leaked) {
      findings.push({
        provider: 'ipqs_phone',
        kind: 'phone.leaked',
        severity: 'high' as const,
        confidence: 0.85,
        observedAt: now,
        evidence: [
          { key: 'Phone Number', value: data.formatted || cleanPhone },
          { key: 'Leaked', value: 'true' },
          { key: 'Carrier', value: data.carrier || 'Unknown' },
        ],
        meta: { leaked: true }
      });
    }

    // Recent abuse detection
    if (data.recent_abuse) {
      findings.push({
        provider: 'ipqs_phone',
        kind: 'phone.abuse',
        severity: 'high' as const,
        confidence: 0.8,
        observedAt: now,
        evidence: [
          { key: 'Phone Number', value: data.formatted || cleanPhone },
          { key: 'Recent Abuse', value: 'true' },
          { key: 'Fraud Score', value: `${data.fraud_score}/100` },
        ],
        meta: { recent_abuse: true, fraud_score: data.fraud_score }
      });
    }

    // Spammer detection
    if (data.spammer) {
      findings.push({
        provider: 'ipqs_phone',
        kind: 'phone.spammer',
        severity: 'medium' as const,
        confidence: 0.85,
        observedAt: now,
        evidence: [
          { key: 'Phone Number', value: data.formatted || cleanPhone },
          { key: 'Spammer', value: 'true' },
          { key: 'Fraud Score', value: `${data.fraud_score}/100` },
        ],
        meta: { spammer: true, fraud_score: data.fraud_score }
      });
    }

    // Risky phone detection
    if (data.risky) {
      findings.push({
        provider: 'ipqs_phone',
        kind: 'phone.risky',
        severity: 'medium' as const,
        confidence: 0.75,
        observedAt: now,
        evidence: [
          { key: 'Phone Number', value: data.formatted || cleanPhone },
          { key: 'Risky', value: 'true' },
          { key: 'Fraud Score', value: `${data.fraud_score}/100` },
          { key: 'Line Type', value: data.line_type || 'Unknown' },
        ],
        meta: { risky: true, fraud_score: data.fraud_score }
      });
    }

    console.log(`[IPQS Phone] Generated ${findings.length} findings for ${cleanPhone}`);
    return { findings };
  } catch (error) {
    console.error('[IPQS Phone] Exception:', error);
    return { findings: [] };
  }
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

async function callApifyRunner(actorId: string, target: string, input: Record<string, any>, workspaceId?: string) {
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
          workspaceId: workspaceId || 'system',
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

// =================== Perplexity OSINT Provider ===================

async function callPerplexityOSINT(target: string, type: string, options: any = {}): Promise<{ findings: any[], citations?: string[] }> {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  const now = new Date().toISOString();
  
  if (!PERPLEXITY_API_KEY) {
    console.log('[perplexity_osint] API key not configured');
    return {
      findings: [{
        provider: 'perplexity_osint',
        kind: 'provider.unconfigured',
        severity: 'info' as const,
        confidence: 1.0,
        observedAt: now,
        evidence: [
          { key: 'message', value: 'Perplexity API key not configured' },
          { key: 'config_required', value: 'PERPLEXITY_API_KEY' }
        ],
        meta: { unconfigured: true }
      }]
    };
  }

  // Build targeted OSINT query based on type
  const queryBuilders: Record<string, string> = {
    username: `Find all publicly available information about the username "${target}". Look for social media profiles, forum accounts, gaming profiles, and any mentions on websites. Focus on verified accounts and significant online presence. Report each finding with the source URL.`,
    email: `Search for any public exposure of the email address "${target}". Look for data breaches, paste sites, public registrations, social media accounts linked to this email, and any security incidents. Report findings with source URLs.`,
    phone: `Find any public information associated with the phone number "${target}". Look for spam reports, scam reports, business listings, social media profiles, and any public registrations. Report each finding with the source URL.`,
  };

  const query = queryBuilders[type] || `Search for all public information about "${target}". Report findings with source URLs.`;

  console.log(`[perplexity_osint] Searching for ${type}: ${target}`);

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are an OSINT analyst searching for publicly available information. Be thorough but only report verified, publicly accessible data. Focus on actionable intelligence. Never fabricate information - if you cannot find data, say so.'
          },
          { role: 'user', content: query }
        ],
        search_recency_filter: options.recencyFilter || 'month',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[perplexity_osint] API error:', response.status, errorText);
      return {
        findings: [{
          provider: 'perplexity_osint',
          kind: 'provider_error',
          severity: 'warn' as const,
          confidence: 0.5,
          observedAt: now,
          evidence: [
            { key: 'error', value: `Perplexity API error: ${response.status}` },
            { key: 'target', value: target }
          ],
          meta: { error: errorText.slice(0, 500) }
        }]
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    console.log(`[perplexity_osint] Response received with ${citations.length} citations`);

    // Parse the response into structured findings
    const findings = normalizePerplexityFindings(content, citations, target, type, now);

    return {
      findings: findings.length > 0 ? findings : [{
        provider: 'perplexity_osint',
        kind: 'web_intel.no_results',
        severity: 'info' as const,
        confidence: 0.9,
        observedAt: now,
        evidence: [
          { key: 'message', value: 'No significant public information found' },
          { key: 'target', value: target },
          { key: 'type', value: type }
        ],
        meta: { rawContent: content.slice(0, 1000) }
      }],
      citations
    };

  } catch (error: any) {
    console.error('[perplexity_osint] Error:', error);
    return {
      findings: [{
        provider: 'perplexity_osint',
        kind: 'provider_error',
        severity: 'warn' as const,
        confidence: 0.5,
        observedAt: now,
        evidence: [
          { key: 'error', value: error.message || 'Unknown error' },
          { key: 'target', value: target }
        ],
        meta: { error: String(error) }
      }]
    };
  }
}

function normalizePerplexityFindings(content: string, citations: string[], target: string, type: string, observedAt: string): any[] {
  const findings: any[] = [];

  // Add a main web intelligence finding with the full analysis
  if (content && content.length > 50) {
    findings.push({
      provider: 'perplexity_osint',
      kind: 'web_intel.analysis',
      severity: 'medium' as const,
      confidence: 0.8,
      observedAt,
      evidence: [
        { key: 'target', value: target },
        { key: 'type', value: type },
        { key: 'summary', value: content.slice(0, 500) }
      ],
      meta: {
        fullContent: content,
        citationCount: citations.length,
        sources: citations.slice(0, 10)
      }
    });
  }

  // Create individual findings for each citation
  citations.slice(0, 10).forEach((url, index) => {
    const domain = new URL(url).hostname.replace('www.', '');
    findings.push({
      provider: 'perplexity_osint',
      kind: 'web_intel.mention',
      severity: 'info' as const,
      confidence: 0.7,
      observedAt,
      evidence: [
        { key: 'source', value: domain },
        { key: 'url', value: url },
        { key: 'target', value: target },
        { key: 'citation_index', value: String(index + 1) }
      ],
      meta: { url, domain }
    });
  });

  return findings;
}
