import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useWorkerStatus } from "@/hooks/useWorkerStatus";

interface WorkerStatusBannerProps {
  workerType?: string;
  showIfAllOnline?: boolean;
}

export const WorkerStatusBanner = ({ 
  workerType, 
  showIfAllOnline = false 
}: WorkerStatusBannerProps) => {
  const { 
    workers, 
    loading, 
    anyOffline, 
    anyDegraded, 
    allOnline, 
    getStatusEmoji,
    refresh 
  } = useWorkerStatus({ workerType });

  if (loading) return null;
  
  // Don't show banner if all workers are online and showIfAllOnline is false
  if (!showIfAllOnline && allOnline) return null;

  // Filter workers if workerType is specified
  const displayWorkers = workerType 
    ? workers.filter(w => w.worker_type === workerType)
    : workers;

  if (displayWorkers.length === 0) return null;

  const getVariant = () => {
    if (anyOffline) return 'destructive';
    if (anyDegraded) return 'default';
    return 'default';
  };

  const getIcon = () => {
    if (anyOffline) return <XCircle className="w-5 h-5" />;
    if (anyDegraded) return <AlertCircle className="w-5 h-5" />;
    return <CheckCircle2 className="w-5 h-5" />;
  };

  const getTitle = () => {
    if (anyOffline) return 'Some workers are offline';
    if (anyDegraded) return 'Some workers are degraded';
    return 'All workers operational';
  };

  const getDescription = () => {
    if (anyOffline) {
      return 'Certain scans may be unavailable. Cached results will be used when possible.';
    }
    if (anyDegraded) {
      return 'Some workers are experiencing slow response times. Scans may take longer than usual.';
    }
    return 'All systems are running normally.';
  };

  return (
    <Alert variant={getVariant()} className="mb-6">
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <AlertDescription className="font-semibold">
              {getTitle()}
            </AlertDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refresh}
              className="h-8"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          <AlertDescription className="text-sm">
            {getDescription()}
          </AlertDescription>
          
          {displayWorkers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {displayWorkers.map((worker) => (
                <Badge 
                  key={worker.worker_name}
                  variant={
                    worker.status === 'online' ? 'default' : 
                    worker.status === 'degraded' ? 'secondary' : 
                    'destructive'
                  }
                  className="text-xs"
                >
                  {getStatusEmoji(worker.status)} {worker.worker_name}
                  {worker.response_time_ms && (
                    <span className="ml-1 opacity-70">
                      ({worker.response_time_ms}ms)
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};
