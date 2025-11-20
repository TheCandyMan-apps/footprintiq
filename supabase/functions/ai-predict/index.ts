import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const PredictRequestSchema = z.object({
  seedEntityIds: z.array(z.string().uuid()).min(1, "At least one seed entity required")
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
  const { data: rateLimit } = await supabase.rpc('check_rate_limit', {
    p_identifier: userId,
    p_identifier_type: 'user',
    p_endpoint: endpoint,
    p_max_requests: 20,
    p_window_seconds: 3600
  });

  if (!rateLimit?.allowed) {
    const error = new Error('Rate limit exceeded');
    (error as any).status = 429;
    (error as any).resetAt = rateLimit?.reset_at;
    throw error;
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authentication
    const user = await validateAuth(req, supabase);
    const userId = user.id;

    // Rate limiting - premium tier (20 req/hour)
    await checkRateLimit(supabase, userId, 'ai-predict');

    // Validate request body
    const body = await req.json();
    const validatedData = PredictRequestSchema.parse(body);
    const { seedEntityIds } = validatedData;

    // Check cache first
    const { data: cached } = await supabase
      .from("entity_suggestions")
      .select("*")
      .eq("user_id", userId)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached && JSON.stringify(cached.seed_entities) === JSON.stringify(seedEntityIds)) {
      return new Response(
        JSON.stringify({ suggestions: cached.suggestions, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch entity details
    const { data: entities } = await supabase
      .from("entity_nodes")
      .select("entity_type, entity_value, metadata")
      .in("id", seedEntityIds);

    if (!entities || entities.length === 0) {
      return new Response(
        JSON.stringify({ error: "No entities found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context for AI
    const entityContext = entities.map((e: any) => 
      `${e.entity_type}: ${e.entity_value}`
    ).join(", ");

    const systemPrompt = `You are an OSINT intelligence analyst. Given seed entities, suggest 3-5 plausible related entities (aliases, associated accounts, related infrastructure) that an analyst should investigate next.

Rules:
- Return ONLY entity suggestions in valid JSON array format
- Each suggestion must have: entityType (email|username|domain|phone|ip), value, confidence (0.0-1.0), why (brief explanation)
- DO NOT include any markdown, explanations, or text outside the JSON array
- Base suggestions on common OSINT patterns and relationships
- Never suggest duplicates
- Never expose raw PII in explanations

Output format (raw JSON array only):
[
  {
    "entityType": "username",
    "value": "possible_alias",
    "confidence": 0.85,
    "why": ["Same avatar hash pattern", "Similar activity timeline"]
  }
]`;

    const userPrompt = `Seed entities: ${entityContext}

Suggest related entities to investigate.`;

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
        temperature: 0.7,
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
    let suggestions = [];
    try {
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = JSON.parse(content);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      suggestions = [];
    }

    // Validate and clean suggestions
    const validSuggestions = suggestions
      .filter((s: any) => s.entityType && s.value && typeof s.confidence === "number")
      .map((s: any) => ({
        entityType: s.entityType,
        value: s.value,
        confidence: Math.min(Math.max(s.confidence, 0), 1),
        why: Array.isArray(s.why) ? s.why : [s.why || "Pattern analysis"],
      }))
      .slice(0, 5);

    // Store in cache
    await supabase.from("entity_suggestions").insert({
      user_id: userId,
      seed_entities: seedEntityIds,
      suggestions: validSuggestions,
      confidence: validSuggestions.length > 0 
        ? validSuggestions.reduce((sum: number, s: any) => sum + s.confidence, 0) / validSuggestions.length 
        : 0,
    });

    return new Response(
      JSON.stringify({ suggestions: validSuggestions, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[ai-predict] Error:', {
      message: error.message,
      duration,
      timestamp: new Date().toISOString()
    });

    const status = error.status || 500;
    const message = error.message || 'Prediction failed';

    return new Response(
      JSON.stringify({ 
        error: message,
        ...(error.resetAt && { retryAfter: error.resetAt })
      }),
      { 
        status,
        headers: addSecurityHeaders({ "Content-Type": "application/json" })
      }
    );
  }
});