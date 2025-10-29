import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const {
      caseId,
      entityIds,
      templateId,
      reportType,
      includeTimeline = true,
      includeGraph = true,
      includeForecast = true,
      clientId,
    }: ReportRequest = await req.json();

    console.log('Generating report:', { reportType, caseId, entityIds: entityIds?.length });

    const startTime = Date.now();

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

    // Generate AI summary
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
4. Recommendations`;

    const aiResponse = await fetch('https://lovable.app/api/ai/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an intelligence analyst. Generate professional, evidence-based reports.'
          },
          { role: 'user', content: summaryPrompt }
        ]
      }),
    });

    const aiData = await aiResponse.json();
    const executiveSummary = aiData.choices[0].message.content;

    // Build report content
    const reportContent = {
      metadata: {
        reportType,
        generatedAt: new Date().toISOString(),
        generatedBy: user.email,
        processingTime: Date.now() - startTime,
      },
      executiveSummary,
      case: caseData,
      entities,
      findings,
      timeline: timelineData,
      graph: graphData,
      forecasts,
      statistics: {
        totalFindings: findings?.length || 0,
        criticalFindings: findings?.filter(f => f.severity === 'critical').length || 0,
        entitiesAnalyzed: entities.length,
        timelineEvents: timelineData.length,
      },
    };

    // Generate hash manifest for integrity
    const hashInput = JSON.stringify(reportContent);
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(hashInput)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashManifest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store report if clientId provided
    if (clientId) {
      await supabase.from('client_reports').insert({
        client_id: clientId,
        report_type: reportType,
        title: caseData?.title || `${reportType} Report`,
        content: reportContent,
        hash_manifest: hashManifest,
        last_generated_at: new Date().toISOString(),
      });
    }

    console.log('Report generated successfully in', Date.now() - startTime, 'ms');

    return new Response(
      JSON.stringify({
        success: true,
        report: reportContent,
        hashManifest,
        processingTime: Date.now() - startTime,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});