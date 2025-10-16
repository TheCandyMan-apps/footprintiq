import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InsightRequest {
  findings: any[];
  redact?: boolean;
  provider?: "openai" | "groq";
  model?: string;
}

// Rate limiting (in-memory, 30 req/min per IP)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const limit = rateLimits.get(ip);
  
  if (!limit || now > limit.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  
  if (limit.count >= 30) {
    return false;
  }
  
  limit.count++;
  return true;
};

const redactPII = (text: string): string => {
  return text
    .replace(/\b[\w.%+-]+@[\w.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]")
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]")
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP]");
};

const generateFallbackInsight = (findings: any[]): any => {
  const severityCounts = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const criticalCount = severityCounts.critical || 0;
  const highCount = severityCounts.high || 0;
  
  let persona = "Unknown digital footprint";
  let risks: string[] = [];
  let actions: string[] = [];

  if (criticalCount > 0 || highCount > 0) {
    persona = "High-risk digital footprint detected with multiple exposures";
    risks = [
      "Active credential breaches detected",
      "Multiple data exposures across providers",
      "Potential identity theft risk"
    ];
    actions = [
      "Change all passwords immediately",
      "Enable 2FA on all accounts",
      "Monitor for suspicious activity"
    ];
  } else if (findings.length > 0) {
    persona = "Moderate digital footprint with some information exposure";
    risks = [
      "Minor information disclosures detected",
      "Some data visible to public sources"
    ];
    actions = [
      "Review privacy settings on social media",
      "Consider password rotation"
    ];
  } else {
    persona = "Minimal digital footprint detected";
    risks = ["No significant exposures found"];
    actions = ["Continue monitoring periodically"];
  }

  return { persona, risks, actions };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for") || "unknown";
  
  if (!checkRateLimit(clientIP)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { findings, redact = true, provider = "openai", model }: InsightRequest = await req.json();
    
    if (!findings || findings.length === 0) {
      const fallback = generateFallbackInsight([]);
      return new Response(
        JSON.stringify({ type: "done", data: fallback }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for API keys
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    // Use fallback if no keys available
    if (!openaiKey && !groqKey && !lovableKey) {
      const fallback = generateFallbackInsight(findings);
      return new Response(
        JSON.stringify({ type: "done", data: fallback }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare prompt
    const findingsSummary = findings.map(f => ({
      type: f.type,
      severity: f.severity,
      title: f.title,
      provider: f.provider
    }));

    const promptData = redact ? redactPII(JSON.stringify(findingsSummary)) : JSON.stringify(findingsSummary);

    const systemPrompt = `You are FootprintIQ's OSINT analyst. Analyze findings and produce ONLY valid JSON with this exact structure:
{
  "persona": "2-3 sentence professional assessment of the digital footprint",
  "risks": ["risk 1", "risk 2", "risk 3"],
  "actions": ["action 1", "action 2", "action 3"]
}

Guidelines:
- Be factual and professional
- Focus on actionable insights
- Keep persona under 200 characters
- Limit to 3-5 risks and 3-5 actions
- No speculation beyond provided findings
- Return ONLY valid JSON, no markdown or extra text`;

    const userPrompt = `Analyze these OSINT findings and provide persona, risks, and actions:\n${promptData}`;

    // Determine which service to use
    let apiUrl: string;
    let apiKey: string;
    let requestBody: any;

    if (lovableKey) {
      // Use Lovable AI Gateway
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      apiKey = lovableKey;
      requestBody = {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      };
    } else if (provider === "groq" && groqKey) {
      apiUrl = "https://api.groq.com/openai/v1/chat/completions";
      apiKey = groqKey;
      requestBody = {
        model: model || "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: true
      };
    } else if (openaiKey) {
      apiUrl = "https://api.openai.com/v1/chat/completions";
      apiKey = openaiKey;
      requestBody = {
        model: model || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: true
      };
    } else {
      // Fallback
      const fallback = generateFallbackInsight(findings);
      return new Response(
        JSON.stringify({ type: "done", data: fallback }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status, await response.text());
      const fallback = generateFallbackInsight(findings);
      return new Response(
        JSON.stringify({ type: "done", data: fallback }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For non-streaming Lovable AI
    if (lovableKey) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      
      try {
        const parsed = JSON.parse(content);
        return new Response(
          JSON.stringify({ type: "done", data: parsed }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        const fallback = generateFallbackInsight(findings);
        return new Response(
          JSON.stringify({ type: "done", data: fallback }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Stream SSE for OpenAI/Groq
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "delta", data: content })}\n\n`));
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", data: {} })}\n\n`));
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("Insight stream error:", error);
    const fallback = generateFallbackInsight([]);
    return new Response(
      JSON.stringify({ type: "done", data: fallback }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
