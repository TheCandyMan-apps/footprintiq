import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { authenticateRequest } from "../_shared/auth-utils.ts";
import { rateLimitMiddleware } from "../_shared/enhanced-rate-limiter.ts";
import { validateRequestBody } from "../_shared/security-validation.ts";
import { secureJsonResponse } from "../_shared/security-headers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GraphQuerySchema = z.object({
  query: z.string().min(1).max(500, { message: "Query too long" }),
  workspaceId: z.string().uuid({ message: "Invalid workspace ID" }),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // 1. Authentication
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.context) {
      return authResult.response!;
    }

    const { userId, subscriptionTier = 'free' } = authResult.context;

    // 2. Rate Limiting (graph queries are expensive)
    const rateLimitResult = await rateLimitMiddleware(req, {
      endpoint: 'graph-query',
      userId,
      tier: subscriptionTier,
    });

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // 3. Input Validation
    const body = await req.json();
    const validation = validateRequestBody(body, GraphQuerySchema);
    
    if (!validation.valid) {
      return secureJsonResponse(
        { error: validation.error || 'Invalid input' },
        400
      );
    }
    
    const { query, workspaceId } = validation.data!;
    // 4. Verify workspace access
    const { data: workspaceMember } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (!workspaceMember) {
      return secureJsonResponse(
        { error: 'Access denied to workspace' },
        403
      );
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
            content: `Convert to SQL (user_id='${userId}'): ${query}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI service error');
    }

    const aiResult = await aiResponse.json();
    const generatedQuery = aiResult.choices[0].message.content.trim();

    // Execute the generated query with safety checks
    const { data: queryResult, error: queryError } = await supabase.rpc('execute_safe_query', {
      query_text: generatedQuery,
      user_id: userId
    });

    if (queryError) {
      // Fallback: try a simpler entity search
      const { data: fallbackData } = await supabase
        .from('entity_nodes' as any)
        .select('*')
        .eq('user_id', userId)
        .limit(10);
      
      const executionTime = Date.now() - startTime;

      await supabase.from('graph_queries' as any).insert({
        user_id: userId,
        workspace_id: workspaceId,
        natural_language_query: query,
        generated_query: generatedQuery,
        result_summary: { rows: fallbackData?.length || 0, error: queryError.message },
        execution_time_ms: executionTime
      });

      return secureJsonResponse({ 
        result: fallbackData || [], 
        query: generatedQuery,
        executionTime,
        fallback: true
      });
    }

    const executionTime = Date.now() - startTime;

    // Log the query
    await supabase.from('graph_queries' as any).insert({
      user_id: userId,
      workspace_id: workspaceId,
      natural_language_query: query,
      generated_query: generatedQuery,
      result_summary: { rows: queryResult?.length || 0 },
      execution_time_ms: executionTime
    });

    return secureJsonResponse({ 
      result: queryResult || [], 
      query: generatedQuery,
      executionTime 
    });

  } catch (error) {
    console.error('[graph-query] Error:', error);
    return secureJsonResponse(
      { 
        error: 'Internal server error',
        message: 'Failed to process graph query'
      },
      500
    );
  }
});
