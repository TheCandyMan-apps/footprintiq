import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, userId, footprintData } = await req.json();
    
    console.log("Generating insights for:", { jobId, userId, footprintData });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch additional context from database
    const { data: darkwebFindings } = await supabase
      .from("darkweb_findings")
      .select("finding_type, severity, data_exposed, source_url")
      .eq("user_id", userId)
      .order("discovered_at", { ascending: false })
      .limit(10);

    const { data: scanJobs } = await supabase
      .from("scan_jobs")
      .select("username, status, artifacts")
      .eq("requested_by", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Prepare context for AI
    const context = {
      footprint: footprintData,
      recentFindings: darkwebFindings || [],
      recentScans: scanJobs || [],
    };

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a cybersecurity expert analyzing digital footprint data. Generate 3-5 actionable security insights based on the user's scan results.

For each insight:
1. Identify specific risks or opportunities
2. Prioritize actions by impact
3. Provide clear, actionable recommendations
4. Include specific numbers and sources when available

Return insights as a JSON array with this structure:
[
  {
    "type": "risk" | "action" | "success",
    "message": "Clear, specific insight with numbers",
    "priority": "high" | "medium" | "low",
    "actions": [
      {"label": "Action button text", "href": "optional URL or null"}
    ]
  }
]

Focus on:
- Data broker removal priorities (highest count first)
- Dark web exposure severity
- Recent breach trends
- Proactive monitoring recommendations`,
          },
          {
            role: "user",
            content: `Analyze this digital footprint data and generate security insights:

Footprint Summary:
- Breaches: ${context.footprint.breaches}
- Exposures: ${context.footprint.exposures}
- Data Brokers: ${context.footprint.dataBrokers}
- Dark Web Mentions: ${context.footprint.darkWeb}

Recent Findings: ${JSON.stringify(context.recentFindings, null, 2)}

Recent Scans: ${JSON.stringify(context.recentScans, null, 2)}

Generate personalized insights based on this data.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    console.log("Raw AI response:", content);

    // Parse the JSON response
    let insights;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      insights = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      // Fallback to mock insights if parsing fails
      insights = [
        {
          type: "risk",
          message: `Analysis found ${context.footprint.breaches} breaches and ${context.footprint.exposures} exposures. Review your security posture.`,
          priority: "high",
          actions: [
            { label: "View Details", href: null }
          ]
        }
      ];
    }

    // Add unique IDs to insights
    const enrichedInsights = insights.map((insight: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      ...insight,
    }));

    console.log("Generated insights:", enrichedInsights);

    // Save insights to database
    const insightsToSave = enrichedInsights.map((insight: any) => ({
      user_id: userId,
      job_id: jobId,
      insight_type: insight.type,
      message: insight.message,
      priority: insight.priority,
      actions: insight.actions || [],
      metadata: { footprint: context.footprint },
    }));

    const { error: insertError } = await supabase
      .from("ai_insights")
      .insert(insightsToSave);

    if (insertError) {
      console.error("Failed to save insights to database:", insertError);
      // Continue anyway - we'll still return the insights
    }

    return new Response(
      JSON.stringify({ insights: enrichedInsights }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-insights function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
