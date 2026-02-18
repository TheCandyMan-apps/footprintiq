import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrialMetrics } from '@/hooks/useTrialEmailAnalytics';
import { TrendingUp, Users, Zap } from 'lucide-react';

interface TrialConversionMetricsProps {
  metrics: TrialMetrics | undefined;
  isLoading: boolean;
}

export function TrialConversionMetrics({ metrics, isLoading }: TrialConversionMetricsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No subscription data available for this period
        </CardContent>
      </Card>
    );
  }

  const total = metrics.totalFreeUsers + metrics.totalProUsers;
  const freeBarWidth = total > 0 ? `${(metrics.totalFreeUsers / total) * 100}%` : '0%';
  const proBarWidth = total > 0 ? `${(metrics.totalProUsers / total) * 100}%` : '0%';

  return (
    <div className="space-y-6">
      {/* Subscription Breakdown Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Subscription Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Free Users</span>
              </div>
              <span className="font-semibold">{metrics.totalFreeUsers}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-muted-foreground/40 rounded-full transition-all duration-500"
                style={{ width: freeBarWidth }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Pro Subscribers</span>
              </div>
              <span className="font-semibold">{metrics.totalProUsers}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: proBarWidth }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</p>
              <p className="text-4xl font-bold text-primary">
                {metrics.conversionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Free → Pro
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Pro Subscribers</p>
              <p className="text-4xl font-bold text-green-500">
                {metrics.totalProUsers}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Active paid accounts
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Workspaces</p>
              <p className="text-4xl font-bold text-foreground">
                {total}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.totalFreeUsers} free · {metrics.totalProUsers} pro
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
