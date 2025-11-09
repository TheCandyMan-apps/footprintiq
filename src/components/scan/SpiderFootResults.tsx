import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSpiderFootScan, SpiderFootScan } from '@/hooks/useSpiderFootScan';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  TrendingUp,
  Link as LinkIcon,
  Database,
  FileText,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SpiderFootResultsProps {
  workspaceId: string;
}

export function SpiderFootResults({ workspaceId }: SpiderFootResultsProps) {
  const { listScans } = useSpiderFootScan();
  const [scans, setScans] = useState<SpiderFootScan[]>([]);
  const [selectedScan, setSelectedScan] = useState<SpiderFootScan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScans();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('spiderfoot_scans_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'spiderfoot_scans',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          loadScans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  const loadScans = async () => {
    setLoading(true);
    const data = await listScans(workspaceId, 20);
    setScans(data);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      running: 'default',
      completed: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">Loading scans...</p>
      </Card>
    );
  }

  if (scans.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No SpiderFoot scans yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start a scan above to see results here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scan List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Recent Scans
        </h3>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedScan?.id === scan.id
                    ? 'bg-accent border-primary'
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedScan(scan)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(scan.status)}
                      <span className="font-medium">{scan.target}</span>
                      <Badge variant="outline" className="text-xs">
                        {scan.target_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{new Date(scan.created_at).toLocaleString()}</span>
                      <span>•</span>
                      <span>{scan.total_events} events</span>
                      {scan.modules.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{scan.modules.length} modules</span>
                        </>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(scan.status)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Selected Scan Details */}
      {selectedScan && (
        <>
          {/* Correlations */}
          {selectedScan.correlations && selectedScan.correlations.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-warning" />
                Correlations & Insights
                <Badge variant="secondary">{selectedScan.correlations.length}</Badge>
              </h3>
              <div className="space-y-3">
                {selectedScan.correlations.map((corr: any, idx: number) => (
                  <Alert key={idx} className="border-warning/50 bg-warning/5">
                    <LinkIcon className="h-4 w-4 text-warning" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">{corr.description}</p>
                        {corr.confidence && (
                          <Badge variant="outline" className="text-xs">
                            Confidence: {corr.confidence}
                          </Badge>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </Card>
          )}

          {/* Raw Results */}
          {selectedScan.results && selectedScan.results.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Scan Results
                <Badge variant="secondary">{selectedScan.results.length}</Badge>
              </h3>
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedScan.results.map((result: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border bg-muted/30 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium line-clamp-1">
                          {result.type || 'Unknown'}
                        </span>
                        {result.module && (
                          <Badge variant="outline" className="text-xs">
                            {result.module}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground break-all">
                        {result.data || JSON.stringify(result)}
                      </p>
                      {result.confidence && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Shield className="w-3 h-3" />
                          Confidence: {result.confidence}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}

          {/* Error State */}
          {selectedScan.status === 'failed' && selectedScan.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Scan Failed:</strong> {selectedScan.error}
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
