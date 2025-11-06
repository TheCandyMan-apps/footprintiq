import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export function WorkerStatus() {
  const [status, setStatus] = useState<HealthStatus>('unknown');
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
        setStatus('unknown');
        return;
      }

      const response = await fetch(`${workerUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setStatus('healthy');
      } else if (response.status >= 500) {
        setStatus('down');
      } else {
        setStatus('degraded');
      }
      
      setLastCheck(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setStatus('down');
      setLastCheck(new Date());
    }
  };

  const getVariant = () => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'down':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'healthy':
        return 'Worker Online';
      case 'degraded':
        return 'Worker Degraded';
      case 'down':
        return 'Worker Offline';
      default:
        return 'Worker Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Activity className="h-4 w-4 text-muted-foreground" />
      <Badge variant={getVariant()}>
        {getLabel()}
      </Badge>
      {lastCheck && (
        <span className="text-xs text-muted-foreground">
          Last checked: {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
