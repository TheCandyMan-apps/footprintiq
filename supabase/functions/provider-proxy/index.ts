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

    const { provider, target, type, options = {} } = await req.json();
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
        break;
      case 'apify-osint':
        result = await callApifyRunner('epctex/osint-scraper', target, { keywords: [target], modules: ['pastebin', 'github_gist', 'codepad'] });
        break;
      case 'apify-darkweb':
        result = await callApifyRunner('epctex/darkweb-scraper', target, { keywords: [target], maxDepth: options.darkwebDepth || 2 });
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
      default:
        throw new Error(`Unknown provider: ${provider}`);
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
  if (!API_TOKEN) return { findings: [] };

  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/providers/apify-runner`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        actorId,
        input: { ...input, searchTerm: target },
        timeoutSec: 180,
      }),
    }
  );

  if (!response.ok) throw new Error(`Apify Runner error: ${response.status}`);
  return await response.json();
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
