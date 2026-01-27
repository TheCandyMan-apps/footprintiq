import { useEffect, useRef, useState, useCallback } from 'react';
import { useWorkspace } from './useWorkspace';
import { getPlan } from '@/lib/billing/tiers';

/**
 * Hook to detect Free → Pro upgrade and trigger unlock transition
 * Stores previous plan in ref to detect changes without page reload
 */
export function useProUnlock() {
  const { workspace } = useWorkspace();
  const [showUnlockTransition, setShowUnlockTransition] = useState(false);
  const previousPlanRef = useRef<string | null>(null);
  const hasShownRef = useRef(false);

  const currentPlan = getPlan((workspace as any)?.plan);

  useEffect(() => {
    // Skip if no workspace yet
    if (!workspace?.id) return;

    const prevPlan = previousPlanRef.current;
    const currentPlanId = currentPlan.id;

    // Detect upgrade from free to pro/business
    if (
      prevPlan === 'free' && 
      (currentPlanId === 'pro' || currentPlanId === 'business') &&
      !hasShownRef.current
    ) {
      setShowUnlockTransition(true);
      hasShownRef.current = true;
    }

    // Update previous plan ref
    previousPlanRef.current = currentPlanId;
  }, [workspace?.id, currentPlan.id]);

  const dismissTransition = useCallback(() => {
    setShowUnlockTransition(false);
  }, []);

  return {
    showUnlockTransition,
    dismissTransition,
    currentPlan,
  };
}
