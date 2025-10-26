import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, scanId } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Fetch scan context if provided
    let contextData = '';
    if (scanId) {
      const { data: scan } = await supabase
        .from('scans')
        .select('*, findings(*), anomalies(*)')
        .eq('id', scanId)
        .single();

      if (scan) {
        contextData = `
Current Scan Context:
- Target: ${scan.username || scan.email || scan.phone || 'Unknown'}
- Risk Score: ${scan.risk_score || 'N/A'}
- Total Findings: ${scan.findings?.length || 0}
- Critical: ${scan.findings?.filter((f: any) => f.severity === 'critical').length || 0}
- Anomalies: ${scan.anomalies?.length || 0}
`;
      }
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a FootprintIQ AI Assistant, an expert in cybersecurity, OSINT, and digital footprint analysis.

Your role is to:
- Answer questions about scan results, findings, and security risks
- Provide actionable security recommendations
- Explain technical concepts in clear terms
- Help users understand their digital footprint and privacy exposure
- Suggest next steps and remediation strategies

${contextData}

Be concise, accurate, and helpful. If you don't know something, say so. Always prioritize user privacy and security.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { 
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI service error');
    }

    // Stream the response
    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' }
    });

  } catch (error) {
    console.error('Error in ai-assistant-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
