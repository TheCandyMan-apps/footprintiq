import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { rateLimitMiddleware } from '../_shared/enhanced-rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ReportRequestSchema = z.object({
  scanId: z.string().uuid(),
  reportType: z.enum(['executive', 'technical']).default('executive'),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[AI-REPORT-GENERATOR] Request started');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[AI-REPORT-GENERATOR] Missing authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[AI-REPORT-GENERATOR] Authentication failed:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    console.log('[AI-REPORT-GENERATOR] User authenticated:', user.id);

    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(req, {
      userId: user.id,
      tier: 'premium',
      endpoint: 'ai-report-generator',
    });

    if (!rateLimitResult.allowed) {
      console.warn('[AI-REPORT-GENERATOR] Rate limit exceeded for user:', user.id);
      return rateLimitResult.response!;
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = ReportRequestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('[AI-REPORT-GENERATOR] Invalid request body:', validation.error);
      return new Response(JSON.stringify({ error: 'Invalid request body', details: validation.error.issues }), {
        status: 400,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }),
      });
    }

    const { scanId, reportType } = validation.data;

    // Fetch scan data
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) {
      throw new Error('Scan not found');
    }

    // Fetch findings
    const { data: findings } = await supabase
      .from('findings')
      .select('*')
      .eq('scan_id', scanId);

    // Fetch anomalies
    const { data: anomalies } = await supabase
      .from('anomalies')
      .select('*')
      .eq('scan_id', scanId);

    // Generate AI report
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = reportType === 'executive' 
      ? `You are a cybersecurity analyst generating an executive summary report. 
         Focus on high-level insights, business impact, and actionable recommendations.
         Use clear, non-technical language suitable for executives and decision-makers.`
      : `You are a cybersecurity analyst generating a detailed technical report.
         Provide in-depth analysis, technical details, and comprehensive recommendations.
         Include specific indicators, threat patterns, and remediation steps.`;

    const userPrompt = `Generate a ${reportType} report for this security scan:

Scan Details:
- Target: ${scan.username || scan.email || scan.phone || 'Unknown'}
- Risk Score: ${scan.risk_score || 'N/A'}
- Total Findings: ${findings?.length || 0}
- Critical Findings: ${findings?.filter(f => f.severity === 'critical').length || 0}
- High Findings: ${findings?.filter(f => f.severity === 'high').length || 0}
- Anomalies Detected: ${anomalies?.length || 0}

Findings Summary:
${findings?.slice(0, 10).map(f => `- ${f.category}: ${f.description} (${f.severity})`).join('\n') || 'No findings'}

${anomalies?.length ? `\nAnomalies Detected:\n${anomalies.slice(0, 5).map(a => `- ${a.anomaly_type}: ${a.description}`).join('\n')}` : ''}

Generate a comprehensive ${reportType} report with:
1. Executive Summary (2-3 paragraphs)
2. Key Findings & Risk Assessment
3. Business Impact Analysis
4. Prioritized Recommendations
5. Next Steps

Format as markdown.`;

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[AI-REPORT-GENERATOR] AI API error:', aiResponse.status, errorText);
      throw new Error('Failed to generate AI report');
    }

    const aiData = await aiResponse.json();
    const report = aiData.choices[0].message.content;

    // Store the generated report
    const { data: savedReport, error: saveError } = await supabase
      .from('ai_generated_reports')
      .insert({
        scan_id: scanId,
        report_type: reportType,
        content: report,
        user_id: user.id,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('[AI-REPORT-GENERATOR] Error saving report:', saveError);
    }

    console.log('[AI-REPORT-GENERATOR] Report generated successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        report,
        reportId: savedReport?.id
      }),
      { headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );

  } catch (error) {
    console.error('[AI-REPORT-GENERATOR] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' })
      }
    );
  }
});
