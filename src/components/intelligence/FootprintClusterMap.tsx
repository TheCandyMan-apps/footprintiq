import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Loader2 } from 'lucide-react';
import { getPlatformCategory, getCategoryColor, type PlatformCategory } from '@/lib/categoryMapping';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FootprintClusterMapProps {
  scanId: string;
}

export function FootprintClusterMap({ scanId }: FootprintClusterMapProps) {
  const { data: platforms, isLoading } = useQuery({
    queryKey: ['footprint-clusters', scanId],
    queryFn: async () => {
      const { data: findings } = await supabase
        .from('findings')
        .select('kind, evidence')
        .eq('scan_id', scanId)
        .neq('kind', 'provider.error')
        .neq('kind', 'provider.timeout');

      if (!findings || findings.length === 0) return [];

      return findings.map(f => {
        const evidence = Array.isArray(f.evidence) ? f.evidence : [];
        const siteEvidence = evidence.find((e: any) => e.key === 'site' || e.key === 'platform');
        return { name: (siteEvidence as any)?.value || f.kind };
      });
    },
    enabled: !!scanId
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  // Group platforms by category
  const clusters = (platforms || []).reduce((acc, { name }) => {
    const category = getPlatformCategory(name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(name);
    return acc;
  }, {} as Record<PlatformCategory, string[]>);
  
  const sortedClusters = Object.entries(clusters).sort(([, a], [, b]) => b.length - a.length);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Footprint Clusters</CardTitle>
        </div>
        <CardDescription>
          Platform groupings by category
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedClusters.length === 0 ? (
          <p className="text-sm text-muted-foreground">No platforms found</p>
        ) : (
          <div className="space-y-2">
            {sortedClusters.map(([category, platformList]) => (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={getCategoryColor(category as PlatformCategory)}
                  >
                    {category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {platformList.length} {platformList.length === 1 ? 'platform' : 'platforms'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {platformList.slice(0, 5).map((platform, idx) => (
                    <span 
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {platform}
                    </span>
                  ))}
                  {platformList.length > 5 && (
                    <span className="text-xs px-2 py-0.5 text-muted-foreground">
                      +{platformList.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
