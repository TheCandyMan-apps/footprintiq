import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_IP = 10; // 10 searches per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Networks cache - refresh every hour
let networksCache: { data: any; fetchedAt: number } | null = null;
const NETWORKS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt < now) rateLimitMap.delete(key);
    }
  }

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_IP) return false;
  record.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
             req.headers.get("x-real-ip") || "unknown";

  if (!checkRateLimit(ip)) {
    console.warn(`[predicta-search] Rate limit exceeded for IP: ${ip.substring(0, 8)}...`);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Too many requests. Please try again later.',
        provider: 'predictasearch',
      }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
    );
  }

  try {
    const body = await req.json();
    const { action, query, queryType, networks: selectedNetworks } = body;

    const apiKey = Deno.env.get('PREDICTA_SEARCH_API_KEY');
    if (!apiKey) {
      throw new Error('PREDICTA_SEARCH_API_KEY not configured');
    }

    // Handle "getNetworks" action - returns available networks
    if (action === 'getNetworks') {
      console.log('[predicta-search] Fetching available networks');
      
      // Check cache first
      const now = Date.now();
      if (networksCache && (now - networksCache.fetchedAt) < NETWORKS_CACHE_TTL_MS) {
        console.log('[predicta-search] Returning cached networks');
        return new Response(
          JSON.stringify({
            success: true,
            data: networksCache.data,
            cached: true,
            provider: 'predictasearch',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch fresh networks
      const response = await fetch('https://dev.predictasearch.com/api/networks', {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`[predicta-search] Networks API error: ${response.status}`);
        throw new Error(`Networks API error: ${response.status}`);
      }

      const networksData = await response.json();
      
      // Cache the result
      networksCache = { data: networksData, fetchedAt: now };
      
      // Log credit balance
      const creditBalance = response.headers.get('x-credit-balance');
      if (creditBalance) {
        console.log(`[predicta-search] Credits remaining: ${creditBalance}`);
      }

      // Parse networks to extract useful metadata
      const parsedNetworks = Object.entries(networksData).map(([name, config]: [string, any]) => ({
        id: name,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        type: config.type || 'unknown',
        supportedInputs: config.actions?.flatMap((a: any) => a.inputs) || [],
        supportedOutputs: config.actions?.flatMap((a: any) => a.outputs) || [],
      }));

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            networks: parsedNetworks,
            raw: networksData,
            count: parsedNetworks.length,
          },
          cached: false,
          provider: 'predictasearch',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default action: search
    if (!query || !queryType) {
      throw new Error('Missing required parameters: query and queryType');
    }

    // Input validation
    if (typeof query !== 'string' || query.length < 1 || query.length > 500) {
      throw new Error('Query must be a string between 1 and 500 characters');
    }
    if (!['username', 'email', 'phone', 'name'].includes(queryType)) {
      throw new Error('Invalid queryType. Must be: username, email, phone, or name');
    }

    console.log(`[predicta-search] Search request: ${queryType} - ${query}`);

    const response = await fetch('https://dev.predictasearch.com/api/search', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        query_type: queryType,
        networks: selectedNetworks || ['all']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[predicta-search] API error: ${response.status} - ${errorText}`);
      
      // Handle quota exhausted (402) gracefully
      if (response.status === 402) {
        console.warn('[predicta-search] API quota exhausted');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'quota_exhausted',
            provider: 'predictasearch',
            retry: false,
            message: 'Predicta Search API quota exhausted. Please try again later.',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Handle rate limiting (429) gracefully
      if (response.status === 429) {
        console.warn('[predicta-search] API rate limited');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'rate_limited',
            provider: 'predictasearch',
            retry: true,
            message: 'Predicta Search API rate limited. Please try again in a few minutes.',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      throw new Error(`Predicta Search API error: ${response.status}`);
    }

    const rawData = await response.json();
    
    // Log remaining credits
    const creditBalance = response.headers.get('x-credit-balance');
    if (creditBalance) {
      const credits = parseInt(creditBalance, 10);
      console.log(`[predicta-search] Credits remaining: ${credits}`);
      
      if (credits < 100) {
        console.warn(`[predicta-search] LOW CREDITS WARNING: Only ${credits} credits remaining!`);
      } else if (credits < 500) {
        console.warn(`[predicta-search] Credits running low: ${credits} remaining`);
      }
    }

    // Normalize the flat array response into categorized structure
    const results = Array.isArray(rawData) ? rawData : [];
    const profiles: any[] = [];
    const breaches: any[] = [];
    const leaks: any[] = [];

    results.forEach((item: any) => {
      if (item.source === 'hudsonrock' || item.breach_name || item.date_compromised) {
        breaches.push(item);
      } else if (item.source === 'leak' || item.leak_source) {
        leaks.push(item);
      } else {
        profiles.push(item);
      }
    });

    console.log(`[predicta-search] Categorized: ${profiles.length} profiles, ${breaches.length} breaches, ${leaks.length} leaks`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          profiles,
          breaches,
          leaks,
          raw: results,
        },
        provider: 'predictasearch',
        cached: false,
        summary: {
          profiles: profiles.length,
          breaches: breaches.length,
          leaks: leaks.length,
          total: results.length,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[predicta-search] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        provider: 'predictasearch',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
