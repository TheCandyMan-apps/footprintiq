import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad, allowedOrigin } from '../_shared/secure.ts';
import { checkCredits, deductCredits } from '../_shared/credits.ts';

const ENRICHMENT_COST = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') return bad(405, 'method_not_allowed');
  if (!allowedOrigin(req)) return bad(403, 'forbidden');

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return bad(401, 'unauthorized');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) return bad(401, 'unauthorized');

    const { findingId, workspaceId } = await req.json();
    if (!findingId || !workspaceId) return bad(400, 'missing_parameters');

    // Check credits
    const creditCheck = await checkCredits(workspaceId, ENRICHMENT_COST);
    if (!creditCheck.success) {
      return new Response(JSON.stringify({
        error: creditCheck.error,
        balance: creditCheck.balance,
        required: creditCheck.required
      }), {
        status: 402,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }

    // Fetch finding details
    const { data: finding, error: findingError } = await supabase
      .from('findings')
      .select('*')
      .eq('id', findingId)
      .single();

    if (findingError || !finding) return bad(404, 'finding_not_found');

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
Category: ${finding.provider_category}
Severity: ${finding.severity}
Confidence: ${finding.confidence}
Evidence: ${JSON.stringify(finding.evidence || {})}
Raw Data: ${JSON.stringify(finding.raw || {})}

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
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
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
    const deductResult = await deductCredits(
      workspaceId,
      ENRICHMENT_COST,
      `Deep enrichment for finding ${findingId}`
    );

    if (!deductResult.success) {
      return new Response(JSON.stringify({
        error: 'credit_deduction_failed',
        balance: deductResult.balance
      }), {
        status: 402,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }

    // Store enrichment in database
    const { error: insertError } = await supabase
      .from('finding_enrichments')
      .insert({
        finding_id: findingId,
        workspace_id: workspaceId,
        enriched_by: user.id,
        context: enrichment.context,
        links: enrichment.links,
        remediation_steps: enrichment.remediation_steps,
        attack_vectors: enrichment.attack_vectors,
        credits_spent: ENRICHMENT_COST
      });

    if (insertError) {
      console.error('[enrich-finding] Insert error:', insertError);
    }

    return ok({
      enrichment,
      credits_spent: ENRICHMENT_COST,
      new_balance: deductResult.balance
    });

  } catch (error) {
    console.error('[enrich-finding] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'unknown_error');
  }
});
