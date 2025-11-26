import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';
import { logAIUsage } from '../_shared/aiLogger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Model = "gemini" | "gpt" | "grok";

// Validation schema
const AIRequestSchema = z.object({
  systemPrompt: z.string().min(1).max(5000),
  userPrompt: z.string().min(1).max(10000),
  preferredModel: z.enum(["gemini", "gpt", "grok"]).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const userId = authResult.context.userId;

    // Rate limiting - 50 requests/hour
    const rateLimitResult = await checkRateLimit(userId, 'user', 'ai-router', {
      maxRequests: 50,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt 
        }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Validate request body
    const body = await req.json();
    const validatedData = AIRequestSchema.parse(body);
    const { systemPrompt, userPrompt, preferredModel = "gemini" } = validatedData;

    // Route to Grok API if requested
    if (preferredModel === "grok") {
      const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
      if (!GROK_API_KEY) {
        console.error("GROK_API_KEY not configured");
        return new Response(
          JSON.stringify({ error: 'Grok API not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`AI Router: Using Grok model (grok-beta)`);

      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Grok API error (${response.status}):`, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ error: 'Grok API error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.error("No content in Grok response:", data);
        return new Response(
          JSON.stringify({ error: 'Invalid Grok response' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Grok request completed - Response length: ${content.length}`);

      // Log AI usage
      await logAIUsage(supabase, {
        userId: userId,
        model: 'grok-beta',
        promptLength: systemPrompt.length + userPrompt.length,
        responseLength: content.length,
        success: true,
      });

      return new Response(
        JSON.stringify({
          content,
          modelUsed: "grok",
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default to Lovable AI Gateway for gemini/gpt
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Model mapping
    const modelMap = {
      gemini: "google/gemini-2.5-flash",
      gpt: "openai/gpt-5-mini",
    };

    const selectedModel = modelMap[preferredModel as "gemini" | "gpt"] || modelMap.gemini;

    console.log(`AI Router: Using model ${selectedModel} (requested: ${preferredModel})`);

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Gateway error (${response.status}):`, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", data);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log usage to ai_logs table
    await logAIUsage(supabase, {
      userId: userId,
      model: selectedModel,
      promptLength: systemPrompt.length + userPrompt.length,
      responseLength: content.length,
      success: true,
    });

    return new Response(
      JSON.stringify({
        content,
        modelUsed: preferredModel,
      }),
      { headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[ai-router] Error:', {
      message: error.message,
      duration,
      timestamp: new Date().toISOString()
    });

    const status = error.status || 500;
    const message = error.message || 'AI routing failed';

    return new Response(
      JSON.stringify({ 
        error: message,
        ...(error.resetAt && { retryAfter: error.resetAt })
      }),
      { 
        status,
        headers: addSecurityHeaders({ 'Content-Type': 'application/json' })
      }
    );
  }
});
