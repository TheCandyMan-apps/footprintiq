import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { ScanDiff } from "@/lib/monitor/diff";
import { Finding } from "@/lib/ufm";

interface Props {
  diff: ScanDiff;
  onViewFinding?: (finding: Finding) => void;
}

export function MonitorDiffViewer({ diff, onViewFinding }: Props) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Change Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {diff.summary.totalNew}
            </div>
            <div className="text-sm text-muted-foreground">New Findings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {diff.summary.totalRemoved}
            </div>
            <div className="text-sm text-muted-foreground">Removed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {diff.summary.totalChanged}
            </div>
            <div className="text-sm text-muted-foreground">Changed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {diff.summary.severityChanges.increased}
            </div>
            <div className="text-sm text-muted-foreground">Severity ↑</div>
          </div>
        </div>
      </Card>

      {/* New Findings */}
      {diff.newFindings.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">New Findings ({diff.newFindings.length})</h3>
          </div>
          <div className="space-y-3">
            {diff.newFindings.slice(0, 10).map((finding) => (
              <div
                key={finding.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getSeverityColor(finding.severity)}>
                      {finding.severity}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{finding.provider}</span>
                  </div>
                  <p className="font-medium">{finding.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {finding.description}
                  </p>
                </div>
                {onViewFinding && (
                  <Button size="sm" variant="ghost" onClick={() => onViewFinding(finding)}>
                    View
                  </Button>
                )}
              </div>
            ))}
            {diff.newFindings.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                ...and {diff.newFindings.length - 10} more
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Changed Findings */}
      {diff.changedFindings.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Changed Findings ({diff.changedFindings.length})</h3>
          </div>
          <div className="space-y-3">
            {diff.changedFindings.slice(0, 10).map(({ finding, changes }) => (
              <div
                key={finding.id}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getSeverityColor(finding.severity)}>
                      {finding.severity}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{finding.provider}</span>
                  </div>
                  <p className="font-medium">{finding.title}</p>
                  <ul className="text-sm text-muted-foreground mt-1">
                    {changes.map((change, idx) => (
                      <li key={idx}>• {change}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            {diff.changedFindings.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                ...and {diff.changedFindings.length - 10} more
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Removed Findings */}
      {diff.removedFindings.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Removed Findings ({diff.removedFindings.length})</h3>
          </div>
          <div className="space-y-3">
            {diff.removedFindings.slice(0, 10).map((finding) => (
              <div
                key={finding.id}
                className="flex items-start justify-between p-3 border rounded-lg opacity-60"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{finding.severity}</Badge>
                    <span className="text-sm text-muted-foreground">{finding.provider}</span>
                  </div>
                  <p className="font-medium line-through">{finding.title}</p>
                </div>
              </div>
            ))}
            {diff.removedFindings.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                ...and {diff.removedFindings.length - 10} more
              </p>
            )}
          </div>
        </Card>
      )}

      {/* No Changes */}
      {diff.summary.totalNew === 0 && 
       diff.summary.totalRemoved === 0 && 
       diff.summary.totalChanged === 0 && (
        <Card className="p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h3 className="text-xl font-semibold mb-2">No Changes Detected</h3>
          <p className="text-muted-foreground">
            Your digital footprint remains stable since the last scan
          </p>
        </Card>
      )}
    </div>
  );
}
