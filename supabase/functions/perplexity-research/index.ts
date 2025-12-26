import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ResearchRequestSchema = z.object({
  target: z.string().min(1).max(255),
  type: z.enum(['username', 'email', 'phone', 'domain', 'entity']),
  workspaceId: z.string().uuid(),
  depth: z.enum(['quick', 'standard', 'deep']).optional().default('standard'),
});

const RESEARCH_COSTS = { quick: 3, standard: 5, deep: 10 };

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const validation = ResearchRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.issues }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { target, type, workspaceId, depth } = validation.data;
    const cost = RESEARCH_COSTS[depth];

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check credits
    const { data: balance } = await supabaseService.rpc('get_credits_balance', { _workspace_id: workspaceId });
    if ((balance || 0) < cost) {
      return new Response(JSON.stringify({ error: 'Insufficient credits', required: cost, balance: balance || 0 }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      return new Response(JSON.stringify({ error: 'Perplexity API not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[perplexity-research] Starting ${depth} research on ${type}: ${target}`);

    // Fetch existing HIBP breach data if researching an email
    let knownBreaches: string[] = [];
    let hibpFindings: any[] = [];
    
    if (type === 'email') {
      // Look for existing scan findings for this email
      const { data: existingScans } = await supabaseService
        .from('scans')
        .select('id, findings')
        .eq('target', target)
        .eq('scan_type', 'email')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (existingScans?.[0]?.findings) {
        const findings = existingScans[0].findings as any[];
        hibpFindings = findings.filter((f: any) => 
          f.source === 'hibp' || 
          f.provider === 'hibp' ||
          f.title?.toLowerCase().includes('breach') ||
          f.category === 'breach'
        );
        knownBreaches = hibpFindings.map((f: any) => f.title || f.name).filter(Boolean);
        console.log(`[perplexity-research] Found ${knownBreaches.length} known breaches from HIBP`);
      }
    }

    // Build research queries based on depth and known breaches
    const queries = buildResearchQueries(target, type, depth, knownBreaches);
    const results: any[] = [];

    // Build context from known findings
    const contextSection = knownBreaches.length > 0
      ? `\n\nKNOWN FINDINGS (from FootprintIQ scans): This target appears in these breaches: ${knownBreaches.join(', ')}. Use this as context for your research.`
      : '';

    const systemPrompt = `You are a web intelligence analyst helping users understand their digital footprint. Your role is to:

1. Search the PUBLIC WEB for mentions, news, discussions, and articles about the target
2. Look for forum posts, social media discussions, news coverage, and public profiles
3. Always cite your sources with URLs
4. Be honest about what you find - if nothing is publicly indexed, say so clearly
5. Focus on what IS findable: news mentions, public profiles, forum activity, published content
6. DO NOT claim to directly query databases you cannot access - instead report what web sources say about them

IMPORTANT: You search the web, not private databases. If you find no results, that often means the target has minimal public web presence - which can be positive for privacy.${contextSection}`;

    for (const query of queries) {
      try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: depth === 'deep' ? 'sonar-pro' : 'sonar',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: query }
            ],
            search_recency_filter: depth === 'deep' ? 'year' : 'month',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          results.push({
            query,
            content: data.choices?.[0]?.message?.content || '',
            citations: data.citations || [],
            source: 'perplexity'
          });
        }
      } catch (err) {
        console.error('[perplexity-research] Query error:', err);
      }
    }

    // Deduct credits
    await supabaseService.rpc('spend_credits', {
      _workspace_id: workspaceId,
      _cost: cost,
      _reason: 'api_usage',
      _meta: { target, type, depth, operation: 'perplexity_research' }
    });

    const allCitations = [...new Set(results.flatMap(r => r.citations))];

    return new Response(JSON.stringify({
      target,
      type,
      depth,
      results,
      citations: allCitations,
      credits_spent: cost,
      // Include HIBP data so UI can display both sources
      known_breaches: {
        count: hibpFindings.length,
        breaches: hibpFindings.slice(0, 10).map((f: any) => ({
          name: f.title || f.name,
          severity: f.severity,
          date: f.breach_date || f.date,
          dataTypes: f.data_types || f.compromised_data
        })),
        source: 'hibp'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[perplexity-research] Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function buildResearchQueries(target: string, type: string, depth: string, knownBreaches?: string[]): string[] {
  const queries: string[] = [];

  if (type === 'email') {
    // Web-searchable queries for email - focus on what Perplexity CAN find
    queries.push(
      `Search for news articles, forum posts, or discussions mentioning the email "${target}". Look for any public mentions, registrations, or exposure reports.`
    );
    
    if (depth === 'standard' || depth === 'deep') {
      queries.push(
        `Find any public profiles, websites, or accounts associated with "${target}". Include social media, professional sites, or personal pages.`
      );
    }
    
    if (depth === 'deep') {
      queries.push(
        `Search for security news, breach announcements, or incident reports that may reference "${target}" or the domain associated with it.`
      );
    }
  } else if (type === 'username') {
    queries.push(
      `Search for public profiles using the username "${target}" on social media platforms like Twitter/X, Instagram, TikTok, Reddit, GitHub, YouTube. Include profile URLs if found.`
    );
    
    if (depth === 'standard' || depth === 'deep') {
      queries.push(
        `Find forum posts, gaming profiles, or community accounts for username "${target}". Look on Steam, Discord communities, gaming forums, and hobby communities.`
      );
      queries.push(
        `Search for news articles, blog posts, or discussions mentioning the username "${target}".`
      );
    }
    
    if (depth === 'deep') {
      queries.push(
        `Search for archived content, cross-platform mentions, or historical activity for username "${target}". Include any public repositories or contributions.`
      );
    }
  } else if (type === 'phone') {
    queries.push(
      `Search for phone number "${target}" in public directories, spam reports, or caller ID lookups. Report any public listings or complaints found.`
    );
    
    if (depth === 'standard' || depth === 'deep') {
      queries.push(
        `Find any business listings, advertisements, or public records mentioning phone number "${target}".`
      );
    }
  } else if (type === 'domain') {
    queries.push(
      `Research the domain "${target}". Find company information, public WHOIS data, related news, and what the organization does.`
    );
    
    if (depth === 'standard' || depth === 'deep') {
      queries.push(
        `Search for security news, breach reports, or incidents involving "${target}". Include any public CVEs or advisories.`
      );
    }
    
    if (depth === 'deep') {
      queries.push(
        `Find press coverage, employee information, company announcements, or public documentation about "${target}".`
      );
    }
  } else {
    queries.push(
      `Search for news articles, public profiles, and online presence for "${target}". Include any notable mentions or publications.`
    );
    
    if (depth === 'deep') {
      queries.push(
        `Find business records, professional profiles, or public records mentioning "${target}".`
      );
    }
  }

  return queries;
}
