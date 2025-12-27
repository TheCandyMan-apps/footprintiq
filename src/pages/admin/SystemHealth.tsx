import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, AlertCircle, AlertTriangle, Activity, Database, Globe, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function SystemHealth() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      // Use fetch directly to handle non-2xx responses with valid data
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      
      const data = await response.json();
      
      // Accept 200, 207 (degraded), 503 (unhealthy) - all contain valid health data
      if (data && 'status' in data) {
        return data;
      }
      
      throw new Error(data?.error || 'Failed to fetch health status');
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    retry: 1,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warn':
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case 'warn':
      case 'degraded':
        return <Badge variant="default" className="bg-yellow-500">Degraded</Badge>;
      default:
        return <Badge variant="destructive">Unhealthy</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Checking system health...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Health</h1>
            <p className="text-muted-foreground">Real-time platform monitoring</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <div className="space-y-2">
                <p className="font-medium text-destructive">Unable to Load System Health</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {error instanceof Error ? error.message : 'Connection to health check service failed. This may be a temporary issue.'}
                </p>
              </div>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Show partial status when health check fails */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Status Overview</CardTitle>
            <CardDescription>Limited data available while health check is unavailable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span>Database: Unknown</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>OSINT Workers: Unknown</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span>Edge Functions: Unknown</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Real-time platform monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(data?.status)}
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(data?.status)}
              <div>
                <CardTitle>Overall Status</CardTitle>
                <CardDescription>
                  Last checked: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Never'}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(data?.status)}
          </div>
        </CardHeader>
      </Card>

      {/* Component Health Checks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5" />
              <div className="flex-1">
                <CardTitle className="text-lg">Database</CardTitle>
                <CardDescription>PostgreSQL Connection</CardDescription>
              </div>
              {getStatusIcon(data?.checks?.database?.status)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">{data?.checks?.database?.message}</p>
            {data?.checks?.database?.latency_ms !== undefined && (
              <p className="text-xs text-muted-foreground">
                Latency: {data.checks.database.latency_ms}ms
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5" />
              <div className="flex-1">
                <CardTitle className="text-lg">OSINT Workers</CardTitle>
                <CardDescription>External Providers</CardDescription>
              </div>
              {getStatusIcon(data?.checks?.osint_workers?.status)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">{data?.checks?.osint_workers?.message}</p>
            {data?.checks?.osint_workers?.details && (
              <div className="space-y-1 mt-2">
                {data.checks.osint_workers.details.map((worker: any) => (
                  <div key={worker.worker} className="flex items-center justify-between text-xs">
                    <span className="capitalize">{worker.worker}</span>
                    {worker.ok ? (
                      <Badge variant="outline" className="text-green-500">Online</Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-500">Offline</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
            {data?.checks?.osint_workers?.latency_ms !== undefined && (
              <p className="text-xs text-muted-foreground mt-2">
                Latency: {data.checks.osint_workers.latency_ms}ms
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5" />
              <div className="flex-1">
                <CardTitle className="text-lg">Edge Functions</CardTitle>
                <CardDescription>Serverless Compute</CardDescription>
              </div>
              {getStatusIcon(data?.checks?.edge_functions?.status)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">{data?.checks?.edge_functions?.message}</p>
            {data?.checks?.edge_functions?.latency_ms !== undefined && (
              <p className="text-xs text-muted-foreground">
                Latency: {data.checks.edge_functions.latency_ms}ms
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
          <CardDescription>Performance indicators from the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Pending Scans</span>
              <span className="text-2xl font-bold">{data?.metrics?.pending_scans || 0}</span>
            </div>
            <Progress 
              value={Math.min((data?.metrics?.pending_scans || 0) / 10 * 100, 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {data?.metrics?.pending_scans > 5 ? 'High queue depth' : 'Normal queue depth'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Avg Scan Time</span>
              <span className="text-2xl font-bold">{data?.metrics?.avg_scan_time_minutes?.toFixed(1) || 0}m</span>
            </div>
            <Progress 
              value={Math.min((data?.metrics?.avg_scan_time_minutes || 0) / 5 * 100, 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt; 3 minutes
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Error Rate (24h)</span>
              <span className="text-2xl font-bold">{data?.metrics?.error_rate_24h?.toFixed(1) || 0}%</span>
            </div>
            <Progress 
              value={Math.min((data?.metrics?.error_rate_24h || 0) * 10, 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {data?.metrics?.error_rate_24h > 5 ? '⚠️ Above threshold' : '✓ Within acceptable range'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
