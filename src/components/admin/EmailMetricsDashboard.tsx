import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmailMetrics } from '@/hooks/useTrialEmailAnalytics';
import { Mail, Eye, MousePointerClick, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmailMetricsDashboardProps {
  metrics: EmailMetrics | undefined;
  isLoading: boolean;
}

const formatEmailType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'trial_started': 'Trial Started',
    'trial_ending': 'Trial Ending (24h)',
    'trial_converted': 'Trial Converted',
    'low_credit_warning': 'Low Credit Warning',
  };
  return typeMap[type] || type;
};

const getRateColor = (rate: number, type: 'open' | 'click' | 'bounce'): string => {
  if (type === 'bounce') {
    if (rate < 2) return 'text-green-500';
    if (rate < 5) return 'text-amber-500';
    return 'text-red-500';
  }
  if (type === 'open') {
    if (rate >= 50) return 'text-green-500';
    if (rate >= 30) return 'text-amber-500';
    return 'text-red-500';
  }
  if (type === 'click') {
    if (rate >= 20) return 'text-green-500';
    if (rate >= 10) return 'text-amber-500';
    return 'text-red-500';
  }
  return 'text-muted-foreground';
};

export function EmailMetricsDashboard({ metrics, isLoading }: EmailMetricsDashboardProps) {
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
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics || metrics.totalSent === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No email data available yet. Emails will be tracked once trial notifications are sent.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{metrics.totalSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                <p className={`text-2xl font-bold ${getRateColor(metrics.overallOpenRate, 'open')}`}>
                  {metrics.overallOpenRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <MousePointerClick className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                <p className={`text-2xl font-bold ${getRateColor(metrics.overallClickRate, 'click')}`}>
                  {metrics.overallClickRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                <p className={`text-2xl font-bold ${getRateColor(metrics.overallBounceRate, 'bounce')}`}>
                  {metrics.overallBounceRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Type Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Performance by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.byType.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No trial emails sent yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email Type</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Delivered</TableHead>
                  <TableHead className="text-right">Opened</TableHead>
                  <TableHead className="text-right">Clicked</TableHead>
                  <TableHead className="text-right">Open Rate</TableHead>
                  <TableHead className="text-right">Click Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.byType.map((typeMetrics) => (
                  <TableRow key={typeMetrics.type}>
                    <TableCell>
                      <Badge variant="outline">{formatEmailType(typeMetrics.type)}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{typeMetrics.sent}</TableCell>
                    <TableCell className="text-right">{typeMetrics.delivered}</TableCell>
                    <TableCell className="text-right">{typeMetrics.opened}</TableCell>
                    <TableCell className="text-right">{typeMetrics.clicked}</TableCell>
                    <TableCell className={`text-right font-medium ${getRateColor(typeMetrics.openRate, 'open')}`}>
                      {typeMetrics.openRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getRateColor(typeMetrics.clickRate, 'click')}`}>
                      {typeMetrics.clickRate.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Best Performing Email */}
      {metrics.byType.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Performing Email</p>
                <p className="text-lg font-semibold">
                  {formatEmailType(
                    metrics.byType.reduce((best, current) =>
                      current.clickRate > best.clickRate ? current : best
                    ).type
                  )}
                </p>
              </div>
              <Badge variant="secondary" className="text-green-600 bg-green-500/10">
                Highest Click Rate
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
