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

    // Build research queries based on depth
    const queries = buildResearchQueries(target, type, depth);
    const results: any[] = [];

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
              { role: 'system', content: 'You are an OSINT researcher. Provide thorough, factual analysis with source URLs. Never fabricate information.' },
              { role: 'user', content: query }
            ],
            search_recency_filter: 'month',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          results.push({
            query,
            content: data.choices?.[0]?.message?.content || '',
            citations: data.citations || []
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
      credits_spent: cost
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

function buildResearchQueries(target: string, type: string, depth: string): string[] {
  const baseQueries: Record<string, string[]> = {
    username: [
      `Find all social media profiles and online accounts for username "${target}". Include URLs.`,
    ],
    email: [
      `Search for any public exposure or breaches involving email "${target}". Include source URLs.`,
    ],
    phone: [
      `Find public information about phone number "${target}". Look for spam reports, business listings, social profiles.`,
    ],
    domain: [
      `Research the domain "${target}". Find company info, security incidents, and related infrastructure.`,
    ],
    entity: [
      `Research "${target}". Find background information, news, and public records.`,
    ],
  };

  const queries = baseQueries[type] || [`Research "${target}"`];

  if (depth === 'standard' || depth === 'deep') {
    queries.push(`Find recent news and security incidents related to "${target}".`);
  }

  if (depth === 'deep') {
    queries.push(`Search for "${target}" in breach databases, paste sites, and dark web mentions.`);
    queries.push(`Find technical infrastructure and related entities for "${target}".`);
  }

  return queries;
}
