import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { persona, score, exposureCount, completedRemovals, pendingRemovals, successRate } = await req.json();

    if (!persona) throw new Error("Missing required field: persona");

    const systemPrompt = `You are a digital identity risk analyst for FootprintIQ, an OSINT platform. 
You write short (3-5 sentence) first-person assessments from the perspective of a specific persona viewing someone's digital footprint.

Rules:
- Write in first person as the persona (e.g., "As a recruiter, I would...")
- Be specific and actionable, referencing the provided metrics
- Use professional, measured tone — no fear-mongering
- Focus on what the persona would actually notice and care about
- End with one concrete recommendation
- Keep it under 80 words`;

    const userPrompt = `Persona: ${persona}
Subject's digital metrics:
- Sovereignty Score: ${score}/100
- Public exposures: ${exposureCount}
- Completed data removals: ${completedRemovals}
- Pending removal requests: ${pendingRemovals}
- Removal success rate: ${successRate}%

Write a 3-5 sentence first-person narrative from this persona's perspective evaluating this person's digital footprint.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const narrative = data.choices?.[0]?.message?.content || "Unable to generate assessment.";

    return new Response(JSON.stringify({ narrative }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("persona-simulation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
