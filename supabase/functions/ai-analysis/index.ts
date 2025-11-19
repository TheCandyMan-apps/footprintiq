import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { authenticateRequest } from "../_shared/auth-utils.ts";
import { rateLimitMiddleware } from "../_shared/enhanced-rate-limiter.ts";
import { validateRequestBody } from "../_shared/security-validation.ts";
import { secureJsonResponse, addSecurityHeaders } from "../_shared/security-headers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  scanId: z.string().uuid({ message: "Invalid scan ID format" }),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.context) {
      return authResult.response!;
    }

    // Rate limiting (premium tier)
    const rateLimitResult = await rateLimitMiddleware(req, {
      endpoint: "ai-analysis",
      userId: authResult.context.userId,
      tier: "premium",
    });
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Input validation
    const body = await req.json();
    const bodyValidation = validateRequestBody(body, RequestSchema);
    if (!bodyValidation.valid || !bodyValidation.data) {
      return secureJsonResponse(
        { error: 'Invalid input', details: bodyValidation.error },
        400
      );
    }
    
    const { scanId } = bodyValidation.data;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Fetch scan data
    const { data: scan, error: scanError } = await supabaseClient
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanError) throw scanError;

    // Fetch data sources
    const { data: sources, error: sourcesError } = await supabaseClient
      .from('data_sources')
      .select('*')
      .eq('scan_id', scanId);

    if (sourcesError) throw sourcesError;

    // Fetch social profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('social_profiles')
      .select('*')
      .eq('scan_id', scanId);

    if (profilesError) throw profilesError;

    // Prepare analysis prompt
    const analysisPrompt = `You are a privacy and data security expert. Analyze the following privacy scan results and provide actionable insights:

**Scan Overview:**
- Privacy Score: ${scan.privacy_score}/100
- Total Sources Found: ${scan.total_sources_found}
- Risk Levels: ${scan.high_risk_count} high, ${scan.medium_risk_count} medium, ${scan.low_risk_count} low

**Data Sources Found (${sources?.length || 0}):**
${sources?.map(s => `- ${s.name} (${s.category}): Risk Level ${s.risk_level}, Data: ${s.data_found.join(', ')}`).join('\n')}

**Social Media Profiles (${profiles?.length || 0}):**
${profiles?.map(p => `- ${p.platform}: @${p.username}`).join('\n')}

Please provide:
1. **Risk Prioritization**: Which sources pose the biggest threat and why?
2. **Action Plan**: Step-by-step removal recommendations, prioritized by impact
3. **Pattern Analysis**: How is the data connected across sources?
4. **Privacy Insights**: What's affecting the privacy score most?
5. **Key Recommendations**: Top 3 actions to take immediately

Format your response in clear sections with bullet points. Be specific and actionable.`;

    console.log('Calling Lovable AI for analysis...');

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a privacy and data security expert providing clear, actionable analysis of personal data exposure findings.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    console.log('AI analysis completed successfully');

    return secureJsonResponse({
      analysis,
      scanData: {
        privacyScore: scan.privacy_score,
        totalSources: scan.total_sources_found,
        highRisk: scan.high_risk_count,
        mediumRisk: scan.medium_risk_count,
        lowRisk: scan.low_risk_count
      }
    }, 200);

  } catch (error) {
    console.error('Error in ai-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
