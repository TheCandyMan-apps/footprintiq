import { Finding } from "./ufm";

export interface TimelineEvent {
  date: string;
  findings: Finding[];
  severity: string;
  count: number;
}

export const clusterFindingsByDate = (findings: Finding[]): TimelineEvent[] => {
  const grouped = new Map<string, Finding[]>();
  
  for (const finding of findings) {
    const date = new Date(finding.observedAt).toISOString().split('T')[0];
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(finding);
  }
  
  const events: TimelineEvent[] = [];
  for (const [date, findings] of grouped.entries()) {
    const severities = findings.map(f => f.severity);
    const maxSeverity = severities.includes('critical') ? 'critical' :
                        severities.includes('high') ? 'high' :
                        severities.includes('medium') ? 'medium' : 'low';
    
    events.push({
      date,
      findings,
      severity: maxSeverity,
      count: findings.length
    });
  }
  
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const groupByProvider = (findings: Finding[]): Record<string, Finding[]> => {
  return findings.reduce((acc, finding) => {
    if (!acc[finding.provider]) acc[finding.provider] = [];
    acc[finding.provider].push(finding);
    return acc;
  }, {} as Record<string, Finding[]>);
};