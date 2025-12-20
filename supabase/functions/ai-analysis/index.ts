import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { authenticateRequest } from "../_shared/auth-utils.ts";
import { rateLimitMiddleware } from "../_shared/enhanced-rate-limiter.ts";
import { validateRequestBody } from "../_shared/security-validation.ts";
import { secureJsonResponse, addSecurityHeaders } from "../_shared/security-headers.ts";
import { logAIUsage } from "../_shared/aiLogger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
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
      endpoint: "ai-analysis",
      userId: authResult.context.userId,
      tier: "premium",
    });
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // Input validation
    const body = await req.json();
    const bodyValidation = validateRequestBody(body, RequestSchema);
    if (!bodyValidation.valid || !bodyValidation.data) {
      return secureJsonResponse(
        { error: 'Invalid input', details: bodyValidation.error },
        400
      );
    }
    
    const { scanId } = bodyValidation.data;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Fetch scan data
    const { data: scan, error: scanError } = await supabaseClient
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanError) throw scanError;

    console.log('[ai-analysis] Scan data:', { 
      scanId, 
      username: scan.username, 
      email: scan.email,
      scanType: scan.scan_type 
    });

    // Fetch all findings from unified findings table
    const { data: findings, error: findingsError } = await supabaseClient
      .from('findings')
      .select('kind, provider, evidence, meta, confidence, severity')
      .eq('scan_id', scanId);

    if (findingsError) throw findingsError;

    console.log('[ai-analysis] Findings fetched:', { count: findings?.length, sample: findings?.[0] });

    // Detect scan type based on findings and scan record
    const isUsernameScan = findings?.some(f => 
      ['profile_presence', 'presence.hit', 'username.found'].some(k => 
        (f.kind || '').toLowerCase().includes(k)
      )
    ) || !!scan.username;

    console.log('[ai-analysis] Detected scan type:', { isUsernameScan, username: scan.username });

    let analysisPrompt: string;

    if (isUsernameScan) {
      // USERNAME SCAN: Extract platform data
      const platforms = (findings || []).map(f => {
        const evidence = Array.isArray(f.evidence) 
          ? f.evidence.reduce((acc: any, item: any) => ({...acc, [item.key]: item.value}), {})
          : f.evidence || {};
        
        return {
          platform: evidence.site || evidence.platform || f.meta?.site || f.provider || 'Unknown',
          url: evidence.url || f.meta?.url,
          confidence: f.confidence || 'medium',
          provider: f.provider
        };
      }).filter(p => p.platform !== 'Unknown');

      console.log('[ai-analysis] Username scan platforms:', { count: platforms.length, platforms });

      if (platforms.length === 0) {
        console.log('[ai-analysis] Username scan with no platforms found, returning fallback');
        return new Response(
          JSON.stringify({
            analysis: `## No Profile Data Found

This username scan completed but did not find any associated social media or platform profiles. This could indicate:

### Possible Reasons
- **Unique Username**: The username may be uncommon and not used on major platforms
- **Privacy-Conscious User**: The target may intentionally limit their online presence
- **New or Limited Identity**: The digital footprint may be minimal

### Recommendations
1. **Try Variations**: Search for common variations of the username (e.g., with numbers, underscores)
2. **Cross-Reference**: Try scanning associated email addresses or phone numbers
3. **Alternative Platforms**: The username may be active on niche platforms not covered by our scanners

### Next Steps
- Run an email or phone scan for additional data points
- Check the breach database for any historical exposures
- Consider running a fresh scan if the target is known to be active online`,
            scanData: {
              privacyScore: scan.privacy_score || 95,
              totalSources: 0,
              highRisk: 0,
              mediumRisk: 0,
              lowRisk: 0
            },
            noFindings: true
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      analysisPrompt = `You are a digital privacy expert analyzing a USERNAME scan for: ${scan.username}

**Platforms Found (${platforms.length}):**
${platforms.map(p => `- ${p.platform}${p.url ? ` (${p.url})` : ''} [${p.confidence} confidence, found by ${p.provider}]`).join('\n')}

**Analysis Required:**
1. **Username Exposure Risk**: How widely is this username distributed across platforms?
2. **Platform Categories**: What categories of sites (social, gaming, forums, etc.) are most represented?
3. **Privacy Recommendations**: Which platforms pose the highest privacy risk and should be prioritized for account review or deletion?
4. **Correlation Patterns**: Are there any concerning patterns in where this username appears?
5. **Actionable Steps**: Top 3 immediate actions to reduce digital footprint

Format your response in clear sections with bullet points. Be specific and actionable. Focus on username reuse risk, platform exposure, and privacy implications.`;

    } else {
      // BREACH/EMAIL SCAN: Extract breach/exposure data
      const breaches = (findings || []).filter(f => 
        (f.kind || '').toLowerCase().includes('breach') ||
        (f.kind || '').toLowerCase().includes('leak') ||
        f.severity === 'critical' || f.severity === 'high'
      );

      console.log('[ai-analysis] Breach scan findings:', { 
        totalFindings: findings?.length, 
        breaches: breaches.length 
      });

      if (findings?.length === 0) {
        console.log('[ai-analysis] Breach/email scan with no findings, returning fallback');
        return new Response(
          JSON.stringify({
            analysis: `## No Findings Detected

Good news! This scan completed successfully and did not find any concerning data exposures.

### What This Means
- **No Known Breaches**: The target email/phone was not found in our breach databases
- **Limited Exposure**: No significant data broker listings were detected
- **Clean Status**: The digital identity appears to have minimal exposure

### Recommendations
1. **Stay Vigilant**: Continue monitoring for future breaches
2. **Enable Alerts**: Set up monitoring to be notified of new exposures
3. **Maintain Security**: Use strong, unique passwords and enable 2FA

### Note
This scan checks against current databases. New breaches are discovered regularly, so periodic re-scanning is recommended.`,
            scanData: {
              privacyScore: scan.privacy_score || 90,
              totalSources: 0,
              highRisk: 0,
              mediumRisk: 0,
              lowRisk: 0
            },
            noFindings: true
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      analysisPrompt = `You are a privacy and data security expert analyzing a BREACH/EMAIL scan.

**Scan Target:** ${scan.email || scan.phone || 'Unknown'}
**Total Findings:** ${findings?.length || 0}
**High Risk Findings:** ${breaches.length}

**Findings Summary:**
${findings?.slice(0, 20).map(f => `- ${f.kind || 'Unknown'} (Provider: ${f.provider}, Severity: ${f.severity || 'unknown'})`).join('\n')}

**Analysis Required:**
1. **Risk Prioritization**: Which findings pose the biggest threat and why?
2. **Action Plan**: Step-by-step remediation recommendations, prioritized by impact
3. **Pattern Analysis**: What patterns emerge across the findings?
4. **Privacy Insights**: What's the overall risk level?
5. **Key Recommendations**: Top 3 actions to take immediately

Format your response in clear sections with bullet points. Be specific and actionable.`;
    }

    console.log('[ai-analysis] Generated prompt length:', analysisPrompt.length);

    console.log('Calling Lovable AI for analysis...');

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a privacy and data security expert providing clear, actionable analysis of personal data exposure findings.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    console.log('AI analysis completed successfully');

    // Log AI usage
    await logAIUsage(supabaseClient, {
      userId: authResult.context.userId,
      workspaceId: scan.workspace_id,
      model: 'google/gemini-2.5-flash',
      promptLength: analysisPrompt.length,
      responseLength: analysis?.length || 0,
      success: true,
    });

    return new Response(
      JSON.stringify({
        analysis,
        scanData: {
          privacyScore: scan.privacy_score,
          totalSources: scan.total_sources_found,
          highRisk: scan.high_risk_count,
          mediumRisk: scan.medium_risk_count,
          lowRisk: scan.low_risk_count
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
        }
      }
    );

  } catch (error) {
    console.error('Error in ai-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
