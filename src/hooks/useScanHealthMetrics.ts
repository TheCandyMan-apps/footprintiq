import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProviderHealthMetric {
  provider: string;
  successCount: number;
  failedCount: number;
  timeoutCount: number;
  skippedCount: number;
  emptyResults: number;
  totalCount: number;
  successRate: number;
  emptyRate: number;
  avgDurationMs: number | null;
}

export interface ScanHealthSummary {
  totalProviderCalls: number;
  overallSuccessRate: number;
  overallTimeoutRate: number;
  overallEmptyRate: number;
  avgDurationMs: number;
  providersWithIssues: number;
  healthyProviders: number;
}

export interface ScanHealthData {
  providers: ProviderHealthMetric[];
  summary: ScanHealthSummary;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useScanHealthMetrics(days: number = 7): ScanHealthData {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['scan-health-metrics', days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // Fetch all completed scan events
      const { data: events, error: eventsError } = await supabase
        .from('scan_events')
        .select('provider, status, stage, findings_count, duration_ms')
        .gte('created_at', since)
        .in('stage', ['complete', 'completed']);

      if (eventsError) throw eventsError;

      // Aggregate by provider
      const providerMap = new Map<string, {
        success: number;
        failed: number;
        timeout: number;
        skipped: number;
        empty: number;
        total: number;
        durations: number[];
      }>();

      (events || []).forEach(event => {
        const provider = event.provider;
        if (!provider || provider === 'system' || provider === 'orchestrator' || provider === 'all') return;

        if (!providerMap.has(provider)) {
          providerMap.set(provider, {
            success: 0,
            failed: 0,
            timeout: 0,
            skipped: 0,
            empty: 0,
            total: 0,
            durations: []
          });
        }

        const stats = providerMap.get(provider)!;
        stats.total++;

        if (event.status === 'success' || event.status === 'completed') {
          stats.success++;
          if (event.findings_count === 0) {
            stats.empty++;
          }
        } else if (event.status === 'failed') {
          stats.failed++;
        } else if (event.status === 'timeout') {
          stats.timeout++;
        } else if (event.status === 'skipped') {
          stats.skipped++;
        }

        if (event.duration_ms && event.duration_ms > 0) {
          stats.durations.push(event.duration_ms);
        }
      });

      // Convert to array
      const providers: ProviderHealthMetric[] = Array.from(providerMap.entries())
        .map(([provider, stats]) => ({
          provider,
          successCount: stats.success,
          failedCount: stats.failed,
          timeoutCount: stats.timeout,
          skippedCount: stats.skipped,
          emptyResults: stats.empty,
          totalCount: stats.total,
          successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
          emptyRate: stats.success > 0 ? (stats.empty / stats.success) * 100 : 0,
          avgDurationMs: stats.durations.length > 0 
            ? stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length 
            : null
        }))
        .sort((a, b) => b.totalCount - a.totalCount);

      // Calculate summary
      const totals = providers.reduce((acc, p) => ({
        calls: acc.calls + p.totalCount,
        success: acc.success + p.successCount,
        timeout: acc.timeout + p.timeoutCount,
        empty: acc.empty + p.emptyResults,
        duration: acc.duration + (p.avgDurationMs || 0) * p.totalCount,
        durationCount: acc.durationCount + (p.avgDurationMs ? p.totalCount : 0)
      }), { calls: 0, success: 0, timeout: 0, empty: 0, duration: 0, durationCount: 0 });

      const summary: ScanHealthSummary = {
        totalProviderCalls: totals.calls,
        overallSuccessRate: totals.calls > 0 ? (totals.success / totals.calls) * 100 : 0,
        overallTimeoutRate: totals.calls > 0 ? (totals.timeout / totals.calls) * 100 : 0,
        overallEmptyRate: totals.success > 0 ? (totals.empty / totals.success) * 100 : 0,
        avgDurationMs: totals.durationCount > 0 ? totals.duration / totals.durationCount : 0,
        providersWithIssues: providers.filter(p => p.successRate < 90 || p.emptyRate > 80).length,
        healthyProviders: providers.filter(p => p.successRate >= 90 && p.emptyRate <= 80).length
      };

      return { providers, summary };
    },
    refetchInterval: 30000,
  });

  return {
    providers: data?.providers || [],
    summary: data?.summary || {
      totalProviderCalls: 0,
      overallSuccessRate: 0,
      overallTimeoutRate: 0,
      overallEmptyRate: 0,
      avgDurationMs: 0,
      providersWithIssues: 0,
      healthyProviders: 0
    },
    isLoading,
    error: error as Error | null,
    refetch
  };
}
