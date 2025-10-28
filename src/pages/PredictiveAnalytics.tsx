import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Brain, Target, Activity } from "lucide-react";
import { ModelPerformance } from "@/components/ml/ModelPerformance";
import { RiskPredictions } from "@/components/ml/RiskPredictions";
import { BehavioralInsights } from "@/components/ml/BehavioralInsights";

export default function PredictiveAnalytics() {
  const { data: stats } = useQuery({
    queryKey: ["ml-stats"],
    queryFn: async () => {
      const { data: models } = await supabase
        .from("ml_models" as any)
        .select("status")
        .eq("status", "active");

      const { data: predictions } = await supabase
        .from("predictions" as any)
        .select("confidence_score")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const avgConfidence = predictions?.reduce((acc: number, p: any) => 
        acc + (p.confidence_score || 0), 0) / (predictions?.length || 1);

      return {
        activeModels: models?.length || 0,
        predictions: predictions?.length || 0,
        avgConfidence: (avgConfidence * 100).toFixed(1),
      };
    },
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Predictive Analytics</h1>
        <p className="text-muted-foreground">AI-powered predictions and behavioral insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Models</p>
              <p className="text-2xl font-bold">{stats?.activeModels || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <Target className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Predictions (7d)</p>
              <p className="text-2xl font-bold">{stats?.predictions || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Activity className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Confidence</p>
              <p className="text-2xl font-bold">{stats?.avgConfidence || 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">Risk Predictions</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions">
          <RiskPredictions />
        </TabsContent>

        <TabsContent value="models">
          <ModelPerformance />
        </TabsContent>

        <TabsContent value="behavioral">
          <BehavioralInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
}
