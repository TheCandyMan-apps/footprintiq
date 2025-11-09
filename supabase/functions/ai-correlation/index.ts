import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const grokApiKey = Deno.env.get('GROK_API_KEY');

    if (!grokApiKey) {
      throw new Error('GROK_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check subscription tier (premium required)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('subscription_tier, role')
      .eq('user_id', user.id)
      .single();

    const isPremium = userRole?.subscription_tier === 'premium' || 
                      userRole?.subscription_tier === 'enterprise' ||
                      userRole?.role === 'admin';

    if (!isPremium) {
      return new Response(JSON.stringify({ 
        error: 'Premium subscription required',
        upgrade_required: true 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { findings } = await req.json();

    if (!findings || !Array.isArray(findings)) {
      throw new Error('Invalid findings data');
    }

    console.log('[ai-correlation] Analyzing', findings.length, 'findings');

    // Call Grok API
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are an expert OSINT analyst. Analyze security findings and identify patterns, risks, and correlations. Provide concise, actionable insights in bullet points.'
          },
          {
            role: 'user',
            content: `Correlate these findings and highlight risks/links:\n\n${JSON.stringify(findings, null, 2)}\n\nProvide:\n1. Key risk patterns\n2. Data correlations\n3. Critical vulnerabilities\n4. Recommended actions\n\nFormat as concise bullet points.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!grokResponse.ok) {
      const errorText = await grokResponse.text();
      console.error('[ai-correlation] Grok API error:', grokResponse.status, errorText);
      throw new Error(`Grok API error: ${grokResponse.status}`);
    }

    const grokData = await grokResponse.json();
    const analysis = grokData.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error('No analysis returned from Grok');
    }

    console.log('[ai-correlation] Analysis complete');

    return new Response(JSON.stringify({
      analysis,
      timestamp: new Date().toISOString(),
      findings_analyzed: findings.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ai-correlation] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
