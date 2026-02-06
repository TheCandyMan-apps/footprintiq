import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  language?: string;
  family_friendly?: boolean;
}

interface BraveNewsResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  source?: { name: string; url: string };
  thumbnail?: { src: string };
}

interface BraveWebResponse {
  web?: { results: BraveSearchResult[] };
  news?: { results: BraveNewsResult[] };
  query?: { original: string };
}

/**
 * Brave Search Edge Function
 * 
 * Provides web and news search through Brave's independent index.
 * Used for profile enrichment and LENS confidence corroboration.
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const BRAVE_API_KEY = Deno.env.get('BRAVE_SEARCH_API_KEY');
  const now = new Date().toISOString();

  if (!BRAVE_API_KEY) {
    console.error('[brave-search] API key not configured');
    return new Response(
      JSON.stringify({
        error: 'api_key_not_configured',
        findings: [{
          provider: 'brave_search',
          kind: 'provider.unconfigured',
          severity: 'info',
          confidence: 1.0,
          observedAt: now,
          evidence: [
            { key: 'message', value: 'Brave Search API key not configured' },
            { key: 'config_required', value: 'BRAVE_SEARCH_API_KEY' }
          ],
          meta: { unconfigured: true }
        }]
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const {
      target,
      type = 'username', // username | email | domain | phone
      searchType = 'web', // web | news
      freshness = 'month', // day | week | month | year
      count = 10,
    } = body;

    if (!target) {
      return new Response(
        JSON.stringify({ error: 'target_required', message: 'Target parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[brave-search] ${searchType} search for ${type}: "${target}" (freshness: ${freshness})`);

    // Build search query based on target type
    const query = buildSearchQuery(target, type);
    
    // Determine API endpoint
    const endpoint = searchType === 'news'
      ? 'https://api.search.brave.com/res/v1/news/search'
      : 'https://api.search.brave.com/res/v1/web/search';

    // Build URL with parameters
    const url = new URL(endpoint);
    url.searchParams.set('q', query);
    url.searchParams.set('count', String(Math.min(count, 20))); // Max 20 per request
    url.searchParams.set('safesearch', 'moderate');
    
    if (freshness && freshness !== 'all') {
      // Map to Brave's freshness format: pd (past day), pw (past week), pm (past month), py (past year)
      const freshnessMap: Record<string, string> = {
        day: 'pd',
        week: 'pw',
        month: 'pm',
        year: 'py',
      };
      if (freshnessMap[freshness]) {
        url.searchParams.set('freshness', freshnessMap[freshness]);
      }
    }

    console.log(`[brave-search] Calling Brave API: ${url.toString().replace(query, '***')}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[brave-search] API error ${response.status}:`, errorText.slice(0, 500));
      
      return new Response(
        JSON.stringify({
          error: 'brave_api_error',
          status: response.status,
          findings: [{
            provider: 'brave_search',
            kind: 'provider_error',
            severity: 'warn',
            confidence: 0.5,
            observedAt: now,
            evidence: [
              { key: 'error', value: `Brave API error: ${response.status}` },
              { key: 'target', value: target }
            ],
            meta: { error: errorText.slice(0, 500) }
          }]
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: BraveWebResponse = await response.json();
    
    // Normalize results to UFM findings
    const findings = searchType === 'news'
      ? normalizeNewsResults(data.news?.results || [], target, type, now)
      : normalizeWebResults(data.web?.results || [], target, type, now);

    console.log(`[brave-search] Found ${findings.length} results for "${target}"`);

    // Determine if this is a web_index.hit or web_index.miss
    const isIndexed = findings.length > 0;
    const corroborationFinding = {
      provider: 'brave_search',
      kind: isIndexed ? 'web_index.hit' : 'web_index.miss',
      severity: 'info' as const,
      confidence: isIndexed ? 0.85 : 0.7,
      observedAt: now,
      evidence: [
        { key: 'target', value: target },
        { key: 'type', value: type },
        { key: 'indexed', value: String(isIndexed) },
        { key: 'result_count', value: String(findings.length) },
      ],
      meta: {
        searchType,
        freshness,
        query: data.query?.original || query,
        resultCount: findings.length,
      }
    };

    return new Response(
      JSON.stringify({
        success: true,
        indexed: isIndexed,
        resultCount: findings.length,
        findings: [corroborationFinding, ...findings],
        citations: findings.slice(0, 5).map(f => {
          const urlEvidence = f.evidence?.find((e: any) => e.key === 'url');
          return urlEvidence?.value || '';
        }).filter(Boolean),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[brave-search] Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'internal_error',
        message: error.message,
        findings: [{
          provider: 'brave_search',
          kind: 'provider_error',
          severity: 'warn',
          confidence: 0.5,
          observedAt: now,
          evidence: [
            { key: 'error', value: error.message || 'Unknown error' }
          ],
          meta: { error: String(error) }
        }]
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Build an optimized search query based on target type
 */
