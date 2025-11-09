import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LogEntry {
  id: string;
  test_name: string;
  status: string;
  error_message?: string;
  actual_behavior: string;
  duration_ms: number;
  created_at: string;
}

interface AuditRun {
  id: string;
  success_rate: number;
  failed: number;
  total_tests: number;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { logs, auditRun } = await req.json() as { logs: LogEntry[], auditRun: AuditRun };
    
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      throw new Error('GROK_API_KEY not configured');
    }

    console.log('[AI Glitch Detection] Analyzing logs with Grok...');

    // Prepare log summary for analysis
    const logSummary = {
      audit_id: auditRun.id,
      success_rate: auditRun.success_rate,
      failed_tests: auditRun.failed,
      total_tests: auditRun.total_tests,
      timestamp: auditRun.created_at,
      failed_test_details: logs
        .filter(log => log.status === 'fail')
        .map(log => ({
          name: log.test_name,
          error: log.error_message,
          behavior: log.actual_behavior,
          duration: log.duration_ms
        })),
      warning_test_details: logs
        .filter(log => log.status === 'warning')
        .map(log => ({
          name: log.test_name,
          behavior: log.actual_behavior,
          duration: log.duration_ms
        }))
    };

    // Call Grok API via X.ai
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
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
            content: `You are an expert system reliability engineer analyzing test audit logs. 
Your task is to:
1. Identify patterns in failures and warnings
2. Detect anomalies that indicate systemic issues
3. Suggest specific fixes with actionable steps
4. Prioritize issues by severity and impact
5. Flag recurring problems that need immediate attention

Provide concise, actionable insights in JSON format with:
- patterns: Array of detected patterns with description and severity
- anomalies: Array of anomalies with impact assessment
- fixes: Array of specific fixes with implementation steps
- priority_issues: Array of critical issues requiring immediate action
- risk_assessment: Overall system health risk (low/medium/high/critical)`
          },
          {
            role: 'user',
            content: `Analyze these audit logs and detect patterns, anomalies, and suggest fixes:\n\n${JSON.stringify(logSummary, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Glitch Detection] Grok API error:', response.status, errorText);
      throw new Error(`Grok API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiAnalysis = data.choices[0].message.content;

    console.log('[AI Glitch Detection] Analysis complete');

    // Try to parse as JSON, fallback to text
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(aiAnalysis);
    } catch {
      parsedAnalysis = {
        raw_analysis: aiAnalysis,
        patterns: [],
        anomalies: [],
        fixes: [],
        priority_issues: [],
        risk_assessment: 'unknown'
      };
    }

    // Determine if anomaly threshold is exceeded
    const failureRate = ((auditRun.failed / auditRun.total_tests) * 100);
    const shouldAlert = failureRate > 5 || auditRun.success_rate < 95;

    return new Response(
      JSON.stringify({
        analysis: parsedAnalysis,
        metadata: {
          failure_rate: failureRate,
          should_alert: shouldAlert,
          analyzed_at: new Date().toISOString(),
          log_count: logs.length,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[AI Glitch Detection] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        analysis: null
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
