import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { authenticateRequest } from "../_shared/auth-utils.ts";
import { rateLimitMiddleware } from "../_shared/enhanced-rate-limiter.ts";
import { validateRequestBody } from "../_shared/security-validation.ts";
import { secureJsonResponse } from "../_shared/security-headers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BriefingRequestSchema = z.object({
  clientId: z.string().uuid({ message: "Invalid client ID" }),
  caseId: z.string().uuid().optional(),
  recipientEmails: z.array(z.string().email()).min(1).max(10),
  schedule: z.string().optional(),
});

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

    // Authentication
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.context) {
      return authResult.response!;
    }

    const { userId, subscriptionTier } = authResult.context;

    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(req, {
      endpoint: 'ai-briefing',
      userId,
      tier: subscriptionTier,
    });

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Input validation
    const body = await req.json();
    const validation = validateRequestBody(body, BriefingRequestSchema);

    if (!validation.valid) {
      return secureJsonResponse({ error: validation.error || 'Invalid input' }, 400);
    }

    const { clientId, caseId, recipientEmails, schedule } = validation.data!;

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
      .eq('user_id', userId)
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

    return secureJsonResponse({
      success: true,
      briefing: {
        id: briefing.id,
        summary,
        recipients: recipientEmails,
      },
      message: 'Briefing generated successfully',
    });

  } catch (error) {
    console.error('[ai-briefing] Error:', error);
    return secureJsonResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});