import { lazy, Suspense, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { normalizePlanTier } from '@/lib/billing/planCapabilities';
import FreeResultsPage from '@/components/scan/FreeResultsPage';

// IMPORTANT: AdvancedResultsPage is lazy-loaded so it is never imported/evaluated for Free users.
const AdvancedResultsPage = lazy(() => import('@/components/scan/AdvancedResultsPage'));

/**
 * ResultsDetail (route entry): /results/:scanId
 *
 * HARD ROUTING SPLIT (early return):
 * - Free users: ONLY mount FreeResultsPage
 * - Pro/Admin (and other paid tiers): ONLY mount AdvancedResultsPage
 *
 * This file must remain a thin route entry and must NOT import any heavy/advanced results children.
 */
export default function ResultsDetail() {
  const { scanId } = useParams();
  const { subscriptionTier: rawSubscriptionTier, isLoading: subscriptionLoading } = useSubscription();

  const plan = useMemo(() => {
    // Map enterprise -> business for internal normalization
    const normalized = normalizePlanTier(rawSubscriptionTier === 'enterprise' ? 'business' : rawSubscriptionTier);
    return normalized || 'free';
  }, [rawSubscriptionTier]);

  if (!scanId) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">Invalid scan ID</CardContent>
      </Card>
    );
  }

  if (subscriptionLoading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // EARLY RETURN HARD SPLIT (required)
  if (plan === 'free') {
    return <FreeResultsPage jobId={scanId} />;
  }

  return (
    <Suspense
      fallback={
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      }
    >
      <AdvancedResultsPage jobId={scanId} />
    </Suspense>
  );
}
