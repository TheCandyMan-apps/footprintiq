import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface QuickAnalysisData {
  summary: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  immediate_action: string;
}

interface QuickAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: QuickAnalysisData | null;
  isLoading: boolean;
  creditsSpent?: number;
}

const getRiskIcon = (level: string) => {
  switch (level) {
    case 'critical':
    case 'high':
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case 'medium':
      return <Info className="h-5 w-5 text-yellow-500" />;
    case 'low':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

const getRiskColor = (level: string) => {
  switch (level) {
    case 'critical':
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function QuickAnalysisDialog({
  open,
  onOpenChange,
  analysis,
  isLoading,
  creditsSpent
}: QuickAnalysisDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Analysis
          </DialogTitle>
          <DialogDescription>
            AI-powered rapid assessment
            {creditsSpent && (
              <Badge variant="secondary" className="ml-2">
                {creditsSpent} credits used
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Zap className="h-8 w-8 animate-pulse text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing finding...</p>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            {/* Risk Level */}
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              {getRiskIcon(analysis.risk_level)}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                <Badge variant={getRiskColor(analysis.risk_level) as any}>
                  {analysis.risk_level.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Assessment</h3>
              <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </div>

            {/* Immediate Action */}
            <div className="p-4 rounded-lg border bg-accent/5">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Immediate Action
              </h3>
              <p className="text-sm text-foreground">{analysis.immediate_action}</p>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
