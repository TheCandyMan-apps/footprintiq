import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AnalysisRequestSchema = z.object({
  userId: z.string().uuid().optional(), // Make optional since we get from auth
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Authentication
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
      );
    }
    const userId = authResult.context.userId;

    // Rate limiting (10 analyses/hour)
    const rateLimitResult = await checkRateLimit(userId, 'user', 'ml-analysis', {
      maxRequests: 10,
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
    const validation = AnalysisRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's scan history
    const { data: scans } = await supabase
      .from("scans")
      .select("*, findings:findings(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!scans || scans.length === 0) {
      return new Response(
        JSON.stringify({ patterns: [] }),
        { headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
      );
    }

    // Build behavioral context
    const context = {
      scanCount: scans.length,
      avgRiskScore: scans.reduce((sum: number, s: any) => sum + (s.risk_score || 0), 0) / scans.length,
      totalFindings: scans.reduce((sum: number, s: any) => sum + (s.findings?.length || 0), 0),
      scanTypes: scans.map((s: any) => s.scan_type).filter(Boolean),
      timespan: {
        first: scans[scans.length - 1]?.created_at,
        last: scans[0]?.created_at,
      },
    };

    const systemPrompt = `You are a behavioral analysis AI detecting patterns in user OSINT scan history. Analyze scan patterns and identify behavioral trends, habits, and anomalies.

Return a JSON array of detected patterns. Each pattern must have:
- pattern_type: "habit" | "trend" | "anomaly" | "risk_behavior"
- title: Short descriptive title
- description: Clear explanation
- severity: "low" | "medium" | "high"
- confidence: 0.0-1.0
- recommendations: Array of actionable recommendations

Output format (raw JSON array only):
[
  {
    "pattern_type": "habit",
    "title": "Regular monthly scans",
    "description": "User performs scans consistently every month",
    "severity": "low",
    "confidence": 0.9,
    "recommendations": ["Continue regular monitoring", "Consider automation"]
  }
]`;

    const userPrompt = `Analyze user scan history:
Scans: ${context.scanCount}
Avg Risk: ${context.avgRiskScore.toFixed(1)}
Total Findings: ${context.totalFindings}
Scan Types: ${context.scanTypes.join(", ")}
Timespan: ${context.timespan.first} to ${context.timespan.last}`;

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
        temperature: 0.4,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Insufficient credits. Please add more credits." }),
          { status: 402, headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || "[]";

    // Parse AI response
    let patterns = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        patterns = JSON.parse(jsonMatch[0]);
      } else {
        patterns = JSON.parse(content);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      patterns = [];
    }

    // Store patterns
    for (const pattern of patterns) {
      await supabase.from("detected_patterns").insert({
        user_id: userId,
        pattern_type: pattern.pattern_type,
        description: pattern.description,
        severity: pattern.severity,
        metadata: {
          title: pattern.title,
          confidence: pattern.confidence,
          recommendations: pattern.recommendations,
        },
      });
    }

    return new Response(
      JSON.stringify({ patterns }),
      { headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
    );
  } catch (error: any) {
    console.error("ML analysis error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, "Content-Type": "application/json" }) }
    );
  }
});
