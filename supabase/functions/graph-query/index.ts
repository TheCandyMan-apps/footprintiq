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
    const { query, workspaceId } = await req.json();
    
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

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const startTime = Date.now();

    // Convert natural language to SQL using AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a SQL query generator for the FootprintIQ knowledge graph.
Available tables: entity_nodes, entity_edges, findings, scans.
Return ONLY a valid PostgreSQL query. No explanations. No markdown.
Only query data for user_id matching the authenticated user.
Never expose raw PII - only return aggregated metrics and summaries.`
          },
          {
            role: 'user',
            content: `Convert to SQL (user_id='${user.id}'): ${query}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI service error');
    }

    const aiResult = await aiResponse.json();
    const generatedQuery = aiResult.choices[0].message.content.trim();

    // Execute the generated query
    const { data: queryResult, error: queryError } = await supabase.rpc('execute_safe_query', {
      query_text: generatedQuery,
      user_id: user.id
    });

    if (queryError) {
      // Fallback: try a simpler entity search
      const { data: fallbackData } = await supabase
        .from('entity_nodes' as any)
        .select('*')
        .eq('user_id', user.id)
        .limit(10);
      
      const executionTime = Date.now() - startTime;

      await supabase.from('graph_queries' as any).insert({
        user_id: user.id,
        workspace_id: workspaceId,
        natural_language_query: query,
        generated_query: generatedQuery,
        result_summary: { rows: fallbackData?.length || 0, error: queryError.message },
        execution_time_ms: executionTime
      });

      return new Response(
        JSON.stringify({ 
          result: fallbackData || [], 
          query: generatedQuery,
          executionTime,
          fallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const executionTime = Date.now() - startTime;

    // Log the query
    await supabase.from('graph_queries' as any).insert({
      user_id: user.id,
      workspace_id: workspaceId,
      natural_language_query: query,
      generated_query: generatedQuery,
      result_summary: { rows: queryResult?.length || 0 },
      execution_time_ms: executionTime
    });

    return new Response(
      JSON.stringify({ 
        result: queryResult || [], 
        query: generatedQuery,
        executionTime 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in graph-query:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
