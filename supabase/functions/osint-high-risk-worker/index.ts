import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders, ok, bad, allowedOrigin } from '../_shared/secure.ts';
import { normalizePlanTier, hasCapability, type PlanTier } from '../_shared/planCapabilities.ts';

/**
 * High-Risk Intelligence Worker
 * 
 * Provides optional high-risk OSINT enrichment including limited dark web references.
 * 
 * RULES:
 * - Pro+ only (tier gated)
 * - Explicit user opt-in required per scan
 * - Read-only sources only
 * - No monitoring, no alerts, no crawling behind auth
 * - No raw dumps or illegal content surfaced
 * - All outputs pass through LENS AI reduction layer
 */

interface HighRiskRequest {
  scan_id: string;
  entity_type: 'email' | 'username' | 'phone' | 'domain';
  entity_value: string;
  user_opt_in: boolean;
  plan_tier: string;
}

interface HighRiskSignal {
  signal_type: string;
  confidence: number; // 0-1
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  context: string;
  verified: boolean;
  action_required: boolean;
}

interface HighRiskResponse {
  signals: HighRiskSignal[];
  lens_notes: string;
  exposure_score_delta: number;
}

// Simulated high-risk intelligence sources (in production, these would be real API calls)
const HIGH_RISK_SOURCES = [
  { id: 'paste_sites', name: 'Paste Site Aggregator', category: 'leak' },
  { id: 'breach_compilations', name: 'Breach Compilations Index', category: 'breach' },
  { id: 'dark_forum_mentions', name: 'Dark Forum Mentions', category: 'dark_web' },
  { id: 'marketplace_listings', name: 'Marketplace Listings', category: 'dark_web' },
  { id: 'stealer_logs', name: 'Stealer Log References', category: 'malware' },
];

/**
 * Query high-risk sources and normalize signals
 * In production, this would call actual OSINT APIs
 */
async function queryHighRiskSources(
  entityType: string,
  entityValue: string,
  planTier: PlanTier
): Promise<HighRiskSignal[]> {
  const signals: HighRiskSignal[] = [];
  
  console.log(`[high-risk-worker] Querying sources for ${entityType}: ${entityValue}`);
  
  // Simulate checking various high-risk sources
  // In production, this would make actual API calls to:
  // - DeHashed API
  // - IntelX API
  // - Dark web monitoring services
  // - Breach compilation indices
  
  for (const source of HIGH_RISK_SOURCES) {
    try {
      // Simulate API call with some delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate finding a result ~20% of the time for demo purposes
      // In production, this would be actual API responses
      const hasResult = Math.random() < 0.2;
      
      if (hasResult) {
        const signal: HighRiskSignal = {
          signal_type: source.category,
          confidence: 0.4 + Math.random() * 0.4, // 0.4-0.8 range
          risk_level: source.category === 'dark_web' ? 'high' : 'medium',
          summary: generateSanitizedSummary(source.name, entityType),
          context: `Reference found in ${source.name}. Details filtered through LENS AI.`,
          verified: false, // Dark web data is unreliable by default
          action_required: false, // Default to no action unless verified
        };
        
        signals.push(signal);
        console.log(`[high-risk-worker] Signal found from ${source.name}`);
      }
    } catch (error) {
      console.error(`[high-risk-worker] Error querying ${source.name}:`, error);
      // Continue with other sources on error
    }
  }
  
  return signals;
}

/**
 * Generate sanitized, non-fear-inducing summary
 */
function generateSanitizedSummary(sourceName: string, entityType: string): string {
  const summaries: Record<string, string> = {
    'Paste Site Aggregator': `Your ${entityType} may have appeared in a public paste. Consider reviewing your exposure.`,
    'Breach Compilations Index': `Historical breach records may reference this ${entityType}. Age and validity unknown.`,
    'Dark Forum Mentions': `A reference matching this ${entityType} was indexed. Reliability is unverified.`,
    'Marketplace Listings': `An indexed reference was found. This does not confirm active trading.`,
    'Stealer Log References': `Log aggregator reference found. Recommend password rotation as precaution.`,
  };
  
  return summaries[sourceName] || `Reference found in ${sourceName}. Review recommended.`;
}

/**
 * Apply LENS AI reduction layer to filter and contextualize signals
 */
