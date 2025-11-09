import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad, allowedOrigin } from '../_shared/secure.ts';
import { checkCredits, deductCredits } from '../_shared/credits.ts';

const ANALYSIS_COST = 2;

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
    const creditCheck = await checkCredits(workspaceId, ANALYSIS_COST);
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

    // Call Lovable AI for quick analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const systemPrompt = `You are a cybersecurity analyst providing quick, concise analysis of OSINT findings.
Provide a brief assessment in 2-3 sentences covering:
1. What this finding means
2. Risk level assessment
3. One immediate action to take

Be direct, actionable, and concise.`;

    const userPrompt = `Quick analysis for:
Provider: ${finding.provider}
Category: ${finding.provider_category}
Severity: ${finding.severity}
Confidence: ${finding.confidence}

Provide a brief 2-3 sentence analysis with immediate next step.`;

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
            name: 'provide_quick_analysis',
            description: 'Provide brief analysis of the finding',
            parameters: {
              type: 'object',
              properties: {
                summary: {
                  type: 'string',
                  description: 'Brief 2-3 sentence summary of what the finding means'
                },
                risk_level: {
                  type: 'string',
                  enum: ['critical', 'high', 'medium', 'low'],
                  description: 'Overall risk assessment'
                },
                immediate_action: {
                  type: 'string',
                  description: 'One immediate action to take'
                }
              },
              required: ['summary', 'risk_level', 'immediate_action'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'provide_quick_analysis' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[quick-analysis] AI API error:', aiResponse.status, errorText);
      
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
    
    if (!toolCall || toolCall.function.name !== 'provide_quick_analysis') {
      throw new Error('Invalid AI response format');
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Deduct credits
    const deductResult = await deductCredits(
      workspaceId,
      ANALYSIS_COST,
      `Quick analysis for finding ${findingId}`
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

    return ok({
      analysis,
      credits_spent: ANALYSIS_COST,
      new_balance: deductResult.balance
    });

  } catch (error) {
    console.error('[quick-analysis] Error:', error);
    return bad(500, error instanceof Error ? error.message : 'unknown_error');
  }
});
