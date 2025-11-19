import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { authenticateRequest } from "../_shared/auth-utils.ts";
import { rateLimitMiddleware } from "../_shared/enhanced-rate-limiter.ts";
import { validateRequestBody } from "../_shared/security-validation.ts";
import { secureJsonResponse } from "../_shared/security-headers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ScanAnalysisSchema = z.object({
  scanId: z.string().uuid({ message: "Invalid scan ID format" }),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.context) {
      return authResult.response!;
    }

    // Rate limiting (premium tier)
    const rateLimitResult = await rateLimitMiddleware(req, {
      endpoint: "ai-scan-analysis",
      userId: authResult.context.userId,
      tier: "premium",
    });
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Input validation
    const body = await req.json();
    const bodyValidation = validateRequestBody(body, ScanAnalysisSchema);
    if (!bodyValidation.valid || !bodyValidation.data) {
      return secureJsonResponse(
        { error: 'Invalid input', details: bodyValidation.error },
        400
      );
    }

    const { scanId } = bodyValidation.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return secureJsonResponse({ error: 'Service configuration error' }, 500);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch findings for this scan
    const { data: findings, error: findingsError } = await supabase
      .from('findings')
      .select('*')
      .eq('scan_id', scanId);

    if (findingsError) throw findingsError;
    if (!findings || findings.length === 0) {
      return secureJsonResponse(
        { analyzed: 0, message: 'No findings to analyze' },
        200
      );
    }

    console.log(`🔬 Analyzing ${findings.length} findings for scan ${scanId}`);

    // Build AI prompt for analysis
    const systemPrompt = `You are an OSINT analysis expert. Analyze findings and return a JSON array with AI assessments.

For each finding, provide:
- falsePositive: boolean (is this likely a false positive?)
- confidenceOverride: number 0-1 (refined confidence score)
- priority: "low" | "medium" | "high" | "critical" (importance for reporting)
- notes: string (brief explanation of your assessment)

Output format (raw JSON array only):
[
  {
    "findingId": "uuid",
    "falsePositive": false,
    "confidenceOverride": 0.85,
    "priority": "high",
    "notes": "Confirmed breach with credential exposure"
  }
]`;

    const userPrompt = `Analyze these findings:\n${JSON.stringify(findings.map(f => ({
      id: f.id,
      provider: f.provider,
      kind: f.kind,
      severity: f.severity,
      confidence: f.confidence,
      evidence: f.evidence,
    })), null, 2)}`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return secureJsonResponse(
          { error: 'Rate limits exceeded. Please try again later.' },
          429
        );
      }
      if (aiResponse.status === 402) {
        return secureJsonResponse(
          { error: 'Payment required. Please add funds to your Lovable AI workspace.' },
          402
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || '[]';

    // Parse AI response
    let analyses = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        analyses = JSON.parse(jsonMatch[0]);
      } else {
        analyses = JSON.parse(content);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      analyses = [];
    }

    console.log(`✅ AI analyzed ${analyses.length} findings`);

    // Update findings with AI assessments
    let updated = 0;
    for (const analysis of analyses) {
      if (!analysis.findingId) continue;

      // Get current finding
      const { data: finding } = await supabase
        .from('findings')
        .select('meta')
        .eq('id', analysis.findingId)
        .single();

      if (!finding) continue;

      const updatedMeta = {
        ...(finding.meta || {}),
        ai: {
          falsePositive: analysis.falsePositive || false,
          confidenceOverride: analysis.confidenceOverride || null,
          priority: analysis.priority || 'medium',
          notes: analysis.notes || '',
        }
      };

      const { error } = await supabase
        .from('findings')
        .update({ meta: updatedMeta })
        .eq('id', analysis.findingId);

      if (!error) updated++;
    }

    console.log(`💾 Updated ${updated} findings with AI analysis`);

    return new Response(
      JSON.stringify({
        analyzed: analyses.length,
        updated,
        summary: {
          falsePositives: analyses.filter((a: any) => a.falsePositive).length,
          highPriority: analyses.filter((a: any) => a.priority === 'high' || a.priority === 'critical').length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('AI analysis error:', error);
    return secureJsonResponse({
      error: error.message || 'Unknown error',
      analyzed: 0,
    }, 500);
  }
});
