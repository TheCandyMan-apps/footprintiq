import { lazy, Suspense, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { normalizePlanTier } from '@/lib/billing/planCapabilities';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">Invalid scan ID</CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // EARLY RETURN HARD SPLIT (required)
  if (plan === 'free') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <FreeResultsPage jobId={scanId} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Card className="rounded-2xl shadow-sm">
                <CardContent className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            </div>
          }
        >
          <AdvancedResultsPage jobId={scanId} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
