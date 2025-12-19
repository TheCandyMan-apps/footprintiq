import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';
import { getProviderCost } from '../_shared/providerCosts.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Normalize phone to E.164 format
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

// Generate finding ID
function generateFindingId(provider: string, kind: string, unique: string): string {
  return `${provider}_${kind}_${unique.replace(/[^a-zA-Z0-9]/g, '')}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: addSecurityHeaders(corsHeaders) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth
    const authResult = await validateAuth(req);
    if (!authResult.valid || !authResult.context) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }
    const userId = authResult.context.userId;

    // Rate limit
    const rateLimitResult = await checkRateLimit(userId, 'user', 'phone-intel', {
      maxRequests: 30,
      windowSeconds: 3600
    });
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', resetAt: rateLimitResult.resetAt }),
        { status: 429, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const body = await req.json();
    const { scanId, phone, workspaceId, providers = ['abstract_phone', 'ipqs_phone'] } = body;

    if (!phone || !scanId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: phone, scanId' }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    const normalizedPhone = normalizePhone(phone);
    console.log(`[phone-intel] Starting scan for ${normalizedPhone.slice(0, 5)}***`);
    console.log(`[phone-intel] Requested providers: ${providers.join(', ')}`);

    const findings: any[] = [];
    const providerResults: Record<string, { status: string; findingsCount: number; latencyMs: number; message?: string }> = {};

    // Helper to log and record not_configured status
    const markNotConfigured = (providerId: string, keyName: string) => {
      console.log(`[phone-intel] Provider ${providerId} skipped: ${keyName} not configured`);
      providerResults[providerId] = { 
        status: 'not_configured', 
        findingsCount: 0, 
        latencyMs: 0,
        message: `API key ${keyName} not configured`
      };
    };

    // Provider: AbstractAPI Phone
    if (providers.includes('abstract_phone')) {
      const startTime = Date.now();
      const ABSTRACT_API_KEY = Deno.env.get('ABSTRACT_PHONE_API_KEY');
      
      if (!ABSTRACT_API_KEY) {
        markNotConfigured('abstract_phone', 'ABSTRACT_PHONE_API_KEY');
      } else {
        try {
          const response = await fetch(
            `https://phonevalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&phone=${encodeURIComponent(normalizedPhone)}`
          );
          
          if (response.ok) {
            const data = await response.json();
            const latency = Date.now() - startTime;
            
            if (data.valid) {
              findings.push({
                id: generateFindingId('abstract_phone', 'carrier_intel', normalizedPhone),
                type: 'phone_intelligence',
                title: `Carrier: ${data.carrier || 'Unknown'} (${data.type || 'unknown'})`,
                description: `Phone validated as ${data.type || 'unknown'} line in ${data.country?.name || 'unknown country'}.`,
                severity: data.type === 'voip' ? 'low' : 'info',
                confidence: 0.85,
                provider: 'AbstractAPI Phone',
                providerCategory: 'Carrier Intelligence',
                evidence: [
                  { key: 'Phone', value: normalizedPhone },
                  { key: 'Valid', value: String(data.valid) },
                  { key: 'Line Type', value: data.type || 'unknown' },
                  { key: 'Carrier', value: data.carrier || 'Unknown' },
                  { key: 'Country', value: data.country?.name || 'Unknown' },
                  { key: 'Country Code', value: data.country?.code || 'Unknown' },
                  { key: 'International Format', value: data.format?.international || normalizedPhone },
                ],
                impact: 'Phone carrier and type identified for verification',
                remediation: [],
                tags: ['phone', 'carrier', data.type || 'unknown'],
                observedAt: new Date().toISOString(),
              });
            }
            
            providerResults['abstract_phone'] = { status: 'success', findingsCount: data.valid ? 1 : 0, latencyMs: latency };
          } else {
            providerResults['abstract_phone'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime };
          }
        } catch (error) {
          console.error('[phone-intel] AbstractAPI error:', error);
          providerResults['abstract_phone'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime };
        }
      }
    }

    // Provider: IPQualityScore Phone
    if (providers.includes('ipqs_phone')) {
      const startTime = Date.now();
      const IPQS_KEY = Deno.env.get('IPQS_API_KEY');
      
      if (!IPQS_KEY) {
        markNotConfigured('ipqs_phone', 'IPQS_API_KEY');
      } else {
        try {
          const response = await fetch(
            `https://ipqualityscore.com/api/json/phone/${IPQS_KEY}/${encodeURIComponent(normalizedPhone)}`
          );
          
          if (response.ok) {
            const data = await response.json();
            const latency = Date.now() - startTime;
            
            if (data.valid) {
              // Carrier finding
              findings.push({
                id: generateFindingId('ipqs_phone', 'carrier_intel', normalizedPhone),
                type: 'phone_intelligence',
                title: `Carrier: ${data.carrier || 'Unknown'} (${data.line_type || 'unknown'})`,
                description: `Phone is a ${data.line_type || 'unknown'} line on ${data.carrier || 'unknown carrier'} in ${data.country || 'unknown country'}.`,
                severity: 'info',
                confidence: 0.85,
                provider: 'IPQualityScore',
                providerCategory: 'Carrier Intelligence',
                evidence: [
                  { key: 'Phone', value: normalizedPhone },
                  { key: 'Valid', value: String(data.valid) },
                  { key: 'Active', value: String(data.active) },
                  { key: 'Line Type', value: data.line_type || 'unknown' },
                  { key: 'Carrier', value: data.carrier || 'Unknown' },
                  { key: 'Country', value: data.country || 'Unknown' },
                  { key: 'Region', value: data.region || 'Unknown' },
                  { key: 'City', value: data.city || 'Unknown' },
                  { key: 'Is VoIP', value: String(data.VOIP || false) },
                  { key: 'Is Prepaid', value: String(data.prepaid || false) },
                ],
                impact: 'Phone carrier and type identified for verification',
                remediation: [],
                tags: ['phone', 'carrier', data.line_type || 'unknown'],
                observedAt: new Date().toISOString(),
              });

              // Risk signal finding
              if (data.fraud_score > 0 || data.leaked || data.recent_abuse || data.spammer) {
                const riskFactors: string[] = [];
                if (data.spammer) riskFactors.push('Known Spammer');
                if (data.recent_abuse) riskFactors.push('Recent Abuse');
                if (data.leaked) riskFactors.push('Found in Data Leak');
                if (data.risky) riskFactors.push('Risky');
                
                const severity = data.fraud_score > 75 ? 'high' : data.fraud_score > 50 ? 'medium' : 'low';
                
                findings.push({
                  id: generateFindingId('ipqs_phone', 'risk_signal', normalizedPhone),
                  type: 'phone_intelligence',
                  title: riskFactors.length > 0 
                    ? `Risk: ${riskFactors.slice(0, 2).join(', ')}`
                    : `Fraud Score: ${data.fraud_score}`,
                  description: `Phone has fraud score of ${data.fraud_score}/100. ${riskFactors.length > 0 ? `Risk factors: ${riskFactors.join(', ')}.` : ''}`,
                  severity,
                  confidence: 0.8,
                  provider: 'IPQualityScore',
                  providerCategory: 'Risk Intelligence',
                  evidence: [
                    { key: 'Phone', value: normalizedPhone },
                    { key: 'Fraud Score', value: String(data.fraud_score) },
                    { key: 'Is Spammer', value: String(data.spammer || false) },
                    { key: 'Recent Abuse', value: String(data.recent_abuse || false) },
                    { key: 'Leaked', value: String(data.leaked || false) },
                    { key: 'Risky', value: String(data.risky || false) },
                    { key: 'Is VoIP', value: String(data.VOIP || false) },
                    { key: 'Risk Factors', value: String(riskFactors.length) },
                  ],
                  impact: severity === 'high'
                    ? 'High-risk phone number - proceed with caution'
                    : 'Phone has some risk indicators',
                  remediation: severity !== 'low' ? [
                    'Verify identity through additional channels',
                    'Enable additional security measures',
                  ] : [],
                  tags: ['phone', 'risk', ...riskFactors.map(r => r.toLowerCase().replace(/\s+/g, '-'))],
                  observedAt: new Date().toISOString(),
                });
              }

              // VoIP detection
              if (data.VOIP) {
                findings.push({
                  id: generateFindingId('ipqs_phone', 'voip_detection', normalizedPhone),
                  type: 'phone_intelligence',
                  title: 'VoIP Number Detected',
                  description: `Phone number is a VoIP line, which may have lower security protections.`,
                  severity: 'low',
                  confidence: 0.9,
                  provider: 'IPQualityScore',
                  providerCategory: 'Carrier Intelligence',
                  evidence: [
                    { key: 'Phone', value: normalizedPhone },
                    { key: 'Is VoIP', value: 'true' },
                    { key: 'Carrier', value: data.carrier || 'Unknown' },
                  ],
                  impact: 'VoIP numbers are easier to spoof and may be used in phishing',
                  remediation: [
                    'Consider additional verification methods',
                    'Be cautious of SMS-based 2FA vulnerabilities',
                  ],
                  tags: ['phone', 'voip', 'security'],
                  observedAt: new Date().toISOString(),
                });
              }
            }
            
            const findingsFromIPQS = data.valid ? (data.fraud_score > 0 || data.leaked ? 2 : 1) + (data.VOIP ? 1 : 0) : 0;
            providerResults['ipqs_phone'] = { status: 'success', findingsCount: findingsFromIPQS, latencyMs: latency };
          } else {
            providerResults['ipqs_phone'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime };
          }
        } catch (error) {
          console.error('[phone-intel] IPQS error:', error);
          providerResults['ipqs_phone'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime };
        }
      }
    }

    // Provider: Caller Hint (optional - requires CALLERHINT_API_KEY)
    if (providers.includes('caller_hint')) {
      const CALLERHINT_KEY = Deno.env.get('CALLERHINT_API_KEY');
      
      if (!CALLERHINT_KEY) {
        markNotConfigured('caller_hint', 'CALLERHINT_API_KEY');
      } else {
        const startTime = Date.now();
        try {
          // Placeholder for actual CallerHint API call
          // This would be replaced with actual implementation when API is available
          console.log(`[phone-intel] CallerHint lookup for ${normalizedPhone.slice(0, 5)}***`);
          
          // For now, mark as skipped until API is implemented
          providerResults['caller_hint'] = { 
            status: 'success', 
            findingsCount: 0, 
            latencyMs: Date.now() - startTime,
            message: 'API integration pending'
          };
        } catch (error) {
          console.error('[phone-intel] CallerHint error:', error);
          providerResults['caller_hint'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime };
        }
      }
    }

    // Handle other requested providers that aren't configured
    const handledProviders = ['abstract_phone', 'ipqs_phone', 'caller_hint'];
    for (const providerId of providers) {
      if (!handledProviders.includes(providerId) && !providerResults[providerId]) {
        // Mark unimplemented providers as not_configured
        console.log(`[phone-intel] Provider ${providerId} not implemented yet`);
        providerResults[providerId] = { 
          status: 'not_configured', 
          findingsCount: 0, 
          latencyMs: 0,
          message: 'Provider not yet implemented'
        };
      }
    }

    // Calculate total credits
    let totalCredits = 0;
    for (const provider of Object.keys(providerResults)) {
      if (providerResults[provider].status === 'success') {
        totalCredits += getProviderCost(provider);
      }
    }

    // Store findings in database
    if (findings.length > 0) {
      const { error: insertError } = await supabase
        .from('findings')
        .insert(findings.map(f => ({
          scan_id: scanId,
          finding_id: f.id,
          provider: f.provider,
          kind: f.providerCategory === 'Carrier Intelligence' ? 'carrier_intel' 
            : f.providerCategory === 'Risk Intelligence' ? 'risk_signal'
            : f.providerCategory === 'Messaging Presence' ? 'messaging_presence'
            : 'phone_presence',
          severity: f.severity,
          confidence: f.confidence,
          title: f.title,
          description: f.description,
          evidence: f.evidence,
          impact: f.impact,
          remediation: f.remediation,
          tags: f.tags,
          observed_at: f.observedAt,
          meta: { type: f.type, providerCategory: f.providerCategory },
        })));

      if (insertError) {
        console.error('[phone-intel] Failed to store findings:', insertError);
      }
    }

    // Broadcast progress
    try {
      const channel = supabase.channel(`scan_progress:${scanId}`);
      for (const [provider, result] of Object.entries(providerResults)) {
        await channel.send({
          type: 'broadcast',
          event: 'provider_update',
          payload: {
            providerId: provider,
            status: result.status === 'success' ? 'success' : result.status === 'skipped' ? 'skipped' : 'failed',
            message: result.status === 'success' 
              ? `Found ${result.findingsCount} findings` 
              : result.status === 'skipped' ? 'API key not configured' : 'Provider error',
            resultCount: result.findingsCount,
          }
        });
      }
    } catch (error) {
      console.error('[phone-intel] Broadcast error:', error);
    }

    console.log(`[phone-intel] Completed: ${findings.length} findings from ${Object.keys(providerResults).length} providers`);

    return new Response(
      JSON.stringify({
        success: true,
        scanId,
        phone: normalizedPhone,
        findingsCount: findings.length,
        findings,
        providerResults,
        creditsUsed: totalCredits,
      }),
      { headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );

  } catch (error) {
    console.error('[phone-intel] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
    );
  }
});
