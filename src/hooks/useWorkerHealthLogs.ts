import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WorkerHealthLog {
  id: string;
  worker_name: string;
  worker_url: string | null;
  status: string;
  healthy: boolean;
  response_time_ms: number | null;
  tools_status: {
    sherlock?: boolean;
    maigret?: boolean;
    whatsmyname?: boolean;
    holehe?: boolean;
    gosearch?: boolean;
  } | null;
  error_message: string | null;
  checked_at: string;
  created_at: string;
}

export interface HealthMetrics {
  uptime: number;
  avgResponseTime: number;
  totalChecks: number;
  failedChecks: number;
  lastHealthy: string | null;
  lastUnhealthy: string | null;
  consecutiveFailures: number;
}

export function useWorkerHealthLogs(workerName: string = 'osint-multitool-worker', limit: number = 100) {
  const [logs, setLogs] = useState<WorkerHealthLog[]>([]);
  const [metrics, setMetrics] = useState<HealthMetrics>({
    uptime: 100,
    avgResponseTime: 0,
    totalChecks: 0,
    failedChecks: 0,
    lastHealthy: null,
    lastUnhealthy: null,
    consecutiveFailures: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('worker_health_logs')
        .select('*')
        .eq('worker_name', workerName)
        .order('checked_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      const typedData = (data || []) as WorkerHealthLog[];
      setLogs(typedData);

      // Calculate metrics
      if (typedData.length > 0) {
        const healthyChecks = typedData.filter(log => log.healthy).length;
        const uptime = (healthyChecks / typedData.length) * 100;

        const responseTimes = typedData
          .filter(log => log.response_time_ms !== null)
          .map(log => log.response_time_ms as number);
        const avgResponseTime = responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0;

        const lastHealthy = typedData.find(log => log.healthy)?.checked_at || null;
        const lastUnhealthy = typedData.find(log => !log.healthy)?.checked_at || null;

        // Count consecutive failures from most recent
        let consecutiveFailures = 0;
        for (const log of typedData) {
          if (!log.healthy) {
            consecutiveFailures++;
          } else {
            break;
          }
        }

        setMetrics({
          uptime,
          avgResponseTime: Math.round(avgResponseTime),
          totalChecks: typedData.length,
          failedChecks: typedData.length - healthyChecks,
          lastHealthy,
          lastUnhealthy,
          consecutiveFailures,
        });
      }
    } catch (err) {
      console.error('Failed to fetch health logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Refresh every 2 minutes
    const interval = setInterval(fetchLogs, 120000);
    return () => clearInterval(interval);
  }, [workerName, limit]);

  return {
    logs,
    metrics,
    loading,
    error,
    refresh: fetchLogs,
  };
}
