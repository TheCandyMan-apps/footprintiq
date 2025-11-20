import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateAuth } from "../_shared/auth-utils.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { addSecurityHeaders } from "../_shared/security-headers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ExplainRequestSchema = z.object({
  topic: z.string().min(1).max(500),
  context: z.any().optional(),
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

    // Rate limiting (15 explanations/hour)
    const rateLimitResult = await checkRateLimit(userId, 'user', 'ai-explain', {
      maxRequests: 15,
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
    const validation = ExplainRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
      );
    }

    const { topic, context } = validation.data;
    console.log(`[ai-explain] User ${userId} requesting explanation for: ${topic}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create context hash for caching
    const encoder = new TextEncoder();
    const data = encoder.encode(topic + (context || ""));
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const contextHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check cache
    const { data: cached } = await supabase
      .from("explanation_cache")
      .select("explanation")
      .eq("context_hash", contextHash)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      console.log(`[ai-explain] Cache hit for topic: ${topic}`);
      return new Response(
        JSON.stringify({ explanation: cached.explanation, cached: true }),
        { headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
      );
    }

    const systemPrompt = `You are an OSINT expert explaining complex concepts in simple terms. Provide a clear, concise explanation (1-2 sentences max) that helps analysts understand the topic.

Rules:
- Keep it under 2 sentences
- Use plain language, avoid jargon
- Focus on practical implications
- Never expose PII or credentials
- Be accurate and conservative`;

    const userPrompt = `Explain: ${topic}${context ? `\n\nContext: ${JSON.stringify(context)}` : ""}`;

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
        temperature: 0.3,
        max_tokens: 150,
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
    const explanation = aiData.choices[0]?.message?.content?.trim() || "Unable to generate explanation";

    // Store in cache
    await supabase.from("explanation_cache").insert({
      context_hash: contextHash,
      explanation,
    });

    console.log(`[ai-explain] Successfully generated explanation for: ${topic}`);

    return new Response(
      JSON.stringify({ explanation, cached: false }),
      { headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
    );
  } catch (error: any) {
    console.error("[ai-explain] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
    );
  }
});