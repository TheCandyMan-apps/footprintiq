/**
 * useResultsViewModel Hook
 * 
 * Wraps buildResultsViewModel with subscription awareness.
 * Provides a reactive view model that updates when plan changes.
 */

import { useMemo } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { normalizePlanTier, type PlanTier } from '@/lib/billing/planCapabilities';
import {
  buildResultsViewModel,
  type ResultsViewModel,
  type RiskSnapshot,
  type ViewModelBucket,
  type ConnectionsViewModel,
  shouldShowConfidenceDetails,
  getFeatureUpgradePrompt,
} from '@/lib/results/resultsViewModel';

export interface UseResultsViewModelReturn {
  /** The transformed view model */
  viewModel: ResultsViewModel;
  /** Current plan tier */
  plan: PlanTier;
  /** Whether user has full access (Pro/Business) */
  isFullAccess: boolean;
  /** Risk snapshot */
  riskSnapshot: RiskSnapshot;
  /** Buckets with redaction applied */
  buckets: ResultsViewModel['buckets'];
  /** Connections view model */
  connections: ConnectionsViewModel;
  /** Helper: should show confidence details */
  showConfidence: boolean;
  /** Helper: get upgrade prompt for feature */
  getUpgradePrompt: (feature: string) => string;
  /** Whether data is loading */
  isLoading: boolean;
}

/**
 * Hook to get plan-aware results view model
 * 
 * @param rawResults - Raw scan results from the database
 * @returns View model with appropriate redaction for user's plan
 */
export function useResultsViewModel(rawResults: any[]): UseResultsViewModelReturn {
  const { subscriptionTier, isLoading } = useSubscription();
  
  const plan = useMemo(() => normalizePlanTier(subscriptionTier), [subscriptionTier]);
  
  const viewModel = useMemo(() => {
    return buildResultsViewModel(rawResults, plan);
  }, [rawResults, plan]);
  
  const showConfidence = useMemo(() => shouldShowConfidenceDetails(plan), [plan]);
  
  return {
    viewModel,
    plan,
    isFullAccess: viewModel.isFullAccess,
    riskSnapshot: viewModel.riskSnapshot,
    buckets: viewModel.buckets,
    connections: viewModel.connections,
    showConfidence,
    getUpgradePrompt: getFeatureUpgradePrompt,
    isLoading,
  };
}

/**
 * Hook to check if a specific bucket has hidden items
 */
export function useBucketRedaction(bucket: ViewModelBucket) {
  return useMemo(() => ({
    hasHidden: bucket.hiddenCount > 0,
    hiddenCount: bucket.hiddenCount,
    upgradePrompt: bucket.upgradePrompt,
    visibleCount: bucket.items.length,
    totalCount: bucket.totalCount,
  }), [bucket]);
}

/**
 * Hook to check connections graph redaction status
 */
export function useConnectionsRedaction(connections: ConnectionsViewModel) {
  return useMemo(() => ({
    isLocked: connections.isPartiallyLocked,
    lockedCount: connections.totalNodes - connections.visibleNodes.length,
    upgradePrompt: connections.upgradePrompt,
    visibleNodes: connections.visibleNodes.filter(n => !n.isLocked),
    blurredNodes: connections.visibleNodes.filter(n => n.isLocked),
  }), [connections]);
}
