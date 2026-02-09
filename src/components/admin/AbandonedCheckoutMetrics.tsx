import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AbandonedCheckoutMetrics as Metrics } from '@/hooks/useAbandonedCheckouts';
import { ShoppingCart, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AbandonedCheckoutMetricsProps {
  metrics: Metrics | undefined;
  isLoading: boolean;
}

export function AbandonedCheckoutMetrics({ metrics, isLoading }: AbandonedCheckoutMetricsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-32 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No checkout data available for this period
        </CardContent>
      </Card>
    );
  }

  const hasData = metrics.totalInitiated > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Checkouts Started</p>
                <p className="text-2xl font-bold">{metrics.totalInitiated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-500">{metrics.totalCompleted}</p>
                {hasData && (
                  <p className="text-xs text-muted-foreground">{metrics.completionRate.toFixed(1)}%</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abandoned</p>
                <p className="text-2xl font-bold text-red-500">{metrics.totalAbandoned}</p>
                {hasData && (
                  <p className="text-xs text-muted-foreground">{metrics.abandonmentRate.toFixed(1)}%</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-500">{metrics.totalPending}</p>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel by Plan */}
      {metrics.byPlan.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Checkout Funnel by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.byPlan.map(p => (
                <div key={p.plan} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{p.plan}</Badge>
                      <span className="text-muted-foreground">
                        {p.initiated} started → {p.completed} completed
                      </span>
                    </div>
                    <span className="font-semibold">
                      {p.completionRate.toFixed(0)}% conversion
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-green-500 rounded-l-full transition-all"
                      style={{ width: `${p.completionRate}%` }}
                    />
                    <div
                      className="h-full bg-red-400 transition-all"
                      style={{ width: `${p.initiated > 0 ? ((p.abandoned / p.initiated) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Abandoned */}
      {metrics.recentAbandoned.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Recent Incomplete Checkouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentAbandoned.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={session.status === 'expired' ? 'destructive' : 'secondary'}
                      className="capitalize text-xs"
                    >
                      {session.status}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium capitalize">{session.plan} plan</p>
                      <p className="text-xs text-muted-foreground">
                        {(session.metadata as Record<string, string>)?.customer_email || 'Unknown user'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!hasData && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            <ShoppingCart className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No checkout sessions recorded yet</p>
            <p className="text-sm mt-1">
              Checkout tracking is now active. Data will appear as users initiate purchases.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
