import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrialMetrics } from '@/hooks/useTrialEmailAnalytics';
import { TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TrialConversionMetricsProps {
  metrics: TrialMetrics | undefined;
  isLoading: boolean;
}

export function TrialConversionMetrics({ metrics, isLoading }: TrialConversionMetricsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </CardContent>
        </Card>
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
          No trial data available for this period
        </CardContent>
      </Card>
    );
  }

  // Show a clean zero-state when there's data object but no trials
  const hasAnyData = metrics.totalTrialsStarted > 0;

  const maxValue = Math.max(
    metrics.totalTrialsStarted,
    metrics.activeTrials,
    metrics.convertedTrials,
    metrics.cancelledTrials,
    1
  );

  const getBarWidth = (value: number) => `${Math.max((value / maxValue) * 100, 2)}%`;

  const funnelItems = [
    { label: 'Trials Started', value: metrics.totalTrialsStarted, color: 'bg-blue-500', icon: Users },
    { label: 'Currently Active', value: metrics.activeTrials, color: 'bg-amber-500', icon: Clock },
    { label: 'Converted to Pro', value: metrics.convertedTrials, color: 'bg-green-500', icon: CheckCircle },
    { label: 'Cancelled', value: metrics.cancelledTrials, color: 'bg-red-500', icon: XCircle },
    { label: 'Expired', value: metrics.expiredTrials, color: 'bg-gray-500', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trial Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {funnelItems.map((item, index) => {
            const Icon = item.icon;
            const percentage = metrics.totalTrialsStarted > 0 && index > 0
              ? ((item.value / metrics.totalTrialsStarted) * 100).toFixed(1)
              : null;

            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${item.color.replace('bg-', 'text-')}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.value}</span>
                    {percentage && (
                      <span className="text-muted-foreground">({percentage}%)</span>
                    )}
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: getBarWidth(item.value) }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</p>
              <p className="text-4xl font-bold text-green-500">
                {metrics.conversionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.convertedTrials} of {metrics.totalTrialsStarted} trials
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Avg Scans Used</p>
              <p className="text-4xl font-bold text-primary">
                {metrics.avgScansUsed.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                of 3 available per trial
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Churn Rate</p>
              <p className="text-4xl font-bold text-red-500">
                {metrics.totalTrialsStarted > 0
                  ? ((metrics.cancelledTrials / metrics.totalTrialsStarted) * 100).toFixed(1)
                  : '0.0'}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.cancelledTrials} cancelled
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
