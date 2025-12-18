import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { logAIUsage } from "../_shared/aiLogger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const CorrelationRequestSchema = z.object({
  findings: z.array(z.any()).min(1, "At least one finding required")
});

// Security helpers
async function validateAuth(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

async function checkRateLimit(supabase: any, userId: string, endpoint: string) {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_identifier: userId,
    p_identifier_type: 'user',
    p_endpoint: endpoint,
    p_max_requests: 100, // 100 per hour
    p_window_seconds: 3600,
  });

  if (error) {
    console.error('[ai-correlation] Rate limit RPC error:', error);
    throw new Error('Rate limit check failed');
  }

  // PostgREST returns TABLE results as an array
  const rateLimit = Array.isArray(data) ? data[0] : data;

  if (!rateLimit?.allowed) {
    const err = new Error('Rate limit exceeded');
    (err as any).status = 429;
    (err as any).resetAt = rateLimit?.reset_at;
    throw err;
  }
}

function addSecurityHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...corsHeaders,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    ...headers,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Authentication
    const user = await validateAuth(req, supabase);
    const userId = user.id;

    // Rate limiting - premium tier (30 req/hour)
    await checkRateLimit(supabase, userId, 'ai-correlation');

    // Validate request body
    const body = await req.json();
    const validatedData = CorrelationRequestSchema.parse(body);
    const { findings } = validatedData;

    console.log('[ai-correlation] Analyzing', findings.length, 'findings');

    // Call Lovable AI Gateway
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
            content: 'You are an expert OSINT analyst. Analyze security findings and provide actionable remediation steps.'
          },
          {
            role: 'user',
            content: `Analyze these findings and provide insights with specific actions:\n\n${JSON.stringify(findings, null, 2)}\n\nProvide:\n1. Analysis of risks and patterns (as bullet points)\n2. Specific recommended actions (as JSON array)\n\nFormat the response as:\n\nANALYSIS:\n[bullet points here]\n\nACTIONS:\n[JSON array of action objects with fields: title, description, type (one of: 'removal', 'monitoring', 'security', 'privacy'), priority ('high'|'medium'|'low'), sourceIds (array of relevant source IDs from findings)]`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[ai-correlation] Lovable AI error:', aiResponse.status, errorText);
      
      // Handle rate limits and payment errors with status in body for frontend parsing
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.',
          status: 429,
          code: 'RATE_LIMIT_EXCEEDED'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required. Please add credits to your workspace.',
          status: 402,
          code: 'PAYMENT_REQUIRED'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Lovable AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error('No analysis returned from AI');
    }

    // Parse the response to extract analysis and actions
    let analysis = rawContent;
    let actions = [];

    try {
      const analysisSplit = rawContent.split('ACTIONS:');
      if (analysisSplit.length > 1) {
        analysis = analysisSplit[0].replace('ANALYSIS:', '').trim();
        const actionsJson = analysisSplit[1].trim();
        
        // Try to extract JSON from the actions section
        const jsonMatch = actionsJson.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          actions = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (parseError) {
      console.warn('[ai-correlation] Could not parse actions, using full response:', parseError);
    }

    console.log('[ai-correlation] Analysis complete with', actions.length, 'actions');

    // Log AI usage
    const promptContent = `Analyze these findings and provide insights with specific actions:\n\n${JSON.stringify(findings, null, 2)}`;
    await logAIUsage(supabase, {
      userId: userId,
      model: 'google/gemini-2.5-flash',
      promptLength: promptContent.length,
      responseLength: rawContent?.length || 0,
      success: true,
    });

    return new Response(JSON.stringify({
      analysis,
      actions,
      timestamp: new Date().toISOString(),
      findings_analyzed: findings.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[ai-correlation] Error:', {
      message: error.message,
      duration,
      timestamp: new Date().toISOString()
    });

    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    
    // Add structured error codes for frontend parsing
    let code = 'INTERNAL_ERROR';
    if (status === 429) code = 'RATE_LIMIT_EXCEEDED';
    else if (status === 402) code = 'PAYMENT_REQUIRED';
    else if (status === 401) code = 'UNAUTHORIZED';

    return new Response(
      JSON.stringify({ 
        error: message,
        status,
        code,
        ...(error.resetAt && { retryAfter: error.resetAt })
      }),
      { 
        status,
        headers: addSecurityHeaders({ 'Content-Type': 'application/json' })
      }
    );
  }
});
