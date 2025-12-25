import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { validateAuth } from '../_shared/auth-utils.ts';
import { checkRateLimit } from '../_shared/rate-limiter.ts';
import { addSecurityHeaders } from '../_shared/security-headers.ts';
import { getProviderCost } from '../_shared/providerCosts.ts';
import { 
  normalizePlanTier, 
  getCapabilityLimit, 
  enforceProviderAccess,
  PlanTier,
  ProviderAccessReason 
} from '../_shared/planCapabilities.ts';
import { 
  PHONE_PROVIDERS, 
  getPhoneProvider, 
  isProviderKeyConfigured,
  getRequiredTierLabel,
  PhoneProviderConfig
} from '../_shared/phoneProviderConfig.ts';

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

// Provider result status type
type ProviderStatus = 'success' | 'failed' | 'skipped' | 'not_configured' | 'tier_restricted' | 'limit_exceeded';

interface ProviderResult {
  status: ProviderStatus;
  findingsCount: number;
  latencyMs: number;
  message?: string;
  terminal?: boolean;
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
    const { scanId, phone, workspaceId, providers = ['abstract_phone', 'ipqs_phone'], userPlan: rawUserPlan } = body;

    if (!phone || !scanId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: phone, scanId' }),
        { status: 400, headers: addSecurityHeaders({ ...corsHeaders, 'Content-Type': 'application/json' }) }
      );
    }

    // Normalize plan tier using centralized function
    const userPlan = normalizePlanTier(rawUserPlan);
    const normalizedPhone = normalizePhone(phone);
    
    console.log(`[phone-intel] Starting scan for ${normalizedPhone.slice(0, 5)}***`);
    console.log(`[phone-intel] Requested providers: ${providers.join(', ')}`);
    console.log(`[phone-intel] User plan: ${userPlan} (raw: ${rawUserPlan})`);

    const findings: any[] = [];
    const providerResults: Record<string, ProviderResult> = {};

    // Get max providers limit from plan capabilities
    const maxProviders = getCapabilityLimit(userPlan, 'phoneProvidersMax');
    console.log(`[phone-intel] Max providers for ${userPlan}: ${maxProviders === -1 ? 'unlimited' : maxProviders}`);

    // Helper to log scan events
    const logScanEvent = async (
      providerId: string, 
      stage: string, 
      status: string, 
      errorMessage?: string
    ) => {
      try {
        await supabase.from('scan_events').insert({
          scan_id: scanId,
          provider: providerId,
          stage,
          status,
          error_message: errorMessage || null,
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error(`[phone-intel] Failed to log scan event for ${providerId}:`, e);
      }
    };

    // Process each requested provider
    const validatedProviders: string[] = [];
    let providersAccepted = 0;

    for (const providerId of providers) {
      const providerConfig = getPhoneProvider(providerId);

      // Unknown provider
      if (!providerConfig) {
        console.log(`[phone-intel] Provider ${providerId} not found in registry`);
        providerResults[providerId] = {
          status: 'not_configured',
          findingsCount: 0,
          latencyMs: 0,
          message: 'Provider not implemented',
          terminal: true,
        };
        await logScanEvent(providerId, 'validation', 'not_configured', 'Provider not in registry');
        continue;
      }

      // Check provider limit for plan
      if (maxProviders !== -1 && providersAccepted >= maxProviders) {
        console.log(`[phone-intel] Provider ${providerId} skipped: limit exceeded (${providersAccepted}/${maxProviders})`);
        providerResults[providerId] = {
          status: 'limit_exceeded',
          findingsCount: 0,
          latencyMs: 0,
          message: `Free plan limited to ${maxProviders} providers. Upgrade for more.`,
          terminal: true,
        };
        await logScanEvent(providerId, 'validation', 'limit_exceeded', `Plan limit of ${maxProviders} providers reached`);
        continue;
      }

      // Enforce tier and key requirements using centralized function
      const accessResult = enforceProviderAccess({
        plan: userPlan,
        provider: {
          id: providerConfig.id,
          name: providerConfig.name,
          minTier: providerConfig.minTier,
          enabled: providerConfig.enabled,
          requiresKey: providerConfig.requiresKey || undefined,
        },
        isKeyConfigured: isProviderKeyConfigured(providerConfig),
      });

      if (!accessResult.allowed) {
        console.log(`[phone-intel] Provider ${providerId} blocked: ${accessResult.reason} - ${accessResult.message}`);
        
        providerResults[providerId] = {
          status: accessResult.reason as ProviderStatus,
          findingsCount: 0,
          latencyMs: 0,
          message: accessResult.message,
          terminal: true,
        };
        
        await logScanEvent(
          providerId, 
          'validation', 
          accessResult.reason, 
          accessResult.message
        );
        continue;
      }

      // Provider is allowed
      validatedProviders.push(providerId);
      providersAccepted++;
    }

    console.log(`[phone-intel] Validated providers (${validatedProviders.length}): ${validatedProviders.join(', ')}`);

    // Helper to mark not_configured status (for missing keys at runtime)
    const markNotConfigured = (providerId: string, keyName: string) => {
      console.log(`[phone-intel] Provider ${providerId} skipped: ${keyName} not configured`);
      providerResults[providerId] = { 
        status: 'not_configured', 
        findingsCount: 0, 
        latencyMs: 0,
        message: `Missing ${keyName}`,
        terminal: true,
      };
      logScanEvent(providerId, 'execution', 'not_configured', `API key ${keyName} not configured`);
    };

    // Provider: AbstractAPI Phone
    if (validatedProviders.includes('abstract_phone')) {
      const startTime = Date.now();
      const ABSTRACT_API_KEY = Deno.env.get('ABSTRACTAPI_PHONE_VALIDATION_KEY');
      
      if (!ABSTRACT_API_KEY) {
        markNotConfigured('abstract_phone', 'ABSTRACTAPI_PHONE_VALIDATION_KEY');
      } else {
        try {
          const response = await fetch(
            `https://phoneintelligence.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&phone=${encodeURIComponent(normalizedPhone)}`
          );
          
          if (response.ok) {
            const data = await response.json();
            const latency = Date.now() - startTime;

            // Add null checks to prevent TypeError when accessing nested properties
            const isValid = data?.valid ?? data?.phone_validation?.is_valid ?? false;
            const isVoip = data?.is_voip ?? data?.phone_validation?.is_voip ?? false;
            const lineType = data?.type ?? data?.phone_carrier?.line_type ?? null;
            const carrierName = data?.carrier ?? data?.phone_carrier?.name ?? null;
            const countryName = data?.country?.name ?? data?.phone_location?.country_name ?? null;
            const countryCode = data?.country?.code ?? data?.phone_location?.country_code ?? null;
            const intlFormat = data?.format?.international ?? data?.phone_format?.international ?? normalizedPhone;

            if (isValid) {
              findings.push({
                id: generateFindingId('abstract_phone', 'carrier_intel', normalizedPhone),
                kind: 'phone.carrier',
                type: 'phone_intelligence',
                title: `Carrier: ${carrierName || 'Unknown'} (${lineType || 'unknown'})`,
                description: `Phone validated as ${lineType || 'unknown'} line in ${countryName || 'unknown country'}.`,
                severity: isVoip ? 'low' : 'info',
                confidence: 0.85,
                provider: 'AbstractAPI Phone',
                providerCategory: 'Carrier Intelligence',
                evidence: [
                  { key: 'Phone', value: normalizedPhone },
                  { key: 'Valid', value: String(isValid) },
                  { key: 'Line Type', value: lineType || 'unknown' },
                  { key: 'Carrier', value: carrierName || 'Unknown' },
                  { key: 'Country', value: countryName || 'Unknown' },
                  { key: 'Country Code', value: countryCode || 'Unknown' },
                  { key: 'International Format', value: intlFormat },
                  { key: 'Is VoIP', value: String(!!isVoip) },
                ],
                impact: 'Phone carrier and type identified for verification',
                remediation: [],
                tags: ['phone', 'carrier', lineType || 'unknown'],
                observedAt: new Date().toISOString(),
              });
            }

            providerResults['abstract_phone'] = {
              status: 'success',
              findingsCount: isValid ? 1 : 0,
              latencyMs: latency,
            };
          } else {
            providerResults['abstract_phone'] = {
              status: 'failed',
              findingsCount: 0,
              latencyMs: Date.now() - startTime,
              message: `API returned ${response.status}`,
            };
          }
        } catch (error) {
          console.error('[phone-intel] AbstractAPI error:', error);
          providerResults['abstract_phone'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime, message: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    }

    // Provider: Numverify
    if (validatedProviders.includes('numverify')) {
      const startTime = Date.now();
      const NUMVERIFY_KEY = Deno.env.get('NUMVERIFY_API_KEY');
      
      if (!NUMVERIFY_KEY) {
        markNotConfigured('numverify', 'NUMVERIFY_API_KEY');
      } else {
        try {
          console.log(`[phone-intel] Calling Numverify API for ${normalizedPhone.slice(0, 5)}***`);
          
          // Numverify API call - uses HTTP (not HTTPS) on free tier
          const response = await fetch(
            `http://apilayer.net/api/validate?access_key=${NUMVERIFY_KEY}&number=${encodeURIComponent(normalizedPhone)}&format=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const latency = Date.now() - startTime;
            
            console.log(`[phone-intel] Numverify response:`, JSON.stringify(data));
            
            // Check for API error response
            if (data.error) {
              console.error(`[phone-intel] Numverify API error:`, data.error);
              providerResults['numverify'] = { 
                status: 'failed', 
                findingsCount: 0, 
                latencyMs: latency, 
                message: data.error.info || data.error.type || 'API error' 
              };
              await logScanEvent('numverify', 'execution', 'failed', data.error.info || 'Numverify API error');
            } else if (data.valid) {
              // Create findings from Numverify data
              findings.push({
                id: generateFindingId('numverify', 'carrier_intel', normalizedPhone),
                kind: 'phone.carrier',
                type: 'phone_intelligence',
                title: `Carrier: ${data.carrier || 'Unknown'} (${data.line_type || 'unknown'})`,
                description: `Phone validated as ${data.line_type || 'unknown'} line in ${data.country_name || 'unknown country'}.`,
                severity: 'info',
                confidence: 0.9,
                provider: 'Numverify',
                providerCategory: 'Carrier Intelligence',
                evidence: [
                  { key: 'Phone', value: normalizedPhone },
                  { key: 'Valid', value: String(data.valid) },
                  { key: 'Line Type', value: data.line_type || 'unknown' },
                  { key: 'Carrier', value: data.carrier || 'Unknown' },
                  { key: 'Country', value: data.country_name || 'Unknown' },
                  { key: 'Country Code', value: data.country_code || 'Unknown' },
                  { key: 'Country Prefix', value: data.country_prefix || 'Unknown' },
                  { key: 'Location', value: data.location || 'Unknown' },
                  { key: 'Local Format', value: data.local_format || normalizedPhone },
                  { key: 'International Format', value: data.international_format || normalizedPhone },
                ],
                impact: 'Phone carrier and type identified for verification',
                remediation: [],
                tags: ['phone', 'carrier', data.line_type || 'unknown', 'numverify'],
                observedAt: new Date().toISOString(),
              });

              providerResults['numverify'] = { 
                status: 'success', 
                findingsCount: 1, 
                latencyMs: latency 
              };
              await logScanEvent('numverify', 'execution', 'success');
            } else {
              // Invalid phone number
              providerResults['numverify'] = { 
                status: 'success', 
                findingsCount: 0, 
                latencyMs: latency,
                message: 'Phone number invalid or not found'
              };
              await logScanEvent('numverify', 'execution', 'success', 'Phone invalid');
            }
          } else {
            providerResults['numverify'] = { 
              status: 'failed', 
              findingsCount: 0, 
              latencyMs: Date.now() - startTime, 
              message: `API returned ${response.status}` 
            };
            await logScanEvent('numverify', 'execution', 'failed', `HTTP ${response.status}`);
          }
        } catch (error) {
          console.error('[phone-intel] Numverify error:', error);
          providerResults['numverify'] = { 
            status: 'failed', 
            findingsCount: 0, 
            latencyMs: Date.now() - startTime, 
            message: error instanceof Error ? error.message : 'Unknown error' 
          };
          await logScanEvent('numverify', 'execution', 'failed', error instanceof Error ? error.message : 'Unknown error');
        }
      }
    }

    // Provider: IPQualityScore Phone
    if (validatedProviders.includes('ipqs_phone')) {
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
                kind: 'phone.carrier',
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
                  kind: 'phone.risk',
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
                  kind: 'phone.voip',
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
            providerResults['ipqs_phone'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime, message: `API returned ${response.status}` };
          }
        } catch (error) {
          console.error('[phone-intel] IPQS error:', error);
          providerResults['ipqs_phone'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime, message: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    }

    // Provider: Caller Hint (optional - requires CALLERHINT_API_KEY)
    if (validatedProviders.includes('caller_hint')) {
      const CALLERHINT_KEY = Deno.env.get('CALLERHINT_API_KEY');
      
      if (!CALLERHINT_KEY) {
        markNotConfigured('caller_hint', 'CALLERHINT_API_KEY');
      } else {
        const startTime = Date.now();
        try {
          // Placeholder for actual CallerHint API call
          console.log(`[phone-intel] CallerHint lookup for ${normalizedPhone.slice(0, 5)}***`);
          
          // For now, mark as success with no findings until API is implemented
          providerResults['caller_hint'] = { 
            status: 'success', 
            findingsCount: 0, 
            latencyMs: Date.now() - startTime,
            message: 'API integration pending'
          };
        } catch (error) {
          console.error('[phone-intel] CallerHint error:', error);
          providerResults['caller_hint'] = { status: 'failed', findingsCount: 0, latencyMs: Date.now() - startTime, message: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    }

    // Handle other validated providers - distinguish between "not implemented" and "skipped"
    const implementedProviders = ['abstract_phone', 'ipqs_phone', 'caller_hint', 'numverify'];
    const messagingProviders = ['whatsapp_check', 'telegram_check', 'signal_check'];
    
    for (const providerId of validatedProviders) {
      if (!implementedProviders.includes(providerId) && !providerResults[providerId]) {
        // Check if it's a messaging provider - mark as not_implemented (honest)
        if (messagingProviders.includes(providerId)) {
          console.log(`[phone-intel] Provider ${providerId} is not implemented - no legitimate API available`);
          providerResults[providerId] = { 
            status: 'skipped', 
            findingsCount: 0, 
            latencyMs: 0,
            message: 'Unavailable - no legitimate API',
            terminal: true,
          };
          await logScanEvent(providerId, 'execution', 'not_implemented', 'No legitimate API available for messaging presence detection');
        } else {
          // Other providers - implementation pending
          console.log(`[phone-intel] Provider ${providerId} validated but not yet implemented`);
          providerResults[providerId] = { 
            status: 'skipped', 
            findingsCount: 0, 
            latencyMs: 0,
            message: 'Provider implementation pending',
            terminal: true,
          };
          await logScanEvent(providerId, 'execution', 'skipped', 'Provider not yet implemented');
        }
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

    // Broadcast progress with accurate status mapping
    try {
      const channel = supabase.channel(`scan_progress:${scanId}`);
      for (const [provider, result] of Object.entries(providerResults)) {
        const isTerminal = ['not_configured', 'tier_restricted', 'limit_exceeded', 'skipped'].includes(result.status);
        
        await channel.send({
          type: 'broadcast',
          event: 'provider_update',
          payload: {
            providerId: provider,
            status: result.status,
            message: result.message || (
              result.status === 'success' ? `Found ${result.findingsCount} findings`
              : result.status === 'not_configured' ? 'API key not configured'
              : result.status === 'tier_restricted' ? 'Requires plan upgrade'
              : result.status === 'limit_exceeded' ? 'Provider limit reached'
              : result.status === 'skipped' ? 'Provider skipped'
              : 'Provider error'
            ),
            resultCount: result.findingsCount,
            terminal: isTerminal,
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
        enforcement: {
          userPlan,
          maxProviders: maxProviders === -1 ? 'unlimited' : maxProviders,
          requestedCount: providers.length,
          validatedCount: validatedProviders.length,
        },
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
