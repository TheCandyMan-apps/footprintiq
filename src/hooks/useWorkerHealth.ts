import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WorkerHealth {
  name: string;
  status: 'online' | 'offline' | 'checking';
  lastCheck: Date | null;
  responseTime: number | null;
  endpoint: string;
  error?: string;
}

export interface WorkerHealthState {
  maigret: WorkerHealth;
  reconng: WorkerHealth;
  spiderfoot: WorkerHealth;
  checking: boolean;
}

export function useWorkerHealth() {
  const [health, setHealth] = useState<WorkerHealthState>({
    maigret: {
      name: 'Maigret (Username Scans)',
      status: 'checking',
      lastCheck: null,
      responseTime: null,
      endpoint: import.meta.env.VITE_MAIGRET_API_URL || 'https://maigret-api-312297078337.europe-west1.run.app',
    },
    reconng: {
      name: 'Recon-ng',
      status: 'checking',
      lastCheck: null,
      responseTime: null,
      endpoint: '/functions/v1/recon-ng-modules',
    },
    spiderfoot: {
      name: 'SpiderFoot',
      status: 'checking',
      lastCheck: null,
      responseTime: null,
      endpoint: '/functions/v1/spiderfoot-scan',
    },
    checking: false,
  });
  const [checking, setChecking] = useState(false);

  const checkWorkerHealth = async () => {
    setChecking(true);

    // Check Maigret
    try {
      const start = Date.now();
      const response = await fetch(`${health.maigret.endpoint}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      const responseTime = Date.now() - start;

      setHealth((prev) => ({
        ...prev,
        maigret: {
          ...prev.maigret,
          status: response.ok ? 'online' : 'offline',
          lastCheck: new Date(),
          responseTime,
          error: response.ok ? undefined : `HTTP ${response.status}`,
        },
      }));
    } catch (error) {
      setHealth((prev) => ({
        ...prev,
        maigret: {
          ...prev.maigret,
          status: 'offline',
          lastCheck: new Date(),
          responseTime: null,
          error: error instanceof Error ? error.message : 'Connection failed',
        },
      }));
    }

    // Check Recon-ng
    try {
      const start = Date.now();
      const { error } = await supabase.functions.invoke('recon-ng-modules', {
        body: { action: 'list' },
      });
      const responseTime = Date.now() - start;

      setHealth((prev) => ({
        ...prev,
        reconng: {
          ...prev.reconng,
          status: error ? 'offline' : 'online',
          lastCheck: new Date(),
          responseTime: error ? null : responseTime,
          error: error ? error.message : undefined,
        },
      }));
    } catch (error) {
      setHealth((prev) => ({
        ...prev,
        reconng: {
          ...prev.reconng,
          status: 'offline',
          lastCheck: new Date(),
          responseTime: null,
          error: error instanceof Error ? error.message : 'Connection failed',
        },
      }));
    }

    // Check SpiderFoot - just verify function exists
    try {
      const start = Date.now();
      // Try a lightweight call to verify the function is deployed
      const { error } = await supabase.functions.invoke('spiderfoot-scan', {
        body: { _healthCheck: true },
      });
      const responseTime = Date.now() - start;

      setHealth((prev) => ({
        ...prev,
        spiderfoot: {
          ...prev.spiderfoot,
          status: error && error.message.includes('not found') ? 'offline' : 'online',
          lastCheck: new Date(),
          responseTime,
          error: error && error.message.includes('not found') ? 'Function not deployed' : undefined,
        },
      }));
    } catch (error) {
      setHealth((prev) => ({
        ...prev,
        spiderfoot: {
          ...prev.spiderfoot,
          status: 'offline',
          lastCheck: new Date(),
          responseTime: null,
          error: error instanceof Error ? error.message : 'Connection failed',
        },
      }));
    }

    setChecking(false);
  };

  useEffect(() => {
    checkWorkerHealth();
    const interval = setInterval(checkWorkerHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return {
    health,
    checking,
    refresh: checkWorkerHealth,
  };
}
