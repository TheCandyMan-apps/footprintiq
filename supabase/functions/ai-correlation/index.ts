import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { logAIUsage } from "../_shared/aiLogger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const CorrelationRequestSchema = z.object({
  findings: z.array(z.any()).min(1, "At least one finding required"),
  scanType: z.enum(['username', 'email', 'phone', 'personal_details']).optional().default('username'),
});

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
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_identifier: userId,
    p_identifier_type: 'user',
    p_endpoint: endpoint,
    p_max_requests: 100, // 100 per hour
    p_window_seconds: 3600,
  });

  if (error) {
    console.error('[ai-correlation] Rate limit RPC error:', error);
    throw new Error('Rate limit check failed');
  }

  // PostgREST returns TABLE results as an array
  const rateLimit = Array.isArray(data) ? data[0] : data;

  if (!rateLimit?.allowed) {
    const err = new Error('Rate limit exceeded');
    (err as any).status = 429;
    (err as any).resetAt = rateLimit?.reset_at;
    throw err;
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

// Phone-specific system prompt
function getPhoneSystemPrompt(): string {
  return `You are an expert OSINT analyst specializing in phone number intelligence. Analyze phone-related findings with these policies:

PENALIZE (increase risk score):
- VOIP/disposable phone indicators
- Burner phone patterns
- High risk flags from fraud detection services
- High density of data broker listings
- Spam/scam report indicators
- Country mismatch between number registration and usage patterns
- Multiple numbers linked to same identity (potential fraud)

DO NOT PENALIZE (neutral or positive):
- Messaging app presence alone (WhatsApp, Telegram, Signal)
- Basic carrier intelligence
- Business listings associated with the number
- Standard OSINT presence on public platforms

OUTPUT REQUIREMENTS:
- Never claim definitive identity conclusions - use probabilistic language
- Never output PII claims (no names, addresses, SSNs)
- Focus on risk signals and patterns, not individual attributes
- Provide actionable intelligence without overreach`;
}

// Standard system prompt for non-phone scans
function getStandardSystemPrompt(): string {
  return `You are an expert OSINT analyst. Analyze security findings and provide actionable remediation steps.

OUTPUT REQUIREMENTS:
- Never claim definitive identity conclusions - use probabilistic language
- Never output PII claims beyond what's in the findings
- Focus on risk patterns and mitigation strategies`;
}

// Calculate fallback risk score from findings
function calculateFallbackRiskScore(findings: any[], scanType: string): { 
  riskScore: number; 
  riskLevel: 'low' | 'medium' | 'high';
  keySignals: string[];
  recommendedActions: string[];
  summary: string;
} {
  let riskScore = 0;
  const keySignals: string[] = [];
  const recommendedActions: string[] = [];

  if (scanType === 'phone') {
    // Phone-specific risk calculation
    const riskSignals = findings.filter(f => f.kind === 'risk_signal' || f.category === 'risk');
    const brokerFlags = findings.filter(f => f.kind === 'broker_flag' || f.category === 'broker');
    const carrierIntel = findings.filter(f => f.kind === 'carrier_intel');
    const messagingPresence = findings.filter(f => f.kind === 'messaging_presence');

    // Check for VOIP/disposable indicators
    const hasVoip = riskSignals.some(f => 
      f.description?.toLowerCase().includes('voip') ||
      f.description?.toLowerCase().includes('disposable') ||
      f.description?.toLowerCase().includes('burner')
    );
    if (hasVoip) {
      riskScore += 40;
      keySignals.push('VOIP/disposable phone indicator detected');
      recommendedActions.push('Verify phone ownership through alternative channels');
    }

    // Check for scam/spam indicators
    const hasScamIndicator = riskSignals.some(f =>
      f.description?.toLowerCase().includes('scam') ||
      f.description?.toLowerCase().includes('spam') ||
      f.description?.toLowerCase().includes('fraud')
    );
    if (hasScamIndicator) {
      riskScore += 20;
      keySignals.push('Spam/scam reports associated with this number');
      recommendedActions.push('Exercise caution with communications from this number');
    }

    // Check broker density
    if (brokerFlags.length > 3) {
      riskScore += 25;
      keySignals.push(`High data broker presence (${brokerFlags.length} sources)`);
      recommendedActions.push('Consider data removal requests to reduce exposure');
    } else if (brokerFlags.length > 0) {
      riskScore += 10;
      keySignals.push(`Data broker presence detected (${brokerFlags.length} source${brokerFlags.length > 1 ? 's' : ''})`);
    }

    // Check for high-risk severity findings
    const highRiskCount = findings.filter(f => f.severity === 'risk' || f.severity === 'high').length;
    if (highRiskCount > 0) {
      riskScore += Math.min(highRiskCount * 10, 30);
      keySignals.push(`${highRiskCount} high-risk indicator${highRiskCount > 1 ? 's' : ''} found`);
    }

    // Neutral signals (don't penalize, but mention)
    if (messagingPresence.length > 0) {
      keySignals.push(`Active on ${messagingPresence.length} messaging platform${messagingPresence.length > 1 ? 's' : ''}`);
    }
    if (carrierIntel.length > 0) {
      const carrier = carrierIntel[0];
      if (carrier.description) {
        keySignals.push(`Carrier: ${carrier.description}`);
      }
    }

    if (recommendedActions.length === 0) {
      recommendedActions.push('Continue standard verification procedures');
    }
  } else {
    // Standard scan risk calculation (username, email, personal_details)
    const breachCount = findings.filter(f => 
      f.category === 'breach' || 
      f.type === 'breach' ||
      f.kind === 'breach'
    ).length;
    
    const exposureCount = findings.filter(f => 
      f.category === 'exposure' || 
      f.type === 'data_exposure'
    ).length;
    
    const socialProfiles = findings.filter(f => 
      f.category === 'social' || 
      f.type === 'social_profile'
    ).length;

    if (breachCount > 5) {
      riskScore += 40;
      keySignals.push(`High breach exposure: ${breachCount} breaches found`);
      recommendedActions.push('Enable dark web monitoring');
      recommendedActions.push('Change passwords on affected accounts');
    } else if (breachCount > 0) {
      riskScore += breachCount * 5;
      keySignals.push(`${breachCount} breach${breachCount > 1 ? 'es' : ''} detected`);
      recommendedActions.push('Review and update passwords for breached accounts');
    }

    if (exposureCount > 3) {
      riskScore += 25;
      keySignals.push(`Significant data exposure across ${exposureCount} sources`);
      recommendedActions.push('Submit data removal requests to identified brokers');
    } else if (exposureCount > 0) {
      riskScore += exposureCount * 5;
      keySignals.push(`Data exposure found on ${exposureCount} source${exposureCount > 1 ? 's' : ''}`);
    }

    if (socialProfiles > 10) {
      keySignals.push(`Large digital footprint: ${socialProfiles} social profiles`);
      recommendedActions.push('Review privacy settings on all social accounts');
    } else if (socialProfiles > 0) {
      keySignals.push(`${socialProfiles} social profile${socialProfiles > 1 ? 's' : ''} discovered`);
    }

    if (recommendedActions.length === 0) {
      recommendedActions.push('Maintain current security practices');
      recommendedActions.push('Consider periodic monitoring for new exposures');
    }
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (riskScore >= 60) {
    riskLevel = 'high';
  } else if (riskScore >= 30) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Generate summary
  const summary = scanType === 'phone'
    ? `Phone intelligence analysis identified ${findings.length} signals. Risk assessment: ${riskLevel.toUpperCase()} (${riskScore}/100). ${keySignals.length > 0 ? keySignals[0] + '.' : 'No significant risk indicators detected.'}`
    : `Analysis of ${findings.length} findings complete. Risk assessment: ${riskLevel.toUpperCase()} (${riskScore}/100). ${keySignals.length > 0 ? keySignals[0] + '.' : 'No significant risk indicators detected.'}`;

  return {
    riskScore,
    riskLevel,
    keySignals,
    recommendedActions,
    summary,
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

    // Rate limiting - premium tier (100 req/hour)
    await checkRateLimit(supabase, userId, 'ai-correlation');

    // Validate request body
    const body = await req.json();
    const validatedData = CorrelationRequestSchema.parse(body);
    const { findings, scanType } = validatedData;

    console.log('[ai-correlation] Analyzing', findings.length, 'findings for scan type:', scanType);

    // Build prompt based on scan type
    const systemPrompt = scanType === 'phone' 
      ? getPhoneSystemPrompt() 
      : getStandardSystemPrompt();

    const userPrompt = scanType === 'phone'
      ? `Analyze these phone intelligence findings and provide a structured assessment:

${JSON.stringify(findings, null, 2)}

Respond in this exact JSON format:
{
  "summary": "Brief probabilistic summary of phone intelligence findings (2-3 sentences)",
  "riskScore": <number 0-100>,
  "riskLevel": "low" | "medium" | "high",
  "keySignals": ["signal 1", "signal 2", ...],
  "recommendedActions": ["action 1", "action 2", ...],
  "confidence": <number 0.0-1.0>
}`
      : `Analyze these findings and provide insights with specific actions:

${JSON.stringify(findings, null, 2)}

Provide:
1. Analysis of risks and patterns (as bullet points)
2. Specific recommended actions (as JSON array)

Format the response as:

ANALYSIS:
[bullet points here]

ACTIONS:
[JSON array of action objects with fields: title, description, type (one of: 'removal', 'monitoring', 'security', 'privacy'), priority ('high'|'medium'|'low'), sourceIds (array of relevant source IDs from findings)]`;

    // Call Lovable AI Gateway
    let aiResponse: Response;
    let useFallback = false;
    let fallbackReason = '';

    try {
      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('[ai-correlation] Lovable AI error:', aiResponse.status, errorText);
        
        if (aiResponse.status === 429) {
          useFallback = true;
          fallbackReason = 'rate_limit';
        } else if (aiResponse.status === 402) {
          useFallback = true;
          fallbackReason = 'payment_required';
        } else if (aiResponse.status >= 500) {
          useFallback = true;
          fallbackReason = 'service_error';
        } else {
          throw new Error(`Lovable AI error: ${aiResponse.status}`);
        }
      }
    } catch (fetchError: any) {
      console.error('[ai-correlation] AI fetch error:', fetchError.message);
      useFallback = true;
      fallbackReason = 'network_error';
    }

    // Use fallback analysis if AI call failed
    if (useFallback) {
      console.log('[ai-correlation] Using fallback analysis, reason:', fallbackReason);
      
      const fallback = calculateFallbackRiskScore(findings, scanType);
      
      // For phone scans, return structured response
      if (scanType === 'phone') {
        return new Response(JSON.stringify({
          summary: fallback.summary,
          riskScore: fallback.riskScore,
          riskLevel: fallback.riskLevel,
          keySignals: fallback.keySignals,
          recommendedActions: fallback.recommendedActions,
          confidence: 0.6, // Lower confidence for fallback
          fallbackMode: true,
          fallbackReason,
          timestamp: new Date().toISOString(),
          findings_analyzed: findings.length,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // For other scan types, return legacy format with fallback
      const fallbackAnalysis = `## Automated Risk Assessment (Fallback Mode)

${fallback.keySignals.map(s => `• ${s}`).join('\n')}

**Risk Score:** ${fallback.riskScore}/100 (${fallback.riskLevel.toUpperCase()})

**Recommended Actions:**
${fallback.recommendedActions.map(a => `• ${a}`).join('\n')}`;

      const fallbackActions = fallback.recommendedActions.map((action, idx) => ({
        title: action,
        description: action,
        type: idx === 0 ? 'security' : 'monitoring',
        priority: fallback.riskLevel === 'high' ? 'high' : 'medium',
        sourceIds: [],
      }));

      return new Response(JSON.stringify({
        analysis: fallbackAnalysis,
        actions: fallbackActions,
        fallbackMode: true,
        fallbackReason,
        riskScore: fallback.riskScore,
        riskLevel: fallback.riskLevel,
        timestamp: new Date().toISOString(),
        findings_analyzed: findings.length,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse!.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      // Fall back to deterministic analysis if AI returns empty
      const fallback = calculateFallbackRiskScore(findings, scanType);
      
      if (scanType === 'phone') {
        return new Response(JSON.stringify({
          summary: fallback.summary,
          riskScore: fallback.riskScore,
          riskLevel: fallback.riskLevel,
          keySignals: fallback.keySignals,
          recommendedActions: fallback.recommendedActions,
          confidence: 0.6,
          fallbackMode: true,
          fallbackReason: 'empty_response',
          timestamp: new Date().toISOString(),
          findings_analyzed: findings.length,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error('No analysis returned from AI');
    }

    // Parse response based on scan type
    if (scanType === 'phone') {
      // Try to parse JSON response for phone scans
      let parsedResponse: any;
      try {
        // Extract JSON from response (might be wrapped in markdown code blocks)
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('[ai-correlation] Could not parse phone response as JSON, using fallback');
        const fallback = calculateFallbackRiskScore(findings, scanType);
        parsedResponse = {
          summary: fallback.summary,
          riskScore: fallback.riskScore,
          riskLevel: fallback.riskLevel,
          keySignals: fallback.keySignals,
          recommendedActions: fallback.recommendedActions,
          confidence: 0.6,
        };
      }

      // Ensure all required fields exist
      const response = {
        summary: parsedResponse.summary || 'Analysis complete.',
        riskScore: typeof parsedResponse.riskScore === 'number' ? Math.min(100, Math.max(0, parsedResponse.riskScore)) : 0,
        riskLevel: ['low', 'medium', 'high'].includes(parsedResponse.riskLevel) ? parsedResponse.riskLevel : 'low',
        keySignals: Array.isArray(parsedResponse.keySignals) ? parsedResponse.keySignals : [],
        recommendedActions: Array.isArray(parsedResponse.recommendedActions) ? parsedResponse.recommendedActions : [],
        confidence: typeof parsedResponse.confidence === 'number' ? Math.min(1, Math.max(0, parsedResponse.confidence)) : 0.8,
        fallbackMode: false,
        timestamp: new Date().toISOString(),
        findings_analyzed: findings.length,
      };

      console.log('[ai-correlation] Phone analysis complete, risk:', response.riskLevel);

      // Log AI usage
      await logAIUsage(supabase, {
        userId: userId,
        model: 'google/gemini-2.5-flash',
        promptLength: userPrompt.length,
        responseLength: rawContent.length,
        success: true,
      });

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse the response to extract analysis and actions (legacy format)
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

    // Log AI usage
    await logAIUsage(supabase, {
      userId: userId,
      model: 'google/gemini-2.5-flash',
      promptLength: userPrompt.length,
      responseLength: rawContent.length,
      success: true,
    });

    return new Response(JSON.stringify({
      analysis,
      actions,
      fallbackMode: false,
      timestamp: new Date().toISOString(),
      findings_analyzed: findings.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[ai-correlation] Error:', {
      message: error.message,
      duration,
      timestamp: new Date().toISOString()
    });

    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    
    // Add structured error codes for frontend parsing
    let code = 'INTERNAL_ERROR';
    if (status === 429) code = 'RATE_LIMIT_EXCEEDED';
    else if (status === 402) code = 'PAYMENT_REQUIRED';
    else if (status === 401) code = 'UNAUTHORIZED';

    return new Response(
      JSON.stringify({ 
        error: message,
        status,
        code,
        ...(error.resetAt && { retryAfter: error.resetAt })
      }),
      { 
        status,
        headers: addSecurityHeaders({ 'Content-Type': 'application/json' })
      }
    );
  }
});
