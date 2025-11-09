import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WorkerStatus {
  worker_name: string;
  worker_type: string;
  status: 'online' | 'offline' | 'degraded' | 'unknown';
  last_check_at: string | null;
  last_success_at: string | null;
  response_time_ms: number | null;
  error_message: string | null;
}

interface UseWorkerStatusOptions {
  workerType?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useWorkerStatus(options: UseWorkerStatusOptions = {}) {
  const { workerType, autoRefresh = true, refreshInterval = 30000 } = options;
  const [workers, setWorkers] = useState<WorkerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkerStatus = async () => {
    try {
      let query = supabase
        .from('worker_status')
        .select('*')
        .order('worker_name');
      
      if (workerType) {
        query = query.eq('worker_type', workerType);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setWorkers((data || []) as WorkerStatus[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching worker status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch worker status');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWorkerStatus();
  }, [workerType]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchWorkerStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, workerType]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('worker-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'worker_status',
          filter: workerType ? `worker_type=eq.${workerType}` : undefined,
        },
        () => {
          // Refresh on any change
          fetchWorkerStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workerType]);

  const getWorkerByName = (name: string): WorkerStatus | undefined => {
    return workers.find(w => w.worker_name === name);
  };

  const getWorkersByType = (type: string): WorkerStatus[] => {
    return workers.filter(w => w.worker_type === type);
  };

  const isWorkerOnline = (name: string): boolean => {
    const worker = getWorkerByName(name);
    return worker?.status === 'online';
  };

  const isWorkerOffline = (name: string): boolean => {
    const worker = getWorkerByName(name);
    return worker?.status === 'offline';
  };

  const getStatusEmoji = (status: WorkerStatus['status']): string => {
    switch (status) {
      case 'online': return '🟢';
      case 'degraded': return '🟡';
      case 'offline': return '🔴';
      case 'unknown': return '⚪';
      default: return '⚪';
    }
  };

  const allOnline = workers.length > 0 && workers.every(w => w.status === 'online');
  const anyOffline = workers.some(w => w.status === 'offline');
  const anyDegraded = workers.some(w => w.status === 'degraded');

  return {
    workers,
    loading,
    error,
    refresh: fetchWorkerStatus,
    getWorkerByName,
    getWorkersByType,
    isWorkerOnline,
    isWorkerOffline,
    getStatusEmoji,
    allOnline,
    anyOffline,
    anyDegraded,
  };
}