function buildSearchQuery(target: string, type: string): string {
  switch (type) {
    case 'username':
      // Search for profile pages containing the username
      return `"${target}" profile OR account OR user`;
    case 'email':
      // Search for email mentions (be careful with PII)
      return `"${target}"`;
    case 'domain':
      // Search for domain mentions and site info
      return `site:${target} OR "${target}"`;
    case 'phone':
      // Search for phone number (format variations)
      const cleaned = target.replace(/\D/g, '');
      return `"${target}" OR "${cleaned}"`;
    default:
      return `"${target}"`;
  }
}

/**
 * Normalize Brave web results to UFM findings
 */
function normalizeWebResults(
  results: BraveSearchResult[],
  target: string,
  type: string,
  observedAt: string
): any[] {
  return results.map((result, index) => {
    // Extract domain from URL
    let domain = '';
    try {
      domain = new URL(result.url).hostname.replace('www.', '');
    } catch {
      domain = 'unknown';
    }

    // Determine severity based on content relevance
    const titleLower = (result.title || '').toLowerCase();
    const descLower = (result.description || '').toLowerCase();
    const targetLower = target.toLowerCase();
    
    const isDirectMatch = titleLower.includes(targetLower) || descLower.includes(targetLower);
    
    return {
      provider: 'brave_search',
      kind: 'web_index.result',
      severity: 'info' as const,
      confidence: isDirectMatch ? 0.85 : 0.65,
      observedAt,
      evidence: [
        { key: 'title', value: result.title || '' },
        { key: 'url', value: result.url || '' },
        { key: 'domain', value: domain },
        { key: 'snippet', value: (result.description || '').slice(0, 300) },
        { key: 'target', value: target },
        { key: 'rank', value: String(index + 1) },
      ].filter(e => e.value),
      meta: {
        ...result,
        searchTarget: target,
        searchType: type,
        directMatch: isDirectMatch,
      }
    };
  });
}

/**
 * Normalize Brave news results to UFM findings
 */
function normalizeNewsResults(
  results: BraveNewsResult[],
  target: string,
  type: string,
  observedAt: string
): any[] {
  return results.map((result, index) => {
    let domain = '';
    try {
      domain = result.source?.name || new URL(result.url).hostname.replace('www.', '');
    } catch {
      domain = 'unknown';
    }

    return {
      provider: 'brave_news',
      kind: 'news_mention',
      severity: 'info' as const,
      confidence: 0.75,
      observedAt,
      evidence: [
        { key: 'title', value: result.title || '' },
        { key: 'url', value: result.url || '' },
        { key: 'source', value: domain },
        { key: 'snippet', value: (result.description || '').slice(0, 300) },
        { key: 'age', value: result.age || '' },
        { key: 'target', value: target },
        { key: 'rank', value: String(index + 1) },
      ].filter(e => e.value),
      meta: {
        ...result,
        searchTarget: target,
        searchType: type,
      }
    };
  });
}
