import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateSubscription } from "../_shared/validateSubscription.ts";

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
    // Validate premium subscription
    const { userId } = await validateSubscription(req, 'premium');
    console.log('Premium feature access granted for user:', userId);

    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validation.error.issues 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { scanId } = validation.data;
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    console.log('Starting behavioral analysis for scan:', scanId);

    // Fetch scan data with all related information (RLS automatically enforces ownership)
    const { data: scan, error: scanError } = await supabaseClient
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanError) throw scanError;

    // Fetch findings for username scans
    const { data: findings, error: findingsError } = await supabaseClient
      .from('findings')
      .select('*')
      .eq('scan_id', scanId)
      .in('kind', ['profile_presence', 'presence.hit']);

    if (findingsError) {
      console.error('Error fetching findings:', findingsError);
      throw findingsError;
    }

    console.log(`Found ${findings?.length || 0} profile presence findings for analysis`);

    // Fetch correlation data
    const { data: correlationData, error: correlationError } = await supabaseClient.functions.invoke(
      'correlation-engine',
      { body: { scanId } }
    );

    if (correlationError) throw correlationError;

    // Analyze behavioral patterns using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const analysisPrompt = `Analyze the following digital identity for authenticity and detect potential catfish indicators:

USER DATA:
- Name: ${scan.first_name} ${scan.last_name}
- Email: ${scan.email || 'N/A'}
- Phone: ${scan.phone || 'N/A'}
- Username: ${scan.username || 'N/A'}

PLATFORM PRESENCES FOUND (${findings?.length || 0}):
${findings?.map(f => {
  const evidence = Array.isArray(f.evidence) 
    ? f.evidence.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {})
    : f.evidence || {};
  const platform = evidence.site || evidence.platform || f.site || 'Unknown';
  const url = evidence.primary_url || evidence.url || f.url || 'N/A';
  return `- ${platform}: ${url}`;
}).join('\n')}

CORRELATION DATA:
${JSON.stringify(correlationData, null, 2)}

Perform a comprehensive catfish detection analysis including:

1. **Identity Consistency Score (0-100)**: How consistent is the identity across platforms?
2. **Profile Age Analysis**: Are profiles new or established? Suspicious timing?
3. **Activity Pattern Analysis**: Normal human behavior or bot-like?
4. **Cross-Platform Verification**: Do the profiles link back to each other naturally?
5. **Red Flags Detected**: List any suspicious indicators
6. **Authenticity Confidence (0-100)**: Overall confidence this is a real person
7. **Catfish Risk Level**: LOW, MEDIUM, HIGH, or CRITICAL

Provide structured analysis with specific evidence for each point.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in digital forensics, OSINT, and catfish detection. Provide detailed, evidence-based analysis.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    // Parse the analysis to extract scores
    const identityConsistencyMatch = analysis.match(/Identity Consistency Score.*?(\d+)/i);
    const authenticityMatch = analysis.match(/Authenticity Confidence.*?(\d+)/i);
    const riskLevelMatch = analysis.match(/Catfish Risk Level.*?(LOW|MEDIUM|HIGH|CRITICAL)/i);

    const identityConsistency = identityConsistencyMatch ? parseInt(identityConsistencyMatch[1]) : 50;
    const authenticityScore = authenticityMatch ? parseInt(authenticityMatch[1]) : 50;
    const catfishRisk = riskLevelMatch ? riskLevelMatch[1] : 'MEDIUM';

    console.log('Behavioral analysis completed:', {
      identityConsistency,
      authenticityScore,
      catfishRisk
    });

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        scores: {
          identityConsistency,
          authenticityScore,
          catfishRisk,
        },
        correlationData,
        scanData: {
          platformPresencesCount: findings?.length || 0,
          identityGraph: correlationData?.identityGraph,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in behavioral-analysis:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
