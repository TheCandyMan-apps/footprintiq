import { useScanExecutionStats, ProviderStat } from '@/hooks/useScanExecutionStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Ban, 
  Activity, 
  ChevronDown, 
  ExternalLink,
  Zap,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ScanExecutionSummaryProps {
  scanId: string;
  className?: string;
  compact?: boolean;
}

export function ScanExecutionSummary({ scanId, className, compact = false }: ScanExecutionSummaryProps) {
  const stats = useScanExecutionStats(scanId);
  const [isOpen, setIsOpen] = useState(false);

  if (stats.isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="py-4">
          <div className="h-4 bg-muted rounded w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (stats.error || stats.totalProviders === 0) {
    return null;
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusIcon = (status: ProviderStat['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'timeout':
        return <Clock className="h-3 w-3 text-orange-500" />;
      case 'skipped':
        return <Ban className="h-3 w-3 text-muted-foreground" />;
      case 'running':
        return <Activity className="h-3 w-3 text-blue-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const successRate = stats.totalProviders > 0 
    ? Math.round((stats.successfulProviders / stats.totalProviders) * 100) 
    : 0;

  // Compact view for inline display
  if (compact) {
    return (
      <div className={cn("flex items-center gap-4 text-sm", className)}>
        <div className="flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{stats.totalProviders}</span>
          <span className="text-muted-foreground">providers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatDuration(stats.totalDurationMs)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{stats.totalFindings}</span>
          <span className="text-muted-foreground">findings</span>
        </div>
        <Link to={`/scan-timeline/${scanId}`}>
          <Button variant="ghost" size="sm" className="h-7 gap-1">
            Details <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Card className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Execution Summary
                </CardTitle>
                <CardDescription className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{stats.totalProviders} providers</span>
                  <span>•</span>
                  <span>{formatDuration(stats.totalDurationMs)}</span>
                  <span>•</span>
                  <span className="font-medium text-foreground">{stats.totalFindings} findings</span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                {/* Mini status dots */}
                <div className="flex gap-1">
                  {stats.providers.slice(0, 10).map((p, i) => (
                    <div key={i} title={`${p.provider}: ${p.status}`}>
                      {getStatusIcon(p.status)}
                    </div>
                  ))}
                  {stats.totalProviders > 10 && (
                    <span className="text-xs text-muted-foreground">+{stats.totalProviders - 10}</span>
                  )}
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "transform rotate-180"
                )} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Success rate bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-medium">{successRate}%</span>
              </div>
              <Progress value={successRate} className="h-2" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {stats.successfulProviders} success
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-500" />
                  {stats.failedProviders} failed
                </span>
                <span className="flex items-center gap-1">
                  <Ban className="h-3 w-3 text-muted-foreground" />
                  {stats.skippedProviders} skipped
                </span>
              </div>
            </div>

            {/* Provider latency breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Provider Latency</h4>
              <div className="space-y-1.5">
                {stats.providers.slice(0, 8).map((p) => {
                  const maxDuration = Math.max(...stats.providers.map(pr => pr.durationMs), 1);
                  const widthPercent = (p.durationMs / maxDuration) * 100;
                  
                  return (
                    <div key={p.provider} className="flex items-center gap-2 text-sm">
                      {getStatusIcon(p.status)}
                      <span className="w-24 truncate text-muted-foreground" title={p.provider}>
                        {p.provider}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded transition-all",
                            p.status === 'success' ? "bg-green-500/70" :
                            p.status === 'failed' ? "bg-red-500/70" :
                            p.status === 'timeout' ? "bg-orange-500/70" :
                            "bg-muted-foreground/30"
                          )}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs text-muted-foreground">
                        {formatDuration(p.durationMs)}
                      </span>
                      {p.findingsCount > 0 && (
                        <Badge variant="secondary" className="text-xs h-5">
                          {p.findingsCount}
                        </Badge>
                      )}
                    </div>
                  );
                })}
                {stats.providers.length > 8 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{stats.providers.length - 8} more providers
                  </p>
                )}
              </div>
            </div>

            {/* View full timeline link */}
            <div className="pt-2 border-t">
              <Link to={`/scan-timeline/${scanId}`}>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  View Full Timeline <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
