import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CredibilityRequest {
  scanId: string;
  providers: string[];
  resultsData: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { scanId, providers, resultsData }: CredibilityRequest = await req.json();

    if (!scanId || !providers || providers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'scanId and providers are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credibilityScores = [];

    // Analyze credibility for each provider
    for (const provider of providers) {
      const providerData = resultsData[provider];
      if (!providerData) continue;

      const systemPrompt = `You are a data credibility analyst. Evaluate the reliability and trustworthiness of OSINT data sources.

Provide a credibility assessment with:
1. credibility_score: 0.0-1.0 (0=unreliable, 1=highly credible)
2. confidence: 0.0-1.0 (how confident you are in this assessment)
3. data_quality_score: 0.0-1.0 (completeness, accuracy, freshness)
4. reasoning: brief explanation
5. verification_method: how this could be verified

Consider:
- Source reputation and track record
- Data freshness and update frequency
- Cross-reference with other sources
- Known biases or limitations
- Data structure and completeness`;

      const userPrompt = `Evaluate credibility for: ${provider}

Data sample: ${JSON.stringify(providerData).slice(0, 1000)}

Respond in JSON format:
{
  "credibility_score": 0.0-1.0,
  "confidence": 0.0-1.0,
  "data_quality_score": 0.0-1.0,
  "reasoning": "...",
  "verification_method": "..."
}`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI API error for ${provider}:`, aiResponse.status);
          continue;
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;

        if (!content) {
          console.error(`No content in AI response for ${provider}`);
          continue;
        }

        const assessment = JSON.parse(content);

        // Store credibility score
        const { error: insertError } = await supabase
          .from('source_credibility')
          .insert({
            scan_id: scanId,
            provider_name: provider,
            credibility_score: assessment.credibility_score,
            confidence: assessment.confidence,
            data_quality_score: assessment.data_quality_score,
            reasoning: assessment.reasoning,
            verification_method: assessment.verification_method,
          });

        if (insertError) {
          console.error(`Failed to store credibility for ${provider}:`, insertError);
        } else {
          credibilityScores.push({
            provider,
            ...assessment,
          });
        }

      } catch (providerError) {
        console.error(`Error processing ${provider}:`, providerError);
      }
    }

    console.log(`Credibility analysis completed for scan ${scanId}: ${credibilityScores.length} providers analyzed`);

    return new Response(
      JSON.stringify({
        scanId,
        scores: credibilityScores,
        totalAnalyzed: credibilityScores.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Credibility Scorer error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
