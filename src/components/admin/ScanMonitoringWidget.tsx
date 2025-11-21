import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';

export function ScanMonitoringWidget() {
  const { data: scanStats, isLoading } = useQuery({
    queryKey: ['scan-monitoring'],
    queryFn: async () => {
      const supabaseService = supabase;

      // Get scan counts by status
      const { data: scans } = await supabaseService
        .from('scans')
        .select('status, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const statusCounts = {
        pending: 0,
        processing: 0,
        completed: 0,
        error: 0,
        timeout: 0,
        total: scans?.length || 0,
      };

      scans?.forEach(scan => {
        if (scan.status === 'pending') statusCounts.pending++;
        else if (scan.status === 'processing') statusCounts.processing++;
        else if (scan.status === 'completed') statusCounts.completed++;
        else if (scan.status === 'error') statusCounts.error++;
        else if (scan.status === 'timeout') statusCounts.timeout++;
      });

      // Calculate success rate
      const completed = statusCounts.completed;
      const failed = statusCounts.error + statusCounts.timeout;
      const successRate = statusCounts.total > 0 
        ? Math.round((completed / statusCounts.total) * 100) 
        : 100;

      // Get avg scan time
      const { data: completedScans } = await supabaseService
        .from('scans')
        .select('created_at, completed_at')
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(50);

      let avgScanTimeMinutes = 0;
      if (completedScans && completedScans.length > 0) {
        const durations = completedScans
          .filter(s => s.completed_at)
          .map(s => {
            const start = new Date(s.created_at).getTime();
            const end = new Date(s.completed_at!).getTime();
            return (end - start) / (1000 * 60);
          });
        
        if (durations.length > 0) {
          avgScanTimeMinutes = durations.reduce((a, b) => a + b, 0) / durations.length;
        }
      }

      return {
        statusCounts,
        successRate,
        avgScanTimeMinutes,
        completed,
        failed,
      };
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scan Monitoring</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusIcon = (count: number, type: string) => {
    if (type === 'completed') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (type === 'error' || type === 'timeout') return <XCircle className="h-4 w-4 text-red-500" />;
    if (type === 'pending') return <Clock className="h-4 w-4 text-yellow-500" />;
    return <Activity className="h-4 w-4 text-blue-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Monitoring (Last 24h)</CardTitle>
        <CardDescription>Real-time scan queue and performance metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(scanStats?.statusCounts.pending || 0, 'pending')}
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold">{scanStats?.statusCounts.pending || 0}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(scanStats?.statusCounts.processing || 0, 'processing')}
              <span className="text-sm text-muted-foreground">Processing</span>
            </div>
            <p className="text-2xl font-bold">{scanStats?.statusCounts.processing || 0}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(scanStats?.statusCounts.completed || 0, 'completed')}
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold">{scanStats?.statusCounts.completed || 0}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(scanStats?.statusCounts.error || 0, 'error')}
              <span className="text-sm text-muted-foreground">Errors</span>
            </div>
            <p className="text-2xl font-bold">{scanStats?.statusCounts.error || 0}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(scanStats?.statusCounts.timeout || 0, 'timeout')}
              <span className="text-sm text-muted-foreground">Timeouts</span>
            </div>
            <p className="text-2xl font-bold">{scanStats?.statusCounts.timeout || 0}</p>
          </div>
        </div>

        {/* Success Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Success Rate</span>
            <Badge variant={scanStats && scanStats.successRate > 90 ? "default" : "destructive"}>
              {scanStats?.successRate || 0}%
            </Badge>
          </div>
          <Progress value={scanStats?.successRate || 0} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {scanStats?.completed || 0} completed / {scanStats?.failed || 0} failed
          </p>
        </div>

        {/* Avg Scan Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Avg Scan Time</span>
            <span className="text-lg font-bold">{scanStats?.avgScanTimeMinutes.toFixed(1) || 0}m</span>
          </div>
          <Progress 
            value={Math.min((scanStats?.avgScanTimeMinutes || 0) / 5 * 100, 100)} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            Target: &lt; 3 minutes
          </p>
        </div>

        {/* Alert for high queue depth */}
        {scanStats && (scanStats.statusCounts.pending + scanStats.statusCounts.processing) > 10 && (
          <div className="flex items-start gap-2 p-3 border border-yellow-500/50 rounded-lg bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">High Queue Depth</p>
              <p className="text-xs text-muted-foreground">
                {scanStats.statusCounts.pending + scanStats.statusCounts.processing} scans in queue
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
