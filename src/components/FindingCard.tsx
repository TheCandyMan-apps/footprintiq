import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, ExternalLink, Shield, AlertTriangle, Info } from "lucide-react";
import { Finding, Severity } from "@/lib/ufm";
import { useState } from "react";
import { toast } from "sonner";

interface FindingCardProps {
  finding: Finding;
  redactPII?: boolean;
}

export const FindingCard = ({ finding, redactPII = true }: FindingCardProps) => {
  const [checkedRemediation, setCheckedRemediation] = useState<Set<number>>(new Set());

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      case 'info':
        return 'outline';
    }
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Shield className="w-4 h-4" />;
      case 'low':
      case 'info':
        return <Info className="w-4 h-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const toggleRemediation = (index: number) => {
    setCheckedRemediation((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getSeverityIcon(finding.severity)}
              <CardTitle className="text-lg">{finding.title}</CardTitle>
            </div>
            <CardDescription className="text-sm">{finding.description}</CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant={getSeverityColor(finding.severity)} className="capitalize">
              {finding.severity}
            </Badge>
            <span className="text-xs text-muted-foreground text-right">
              {Math.round(finding.confidence * 100)}% confidence
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Evidence Section */}
        {(finding.evidence || []).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Evidence
            </h4>
            <div className="space-y-2">
              {(finding.evidence || []).map((evidence, idx) => (
                <div key={idx} className="flex items-start justify-between gap-2 p-2 rounded bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-muted-foreground">{evidence.key}</div>
                    <div className="text-sm font-mono break-all">
                      {typeof evidence.value === 'string' ? evidence.value : JSON.stringify(evidence.value)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => copyToClipboard(String(evidence.value))}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact Section */}
        {finding.impact && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Impact</h4>
            <p className="text-sm text-muted-foreground">{finding.impact}</p>
          </div>
        )}

        {/* Remediation Checklist */}
        {(finding.remediation || []).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Remediation Steps</h4>
            <div className="space-y-2">
              {(finding.remediation || []).map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Checkbox
                    id={`remediation-${finding.id}-${idx}`}
                    checked={checkedRemediation.has(idx)}
                    onCheckedChange={() => toggleRemediation(idx)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={`remediation-${finding.id}-${idx}`}
                    className={`text-sm cursor-pointer ${
                      checkedRemediation.has(idx) ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {step}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer: Provider & Timestamp */}
        <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">Provider:</span>
            <span>{finding.provider}</span>
            {finding.url && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => window.open(finding.url, '_blank')}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
          <div>
            <span className="font-medium">Checked:</span>{' '}
            <span>{formatTimestamp(finding.observedAt)}</span>
          </div>
        </div>

        {/* Tags */}
        {(finding.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {(finding.tags || []).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
