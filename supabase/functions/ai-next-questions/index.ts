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

    const { scope, context } = await req.json();

    if (!scope || !Array.isArray(scope)) {
      return new Response(
        JSON.stringify({ error: "scope array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    return new Response(
      JSON.stringify({ questions: validQuestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("AI next-questions error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});