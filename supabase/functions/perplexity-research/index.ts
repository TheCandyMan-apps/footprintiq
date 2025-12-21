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

    const systemPrompt = `You are an expert OSINT researcher specializing in digital footprint analysis. Your role is to:
1. Provide thorough, factual analysis based ONLY on information you can verify from sources
2. Always include source URLs for every claim you make
3. For email/username research, explicitly check breach databases like haveibeenpwned.com
4. Structure your findings clearly with sections for: Data Breaches, Social Media, Paste Sites, Public Records
5. If you cannot find information, say so clearly - never fabricate or assume
6. Provide actionable remediation steps when security issues are found
7. Include dates and severity levels where applicable`;

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
            search_domain_filter: type === 'email' ? [
              'haveibeenpwned.com',
              'breachdirectory.org',
              'dehashed.com'
            ] : undefined,
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
  
  // Add known breach context if available
  const breachContext = knownBreaches?.length 
    ? ` Known breaches include: ${knownBreaches.slice(0, 5).join(', ')}.`
    : '';

  if (type === 'email') {
    // Primary OSINT-focused queries for email
    queries.push(
      `Search haveibeenpwned.com and other breach databases for email "${target}". List any data breaches this email appears in with dates and affected data types.${breachContext}`
    );
    
    if (depth === 'standard' || depth === 'deep') {
      queries.push(
        `Search for "${target}" on pastebin.com, ghostbin.com, and paste sites. Look for any public exposure, leaked credentials, or mentions. Include source URLs.`
      );
      queries.push(
        `Find social media profiles, forum accounts, and online registrations linked to email "${target}". Include platform names and URLs.`
      );
    }
    
    if (depth === 'deep') {
      queries.push(
        `Search for recent data breach news mentioning "${target}" or related breaches. Look for security incidents, leak announcements, and exposure reports.`
      );
      queries.push(
        `Find any data broker listings, people search sites, or public records containing "${target}". Include removal options if available.`
      );
    }
  } else if (type === 'username') {
    queries.push(
      `Find all social media profiles for username "${target}" across platforms like Twitter, Instagram, TikTok, Reddit, GitHub, LinkedIn. Include profile URLs and creation dates if visible.`
    );
    
    if (depth === 'standard' || depth === 'deep') {
      queries.push(
        `Search for "${target}" in breach databases, paste sites, and public data dumps. Look for any password leaks or credential exposure.`
      );
      queries.push(
        `Find gaming profiles, forum accounts, and community memberships for username "${target}". Include platform names and activity level.`
      );
    }
    
    if (depth === 'deep') {
      queries.push(
        `Research the history and activity patterns of username "${target}". Look for archived posts, deleted content, and cross-platform connections.`
      );
    }
  } else if (type === 'phone') {
    queries.push(
      `Search for phone number "${target}" in spam reports, caller ID databases, and public directories. Include carrier info if available.`
    );
    
    if (depth === 'standard' || depth === 'deep') {
      queries.push(
        `Find business listings, social media profiles, or online accounts linked to phone "${target}".`
      );
    }
    
    if (depth === 'deep') {
      queries.push(
        `Search for "${target}" in data breach databases and leak compilations. Look for any exposed personal information.`
      );
    }
  } else if (type === 'domain') {
    queries.push(
      `Research domain "${target}". Find WHOIS history, company info, related domains, and infrastructure details.`
    );
    
    if (depth === 'standard' || depth === 'deep') {
      queries.push(
        `Search for security incidents, data breaches, or vulnerabilities affecting "${target}". Include CVEs and security advisories.`
      );
    }
    
    if (depth === 'deep') {
      queries.push(
        `Find subdomains, email patterns, and employee information for "${target}". Look for exposed assets and misconfigurations.`
      );
    }
  } else {
    queries.push(`Research "${target}". Find background information, news, public records, and online presence.`);
    
    if (depth === 'deep') {
      queries.push(`Search for "${target}" in breach databases, court records, and business registrations.`);
    }
  }

  return queries;
}