async function applyLensReduction(
  signals: HighRiskSignal[],
  planTier: PlanTier
): Promise<{ filteredSignals: HighRiskSignal[]; lensNotes: string; scoreDelta: number }> {
  console.log(`[high-risk-worker] Applying LENS reduction to ${signals.length} signals`);
  
  // Filter low-confidence signals
  const filteredSignals = signals.filter(s => s.confidence >= 0.5);
  
  // Downplay low-confidence signals, escalate high-confidence with calm language
  const processedSignals = filteredSignals.map(signal => {
    if (signal.confidence < 0.6) {
      return {
        ...signal,
        summary: `(Low confidence) ${signal.summary}`,
        action_required: false,
      };
    }
    
    if (signal.confidence >= 0.75 && signal.risk_level === 'high') {
      return {
        ...signal,
        action_required: true,
        context: `${signal.context} We recommend reviewing this finding.`,
      };
    }
    
    return signal;
  });
  
  // Generate LENS notes
  const highConfidenceCount = processedSignals.filter(s => s.confidence >= 0.7).length;
  const actionRequiredCount = processedSignals.filter(s => s.action_required).length;
  
  let lensNotes = 'High-Risk Intelligence scan complete. ';
  
  if (processedSignals.length === 0) {
    lensNotes += 'No significant signals detected. Your exposure appears minimal in monitored sources.';
  } else if (highConfidenceCount === 0) {
    lensNotes += `${processedSignals.length} low-confidence signals found. These are informational and may not require action.`;
  } else if (actionRequiredCount > 0) {
    lensNotes += `${actionRequiredCount} finding(s) warrant review. LENS has filtered out unreliable data.`;
  } else {
    lensNotes += `${processedSignals.length} signals analyzed. No immediate action required.`;
  }
  
  // Calculate exposure score delta based on findings
  let scoreDelta = 0;
  for (const signal of processedSignals) {
    if (signal.verified) {
      scoreDelta += signal.risk_level === 'critical' ? 25 : 
                   signal.risk_level === 'high' ? 15 : 
                   signal.risk_level === 'medium' ? 8 : 3;
    } else {
      // Unverified signals have reduced impact
      scoreDelta += signal.confidence >= 0.7 ? 5 : 2;
    }
  }
  
  return {
    filteredSignals: processedSignals,
    lensNotes,
    scoreDelta: Math.min(scoreDelta, 50), // Cap at 50 points
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return bad(405, 'method_not_allowed');
  }

  if (!allowedOrigin(req)) {
    return bad(403, 'forbidden');
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return bad(401, 'missing_authorization_header');
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return bad(401, 'invalid_or_expired_token');
    }

    const body: HighRiskRequest = await req.json();
    const { scan_id, entity_type, entity_value, user_opt_in, plan_tier } = body;

    console.log('[high-risk-worker] Request received:', {
      scan_id,
      entity_type,
      user_opt_in,
      plan_tier,
    });

    // Validate required fields
    if (!scan_id || !entity_type || !entity_value) {
      return bad(400, 'missing_required_fields');
    }

    // CRITICAL: Check user opt-in
    if (!user_opt_in) {
      console.log('[high-risk-worker] User has not opted in to high-risk intelligence');
      return ok({
        signals: [],
        lens_notes: 'High-Risk Intelligence not enabled for this scan.',
        exposure_score_delta: 0,
      });
    }

    // CRITICAL: Enforce Pro+ tier requirement
    const normalizedTier = normalizePlanTier(plan_tier);
    if (normalizedTier === 'free') {
      console.log('[high-risk-worker] Free tier user attempted high-risk scan');
      return bad(403, 'High-Risk Intelligence requires Pro or Business plan');
    }

    // Check capability
    if (!hasCapability(normalizedTier, 'darkWebMonitoring')) {
      console.log('[high-risk-worker] User lacks darkWebMonitoring capability');
      return bad(403, 'Your plan does not include High-Risk Intelligence');
    }

    // Query high-risk sources
    const rawSignals = await queryHighRiskSources(entity_type, entity_value, normalizedTier);
    console.log(`[high-risk-worker] Raw signals found: ${rawSignals.length}`);

    // Apply LENS AI reduction layer
    const { filteredSignals, lensNotes, scoreDelta } = await applyLensReduction(rawSignals, normalizedTier);
    console.log(`[high-risk-worker] Filtered signals: ${filteredSignals.length}, Score delta: ${scoreDelta}`);

    // Store results in database
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store high-risk signals as findings
    if (filteredSignals.length > 0) {
      const findingsToInsert = filteredSignals.map(signal => ({
        scan_id,
        user_id: user.id,
        provider: 'osint-high-risk-worker',
        kind: `high_risk_${signal.signal_type}`,
        severity: signal.risk_level,
        confidence: signal.confidence,
        site: signal.signal_type,
        status: signal.verified ? 'verified' : 'unverified',
        evidence: {
          summary: signal.summary,
          context: signal.context,
          action_required: signal.action_required,
          lens_processed: true,
        },
        meta: {
          source: 'high-risk-intelligence',
          tier_required: 'pro',
        },
      }));

      const { error: insertError } = await supabaseService
        .from('findings')
        .insert(findingsToInsert);

      if (insertError) {
        console.error('[high-risk-worker] Error storing findings:', insertError);
      } else {
        console.log(`[high-risk-worker] Stored ${findingsToInsert.length} findings`);
      }
    }

    // Update scan metadata with LENS notes
    await supabaseService
      .from('scans')
      .update({
        provider_counts: {
          high_risk_intelligence: {
            signals_found: rawSignals.length,
            signals_filtered: filteredSignals.length,
            score_delta: scoreDelta,
          },
        },
      })
      .eq('id', scan_id);

    const response: HighRiskResponse = {
      signals: filteredSignals,
      lens_notes: lensNotes,
      exposure_score_delta: scoreDelta,
    };

    return ok(response);

  } catch (error) {
    console.error('[high-risk-worker] Unexpected error:', error);
    return bad(500, error instanceof Error ? error.message : 'Unknown error');
  }
});
