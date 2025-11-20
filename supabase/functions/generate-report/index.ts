import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const ReportRequestSchema = z.object({
  caseId: z.string().uuid().optional(),
  entityIds: z.array(z.string().uuid()).optional(),
  templateId: z.string().uuid().optional(),
  reportType: z.enum(['executive', 'technical', 'compliance', 'custom']),
  includeTimeline: z.boolean().optional().default(true),
  includeGraph: z.boolean().optional().default(true),
  includeForecast: z.boolean().optional().default(true),
  clientId: z.string().uuid().optional()
});

interface ReportRequest {
  caseId?: string;
  entityIds?: string[];
  templateId?: string;
  reportType: 'executive' | 'technical' | 'compliance' | 'custom';
  includeTimeline?: boolean;
  includeGraph?: boolean;
  includeForecast?: boolean;
  clientId?: string;
}

// Security helpers
async function validateAuth(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

async function checkRateLimit(supabase: any, userId: string, endpoint: string) {
  const { data: rateLimit } = await supabase.rpc('check_rate_limit', {
    p_identifier: userId,
    p_identifier_type: 'user',
    p_endpoint: endpoint,
    p_max_requests: 10,
    p_window_seconds: 3600
  });

  if (!rateLimit?.allowed) {
    const error = new Error('Rate limit exceeded');
    (error as any).status = 429;
    (error as any).resetAt = rateLimit?.reset_at;
    throw error;
  }
}

function addSecurityHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...corsHeaders,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    ...headers,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authentication
    const user = await validateAuth(req, supabase);
    const userId = user.id;

    // Rate limiting - 10 reports per hour
    await checkRateLimit(supabase, userId, 'generate-report');

    // Validate request body
    const body = await req.json();
    const validatedData = ReportRequestSchema.parse(body);
    const {
      caseId,
      entityIds,
      templateId,
      reportType,
      includeTimeline,
      includeGraph,
      includeForecast,
      clientId,
    } = validatedData;

    console.log('[generate-report] Generating report:', { reportType, caseId, entityIds: entityIds?.length, userId });

    // Fetch case data if provided
    let caseData = null;
    if (caseId) {
      const { data } = await supabase
        .from('cases')
        .select(`
          *,
          case_evidence(*),
          case_notes(*),
          case_comments(*)
        `)
        .eq('id', caseId)
        .single();
      caseData = data;
    }

    // Fetch entity data if provided
    let entities = [];
    if (entityIds && entityIds.length > 0) {
      const { data } = await supabase
        .from('entity_nodes')
        .select('*')
        .in('id', entityIds);
      entities = data || [];
    }

    // Fetch timeline data
    let timelineData = [];
    if (includeTimeline) {
      const { data } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('user_id', user.id)
        .order('occurred_at', { ascending: false })
        .limit(50);
      timelineData = data || [];
    }

    // Fetch graph data
    let graphData = null;
    if (includeGraph && entityIds) {
      const { data: edges } = await supabase
        .from('entity_edges')
        .select('*')
        .or(`source_id.in.(${entityIds.join(',')}),target_id.in.(${entityIds.join(',')})`);
      graphData = { nodes: entities, edges: edges || [] };
    }

    // Fetch forecasts
    let forecasts = [];
    if (includeForecast) {
      const { data } = await supabase
        .from('threat_forecasts')
        .select('*')
        .order('forecast_date', { ascending: false })
        .limit(10);
      forecasts = data || [];
    }

    // Fetch findings
    const { data: findings } = await supabase
      .from('findings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    // Generate AI summary using Lovable AI
    const summaryPrompt = `Generate a ${reportType} report summary for:
    
Case: ${caseData?.title || 'Intelligence Analysis'}
Entities: ${entities.length} analyzed
Findings: ${findings?.length || 0} total
Timeline Events: ${timelineData.length}
Forecasts: ${forecasts.length}

Provide:
1. Executive Summary (3-4 sentences)
2. Key Findings (bullet points)
3. Risk Assessment
4. Recommended Actions`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert intelligence analyst. Generate comprehensive, actionable reports.' },
          { role: 'user', content: summaryPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('[generate-report] Lovable AI error:', aiResponse.status);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiSummary = aiData.choices?.[0]?.message?.content || 'AI summary unavailable';

    // Assemble report
    const report = {
      id: crypto.randomUUID(),
      reportType,
      generatedAt: new Date().toISOString(),
      generatedBy: userId,
      case: caseData,
      entities,
      findings: findings || [],
      timeline: timelineData,
      graph: graphData,
      forecasts,
      aiSummary,
      metadata: {
        includeTimeline,
        includeGraph,
        includeForecast,
        templateId,
        clientId,
      }
    };

    // Store report
    const { error: insertError } = await supabase
      .from('analyst_reports')
      .insert({
        user_id: userId,
        case_id: caseId,
        entity_ids: entityIds || [],
        report_data: report,
        confidence: 0.85
      });

    if (insertError) {
      console.error('[generate-report] Failed to store report:', insertError);
    }

    const duration = Date.now() - startTime;
    console.log('[generate-report] Report generated successfully in', duration, 'ms');

    return new Response(
      JSON.stringify({ report, duration }),
      { headers: addSecurityHeaders({ 'Content-Type': 'application/json' }) }
    );

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[generate-report] Error:', {
      message: error.message,
      duration,
      timestamp: new Date().toISOString()
    });

    const status = error.status || 500;
    const message = error.message || 'Report generation failed';

    return new Response(
      JSON.stringify({ 
        error: message,
        ...(error.resetAt && { retryAfter: error.resetAt })
      }),
      { 
        status,
        headers: addSecurityHeaders({ 'Content-Type': 'application/json' })
      }
    );
  }
});