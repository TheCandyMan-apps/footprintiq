import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EnrichRequestSchema = z.object({
  findingId: z.string().uuid(),
  workspaceId: z.string().uuid(),
});

const ENRICHMENT_COST = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(JSON.stringify({ error: authResult.error || 'Unauthorized' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { userId } = authResult.context;

    // Rate limiting - 30 enrichments per hour
    const rateLimitResult = await checkRateLimit(userId, 'user', 'enrich-finding', {
      maxRequests: 30,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', resetAt: rateLimitResult.resetAt }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Input validation
    const body = await req.json();
    const validation = EnrichRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.issues }), {
        status: 400,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { findingId, workspaceId } = validation.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check credits
    const { data: balance } = await supabase.rpc('get_credits_balance', { 
      _workspace_id: workspaceId 
    });

    if ((balance || 0) < ENRICHMENT_COST) {
      return new Response(JSON.stringify({
        error: 'Insufficient credits',
        balance: balance || 0,
        required: ENRICHMENT_COST
      }), {
        status: 402,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' })
      });
    }

    // Fetch finding details
    const { data: finding, error: findingError } = await supabase
      .from('findings')
      .select('*')
      .eq('id', findingId)
      .single();

    if (findingError || !finding) {
      return new Response(JSON.stringify({ error: 'Finding not found' }), {
        status: 404,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    // Call Lovable AI for enrichment
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const systemPrompt = `You are a cybersecurity analyst providing deep enrichment for OSINT findings. 
Analyze the finding and provide:
1. Additional context about the threat/risk
2. Relevant external links and resources
3. Detailed remediation steps
4. Potential attack vectors or exploitation scenarios

Be specific, actionable, and security-focused.`;

    const userPrompt = `Enrich this finding:
Provider: ${finding.provider}
Type: ${finding.kind}
Severity: ${finding.severity}
Confidence: ${finding.confidence}
Evidence: ${JSON.stringify(finding.evidence || {})}
Additional Data: ${JSON.stringify(finding.meta || {})}

Provide a structured analysis with context, links, and remediation steps.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'provide_enrichment',
            description: 'Provide structured enrichment data for the finding',
            parameters: {
              type: 'object',
              properties: {
                context: {
                  type: 'string',
                  description: 'Additional context about the threat/risk'
                },
                links: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      url: { type: 'string' },
                      description: { type: 'string' }
                    },
                    required: ['title', 'url']
                  },
                  description: 'Relevant external resources'
                },
                remediation_steps: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Detailed remediation steps'
                },
                attack_vectors: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Potential attack vectors or exploitation scenarios'
                }
              },
              required: ['context', 'links', 'remediation_steps', 'attack_vectors'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'provide_enrichment' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[enrich-finding] AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'rate_limit_exceeded' }), {
          status: 429,
          headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' })
        });
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== 'provide_enrichment') {
      throw new Error('Invalid AI response format');
    }

    const enrichment = JSON.parse(toolCall.function.arguments);

    // Deduct credits
    const { data: creditResult, error: creditError } = await supabase.rpc('spend_credits', {
      _workspace_id: workspaceId,
      _cost: ENRICHMENT_COST,
      _reason: 'api_usage',
      _meta: { finding_id: findingId, operation: 'deep_enrichment' }
    });

    if (creditError || !creditResult) {
      return new Response(JSON.stringify({
        error: 'credit_deduction_failed',
        message: creditError?.message
      }), {
        status: 402,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' })
      });
    }

    // Store enrichment in database
    const { error: insertError } = await supabase
      .from('finding_enrichments')
      .insert({
        finding_id: findingId,
        workspace_id: workspaceId,
        enriched_by: userId,
        context: enrichment.context,
        links: enrichment.links,
        remediation_steps: enrichment.remediation_steps,
        attack_vectors: enrichment.attack_vectors,
        credits_spent: ENRICHMENT_COST
      });

    if (insertError) {
      console.error('[enrich-finding] Insert error:', insertError);
    }

    // Get updated balance
    const { data: newBalance } = await supabase.rpc('get_credits_balance', { 
      _workspace_id: workspaceId 
    });

    return new Response(JSON.stringify({
      enrichment,
      credits_spent: ENRICHMENT_COST,
      new_balance: newBalance || 0
    }), {
      headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' })
    });

  } catch (error) {
    console.error('[enrich-finding] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'unknown_error' 
    }), {
      status: 500,
      headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' })
    });
  }
});
