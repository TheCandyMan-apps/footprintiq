import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Finding {
  id: string;
  name: string;
  confidenceScore?: number;
  [key: string]: any;
}

interface FilterResponse {
  validFindings: Finding[];
  removedCount: number;
  improvements: {
    originalCount: number;
    filteredCount: number;
    falsePositivesRemoved: number;
    averageConfidenceImprovement: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawFindings, scanId } = await req.json();
    
    if (!rawFindings || !Array.isArray(rawFindings)) {
      throw new Error("Invalid findings data");
    }

    const grokApiKey = Deno.env.get('GROK_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!grokApiKey && !openaiApiKey) {
      console.warn('No AI API keys configured, returning unfiltered results');
      return new Response(JSON.stringify({
        validFindings: rawFindings,
        removedCount: 0,
        improvements: {
          originalCount: rawFindings.length,
          filteredCount: rawFindings.length,
          falsePositivesRemoved: 0,
          averageConfidenceImprovement: 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = `You are an expert OSINT analyst specializing in identifying false positives in digital footprint scans.

Your task: Analyze findings and filter out false positives based on:
1. Data quality and consistency
2. Source reliability
3. Temporal relevance
4. Cross-reference validation
5. Pattern anomalies

Return ONLY valid, high-confidence findings. Remove:
- Unverified matches
- Outdated information (>3 years old)
- Low-confidence correlations (<30%)
- Duplicate or redundant entries
- Clearly incorrect associations

Output Format: Return a JSON object with this EXACT structure:
{
  "validFindings": [array of finding objects that passed validation],
  "reasoning": "Brief explanation of filtering decisions"
}`;

    const userPrompt = `Analyze these scan findings and return only validated results:

${JSON.stringify(rawFindings, null, 2)}

Filter out false positives and return the JSON response.`;

    let response;
    let usedProvider = '';

    // Try Grok first
    if (grokApiKey) {
      try {
        console.log('Attempting Grok API call...');
        response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${grokApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-beta',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
          }),
        });

        if (response.ok) {
          usedProvider = 'grok';
          console.log('Grok API call successful');
        } else {
          throw new Error(`Grok API error: ${response.status}`);
        }
      } catch (grokError) {
        console.error('Grok API failed:', grokError);
        response = null;
      }
    }

    // Fallback to OpenAI
    if (!response && openaiApiKey) {
      try {
        console.log('Falling back to OpenAI...');
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-5-mini-2025-08-07',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_completion_tokens: 4000,
            response_format: { type: "json_object" }
          }),
        });

        if (response.ok) {
          usedProvider = 'openai';
          console.log('OpenAI API call successful');
        }
      } catch (openaiError) {
        console.error('OpenAI API failed:', openaiError);
        throw new Error('All AI providers failed');
      }
    }

    if (!response || !response.ok) {
      throw new Error('Failed to get AI response from any provider');
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    const validFindings = parsedResponse.validFindings || rawFindings;
    const removedCount = rawFindings.length - validFindings.length;
    
    // Calculate improvements
    const originalAvgConfidence = rawFindings.reduce((sum: number, f: Finding) => 
      sum + (f.confidenceScore || 50), 0) / rawFindings.length;
    const filteredAvgConfidence = validFindings.reduce((sum: number, f: Finding) => 
      sum + (f.confidenceScore || 50), 0) / (validFindings.length || 1);
    
    const improvements = {
      originalCount: rawFindings.length,
      filteredCount: validFindings.length,
      falsePositivesRemoved: removedCount,
      averageConfidenceImprovement: filteredAvgConfidence - originalAvgConfidence,
      provider: usedProvider,
      reasoning: parsedResponse.reasoning || 'No reasoning provided'
    };

    // Log improvements to Supabase
    if (scanId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from('ai_filter_logs').insert({
          scan_id: scanId,
          provider: usedProvider,
          original_count: improvements.originalCount,
          filtered_count: improvements.filteredCount,
          removed_count: removedCount,
          confidence_improvement: improvements.averageConfidenceImprovement,
          reasoning: improvements.reasoning
        });
        
        console.log('Logged improvements to database');
      } catch (logError) {
        console.error('Failed to log improvements:', logError);
      }
    }

    console.log(`AI Filtering Results:
- Provider: ${usedProvider}
- Original: ${improvements.originalCount}
- Filtered: ${improvements.filteredCount}
- Removed: ${removedCount}
- Confidence improvement: ${improvements.averageConfidenceImprovement.toFixed(2)}%`);

    return new Response(JSON.stringify({
      validFindings,
      removedCount,
      improvements
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ai-filter-findings:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      validFindings: [], // Return empty array on error
      removedCount: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
