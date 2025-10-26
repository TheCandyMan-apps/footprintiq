import { supabase } from '@/integrations/supabase/client';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  source: string;
  sourceId?: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

export async function buildEntityTimeline(
  entityId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    severity?: string[];
    eventTypes?: string[];
  }
): Promise<TimelineEvent[]> {
  const events: TimelineEvent[] = [];
  
  // Get workspace from entity
  const { data: entity } = await supabase
    .from('entity_nodes' as any)
    .select('workspace_id, user_id')
    .eq('id', entityId)
    .single() as any;
  
  if (!entity) return events;
  
  // 1. Get scan findings
  const { data: scans } = await supabase
    .from('scans')
    .select('id, created_at, query, scan_type, result_count')
    .eq('user_id', entity.user_id)
    .order('created_at', { ascending: false }) as any;
  
  if (scans) {
    for (const scan of scans) {
      events.push({
        id: scan.id,
        timestamp: scan.created_at,
        type: 'scan',
        severity: 'info',
        title: `Scan completed: ${scan.query}`,
        description: `Found ${scan.result_count || 0} results`,
        source: 'scan',
        sourceId: scan.id,
        metadata: { scan_type: scan.scan_type },
      });
    }
  }
  
  // 2. Get monitor runs
  const { data: monitorRuns } = await supabase
    .from('monitor_runs' as any)
    .select('id, started_at, finished_at, new_findings_count, status')
    .order('started_at', { ascending: false }) as any;
  
  if (monitorRuns) {
    for (const run of monitorRuns) {
      const severity = run.new_findings_count > 5 ? 'high' : run.new_findings_count > 0 ? 'medium' : 'info';
      events.push({
        id: run.id,
        timestamp: run.started_at,
        type: 'monitor',
        severity: severity as any,
        title: `Monitor run completed`,
        description: `${run.new_findings_count} new findings`,
        source: 'monitor',
        sourceId: run.id,
        metadata: { status: run.status },
      });
    }
  }
  
  // 3. Get threat intel hits
  const { data: threatIntel } = await supabase
    .from('threat_intel' as any)
    .select('*')
    .eq('workspace_id', entity.workspace_id)
    .order('last_seen', { ascending: false })
    .limit(100) as any;
  
  if (threatIntel) {
    for (const threat of threatIntel) {
      events.push({
        id: threat.id,
        timestamp: threat.last_seen,
        type: 'threat_intel',
        severity: threat.severity,
        title: `Threat indicator: ${threat.type}`,
        description: threat.source,
        source: 'threat_feed',
        sourceId: threat.id,
        confidence: threat.confidence,
        metadata: {
          indicator_type: threat.indicator_type,
          source_feed: threat.source_feed,
        },
      });
    }
  }
  
  // 4. Get AI analyst reports
  const { data: reports } = await supabase
    .from('analyst_reports' as any)
    .select('id, created_at, confidence')
    .eq('user_id', entity.user_id)
    .contains('entity_ids', [entityId])
    .order('created_at', { ascending: false }) as any;
  
  if (reports) {
    for (const report of reports) {
      events.push({
        id: report.id,
        timestamp: report.created_at,
        type: 'ai_analysis',
        severity: 'info',
        title: 'AI Analyst Report',
        description: 'Automated analysis completed',
        source: 'ai_analyst',
        sourceId: report.id,
        confidence: report.confidence,
      });
    }
  }
  
  // 5. Get dark web mentions
  const { data: darkWebFindings } = await supabase
    .from('darkweb_findings' as any)
    .select('*')
    .eq('user_id', entity.user_id)
    .order('discovered_at', { ascending: false }) as any;
  
  if (darkWebFindings) {
    for (const finding of darkWebFindings) {
      events.push({
        id: finding.id,
        timestamp: finding.discovered_at,
        type: 'dark_web',
        severity: finding.severity,
        title: `Dark web finding: ${finding.finding_type}`,
        description: `Data exposed: ${finding.data_exposed.join(', ')}`,
        source: 'dark_web',
        sourceId: finding.id,
        metadata: {
          source_url: finding.source_url,
          verified: finding.is_verified,
        },
      });
    }
  }
  
  // Sort by timestamp
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Apply filters
  let filtered = events;
  
  if (filters?.startDate) {
    filtered = filtered.filter(e => new Date(e.timestamp) >= filters.startDate!);
  }
  
  if (filters?.endDate) {
    filtered = filtered.filter(e => new Date(e.timestamp) <= filters.endDate!);
  }
  
  if (filters?.severity && filters.severity.length > 0) {
    filtered = filtered.filter(e => filters.severity!.includes(e.severity));
  }
  
  if (filters?.eventTypes && filters.eventTypes.length > 0) {
    filtered = filtered.filter(e => filters.eventTypes!.includes(e.type));
  }
  
  return filtered;
}

export function exportTimelineCSV(events: TimelineEvent[]): string {
  const headers = ['Timestamp', 'Type', 'Severity', 'Title', 'Description', 'Source'];
  const rows = events.map(e => [
    e.timestamp,
    e.type,
    e.severity,
    e.title,
    e.description || '',
    e.source,
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
}
