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

    const { action, prompt, entityIds, sourceEntityId, targetEntityId } = await req.json();

    // Build system prompt (redaction rules, conservative claims)
    const systemPrompt = `You are an OSINT analyst assistant. Your role is to:

1. Analyze intelligence data conservatively and objectively
2. NEVER expose raw PII, passwords, or credentials
3. Always cite finding IDs and provider names as evidence
4. Clearly state confidence levels
5. Focus on patterns, correlations, and risk assessment
6. Highlight gaps in intelligence
7. Provide actionable recommendations

When citing evidence, use format: "Evidence: [provider]:[finding_id]"

Redaction rules:
- Mask email addresses (show only first 2 chars + domain)
- Mask phone numbers (show only last 4 digits)
- Never include passwords or credential values
- Use metadata only for dark-web findings

Response format:
- Be concise and structured
- Use bullet points for clarity
- Separate facts from inferences
- Quantify confidence (low/medium/high)`;

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
          { role: "user", content: prompt },
        ],
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
    const content = aiData.choices[0]?.message?.content || "";

    // Parse response based on action
    let result: any = {};

    if (action === "summarize") {
      // Parse structured sections from AI response
      const sections = parseAnalystSections(content);
      result = {
        overview: sections.overview,
        keySignals: sections.keySignals,
        correlations: sections.correlations,
        risks: sections.risks,
        gaps: sections.gaps,
        recommendations: sections.recommendations,
        confidence: extractConfidence(content),
      };
    } else if (action === "explain_link") {
      result = {
        narrative: extractNarrative(content),
        evidenceChain: extractEvidenceChain(content),
        confidence: extractConfidence(content),
      };
    }

    // Store report in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.split("Bearer ")[1]);
      
      if (user && entityIds) {
        await supabase.from("analyst_reports").insert({
          user_id: user.id,
          entity_ids: entityIds,
          report_data: result,
          confidence: result.confidence || 0.7,
        });
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("AI analyst error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseAnalystSections(content: string) {
  const sections = {
    overview: "",
    keySignals: [] as string[],
    correlations: [] as string[],
    risks: [] as string[],
    gaps: [] as string[],
    recommendations: [] as string[],
  };

  const lines = content.split("\n");
  let currentSection = "";

  for (const line of lines) {
    const lower = line.toLowerCase();
    
    if (lower.includes("overview") || lower.includes("summary")) {
      currentSection = "overview";
    } else if (lower.includes("key signal") || lower.includes("findings")) {
      currentSection = "keySignals";
    } else if (lower.includes("correlation") || lower.includes("connections")) {
      currentSection = "correlations";
    } else if (lower.includes("risk")) {
      currentSection = "risks";
    } else if (lower.includes("gap")) {
      currentSection = "gaps";
    } else if (lower.includes("recommendation")) {
      currentSection = "recommendations";
    } else if (line.trim().startsWith("-") || line.trim().startsWith("•") || line.trim().startsWith("*")) {
      const item = line.trim().replace(/^[-•*]\s*/, "");
      if (currentSection && currentSection !== "overview") {
        const section = sections[currentSection as keyof typeof sections];
        if (Array.isArray(section)) {
          section.push(item);
        }
      }
    } else if (line.trim() && currentSection === "overview") {
      sections.overview += (sections.overview ? " " : "") + line.trim();
    }
  }

  return sections;
}

function extractNarrative(content: string): string {
  const lines = content.split("\n");
  const narrative = lines.filter(l => 
    !l.toLowerCase().includes("evidence") &&
    !l.toLowerCase().includes("confidence") &&
    l.trim().length > 20
  ).join(" ");
  return narrative;
}

function extractEvidenceChain(content: string): string[] {
  const chain: string[] = [];
  const lines = content.split("\n");
  
  for (const line of lines) {
    if (line.trim().startsWith("-") || line.trim().startsWith("•") || line.match(/^\d+\./)) {
      const item = line.trim().replace(/^[-•*\d.]\s*/, "");
      if (item.length > 10) chain.push(item);
    }
  }
  
  return chain.length > 0 ? chain : ["Analysis in progress"];
}

function extractConfidence(content: string): number {
  const lower = content.toLowerCase();
  if (lower.includes("high confidence")) return 0.9;
  if (lower.includes("medium confidence")) return 0.7;
  if (lower.includes("low confidence")) return 0.5;
  return 0.7;
}
