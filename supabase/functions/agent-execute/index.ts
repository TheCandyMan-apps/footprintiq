import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, workspaceId } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get agent config
    const { data: agent, error: agentError } = await supabase
      .from('agent_configs' as any)
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found');
    }

    const startTime = Date.now();

    // Create run record
    const { data: run, error: runError } = await supabase
      .from('agent_runs' as any)
      .insert({
        agent_id: agentId,
        user_id: user.id,
        workspace_id: workspaceId,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (runError) throw runError;

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let result: any = {};
    let query = '';

    // Execute agent based on type
    switch (agent.agent_type) {
      case 'trend':
        query = 'Analyze recent findings and identify emerging trends';
        result = await executeTrendAnalysis(supabase, user.id, lovableApiKey);
        break;
      
      case 'summary':
        query = 'Generate weekly intelligence summary';
        result = await executeSummaryGeneration(supabase, user.id, lovableApiKey);
        break;
      
      case 'data_qa':
        query = 'Check for data quality issues';
        result = await executeDataQA(supabase, user.id);
        break;
      
      default:
        query = agent.config?.query || 'Execute custom agent';
        result = { message: 'Custom agent execution not implemented' };
    }

    const runtimeMs = Date.now() - startTime;

    // Update run record
    await supabase
      .from('agent_runs' as any)
      .update({
        status: 'success',
        result,
        query,
        runtime_ms: runtimeMs,
        completed_at: new Date().toISOString()
      })
      .eq('id', run.id);

    // Create intel card if there are insights
    if (result.insights?.length > 0) {
      await supabase
        .from('intel_cards' as any)
        .insert({
          user_id: user.id,
          workspace_id: workspaceId,
          agent_run_id: run.id,
          title: `${agent.name} - ${new Date().toLocaleDateString()}`,
          content: JSON.stringify(result.insights),
          tags: [agent.agent_type],
          topic: agent.agent_type
        });
    }

    return new Response(
      JSON.stringify({ runId: run.id, result, runtimeMs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in agent-execute:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function executeTrendAnalysis(supabase: any, userId: string, apiKey: string) {
  // Get recent findings
  const { data: findings } = await supabase
    .from('findings' as any)
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .limit(100);

  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'You are a trend analyst. Identify patterns and emerging trends from the data. Return insights as JSON array.'
        },
        {
          role: 'user',
          content: `Analyze trends in these findings: ${JSON.stringify(findings?.map((f: any) => ({
            severity: f.severity,
            category: f.category,
            provider: f.provider
          })))}`
        }
      ],
    }),
  });

  const aiResult = await aiResponse.json();
  const insights = aiResult.choices[0].message.content;

  return {
    findingsAnalyzed: findings?.length || 0,
    insights: [insights],
    summary: 'Trend analysis completed'
  };
}

async function executeSummaryGeneration(supabase: any, userId: string, apiKey: string) {
  const { data: scans } = await supabase
    .from('scans' as any)
    .select('*, findings(*)')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .limit(10);

  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'You are an intelligence analyst. Create a concise weekly summary.'
        },
        {
          role: 'user',
          content: `Create weekly summary for ${scans?.length || 0} scans with findings.`
        }
      ],
    }),
  });

  const aiResult = await aiResponse.json();
  const summary = aiResult.choices[0].message.content;

  return {
    scansReviewed: scans?.length || 0,
    insights: [summary],
    summary: 'Weekly intelligence note generated'
  };
}

async function executeDataQA(supabase: any, userId: string) {
  // Check for duplicate entities
  const { data: entities } = await supabase
    .from('entity_nodes' as any)
    .select('value, entity_type')
    .eq('user_id', userId);

  const duplicates: any[] = [];
  const seen = new Map();
  
  entities?.forEach((e: any) => {
    const key = `${e.entity_type}:${e.value}`;
    if (seen.has(key)) {
      duplicates.push(e);
    }
    seen.set(key, true);
  });

  return {
    totalEntities: entities?.length || 0,
    duplicatesFound: duplicates.length,
    insights: duplicates.length > 0 ? 
      [`Found ${duplicates.length} duplicate entities that may need merging`] : 
      ['No data quality issues detected'],
    summary: 'Data quality check completed'
  };
}
