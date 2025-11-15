import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity } from 'lucide-react';

export function WorkerHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const workerUrl = import.meta.env.VITE_MAIGRET_API_URL;
      if (!workerUrl) {
        setIsHealthy(null);
        return;
      }

      const response = await fetch(`${workerUrl}/health`);
      const data = await response.json();
      setIsHealthy(data.ok === true);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setIsHealthy(false);
      setLastCheck(new Date());
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <div
              className={`h-2 w-2 rounded-full ${
                isHealthy === null
                  ? 'bg-muted-foreground'
                  : isHealthy
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-muted-foreground">Worker</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isHealthy === null
              ? 'Worker status unknown'
              : isHealthy
              ? 'OSINT worker healthy'
              : 'OSINT worker offline'}
          </p>
          {lastCheck && (
            <p className="text-xs text-muted-foreground mt-1">
              Last checked: {lastCheck.toLocaleTimeString()}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
