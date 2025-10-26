import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const { seedEntityIds } = await req.json();

    if (!seedEntityIds || !Array.isArray(seedEntityIds)) {
      return new Response(
        JSON.stringify({ error: "seedEntityIds array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.split("Bearer ")[1]);
      userId = user?.id || null;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
    console.error("AI predict error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});