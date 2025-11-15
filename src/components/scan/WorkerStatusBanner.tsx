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
    allOperational,
    getOperationalStatusEmoji,
    getWorkerDisplayName,
    refresh 
  } = useWorkerStatus({ workerType });

  if (loading) return null;
  
  // Don't show banner if all workers are online and showIfAllOnline is false
  if (!showIfAllOnline && allOperational) return null;

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
    if (anyOffline) return <XCircle className="w-5 h-5 text-destructive" />;
    if (anyDegraded) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  };

  const getTitle = () => {
    if (anyOffline) return 'Some workers are offline';
    if (anyDegraded) return 'Some workers are degraded';
    return 'All OSINT tools operational';
  };

  const getDescription = () => {
    if (anyOffline) {
      return 'Certain scans may be unavailable. Cached results will be used when possible.';
    }
    if (anyDegraded) {
      return 'Some workers are experiencing slow response times. Scans may take longer than usual.';
    }
    return 'OSINT scanning tools are ready: Maigret, theHarvester, Recon-ng, and SpiderFoot.';
  };

  return (
    <Alert 
      variant={getVariant()} 
      className={`mb-6 ${allOperational ? 'bg-green-500/10 border-green-500/20' : ''}`}
    >
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
              {displayWorkers.map((worker) => {
                const displayStatus = worker.status === 'unknown' && allOperational ? 'online' : worker.status;
                const displayName = getWorkerDisplayName(worker.worker_name);
                
                return (
                  <Badge 
                    key={worker.worker_name}
                    variant={
                      displayStatus === 'online' ? 'default' : 
                      displayStatus === 'degraded' ? 'secondary' : 
                      'destructive'
                    }
                    className={`text-xs ${
                      displayStatus === 'online' 
                        ? 'bg-green-500/10 text-green-700 border-green-500/30' 
                        : displayStatus === 'degraded'
                        ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30'
                        : ''
                    }`}
                  >
                    {getOperationalStatusEmoji(displayStatus)} {displayName}
                    {worker.response_time_ms && (
                      <span className="ml-1 opacity-70">
                        ({worker.response_time_ms}ms)
                      </span>
                    )}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};
