import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useWorkerStatus } from "@/hooks/useWorkerStatus";

interface WorkerStatusBannerProps {
  workerType?: string;
  showIfAllOnline?: boolean;
  workerNames?: string[];
}

export const WorkerStatusBanner = ({ 
  workerType, 
  showIfAllOnline = false,
  workerNames
}: WorkerStatusBannerProps) => {
  const { 
    workers, 
    loading, 
    getOperationalStatusEmoji,
    getWorkerDisplayName,
    refresh 
  } = useWorkerStatus({ workerType });

  if (loading) return null;
  
  // Build displayWorkers based on props
  let displayWorkers = workers;
  
  if (workerNames) {
    // Show only specified workers in the given order
    displayWorkers = workerNames.map(name => {
      const worker = workers.find(w => w.worker_name === name);
      return worker || {
        worker_name: name,
        worker_type: 'osint',
        status: 'unknown' as const,
        last_seen: new Date().toISOString(),
        last_check_at: new Date().toISOString(),
        last_success_at: null,
        response_time_ms: null,
        error_message: null
      };
    });
  } else if (workerType) {
    displayWorkers = workers.filter(w => w.worker_type === workerType);
  }

  if (displayWorkers.length === 0) return null;

  // Compute local health flags based on displayWorkers only
  const localAnyOffline = displayWorkers.some(w => w.status === 'offline');
  const localAnyDegraded = displayWorkers.some(w => w.status === 'degraded');
  const localAllOperational = displayWorkers.length > 0 && !localAnyOffline && !localAnyDegraded;

  // Don't show banner if all workers are online and showIfAllOnline is false
  if (!showIfAllOnline && localAllOperational) return null;

  const getVariant = () => {
    if (localAnyOffline) return 'destructive';
    if (localAnyDegraded) return 'default';
    return 'default';
  };

  const getIcon = () => {
    if (localAnyOffline) return <XCircle className="w-5 h-5 text-destructive" />;
    if (localAnyDegraded) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  };

  const getTitle = () => {
    if (localAnyOffline) return 'Some workers are offline';
    if (localAnyDegraded) return 'Some workers are degraded';
    return 'All OSINT tools operational';
  };

  const getDescription = () => {
    if (localAnyOffline) {
      return 'Certain scans may be unavailable. Cached results will be used when possible.';
    }
    if (localAnyDegraded) {
      return 'Some workers are experiencing slow response times. Scans may take longer than usual.';
    }
    
    // Generate dynamic description based on worker names
    if (workerNames && workerNames.length > 0) {
      const names = workerNames.map(name => getWorkerDisplayName(name));
      const nameList = names.length === 1 
        ? names[0]
        : `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
      return `${nameList} are ready to find digital footprints across 500+ platforms.`;
    }
    
    return 'OSINT scanning tools are ready to find digital footprints across 500+ platforms.';
  };

  return (
    <Alert 
      variant={getVariant()} 
      className={`mb-6 ${localAllOperational ? 'bg-green-500/10 border-green-500/20' : ''}`}
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
                const displayStatus = worker.status === 'unknown' && localAllOperational ? 'online' : worker.status;
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
