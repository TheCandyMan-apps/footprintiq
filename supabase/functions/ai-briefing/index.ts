import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BriefingRequest {
  clientId: string;
  caseId?: string;
  recipientEmails: string[];
  schedule?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { clientId, caseId, recipientEmails, schedule }: BriefingRequest = await req.json();

    console.log('Generating AI briefing for client:', clientId);

    // Fetch client data
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (!client) {
      throw new Error('Client not found');
    }

    // Fetch case data if provided
    let caseData = null;
    if (caseId) {
      const { data } = await supabase
        .from('cases')
        .select(`
          *,
          case_evidence(*),
          case_notes(*)
        `)
        .eq('id', caseId)
        .single();
      caseData = data;
    }

    // Fetch recent findings
    const { data: recentFindings } = await supabase
      .from('findings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch threat forecasts
    const { data: forecasts } = await supabase
      .from('threat_forecasts')
      .select('*')
      .order('forecast_date', { ascending: false })
      .limit(5);

    // Fetch link predictions
    const { data: predictions } = await supabase
      .from('link_predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Generate AI summary using Lovable AI
    const aiPayload = {
      model: 'openai/gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an intelligence analyst generating executive briefings. Be concise, factual, and actionable. Format output in 300 words or less with key findings and recommendations.'
        },
        {
          role: 'user',
          content: `Generate an executive intelligence briefing for ${client.name}.

Case Context: ${caseData ? JSON.stringify(caseData) : 'General intelligence update'}

Recent Findings (${recentFindings?.length || 0}):
${recentFindings?.map(f => `- ${f.title}: ${f.severity}`).join('\n') || 'None'}

Threat Forecasts:
${forecasts?.map(f => `- ${f.threat_type}: ${f.prediction_value}`).join('\n') || 'None'}

Entity Predictions:
${predictions?.map(p => `- ${p.probability}% match probability`).join('\n') || 'None'}

Include: Executive Summary, Top Threats, Actionable Recommendations.`
        }
      ]
    };

    const aiResponse = await fetch('https://lovable.app/api/ai/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiPayload),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const summary = aiData.choices[0].message.content;

    // Build briefing content
    const content = {
      summary,
      client: client.name,
      caseId: caseId || null,
      findings: recentFindings,
      forecasts,
      predictions,
      generatedAt: new Date().toISOString(),
    };

    // Store briefing log
    const { data: briefing, error: insertError } = await supabase
      .from('briefing_logs')
      .insert({
        client_id: clientId,
        case_id: caseId || null,
        summary,
        content,
        recipients: recipientEmails,
        sent_at: new Date().toISOString(),
        metadata: { schedule },
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('Briefing generated:', briefing.id);

    // TODO: Send email via Resend API (requires RESEND_API_KEY secret)
    // For now, just return the briefing

    return new Response(
      JSON.stringify({
        success: true,
        briefing,
        message: 'Briefing generated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating briefing:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});