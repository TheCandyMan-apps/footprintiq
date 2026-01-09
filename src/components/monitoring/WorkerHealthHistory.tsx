import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkerHealthLogs, WorkerHealthLog } from '@/hooks/useWorkerHealthLogs';
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Clock,
  TrendingUp,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = 'default' 
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}) {
  const variantStyles = {
    default: 'bg-card border',
    success: 'bg-success/10 border-success/20',
    warning: 'bg-warning/10 border-warning/20',
    destructive: 'bg-destructive/10 border-destructive/20',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  return (
    <div className={`p-4 rounded-lg border ${variantStyles[variant]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${iconStyles[variant]}`} />
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      )}
    </div>
  );
}

function HealthLogRow({ log }: { log: WorkerHealthLog }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-3">
        {log.healthy ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
        <div>
          <div className="text-sm font-medium">
            {log.healthy ? 'Healthy' : 'Unhealthy'}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(log.checked_at), 'MMM d, HH:mm:ss')}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {log.response_time_ms && (
          <Badge variant="outline" className="text-xs">
            {log.response_time_ms}ms
          </Badge>
        )}
        {log.error_message && (
          <span className="text-xs text-destructive max-w-[200px] truncate">
            {log.error_message}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(log.checked_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

export function WorkerHealthHistory() {
  const { logs, metrics, loading, error, refresh } = useWorkerHealthLogs();

  const getUptimeVariant = (uptime: number): 'success' | 'warning' | 'destructive' => {
    if (uptime >= 99) return 'success';
    if (uptime >= 95) return 'warning';
    return 'destructive';
  };

  if (loading && logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Worker Health History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Worker Health History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
            <p>{error}</p>
            <Button onClick={refresh} variant="outline" size="sm" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Worker Health History
            </CardTitle>
            <CardDescription>
              Historical health data from n8n monitoring workflow
            </CardDescription>
          </div>
          <Button onClick={refresh} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Uptime"
            value={`${metrics.uptime.toFixed(1)}%`}
            subtitle={`${metrics.totalChecks} total checks`}
            icon={TrendingUp}
            variant={getUptimeVariant(metrics.uptime)}
          />
          <MetricCard
            title="Avg Response"
            value={`${metrics.avgResponseTime}ms`}
            subtitle="Response time"
            icon={Zap}
            variant={metrics.avgResponseTime < 1000 ? 'success' : 'warning'}
          />
          <MetricCard
            title="Failed Checks"
            value={metrics.failedChecks}
            subtitle={`of ${metrics.totalChecks} total`}
            icon={XCircle}
            variant={metrics.failedChecks === 0 ? 'success' : 'destructive'}
          />
          <MetricCard
            title="Consecutive Failures"
            value={metrics.consecutiveFailures}
            subtitle={metrics.consecutiveFailures >= 3 ? 'Alert threshold reached' : 'Within threshold'}
            icon={AlertTriangle}
            variant={metrics.consecutiveFailures >= 3 ? 'destructive' : metrics.consecutiveFailures > 0 ? 'warning' : 'success'}
          />
        </div>

        {/* Uptime Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uptime (last {metrics.totalChecks} checks)</span>
            <span className="font-medium">{metrics.uptime.toFixed(1)}%</span>
          </div>
          <Progress value={metrics.uptime} className="h-2" />
        </div>

        {/* Last Status */}
        <div className="flex gap-4 text-sm">
          {metrics.lastHealthy && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-muted-foreground">Last healthy:</span>
              <span>{formatDistanceToNow(new Date(metrics.lastHealthy), { addSuffix: true })}</span>
            </div>
          )}
          {metrics.lastUnhealthy && (
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-muted-foreground">Last failure:</span>
              <span>{formatDistanceToNow(new Date(metrics.lastUnhealthy), { addSuffix: true })}</span>
            </div>
          )}
        </div>

        {/* Recent Logs */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Health Checks
          </h4>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No health check logs yet</p>
              <p className="text-xs mt-1">Logs will appear once n8n starts sending health data</p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {logs.slice(0, 20).map((log) => (
                <HealthLogRow key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
