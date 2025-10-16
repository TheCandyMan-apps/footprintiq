import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { InsightData } from "@/hooks/useInsightStream";

interface PersonaSummaryProps {
  data: InsightData | null;
  isLoading: boolean;
  error?: string | null;
}

export const PersonaSummary = ({ data, isLoading, error }: PersonaSummaryProps) => {
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Persona Analysis
          </CardTitle>
          <CardDescription>Analyzing your digital footprint...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Persona Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Persona Summary */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Digital Footprint Assessment</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.persona}</p>
        </div>

        {/* Risk Highlights */}
        {data.risks && data.risks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Key Risks Identified
            </h4>
            <div className="space-y-2">
              {data.risks.map((risk, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Badge variant="destructive" className="mt-0.5">
                    {idx + 1}
                  </Badge>
                  <span className="text-sm">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {data.actions && data.actions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Recommended Actions
            </h4>
            <div className="space-y-2">
              {data.actions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary font-bold text-sm mt-0.5">{idx + 1}.</span>
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
