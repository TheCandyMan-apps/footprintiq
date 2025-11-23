import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw } from 'lucide-react';
import { subDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

interface ProviderStats {
  provider: string;
  success: number;
  failed: number;
  total: number;
  successRate: number;
}

export function ProviderHealthMap({ workspaceId }: { workspaceId?: string }) {
  const { data: providers = [], isLoading, refetch } = useQuery({
    queryKey: ['provider-health', workspaceId],
    queryFn: async () => {
      console.log('[ProviderHealthMap] Fetching provider health, workspaceId:', workspaceId);
      const sevenDaysAgo = subDays(new Date(), 7);
      
      let eventsQuery = supabase
        .from('scan_events')
        .select('provider, status, scan_id')
        .gte('created_at', sevenDaysAgo.toISOString())
        .in('status', ['success', 'failed', 'timeout']);
      
      const { data: events, error } = await eventsQuery;

      if (error) throw error;
      
      console.log('[ProviderHealthMap] Raw events count:', events?.length || 0);
      if (!events || events.length === 0) {
        console.log('[ProviderHealthMap] No scan_events found in last 7 days');
        return [];
      }
      
      // If workspace filter needed, get scan_ids for that workspace
      let workspaceScanIds: Set<string> | null = null;
      if (workspaceId) {
        const { data: scans } = await supabase
          .from('scans')
          .select('id')
          .eq('workspace_id', workspaceId)
          .gte('created_at', sevenDaysAgo.toISOString());
        
        workspaceScanIds = new Set(scans?.map(s => s.id) || []);
      }
      
      // Filter events by workspace scans if needed
      const filteredEvents = workspaceScanIds 
        ? events.filter(e => e.scan_id && workspaceScanIds.has(e.scan_id))
        : events;

      // Aggregate by provider
      const statsMap = new Map<string, { success: number; failed: number }>();
      
      filteredEvents.forEach(event => {
        if (!event.provider) return;
        const stats = statsMap.get(event.provider) || { success: 0, failed: 0 };
        if (event.status === 'success') stats.success++;
        if (event.status === 'failed' || event.status === 'timeout') stats.failed++;
        statsMap.set(event.provider, stats);
      });

      const providerStats: ProviderStats[] = Array.from(statsMap.entries())
        .map(([provider, stats]) => {
          const total = stats.success + stats.failed;
          return {
            provider,
            success: stats.success,
            failed: stats.failed,
            total,
            successRate: total > 0 ? Math.round((stats.success / total) * 100) : 0,
          };
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, 8); // Top 8 providers

      console.log('[ProviderHealthMap] Provider stats:', providerStats);
      return providerStats;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });

  const getHealthColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500/80';
    if (rate >= 70) return 'bg-yellow-500/80';
    return 'bg-red-500/80';
  };

  return (
    <Card className="shadow-card hover:shadow-glow transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Provider Health
            </CardTitle>
            <CardDescription>Success rates across providers (7d)</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-8 w-8"
            aria-label="Refresh provider health data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : providers.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Activity className="h-8 w-8 opacity-50" />
            <p className="text-center">No provider data yet</p>
            <p className="text-xs text-center">Run scans to see provider performance</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {providers.map((provider) => (
              <div
                key={provider.provider}
                className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
              >
                <div
                  className={`absolute inset-0 ${getHealthColor(provider.successRate)} transition-opacity group-hover:opacity-90`}
                />
                <div className="relative h-full flex flex-col items-center justify-center p-2 text-white">
                  <div className="text-xs font-medium text-center truncate w-full">
                    {provider.provider}
                  </div>
                  <div className="text-lg font-bold">{provider.successRate}%</div>
                  <div className="text-xs opacity-80">{provider.total} calls</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
