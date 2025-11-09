import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format } from 'date-fns';

export interface ScanMetrics {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  partialScans: number;
  successRate: number;
  averageCompletionTime: number;
  totalProviders: number;
}

export interface TrendData {
  date: string;
  scans: number;
  successful: number;
  failed: number;
  successRate: number;
}

export interface ProviderPopularity {
  provider: string;
  count: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
}

export function useScanAnalytics(days: number = 30) {
  const [metrics, setMetrics] = useState<ScanMetrics>({
    totalScans: 0,
    successfulScans: 0,
    failedScans: 0,
    partialScans: 0,
    successRate: 0,
    averageCompletionTime: 0,
    totalProviders: 0,
  });
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [providers, setProviders] = useState<ProviderPopularity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = startOfDay(subDays(new Date(), days));

      // Get overall metrics from scan_jobs
      const { data: scans, error: scansError } = await supabase
        .from('scan_jobs')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (scansError) throw scansError;

      const totalScans = scans?.length || 0;
      const successfulScans = scans?.filter((s) => s.status === 'finished').length || 0;
      const failedScans = scans?.filter((s) => s.status === 'error').length || 0;
      const partialScans = scans?.filter((s) => s.status === 'partial').length || 0;
      const successRate = totalScans > 0 ? (successfulScans / totalScans) * 100 : 0;

      // Calculate average completion time
      const completedScans = scans?.filter(
        (s) => s.status === 'finished' && s.started_at && s.finished_at
      ) || [];
      const avgTime =
        completedScans.length > 0
          ? completedScans.reduce((sum, scan) => {
              const start = new Date(scan.started_at).getTime();
              const end = new Date(scan.finished_at).getTime();
              return sum + (end - start);
            }, 0) / completedScans.length
          : 0;

      const totalProviders =
        scans?.reduce((sum, scan) => sum + (scan.providers_completed || 0), 0) || 0;

      setMetrics({
        totalScans,
        successfulScans,
        failedScans,
        partialScans,
        successRate,
        averageCompletionTime: avgTime / 1000, // Convert to seconds
        totalProviders,
      });

      // Calculate daily trends
      const trendMap = new Map<string, { scans: number; successful: number; failed: number }>();
      scans?.forEach((scan) => {
        const date = format(new Date(scan.created_at), 'yyyy-MM-dd');
        const existing = trendMap.get(date) || { scans: 0, successful: 0, failed: 0 };
        existing.scans++;
        if (scan.status === 'finished') existing.successful++;
        if (scan.status === 'error') existing.failed++;
        trendMap.set(date, existing);
      });

      const trendData: TrendData[] = Array.from(trendMap.entries())
        .map(([date, data]) => ({
          date,
          scans: data.scans,
          successful: data.successful,
          failed: data.failed,
          successRate: data.scans > 0 ? (data.successful / data.scans) * 100 : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setTrends(trendData);

      // Get provider popularity from scan_findings
      const { data: findings, error: findingsError } = await supabase
        .from('scan_findings')
        .select('site, status, job_id')
        .gte('created_at', startDate.toISOString());

      if (findingsError) throw findingsError;

      const providerMap = new Map<
        string,
        { count: number; successCount: number; failureCount: number }
      >();
      
      findings?.forEach((finding) => {
        const provider = finding.site || 'Unknown';
        const existing = providerMap.get(provider) || {
          count: 0,
          successCount: 0,
          failureCount: 0,
        };
        existing.count++;
        if (finding.status === 'found') existing.successCount++;
        else existing.failureCount++;
        providerMap.set(provider, existing);
      });

      const providerData: ProviderPopularity[] = Array.from(providerMap.entries())
        .map(([provider, data]) => ({
          provider,
          count: data.count,
          successCount: data.successCount,
          failureCount: data.failureCount,
          averageResponseTime: 0, // Could be calculated if we store timing data
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 providers

      setProviders(providerData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    trends,
    providers,
    loading,
    refresh: loadAnalytics,
  };
}
