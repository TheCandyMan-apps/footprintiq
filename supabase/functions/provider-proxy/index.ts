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
        result = await callDeHashed(target);
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
        result = await callProvider('fullcontact', { target, type });
        break;
      case 'pipl':
        result = await callProvider('pipl', { target, type, options });
        break;
      case 'clearbit':
        result = await callProvider('clearbit', { target, type });
        break;
      case 'shodan':
        result = await callProvider('shodan', { target, type });
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    return new Response(JSON.stringify(result), {
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
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.75.0');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  const { data, error } = await supabase.functions.invoke(`providers/${name}`, {
    body,
    headers: {
      'x-internal-token': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    }
  });
  if (error) throw error;
  return data;
}

async function callHIBP(email: string) {
  const API_KEY = Deno.env.get('HIBP_API_KEY');
  if (!API_KEY) throw new Error('HIBP_API_KEY not configured');

  const response = await fetch(
    `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
    {
      headers: {
        'hibp-api-key': API_KEY,
        'User-Agent': 'FootprintIQ-Server',
      },
    }
  );

  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`HIBP API error: ${response.status}`);

  return await response.json();
}

async function callIntelX(query: string) {
  const API_KEY = Deno.env.get('INTELX_API_KEY');
  if (!API_KEY) throw new Error('INTELX_API_KEY not configured');

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
  return await response.json();
}

async function callDeHashed(query: string) {
  const API_KEY = Deno.env.get('DEHASHED_API_KEY');
  const USERNAME = Deno.env.get('DEHASHED_API_KEY_USERNAME');
  if (!API_KEY || !USERNAME) throw new Error('DEHASHED credentials not configured');

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

  if (!response.ok) throw new Error(`DeHashed API error: ${response.status}`);
  return await response.json();
}

async function callCensys(target: string, type: 'domain' | 'ip') {
  const API_KEY_UID = Deno.env.get('CENSYS_API_KEY_UID');
  const API_KEY_SECRET = Deno.env.get('CENSYS_API_KEY_SECRET');
  if (!API_KEY_UID || !API_KEY_SECRET) throw new Error('CENSYS credentials not configured');

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
  if (!API_KEY) throw new Error('BINARYEDGE_API_KEY not configured');

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
  if (!API_KEY) throw new Error('ALIENVAULT_API_KEY not configured');

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
  if (!API_KEY) throw new Error('ALIENVAULT_API_KEY not configured');

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
  if (!API_KEY) throw new Error('SHODAN_API_KEY not configured');

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
  if (!API_KEY) throw new Error('GREYNOISE_API_KEY not configured');

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
  if (!API_KEY) throw new Error('HUNTER_API_KEY not configured');

  const response = await fetch(
    `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${API_KEY}`,
    { headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );

  if (!response.ok) throw new Error(`Hunter API error: ${response.status}`);
  return await response.json();
}

async function callFullHunt(domain: string) {
  const API_KEY = Deno.env.get('FULLHUNT_API_KEY');
  if (!API_KEY) throw new Error('FULLHUNT_API_KEY not configured');

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
  if (!API_KEY) throw new Error('APIFY_API_KEY not configured');

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
  if (!API_KEY || !CX) throw new Error('Google CSE credentials not configured');

  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(query)}`,
    { headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );

  if (!response.ok) throw new Error(`Google CSE API error: ${response.status}`);
  return await response.json();
}

async function callDarkSearch(query: string) {
  const API_KEY = Deno.env.get('DARKSEARCH_API_KEY');
  if (!API_KEY) throw new Error('DARKSEARCH_API_KEY not configured');

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
  if (!API_KEY) throw new Error('SECURITYTRAILS_API_KEY not configured');

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
  if (!API_KEY) throw new Error('URLSCAN_API_KEY not configured');

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
  if (!API_KEY) throw new Error('WHOISXML_API_KEY not configured');

  const response = await fetch(
    `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${API_KEY}&domainName=${encodeURIComponent(domain)}&outputFormat=JSON`,
    { headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );

  if (!response.ok) throw new Error(`WHOISXML API error: ${response.status}`);
  return await response.json();
}

async function callAbstractPhone(phone: string) {
  const API_KEY = Deno.env.get('ABSTRACT_API_KEY');
  if (!API_KEY) throw new Error('ABSTRACT_API_KEY not configured');

  const response = await fetch(
    `https://phonevalidation.abstractapi.com/v1/?api_key=${API_KEY}&phone=${encodeURIComponent(phone)}`,
    { headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );

  if (!response.ok) throw new Error(`Abstract Phone API error: ${response.status}`);
  return await response.json();
}

async function callAbstractIPGeo(ip: string) {
  const API_KEY = Deno.env.get('ABSTRACT_API_KEY');
  if (!API_KEY) throw new Error('ABSTRACT_API_KEY not configured');

  const response = await fetch(
    `https://ipgeolocation.abstractapi.com/v1/?api_key=${API_KEY}&ip_address=${encodeURIComponent(ip)}`,
    { headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );

  if (!response.ok) throw new Error(`Abstract IP Geo API error: ${response.status}`);
  return await response.json();
}

async function callAbstractCompany(domain: string) {
  const API_KEY = Deno.env.get('ABSTRACT_API_KEY');
  if (!API_KEY) throw new Error('ABSTRACT_API_KEY not configured');

  const response = await fetch(
    `https://companyenrichment.abstractapi.com/v1/?api_key=${API_KEY}&domain=${encodeURIComponent(domain)}`,
    { headers: { 'User-Agent': 'FootprintIQ-Server' } }
  );

  if (!response.ok) throw new Error(`Abstract Company API error: ${response.status}`);
  return await response.json();
}

async function callAbuseIPDB(ip: string) {
  const API_KEY = Deno.env.get('ABUSEIPDB_API_KEY');
  if (!API_KEY) throw new Error('ABUSEIPDB_API_KEY not configured');

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
  if (!API_TOKEN) throw new Error('APIFY_API_TOKEN not configured');

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
  if (!API_KEY) throw new Error('VIRUSTOTAL_API_KEY not configured');

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
