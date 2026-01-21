import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTierGating } from './useTierGating';

interface HighRiskSignal {
  signal_type: string;
  confidence: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  context: string;
  verified: boolean;
  action_required: boolean;
}

interface HighRiskResult {
  signals: HighRiskSignal[];
  lens_notes: string;
  exposure_score_delta: number;
}

interface UseHighRiskIntelligenceReturn {
  optedIn: boolean;
  setOptedIn: (value: boolean) => void;
  loading: boolean;
  error: string | null;
  result: HighRiskResult | null;
  runHighRiskScan: (params: {
    scanId: string;
    entityType: 'email' | 'username' | 'phone' | 'domain';
    entityValue: string;
  }) => Promise<HighRiskResult | null>;
  canAccess: boolean;
}

/**
 * Hook for managing High-Risk Intelligence scans
 * Handles opt-in state, tier gating, and API calls
 */
export function useHighRiskIntelligence(): UseHighRiskIntelligenceReturn {
  const [optedIn, setOptedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HighRiskResult | null>(null);
  const { isPro, isBusiness, subscriptionTier } = useTierGating();

  const canAccess = isPro || isBusiness;

  const runHighRiskScan = useCallback(async (params: {
    scanId: string;
    entityType: 'email' | 'username' | 'phone' | 'domain';
    entityValue: string;
  }): Promise<HighRiskResult | null> => {
    if (!optedIn || !canAccess) {
      console.log('[useHighRiskIntelligence] Skipping - optedIn:', optedIn, 'canAccess:', canAccess);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        'osint-high-risk-worker',
        {
          body: {
            scan_id: params.scanId,
            entity_type: params.entityType,
            entity_value: params.entityValue,
            user_opt_in: true,
            plan_tier: subscriptionTier,
          },
        }
      );

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const highRiskResult: HighRiskResult = {
        signals: data.signals || [],
        lens_notes: data.lens_notes || 'Scan complete.',
        exposure_score_delta: data.exposure_score_delta || 0,
      };

      setResult(highRiskResult);
      console.log('[useHighRiskIntelligence] Scan complete:', highRiskResult);
      return highRiskResult;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run high-risk scan';
      console.error('[useHighRiskIntelligence] Error:', message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [optedIn, canAccess, subscriptionTier]);

  return {
    optedIn,
    setOptedIn,
    loading,
    error,
    result,
    runHighRiskScan,
    canAccess,
  };
}
