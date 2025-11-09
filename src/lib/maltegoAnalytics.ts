export interface MaltegoMetrics {
  totalScans: number;
  totalNodes: number;
  totalEdges: number;
  averageNodesPerScan: number;
  averageEdgesPerScan: number;
  averageTransformsPerScan: number;
  entityTypeDistribution: { type: string; count: number }[];
  connectionPatterns: { source: string; target: string; count: number }[];
  scanTrend: { date: string; scans: number }[];
}

export interface MaltegoScan {
  id: string;
  entity: string;
  created_at: string;
  results: {
    nodes?: any[];
    edges?: any[];
    transforms_executed?: number;
  };
  scan_type: string;
  status: string;
}

export const calculateMaltegoMetrics = (scans: MaltegoScan[]): MaltegoMetrics => {
  const completedScans = scans.filter(s => s.status === 'completed');
  
  if (completedScans.length === 0) {
    return {
      totalScans: 0,
      totalNodes: 0,
      totalEdges: 0,
      averageNodesPerScan: 0,
      averageEdgesPerScan: 0,
      averageTransformsPerScan: 0,
      entityTypeDistribution: [],
      connectionPatterns: [],
      scanTrend: []
    };
  }

  // Calculate totals
  const totalNodes = completedScans.reduce((sum, scan) => sum + (scan.results?.nodes?.length || 0), 0);
  const totalEdges = completedScans.reduce((sum, scan) => sum + (scan.results?.edges?.length || 0), 0);
  const totalTransforms = completedScans.reduce((sum, scan) => sum + (scan.results?.transforms_executed || 0), 0);

  // Calculate entity type distribution
  const entityTypeCounts = new Map<string, number>();
  completedScans.forEach(scan => {
    scan.results?.nodes?.forEach((node: any) => {
      const type = node.type || node.entityType || 'Unknown';
      entityTypeCounts.set(type, (entityTypeCounts.get(type) || 0) + 1);
    });
  });

  const entityTypeDistribution = Array.from(entityTypeCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate connection patterns (most common edge types)
  const connectionCounts = new Map<string, number>();
  completedScans.forEach(scan => {
    scan.results?.edges?.forEach((edge: any) => {
      const sourceType = edge.sourceType || edge.from_type || 'Unknown';
      const targetType = edge.targetType || edge.to_type || 'Unknown';
      const key = `${sourceType} → ${targetType}`;
      connectionCounts.set(key, (connectionCounts.get(key) || 0) + 1);
    });
  });

  const connectionPatterns = Array.from(connectionCounts.entries())
    .map(([pattern, count]) => {
      const [source, target] = pattern.split(' → ');
      return { source, target, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate scan trend (last 30 days)
  const scansByDate = new Map<string, number>();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  completedScans
    .filter(scan => new Date(scan.created_at) >= thirtyDaysAgo)
    .forEach(scan => {
      const date = new Date(scan.created_at).toLocaleDateString();
      scansByDate.set(date, (scansByDate.get(date) || 0) + 1);
    });

  const scanTrend = Array.from(scansByDate.entries())
    .map(([date, scans]) => ({ date, scans }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    totalScans: completedScans.length,
    totalNodes,
    totalEdges,
    averageNodesPerScan: Math.round(totalNodes / completedScans.length),
    averageEdgesPerScan: Math.round(totalEdges / completedScans.length),
    averageTransformsPerScan: Math.round(totalTransforms / completedScans.length),
    entityTypeDistribution,
    connectionPatterns,
    scanTrend
  };
};
