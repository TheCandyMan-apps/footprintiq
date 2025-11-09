import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkerHealth } from '@/hooks/useWorkerHealth';
import { RefreshCw, CheckCircle2, XCircle, Clock, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function WorkerHealthDashboard() {
  const { health, checking, refresh } = useWorkerHealth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'default';
      case 'offline':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const workers = [health.maigret, health.reconng, health.spiderfoot];
  const onlineCount = workers.filter((w) => w.status === 'online').length;
  const offlineCount = workers.filter((w) => w.status === 'offline').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Worker Health Status
            </CardTitle>
            <CardDescription>Real-time monitoring of scan service availability</CardDescription>
          </div>
          <Button onClick={refresh} disabled={checking} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">{onlineCount} Online</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium">{offlineCount} Offline</span>
          </div>
        </div>

        <div className="space-y-3">
          {workers.map((worker) => (
            <div
              key={worker.name}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(worker.status)}
                <div className="flex-1">
                  <div className="font-medium">{worker.name}</div>
                  <div className="text-sm text-muted-foreground">{worker.endpoint}</div>
                  {worker.error && (
                    <div className="text-xs text-destructive mt-1">{worker.error}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {worker.responseTime !== null && (
                  <div className="text-sm text-muted-foreground">
                    {worker.responseTime}ms
                  </div>
                )}
                <Badge variant={getStatusColor(worker.status)}>
                  {worker.status}
                </Badge>
                {worker.lastCheck && (
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(worker.lastCheck, { addSuffix: true })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
