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

  try {
    const { provider, target, type, options = {} } = await req.json();
    console.log(`[provider-proxy] ${provider} request for ${target} (${type})`);

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
      case 'hunter':
        result = await callHunter(target);
        break;
      case 'fullhunt':
        result = await callFullHunt(target);
        break;
      case 'apify':
        result = await callApify(target, options.platform);
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

async function callHunter(domain: string) {
  const API_KEY = Deno.env.get('HUNTER_IO_KEY');
  if (!API_KEY) throw new Error('HUNTER_IO_KEY not configured');

  const response = await fetch(
    `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${API_KEY}`,
    {
      headers: { 'User-Agent': 'FootprintIQ-Server' },
    }
  );

  if (!response.ok) throw new Error(`Hunter API error: ${response.status}`);
  return await response.json();
}

async function callFullHunt(domain: string) {
  const API_KEY = Deno.env.get('FULLHUNT_API_KEY');
  if (!API_KEY) throw new Error('FULLHUNT_API_KEY not configured');

  const response = await fetch(
    `https://fullhunt.io/api/v1/domain/${domain}/subdomains`,
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
  const API_TOKEN = Deno.env.get('APIFY_API_TOKEN');
  if (!API_TOKEN) throw new Error('APIFY_API_TOKEN not configured');

  const actorId = Deno.env.get('APIFY_USERNAME_ACTOR') || 'apify/web-scraper';
  const response = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${API_TOKEN}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FootprintIQ-Server',
      },
      body: JSON.stringify({ username, platform }),
    }
  );

  if (!response.ok) throw new Error(`Apify API error: ${response.status}`);
  return await response.json();
}

async function callGoogleCSE(query: string) {
  const API_KEY = Deno.env.get('GOOGLE_API_KEY');
  const SEARCH_ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_API_KEY');
  if (!API_KEY || !SEARCH_ENGINE_ID) throw new Error('GOOGLE API credentials not configured');

  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`,
    {
      headers: { 'User-Agent': 'FootprintIQ-Server' },
    }
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
    `https://api.securitytrails.com/v1/domain/${domain}/subdomains`,
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

async function callURLScan(query: string) {
  const API_KEY = Deno.env.get('URLSCAN_API_KEY');
  if (!API_KEY) throw new Error('URLSCAN_API_KEY not configured');

  const response = await fetch(
    `https://urlscan.io/api/v1/search/?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'API-Key': API_KEY,
        'User-Agent': 'FootprintIQ-Server',
      },
    }
  );

  if (!response.ok) throw new Error(`URLScan API error: ${response.status}`);
  return await response.json();
}

async function callWHOISXML(domain: string) {
  const API_KEY = Deno.env.get('WHOISXML_API_KEY');
  if (!API_KEY) throw new Error('WHOISXML_API_KEY not configured');

  const response = await fetch(
    `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${API_KEY}&domainName=${domain}&outputFormat=JSON`,
    {
      headers: { 'User-Agent': 'FootprintIQ-Server' },
    }
  );

  if (!response.ok) throw new Error(`WHOISXML API error: ${response.status}`);
  return await response.json();
}

async function callAbstractPhone(phone: string) {
  const API_KEY = Deno.env.get('ABSTRACTAPI_PHONE_VALIDATION_KEY');
  if (!API_KEY) throw new Error('ABSTRACTAPI_PHONE_VALIDATION_KEY not configured');

  const response = await fetch(
    `https://phonevalidation.abstractapi.com/v1/?api_key=${API_KEY}&phone=${phone}`,
    {
      headers: { 'User-Agent': 'FootprintIQ-Server' },
    }
  );

  if (!response.ok) throw new Error(`AbstractAPI Phone error: ${response.status}`);
  return await response.json();
}

async function callAbstractIPGeo(ip: string) {
  const API_KEY = Deno.env.get('ABSTRACTAPI_IP_GEOLOCATION_KEY');
  if (!API_KEY) throw new Error('ABSTRACTAPI_IP_GEOLOCATION_KEY not configured');

  const response = await fetch(
    `https://ipgeolocation.abstractapi.com/v1/?api_key=${API_KEY}&ip_address=${ip}`,
    {
      headers: { 'User-Agent': 'FootprintIQ-Server' },
    }
  );

  if (!response.ok) throw new Error(`AbstractAPI IPGeo error: ${response.status}`);
  return await response.json();
}

async function callAbstractCompany(domain: string) {
  const API_KEY = Deno.env.get('ABSTRACTAPI_COMPANY_ENRICHMENT_KEY');
  if (!API_KEY) throw new Error('ABSTRACTAPI_COMPANY_ENRICHMENT_KEY not configured');

  const response = await fetch(
    `https://companyenrichment.abstractapi.com/v1/?api_key=${API_KEY}&domain=${domain}`,
    {
      headers: { 'User-Agent': 'FootprintIQ-Server' },
    }
  );

  if (!response.ok) throw new Error(`AbstractAPI Company error: ${response.status}`);
  return await response.json();
}

async function callAbuseIPDB(ip: string) {
  const API_KEY = Deno.env.get('ABUSEIPDB_API_KEY');
  if (!API_KEY) throw new Error('ABUSEIPDB_API_KEY not configured');

  const response = await fetch(
    `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`,
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

async function callVirusTotal(target: string, type: 'domain' | 'ip') {
  const API_KEY = Deno.env.get('VT_API_KEY');
  if (!API_KEY) throw new Error('VT_API_KEY not configured');

  const endpoint = type === 'domain' ? 'domains' : 'ip_addresses';
  const response = await fetch(
    `https://www.virustotal.com/api/v3/${endpoint}/${target}`,
    {
      headers: {
        'x-apikey': API_KEY,
        'User-Agent': 'FootprintIQ-Server',
      },
    }
  );

  if (!response.ok) throw new Error(`VirusTotal API error: ${response.status}`);
  return await response.json();
}
