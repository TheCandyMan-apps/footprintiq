import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileWarning, 
  RefreshCw, 
  TrendingDown, 
  TrendingUp,
  XCircle,
  Zap
} from 'lucide-react';
import { useScanHealthMetrics, ProviderHealthMetric } from '@/hooks/useScanHealthMetrics';

export default function ScanHealth() {
  const [days, setDays] = useState(7);
  const { providers, summary, isLoading, error, refetch } = useScanHealthMetrics(days);

  const getHealthStatus = (metric: ProviderHealthMetric) => {
    if (metric.successRate < 50) return 'critical';
    if (metric.successRate < 80) return 'warning';
    if (metric.emptyRate > 90) return 'empty-concern';
    return 'healthy';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Warning</Badge>;
      case 'empty-concern':
        return <Badge variant="outline" className="border-orange-500/50 text-orange-500">Empty Results</Badge>;
      default:
        return <Badge variant="default" className="bg-green-500/20 text-green-600">Healthy</Badge>;
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return '-';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load scan health metrics: {error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const criticalProviders = providers.filter(p => getHealthStatus(p) === 'critical');
  const warningProviders = providers.filter(p => getHealthStatus(p) === 'warning');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Scan Health Monitor
          </h1>
          <p className="text-muted-foreground">Provider success rates, timeouts, and empty result statistics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24h</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {criticalProviders.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{criticalProviders.length} provider(s)</strong> have critical failure rates: {criticalProviders.map(p => p.provider).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {warningProviders.length > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            <strong>{warningProviders.length} provider(s)</strong> have elevated failure rates: {warningProviders.map(p => p.provider).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Total Provider Calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.totalProviderCalls.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {providers.length} unique providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Success Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">{summary.overallSuccessRate.toFixed(1)}%</p>
              {summary.overallSuccessRate >= 90 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
            <Progress value={summary.overallSuccessRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Timeout Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.overallTimeoutRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              Target: &lt; 5%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-orange-500" />
              Empty Result Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.overallEmptyRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              Successful calls with 0 findings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Provider Health Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Healthy</span>
              </div>
              <span className="font-bold">{summary.healthyProviders}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>With Issues</span>
              </div>
              <span className="font-bold">{summary.providersWithIssues}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Avg Duration</span>
              </div>
              <span className="font-bold">{formatDuration(summary.avgDurationMs)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Empty Result Providers</CardTitle>
            <CardDescription>Providers returning 0 findings most often</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {providers
                .filter(p => p.emptyResults > 0)
                .sort((a, b) => b.emptyRate - a.emptyRate)
                .slice(0, 5)
                .map(p => (
                  <div key={p.provider} className="flex items-center justify-between">
                    <span className="font-mono text-sm">{p.provider}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {p.emptyResults}/{p.successCount}
                      </span>
                      <Badge variant="outline" className="text-orange-500">
                        {p.emptyRate.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              {providers.filter(p => p.emptyResults > 0).length === 0 && (
                <p className="text-sm text-muted-foreground">No empty results recorded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Details</CardTitle>
          <CardDescription>Detailed health metrics for each OSINT provider</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Success</TableHead>
                <TableHead className="text-center">Failed</TableHead>
                <TableHead className="text-center">Timeout</TableHead>
                <TableHead className="text-center">Empty</TableHead>
                <TableHead className="text-center">Success Rate</TableHead>
                <TableHead className="text-center">Avg Duration</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map(metric => {
                const status = getHealthStatus(metric);
                return (
                  <TableRow key={metric.provider} className={status === 'critical' ? 'bg-red-500/5' : ''}>
                    <TableCell className="font-mono font-medium">{metric.provider}</TableCell>
                    <TableCell className="text-center">{metric.totalCount}</TableCell>
                    <TableCell className="text-center text-green-600">{metric.successCount}</TableCell>
                    <TableCell className="text-center text-red-600">{metric.failedCount || '-'}</TableCell>
                    <TableCell className="text-center text-yellow-600">{metric.timeoutCount || '-'}</TableCell>
                    <TableCell className="text-center text-orange-500">{metric.emptyResults || '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Progress 
                          value={metric.successRate} 
                          className="h-2 w-16"
                        />
                        <span className="text-sm">{metric.successRate.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {formatDuration(metric.avgDurationMs)}
                    </TableCell>
                    <TableCell className="text-right">{getStatusBadge(status)}</TableCell>
                  </TableRow>
                );
              })}
              {providers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No scan events found for the selected time period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
