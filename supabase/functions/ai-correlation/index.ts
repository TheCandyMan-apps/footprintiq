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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
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

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert OSINT analyst. Analyze security findings and provide actionable remediation steps.'
          },
          {
            role: 'user',
            content: `Analyze these findings and provide insights with specific actions:\n\n${JSON.stringify(findings, null, 2)}\n\nProvide:\n1. Analysis of risks and patterns (as bullet points)\n2. Specific recommended actions (as JSON array)\n\nFormat the response as:\n\nANALYSIS:\n[bullet points here]\n\nACTIONS:\n[JSON array of action objects with fields: title, description, type (one of: 'removal', 'monitoring', 'security', 'privacy'), priority ('high'|'medium'|'low'), sourceIds (array of relevant source IDs from findings)]`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[ai-correlation] Lovable AI error:', aiResponse.status, errorText);
      
      // Handle rate limits and payment errors
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required. Please add credits to your workspace.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Lovable AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error('No analysis returned from AI');
    }

    // Parse the response to extract analysis and actions
    let analysis = rawContent;
    let actions = [];

    try {
      const analysisSplit = rawContent.split('ACTIONS:');
      if (analysisSplit.length > 1) {
        analysis = analysisSplit[0].replace('ANALYSIS:', '').trim();
        const actionsJson = analysisSplit[1].trim();
        
        // Try to extract JSON from the actions section
        const jsonMatch = actionsJson.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          actions = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (parseError) {
      console.warn('[ai-correlation] Could not parse actions, using full response:', parseError);
    }

    console.log('[ai-correlation] Analysis complete with', actions.length, 'actions');

    return new Response(JSON.stringify({
      analysis,
      actions,
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
