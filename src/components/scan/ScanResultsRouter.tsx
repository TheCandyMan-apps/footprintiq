/**
 * ScanResultsRouter Component
 * 
 * Hard routing component that determines which results page to render
 * based on user's subscription tier.
 * 
 * CRITICAL: This enforces complete separation between Free and Advanced UI.
 * - Free users NEVER mount AdvancedResultsPage
 * - Pro/Business/Admin users NEVER mount FreeResultsPage
 */

import { lazy, Suspense, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { TabSkeleton } from './results-tabs/TabSkeleton';
import { AccountsTabSkeleton } from './results-tabs/accounts/AccountsTabSkeleton';

// Lazy load both page components to ensure unused code is not bundled
const FreeResultsPage = lazy(() => import('./FreeResultsPage'));
const AdvancedResultsPage = lazy(() => import('./AdvancedResultsPage'));

interface ScanResultsRouterProps {
  jobId: string;
}

/**
 * Determines user tier for routing decisions
 * Returns 'free' for free users, 'advanced' for all paid tiers
 */
function useUserTier(): 'free' | 'advanced' | 'loading' {
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { subscriptionTier, isLoading: subscriptionLoading } = useSubscription();
  
  return useMemo(() => {
    // Show loading state while fetching
    if (workspaceLoading || subscriptionLoading) {
      return 'loading';
    }
    
    // Check workspace plan first (primary source)
    const workspacePlan = (workspace?.plan || '').toLowerCase();
    
    // Check subscription tier as fallback
    const subTier = (subscriptionTier || 'free').toLowerCase();
    
    // Combine for final determination
    const effectiveTier = workspacePlan || subTier;
    
    // Advanced plans get full UI
    const advancedPlans = [
      'pro', 
      'business', 
      'enterprise', 
      'admin',
      // Legacy tier names (normalized to pro/business)
      'premium', 
      'analyst', 
      'family'
    ];
    
    if (advancedPlans.includes(effectiveTier)) {
      return 'advanced';
    }
    
    // Default to free
    return 'free';
  }, [workspace?.plan, subscriptionTier, workspaceLoading, subscriptionLoading]);
}

export function ScanResultsRouter({ jobId }: ScanResultsRouterProps) {
  const userTier = useUserTier();
  
  // Loading state while determining tier
  if (userTier === 'loading') {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading your results...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Hard routing based on tier
  // CRITICAL: Only ONE component is ever mounted - they are never both loaded
  return (
    <Suspense fallback={<AccountsTabSkeleton />}>
      {userTier === 'free' ? (
        <FreeResultsPage jobId={jobId} />
      ) : (
        <AdvancedResultsPage jobId={jobId} />
      )}
    </Suspense>
  );
}

export default ScanResultsRouter;
