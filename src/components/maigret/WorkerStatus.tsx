import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export function WorkerStatus() {
  const [status, setStatus] = useState<HealthStatus>('unknown');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async (manual = false) => {
    setChecking(true);
    try {
      const workerUrl = import.meta.env.VITE_MAIGRET_API_URL;
      if (!workerUrl) {
        setStatus('unknown');
        if (manual) {
          toast({
            title: 'Configuration Error',
            description: 'Worker URL not configured',
            variant: 'destructive',
          });
        }
        return;
      }

      const response = await fetch(`${workerUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        setStatus('healthy');
        if (manual) {
          toast({
            title: 'Worker Online',
            description: 'Username scan service is operational',
          });
        }
      } else if (response.status >= 500) {
        setStatus('down');
        if (manual) {
          toast({
            title: 'Worker Offline',
            description: 'Service is currently unavailable. Scans will retry automatically.',
            variant: 'destructive',
          });
        }
      } else {
        setStatus('degraded');
        if (manual) {
          toast({
            title: 'Worker Degraded',
            description: 'Service is experiencing issues but scans may still work.',
            variant: 'default',
          });
        }
      }
      
      setLastCheck(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setStatus('down');
      setLastCheck(new Date());
      if (manual) {
        toast({
          title: 'Worker Offline',
          description: 'Service is currently unavailable. Scans will retry automatically.',
          variant: 'destructive',
        });
      }
    } finally {
      setChecking(false);
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
        return 'Online';
      case 'degraded':
        return 'Degraded';
      case 'down':
        return 'Offline';
      default:
        return 'Unknown';
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
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => checkHealth(true)}
        disabled={checking}
        className="h-7 w-7 p-0"
        title="Refresh worker status"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${checking ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
