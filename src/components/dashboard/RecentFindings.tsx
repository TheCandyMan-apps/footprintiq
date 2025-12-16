import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, AlertTriangle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { HelpIcon } from '@/components/ui/help-icon';

interface Finding {
  id: string;
  scan_id: string;
  kind: string;
  severity: string;
  provider: string;
  created_at: string;
  results_route?: string;
}

interface RecentFindingsProps {
  workspaceId?: string;
}

export function RecentFindings({ workspaceId }: RecentFindingsProps) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentFindings();
  }, [workspaceId]);

  const fetchRecentFindings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('[RecentFindings] Fetching findings, workspaceId:', workspaceId);

      // Get recent findings (limit 10) with workspace filter - join scans for results_route
      let findingsQuery = supabase
        .from('findings')
        .select('id, scan_id, kind, severity, provider, created_at, scans!inner(results_route)');
      
      if (workspaceId) {
        findingsQuery = findingsQuery.eq('workspace_id', workspaceId);
      }
      
      const { data, error: fetchError } = await findingsQuery
        .order('created_at', { ascending: false })
        .limit(20); // Fetch 20 to filter and display 10

      if (fetchError) {
        console.error('[RecentFindings] Error fetching findings:', fetchError);
        setError('Failed to load recent findings');
        return;
      }

      console.log('[RecentFindings] Raw findings count:', data?.length || 0);

      // Filter out provider errors and tier restrictions, extract results_route
      const validFindings = (data || []).filter(f => {
        const kind = (f.kind || '').toLowerCase();
        return !kind.includes('provider_error') && 
               !kind.includes('error') &&
               !kind.includes('tier_restricted') &&
               !kind.includes('plan_blocked');
      }).slice(0, 10).map(f => ({
        ...f,
        results_route: (f.scans as any)?.results_route || 'results'
      }));

      console.log('[RecentFindings] Valid findings after filtering:', validFindings.length);
      setFindings(validFindings);
    } catch (error) {
      console.error('[RecentFindings] Error fetching findings:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="shadow-card hover:shadow-glow transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Recent Findings
          <HelpIcon helpKey="findings_activity" />
        </CardTitle>
        <CardDescription>Latest discoveries across all scans</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading recent findings...
          </div>
        ) : error ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-destructive gap-2">
            <AlertTriangle className="h-8 w-8 opacity-50" />
            <p className="text-center">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchRecentFindings}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : findings.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
            <AlertTriangle className="h-8 w-8 opacity-50" />
            <p className="text-center">No findings yet</p>
            <p className="text-xs text-center">Run your first scan to see results here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {findings.map((finding) => (
              <div
                key={finding.id}
                onClick={() => {
                  const route = finding.results_route === 'maigret' 
                    ? `/maigret/results/${finding.scan_id}` 
                    : `/results/${finding.scan_id}`;
                  navigate(route);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const route = finding.results_route === 'maigret' 
                      ? `/maigret/results/${finding.scan_id}` 
                      : `/results/${finding.scan_id}`;
                    navigate(route);
                  }
                }}
                aria-label={`View details for ${finding.kind} finding from ${finding.provider}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
              >
                {/* Platform Favicon */}
                <div className="flex-shrink-0 mt-1">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${finding.provider}&sz=32`}
                    alt={`${finding.provider} icon`}
                    className="w-6 h-6 rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Ccircle cx="12" cy="12" r="10"%3E%3C/circle%3E%3Cpath d="M12 16v-4M12 8h.01"%3E%3C/path%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getSeverityColor(finding.severity)} className="text-xs">
                      {finding.severity || 'info'}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">
                      {finding.provider}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {finding.kind}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(finding.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
