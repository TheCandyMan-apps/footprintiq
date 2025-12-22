import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProviderStat {
  provider: string;
  status: 'success' | 'failed' | 'skipped' | 'timeout' | 'running';
  durationMs: number;
  findingsCount: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ScanExecutionStats {
  scanId: string;
  totalProviders: number;
  successfulProviders: number;
  failedProviders: number;
  skippedProviders: number;
  totalDurationMs: number;
  totalFindings: number;
  providers: ProviderStat[];
  isLoading: boolean;
  error: string | null;
}

export function useScanExecutionStats(scanId: string | undefined): ScanExecutionStats {
  const [stats, setStats] = useState<ScanExecutionStats>({
    scanId: scanId || '',
    totalProviders: 0,
    successfulProviders: 0,
    failedProviders: 0,
    skippedProviders: 0,
    totalDurationMs: 0,
    totalFindings: 0,
    providers: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!scanId) {
      setStats(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchStats = async () => {
      try {
        const { data: events, error } = await supabase
          .from('scan_events')
          .select('*')
          .eq('scan_id', scanId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Group events by provider and calculate stats
        const providerMap = new Map<string, ProviderStat>();
        let totalDuration = 0;
        let totalFindings = 0;

        for (const event of events || []) {
          // Skip orchestrator summary events for per-provider stats
          if (event.provider === 'orchestrator' && event.stage === 'scan_summary') {
            // Use scan_summary metadata for totals if available
            const meta = event.metadata as Record<string, unknown> | null;
            if (meta?.total_providers) {
              totalDuration = (event.duration_ms as number) || totalDuration;
              totalFindings = (event.findings_count as number) || totalFindings;
            }
            continue;
          }

          const existing = providerMap.get(event.provider);
          
          if (event.stage === 'started') {
            providerMap.set(event.provider, {
              provider: event.provider,
              status: 'running',
              durationMs: 0,
              findingsCount: 0,
              startedAt: event.created_at,
            });
          } else if (event.stage === 'complete' || event.stage === 'failed' || event.stage === 'timeout' || event.stage === 'skipped') {
            const duration = (event.duration_ms as number) || 0;
            const findings = (event.findings_count as number) || 0;
            
            providerMap.set(event.provider, {
              provider: event.provider,
              status: event.stage === 'complete' ? 'success' : event.stage as ProviderStat['status'],
              durationMs: duration,
              findingsCount: findings,
              errorMessage: event.error_message || undefined,
              startedAt: existing?.startedAt,
              completedAt: event.created_at,
            });

            if (event.stage === 'complete') {
              totalFindings += findings;
            }
            totalDuration += duration;
          }
        }

        const providers = Array.from(providerMap.values());
        const successfulProviders = providers.filter(p => p.status === 'success').length;
        const failedProviders = providers.filter(p => p.status === 'failed' || p.status === 'timeout').length;
        const skippedProviders = providers.filter(p => p.status === 'skipped').length;

        setStats({
          scanId,
          totalProviders: providers.length,
          successfulProviders,
          failedProviders,
          skippedProviders,
          totalDurationMs: totalDuration,
          totalFindings,
          providers: providers.sort((a, b) => b.durationMs - a.durationMs),
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('[useScanExecutionStats] Error:', err);
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load stats',
        }));
      }
    };

    fetchStats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`scan_execution_stats_${scanId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'scan_events',
        filter: `scan_id=eq.${scanId}`,
      }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId]);

  return stats;
}
