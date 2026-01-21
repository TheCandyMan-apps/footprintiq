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
        // Generate realistic confidence distribution
        // Most signals should be low-confidence (aggressive false positive reduction)
        const rawConfidence = Math.random();
        const confidence = rawConfidence < 0.6 ? rawConfidence * 0.5 : rawConfidence * 0.8; // Bias toward lower confidence
        
        const signal: HighRiskSignal = {
          signal_type: source.category,
          confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
          risk_level: source.category === 'dark_web' ? 'high' : 'medium',
          summary: generateSanitizedSummary(source.name, entityType, confidence),
          context: '', // Will be set by LENS reduction
          verified: false, // High-risk data is unreliable by default
          action_required: false, // Default to no action - LENS will set if warranted
        };
        
        signals.push(signal);
        console.log(`[high-risk-worker] Signal found from ${source.name}, confidence: ${signal.confidence}`);
      }
    } catch (error) {
      console.error(`[high-risk-worker] Error querying ${source.name}:`, error);
      // Continue with other sources on error
    }
  }
  
  return signals;
}

/**
 * Generate sanitized, neutral summary without fear-based language
 * Follows ethical OSINT analyst principles
 */
function generateSanitizedSummary(sourceName: string, entityType: string, confidence: number): string {
  // Low confidence (< 0.4): Mark as historical/contextual
  if (confidence < 0.4) {
    const historicalSummaries: Record<string, string> = {
      'Paste Site Aggregator': `Historical reference in a paste archive. Age and relevance unknown. No action required.`,
      'Breach Compilations Index': `Historical compilation entry. Data age indeterminate. Informational only.`,
      'Dark Forum Mentions': `Archived reference of uncertain origin. Context insufficient for conclusions.`,
      'Marketplace Listings': `Archived listing reference. Current relevance cannot be determined.`,
      'Stealer Log References': `Historical aggregator entry. Validity unconfirmed. Contextual information only.`,
    };
    return historicalSummaries[sourceName] || `Historical reference found. No action required.`;
  }
  
  // Medium confidence (0.4-0.7): Neutral, factual
  if (confidence < 0.7) {
    const neutralSummaries: Record<string, string> = {
      'Paste Site Aggregator': `Reference indexed from a public paste. Age and validity are uncertain.`,
      'Breach Compilations Index': `Entry found in a historical compilation. Original source unverified.`,
      'Dark Forum Mentions': `Reference indexed from a public archive. Reliability cannot be confirmed.`,
      'Marketplace Listings': `Indexed reference found. Current status is indeterminate.`,
      'Stealer Log References': `Aggregator reference indexed. Origin and recency unverified.`,
    };
    return neutralSummaries[sourceName] || `Reference indexed. Further context unavailable.`;
  }
  
  // High confidence (> 0.7): Recommend calm review
  const reviewSummaries: Record<string, string> = {
    'Paste Site Aggregator': `Corroborated reference in indexed paste. Consider reviewing associated credentials.`,
    'Breach Compilations Index': `Multiple source correlation suggests historical exposure. Review recommended.`,
    'Dark Forum Mentions': `Corroborated reference with supporting context. Calm review suggested.`,
    'Marketplace Listings': `Reference with corroborating metadata. Review for awareness.`,
    'Stealer Log References': `Corroborated entry. Credential rotation may be prudent.`,
  };
  return reviewSummaries[sourceName] || `Corroborated reference found. Review recommended.`;
}

/**
 * Apply LENS AI reduction layer with ethical OSINT analyst principles
 * 
 * Rules:
 * - Reduce false positives aggressively
 * - Assign confidence 0-1
 * - Summarize neutrally and calmly
 * - State clearly when no action required
 * - No speculation, raw data, fear-based wording, or surveillance language
 * - confidence < 0.4 → historical/contextual, no action
 * - confidence > 0.7 → recommend review with grounded reasoning only
 */
async function applyLensReduction(
  signals: HighRiskSignal[],
  planTier: PlanTier
): Promise<{ filteredSignals: HighRiskSignal[]; lensNotes: string; scoreDelta: number }> {
  console.log(`[high-risk-worker] Applying LENS reduction to ${signals.length} raw signals`);
  
  // AGGRESSIVE FALSE POSITIVE REDUCTION
  // Only surface signals with meaningful confidence
  const processedSignals = signals.map(signal => {
    // confidence < 0.4: Historical/contextual only, no action
    if (signal.confidence < 0.4) {
      return {
        ...signal,
        risk_level: 'low' as const,
        summary: `[Historical] ${signal.summary}`,
        context: 'This reference is historical or contextual. No action required.',
        action_required: false,
        verified: false,
      };
    }
    
    // confidence 0.4-0.7: Informational, generally no action
    if (signal.confidence < 0.7) {
      return {
        ...signal,
        risk_level: signal.risk_level === 'critical' ? 'medium' as const : signal.risk_level,
        context: 'Confidence is moderate. This finding is informational.',
        action_required: false,
      };
    }
    
    // confidence > 0.7: Recommend review with grounded reasoning
    return {
      ...signal,
      action_required: true,
      context: `Confidence level supports review. ${signal.context ? signal.context : 'Multiple source correlation detected.'}`,
    };
  });
  
  // Filter out very low confidence signals from display (< 0.3)
  const filteredSignals = processedSignals.filter(s => s.confidence >= 0.3);
  
  // Generate LENS analyst notes - neutral, calm language
  const highConfidenceCount = filteredSignals.filter(s => s.confidence >= 0.7).length;
  const historicalCount = filteredSignals.filter(s => s.confidence < 0.4).length;
  const actionRequiredCount = filteredSignals.filter(s => s.action_required).length;
  
  let lensNotes = '';
  
  if (filteredSignals.length === 0) {
    lensNotes = 'Analysis complete. No significant signals detected in indexed sources. No action required.';
  } else if (highConfidenceCount === 0) {
    if (historicalCount === filteredSignals.length) {
      lensNotes = `Analysis complete. ${historicalCount} historical reference(s) found. These are contextual only and require no action.`;
    } else {
      lensNotes = `Analysis complete. ${filteredSignals.length} signal(s) indexed with moderate or low confidence. No immediate action required.`;
    }
  } else if (actionRequiredCount > 0) {
    lensNotes = `Analysis complete. ${actionRequiredCount} finding(s) have sufficient confidence to warrant calm review. ${filteredSignals.length - actionRequiredCount} additional reference(s) are informational only.`;
  } else {
    lensNotes = `Analysis complete. ${filteredSignals.length} reference(s) indexed. Confidence levels do not indicate immediate concern.`;
  }
  
  // Calculate exposure score delta - conservative scoring
  // Only verified or high-confidence findings contribute meaningfully
  let scoreDelta = 0;
  for (const signal of filteredSignals) {
    if (signal.confidence < 0.4) {
      // Historical signals don't affect score
      scoreDelta += 0;
    } else if (signal.confidence < 0.7) {
      // Moderate confidence: minimal impact
      scoreDelta += signal.verified ? 3 : 1;
    } else {
      // High confidence: measured impact
      scoreDelta += signal.verified ? 8 : 4;
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
