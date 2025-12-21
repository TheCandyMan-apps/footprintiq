import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { logAIUsage } from "../_shared/aiLogger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, contextType, contextId, workspaceId, enableWebSearch } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Build context
    let contextData = '';
    
    if (contextType && contextId) {
      switch (contextType) {
        case 'entity':
          const { data: entity } = await supabase
            .from('entity_nodes')
            .select('*')
            .eq('id', contextId)
            .single();
          if (entity) {
            contextData = `Entity Context: ${entity.entity_type} - ${entity.value}`;
          }
          break;
          
        case 'case':
          const { data: caseData } = await supabase
            .from('legal_cases')
            .select('*, findings(*)')
            .eq('id', contextId)
            .single();
          if (caseData) {
            contextData = `Case Context: ${caseData.case_number} - ${caseData.title}
Findings: ${caseData.findings?.length || 0}`;
          }
          break;
          
        case 'scan':
          const { data: scan } = await supabase
            .from('scans')
            .select('*, findings(*)')
            .eq('id', contextId)
            .single();
          if (scan) {
            contextData = `Scan Context: Risk Score ${scan.risk_score}
Findings: ${scan.findings?.length || 0}`;
          }
          break;
      }
    }

    // Detect web search intent
    const webSearchPatterns = [
      /search\s+(the\s+)?web/i,
      /find\s+(latest|recent|current)/i,
      /what'?s\s+(the\s+)?(latest|happening|new)/i,
      /look\s+up/i,
      /search\s+for/i,
      /news\s+about/i,
      /current\s+(events?|news|threats?)/i,
    ];
    
    const shouldUseWebSearch = enableWebSearch || webSearchPatterns.some(pattern => pattern.test(query));
    
    let perplexityContext = '';
    let perplexityCitations: string[] = [];
    
    // Use Perplexity for web search if detected or enabled
    if (shouldUseWebSearch) {
      const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
      
      if (PERPLEXITY_API_KEY) {
        console.log('[copilot-chat] Web search detected, using Perplexity');
        
        try {
          const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'sonar',
              messages: [
                { 
                  role: 'system', 
                  content: 'You are a security-focused web researcher. Search for current, relevant information and provide source URLs. Focus on cybersecurity, OSINT, and threat intelligence topics.' 
                },
                { role: 'user', content: query }
              ],
              search_recency_filter: 'week',
            }),
          });

          if (perplexityResponse.ok) {
            const perplexityData = await perplexityResponse.json();
            perplexityContext = perplexityData.choices?.[0]?.message?.content || '';
            perplexityCitations = perplexityData.citations || [];
            console.log(`[copilot-chat] Got Perplexity response with ${perplexityCitations.length} citations`);
          } else {
            console.warn('[copilot-chat] Perplexity API error:', perplexityResponse.status);
          }
        } catch (perplexityError) {
          console.error('[copilot-chat] Perplexity error:', perplexityError);
        }
      }
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are the FootprintIQ AI Co-Pilot, an expert assistant for OSINT analysts and investigators.

Your capabilities:
- Analyze findings and provide actionable insights
- Search and query data using natural language
- Generate executive summaries and briefings
- Suggest next investigative steps
- Explain patterns and connections in data
- Help with integration and automation tasks

${contextData ? `\n${contextData}` : ''}
${perplexityContext ? `\n## Live Web Intelligence:\n${perplexityContext}\n\nSources: ${perplexityCitations.slice(0, 5).join(', ')}` : ''}

Be concise, accurate, and security-focused. Provide actionable recommendations. Never expose raw PII.`;

    const startTime = Date.now();

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { 
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI service error');
    }

    const result = await aiResponse.json();
    const response = result.choices[0].message.content;
    const latency = Date.now() - startTime;

    // Log session
    await supabase
      .from('copilot_sessions')
      .insert({
        user_id: user.id,
        workspace_id: workspaceId,
        context_type: contextType,
        context_id: contextId,
        query,
        response,
        model: 'google/gemini-2.5-flash',
        tokens_used: result.usage?.total_tokens || 0,
        latency_ms: latency,
      });

    // Log AI usage to analytics
    await logAIUsage(supabase, {
      userId: user.id,
      workspaceId: workspaceId,
      model: 'google/gemini-2.5-flash',
      promptLength: systemPrompt.length + query.length,
      responseLength: response?.length || 0,
      success: true,
    });

    return new Response(
      JSON.stringify({ 
        response, 
        latency,
        webSearch: shouldUseWebSearch ? { 
          enabled: true, 
          citations: perplexityCitations 
        } : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in copilot-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});