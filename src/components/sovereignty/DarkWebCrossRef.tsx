import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SovereigntyRequest } from '@/hooks/useSovereignty';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { ShieldAlert, ExternalLink, ArrowRight } from 'lucide-react';

interface DarkWebCrossRefProps {
  requests: SovereigntyRequest[];
  onCreateRequest?: (entity: string, url?: string) => void;
}

export function DarkWebCrossRef({ requests, onCreateRequest }: DarkWebCrossRefProps) {
  const { workspace } = useWorkspace();

  // Fetch breach/exposure findings from scan results
  const { data: breachFindings = [] } = useQuery({
    queryKey: ['breach-findings-xref', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('canonical_results')
        .select('id, platform_name, primary_url, severity, risk_score, canonical_username, page_type')
        .eq('workspace_id', workspace.id)
        .in('severity', ['high', 'critical'])
        .order('risk_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!workspace?.id,
  });

  // Cross-reference: findings not yet covered by a sovereignty request
  const uncoveredFindings = useMemo(() => {
    const coveredEntities = new Set(
      requests.map(r => r.target_entity.toLowerCase())
    );
    return breachFindings.filter(
      f => !coveredEntities.has(f.platform_name.toLowerCase())
    );
  }, [breachFindings, requests]);

  if (uncoveredFindings.length === 0) return null;

  return (
    <Card className="border-yellow-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-600">
          <ShieldAlert className="h-4 w-4" />
          Unprotected Exposures ({uncoveredFindings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground mb-3">
          High-risk findings without an active erasure request
        </p>
        {uncoveredFindings.slice(0, 5).map(finding => (
          <div
            key={finding.id}
            className="flex items-center justify-between gap-2 text-sm border rounded-md p-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant={finding.severity === 'critical' ? 'destructive' : 'outline'}
                className="text-[10px] shrink-0"
              >
                {finding.severity}
              </Badge>
              <span className="truncate font-medium">{finding.platform_name}</span>
              {finding.risk_score && (
                <span className="text-[10px] text-muted-foreground">
                  Risk: {finding.risk_score}
                </span>
              )}
            </div>
            {onCreateRequest && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 shrink-0"
                onClick={() => onCreateRequest(finding.platform_name, finding.primary_url || undefined)}
              >
                <ArrowRight className="h-3 w-3" />
                Request
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
