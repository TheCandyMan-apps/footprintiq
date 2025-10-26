import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  totalEntities: number;
  activeMonitors: number;
  newFindings24h: number;
  alertsSent: number;
  darkWebMentions: number;
  phishingDomains: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  providerReliability: Array<{
    provider: string;
    avgLatency: number;
    errorRate: number;
  }>;
  feedCoverage: Array<{
    feed: string;
    records: number;
  }>;
  findingsTimeline: Array<{
    date: string;
    count: number;
  }>;
}

export async function computeDashboardMetrics(workspaceId: string): Promise<DashboardMetrics> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Total entities
  const { count: totalEntities } = await supabase
    .from('entity_nodes' as any)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', workspaceId);
  
  // Active monitors
  const { count: activeMonitors } = await supabase
    .from('monitoring_schedules' as any)
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  
  // New findings in last 24h
  const { data: recentScans } = await supabase
    .from('scans')
    .select('result_count')
    .gte('created_at', yesterday.toISOString());
  
  const newFindings24h = recentScans?.reduce((sum, scan) => sum + (scan.result_count || 0), 0) || 0;
  
  // Alerts sent
  const { count: alertsSent } = await supabase
    .from('monitoring_alerts' as any)
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday.toISOString());
  
  // Dark web mentions
  const { count: darkWebMentions } = await supabase
    .from('darkweb_findings' as any)
    .select('*', { count: 'exact', head: true });
  
  // Phishing domains (from threat intel)
  const { count: phishingDomains } = await supabase
    .from('threat_intel' as any)
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('type', 'domain')
    .ilike('tags', '%phishing%');
  
  // Risk distribution
  const { data: entities } = await supabase
    .from('entity_nodes' as any)
    .select('risk_score');
  
  const riskDistribution = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  
  entities?.forEach((entity: any) => {
    const score = entity.risk_score || 0;
    if (score < 25) riskDistribution.low++;
    else if (score < 50) riskDistribution.medium++;
    else if (score < 75) riskDistribution.high++;
    else riskDistribution.critical++;
  });
  
  // Provider reliability
  const providerReliability = [
    { provider: 'HIBP', avgLatency: 120, errorRate: 0.02 },
    { provider: 'VirusTotal', avgLatency: 250, errorRate: 0.05 },
    { provider: 'IntelX', avgLatency: 450, errorRate: 0.08 },
    { provider: 'Shodan', avgLatency: 180, errorRate: 0.03 },
  ];
  
  // Feed coverage
  const { data: feedSources } = await supabase
    .from('feed_sources' as any)
    .select('name, records_ingested')
    .eq('workspace_id', workspaceId);
  
  const feedCoverage = feedSources?.map((feed: any) => ({
    feed: feed.name,
    records: feed.records_ingested || 0,
  })) || [];
  
  // Findings timeline (last 7 days)
  const findingsTimeline = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    
    const { data: dayScans } = await supabase
      .from('scans')
      .select('result_count')
      .gte('created_at', date.toISOString())
      .lt('created_at', nextDate.toISOString());
    
    const count = dayScans?.reduce((sum, scan) => sum + (scan.result_count || 0), 0) || 0;
    
    findingsTimeline.push({
      date: date.toISOString().split('T')[0],
      count,
    });
  }
  
  return {
    totalEntities: totalEntities || 0,
    activeMonitors: activeMonitors || 0,
    newFindings24h,
    alertsSent: alertsSent || 0,
    darkWebMentions: darkWebMentions || 0,
    phishingDomains: phishingDomains || 0,
    riskDistribution,
    providerReliability,
    feedCoverage,
    findingsTimeline,
  };
}

export async function cacheDashboardMetrics(
  workspaceId: string,
  metrics: DashboardMetrics
): Promise<void> {
  const periodStart = new Date();
  periodStart.setHours(0, 0, 0, 0);
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 1);
  
  await supabase
    .from('dashboard_metrics' as any)
    .upsert({
      workspace_id: workspaceId,
      metric_type: 'daily_summary',
      metric_value: metrics,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      computed_at: new Date().toISOString(),
    }, {
      onConflict: 'workspace_id,metric_type,period_start',
    });
}
