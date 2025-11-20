import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateAuth } from "../_shared/auth-utils.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { addSecurityHeaders } from "../_shared/security-headers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NextQuestionsSchema = z.object({
  scope: z.array(z.string().min(1)).min(1).max(20),
  context: z.string().max(2000).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
      );
    }
    const userId = authResult.context.userId;

    // Rate limiting (20 requests/hour)
    const rateLimitResult = await checkRateLimit(userId, 'user', 'ai-next-questions', {
      maxRequests: 20,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt
        }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
      );
    }

    // Input validation
    const body = await req.json();
    const validation = NextQuestionsSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
      );
    }

    const { scope, context } = validation.data;
    console.log(`[ai-next-questions] User ${userId} requesting questions for scope: ${scope.join(", ")}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are an OSINT intelligence analyst suggesting next investigative questions. Given current findings/entities, suggest 3-7 actionable follow-up questions that would advance the investigation.

Rules:
- Return ONLY a JSON array of question strings
- Questions should be specific, actionable, and OSINT-focused
- Questions should explore different angles: infrastructure, behavior, connections, timeline
- DO NOT include markdown, explanations, or text outside the JSON array
- Questions should be clear and concise

Output format (raw JSON array only):
[
  "What other accounts share this email pattern?",
  "When was this domain first registered?",
  "Are there linked social media profiles?"
]`;

    const userPrompt = `Current investigation scope: ${scope.join(", ")}
${context ? `\nContext: ${context}` : ""}

What should the analyst investigate next?`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || "[]";

    // Parse AI response
    let questions = [];
    try {
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(content);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      questions = [];
    }

    // Validate and limit questions
    const validQuestions = questions
      .filter((q: any) => typeof q === "string" && q.length > 10)
      .slice(0, 7);

    console.log(`[ai-next-questions] Generated ${validQuestions.length} questions for user ${userId}`);

    return new Response(
      JSON.stringify({ questions: validQuestions }),
      { headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
    );
  } catch (error: any) {
    console.error("[ai-next-questions] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
    );
  }
});