import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function RiskPredictions() {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ["risk-scores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("risk_scores" as any)
        .select("*")
        .order("calculated_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const getRiskColor = (score: number) => {
    if (score >= 75) return "destructive";
    if (score >= 50) return "warning";
    return "success";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="h-4 w-4 text-destructive" />;
      case "decreasing": return <TrendingDown className="h-4 w-4 text-success" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return <div>Loading risk predictions...</div>;
  }

  return (
    <div className="space-y-4">
      {predictions?.map((pred: any) => (
        <Card key={pred.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{pred.entity_type}</h3>
                <Badge variant={getRiskColor(pred.overall_score) as any}>
                  Score: {pred.overall_score}/100
                </Badge>
                {pred.trend && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(pred.trend)}
                    <span className="text-xs text-muted-foreground capitalize">{pred.trend}</span>
                  </div>
                )}
                {pred.confidence && (
                  <Badge variant="outline">
                    {(pred.confidence * 100).toFixed(0)}% confident
                  </Badge>
                )}
              </div>

              {pred.risk_factors && pred.risk_factors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">Risk Factors:</p>
                  <div className="flex flex-wrap gap-1">
                    {pred.risk_factors.slice(0, 5).map((factor: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {factor.name || factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Calculated: {format(new Date(pred.calculated_at), "PPp")}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
