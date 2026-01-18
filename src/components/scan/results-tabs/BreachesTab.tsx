import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { LensConfidenceBadge } from '@/components/scan/LensConfidenceBadge';
import { useLensAnalysis } from '@/hooks/useLensAnalysis';

interface BreachesTabProps {
  results: ScanResult[];
  breachResults: any[];
}

const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-black';
    case 'low':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function BreachesTab({ results, breachResults }: BreachesTabProps) {
  // LENS Analysis for breach results
  const lensAnalysis = useLensAnalysis(breachResults);

  // Group breaches by severity
  const groupedBreaches = useMemo(() => {
    const groups: Record<string, any[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      unknown: [],
    };

    breachResults.forEach(breach => {
      const severity = (breach.severity || 'unknown').toLowerCase();
      if (groups[severity]) {
        groups[severity].push(breach);
      } else {
        groups.unknown.push(breach);
      }
    });

    return groups;
  }, [breachResults]);

  const totalBreaches = breachResults.length;

  if (totalBreaches === 0) {
    return (
      <Card className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Breaches Detected</h3>
        <p className="text-muted-foreground">
          No breach-related findings were detected in this scan.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* LENS Analysis Note */}
      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">LENS Breach Analysis</h4>
            <p className="text-xs text-muted-foreground">
              {lensAnalysis.highConfidence} high-confidence, {lensAnalysis.moderateConfidence} moderate, 
              and {lensAnalysis.lowConfidence} low-confidence breach findings detected. 
              Overall reliability: {lensAnalysis.overallScore}%
            </p>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center border-red-500/20 bg-red-500/5">
          <div className="text-2xl font-bold text-red-500">
            {groupedBreaches.critical.length}
          </div>
          <div className="text-xs text-muted-foreground">Critical</div>
        </Card>
        <Card className="p-4 text-center border-orange-500/20 bg-orange-500/5">
          <div className="text-2xl font-bold text-orange-500">
            {groupedBreaches.high.length}
          </div>
          <div className="text-xs text-muted-foreground">High</div>
        </Card>
        <Card className="p-4 text-center border-yellow-500/20 bg-yellow-500/5">
          <div className="text-2xl font-bold text-yellow-500">
            {groupedBreaches.medium.length}
          </div>
          <div className="text-xs text-muted-foreground">Medium</div>
        </Card>
        <Card className="p-4 text-center border-blue-500/20 bg-blue-500/5">
          <div className="text-2xl font-bold text-blue-500">
            {groupedBreaches.low.length}
          </div>
          <div className="text-xs text-muted-foreground">Low</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{totalBreaches}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </Card>
      </div>

      {/* Breach List */}
      <div className="space-y-3">
        {breachResults.map((breach, idx) => {
          const lensScore = lensAnalysis.resultScores.get(breach.id);
          return (
          <Card key={breach.id || idx} className="overflow-hidden">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <CardTitle className="text-sm font-medium">
                    {breach.site || breach.provider || 'Unknown Source'}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {breach.kind || 'Breach detected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lensScore && (
                  <LensConfidenceBadge
                    score={lensScore.score}
                    reasoning={lensScore.reasoning}
                    size="sm"
                  />
                )}
                <Badge className={getSeverityColor(breach.severity)}>
                  {breach.severity || 'Unknown'}
                </Badge>
                {breach.url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={breach.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardHeader>
            {breach.meta?.description && (
              <CardContent className="py-2 px-4 border-t bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  {breach.meta.description}
                </p>
              </CardContent>
            )}
          </Card>
        )})}
      </div>

      {/* Recommendations */}
      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-sm mb-1">Recommended Actions</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Change passwords for affected accounts immediately</li>
              <li>• Enable two-factor authentication where available</li>
              <li>• Monitor accounts for suspicious activity</li>
              <li>• Consider using a password manager for unique passwords</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default BreachesTab;
