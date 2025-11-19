import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { authenticateRequest } from "../_shared/auth-utils.ts";
import { rateLimitMiddleware } from "../_shared/enhanced-rate-limiter.ts";
import { validateRequestBody } from "../_shared/security-validation.ts";
import { secureJsonResponse } from "../_shared/security-headers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Request validation schema
const AnalystRequestSchema = z.object({
  action: z.enum(['summarize', 'correlate', 'predict', 'explain', 'compare', 'explain_link']),
  prompt: z.string().min(1).max(5000),
  entityIds: z.array(z.string().uuid()).optional(),
  sourceEntityId: z.string().uuid().optional(),
  targetEntityId: z.string().uuid().optional(),
  context: z.string().max(50000).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authentication
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.context) {
      return authResult.response!;
    }

    // Rate limiting - AI endpoints get premium tier limits
    const rateLimitResult = await rateLimitMiddleware(req, {
      endpoint: "ai-analyst",
      userId: authResult.context.userId,
      tier: "premium",
    });
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Validate and sanitize input
    const body = await req.json();
    const validation = validateRequestBody(body, AnalystRequestSchema);
    
    if (!validation.valid) {
      console.error("[ai-analyst] Validation failed:", validation.error);
      if (validation.threat) {
        console.warn("[ai-analyst] Security threat detected:", validation.threat);
      }
      return secureJsonResponse(
        { error: "Invalid request", message: validation.error },
        400
      );
    }

    const { action, prompt, entityIds, sourceEntityId, targetEntityId, context } = validation.data!;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return secureJsonResponse(
        { error: "AI service not configured" },
        500
      );
    }

    // Build system prompt (redaction rules, conservative claims)
    const systemPrompt = `You are an OSINT analyst assistant analyzing REAL scan data. Your role is to:

1. Analyze the PROVIDED intelligence data conservatively and objectively
2. NEVER make up or simulate data - only analyze what is given
3. NEVER mention "John Doe" or other placeholder names unless they appear in the actual data
4. ALWAYS cite finding IDs and provider names from the actual context as evidence
5. Clearly state confidence levels based on available data
6. Focus on patterns, correlations, and risk assessment from the actual findings
7. Highlight gaps in intelligence based on what's missing
8. Provide actionable recommendations based on the actual findings

CRITICAL: If the context provided is empty or minimal, state that there is insufficient data to analyze. Do NOT generate fictional examples or scenarios.

When citing evidence, use format: "Evidence: [provider]:[finding_id]" from the actual data provided.

Redaction rules:
- Mask email addresses (show only first 2 chars + domain)
- Mask phone numbers (show only last 4 digits)
- Never include passwords or credential values
- Use metadata only for dark-web findings

Response format:
- Be concise and structured
- Use bullet points for clarity
- Separate facts from inferences
- Quantify confidence (low/medium/high) based on available data quality
- If no data is available, state "Insufficient data for analysis"`;

    // Enhanced prompt with context
    const fullPrompt = context 
      ? `${prompt}\n\nContext Data:\n${context}\n\nAnalyze ONLY the data provided above. Do not simulate or make up additional information.`
      : prompt;

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
          { role: "user", content: fullPrompt },
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
    } else {
      result = { analysis: content };
    }

    // Store report in database if entityIds provided
    if (authResult.context && entityIds && entityIds.length > 0) {
      await supabase.from("analyst_reports").insert({
        user_id: authResult.context.userId,
        entity_ids: entityIds,
        report_data: result,
        confidence: result.confidence || 0.7,
      });
    }

    return secureJsonResponse({ 
      success: true,
      action,
      result,
      rawContent: content,
    }, 200);
  } catch (error: any) {
    console.error("[ai-analyst] Error:", error);
    return secureJsonResponse(
      { error: "Analysis failed", message: error.message },
      500
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
