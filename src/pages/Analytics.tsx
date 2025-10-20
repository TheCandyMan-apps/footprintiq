import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Activity,
  BarChart3,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [behaviorAnalytics, setBehaviorAnalytics] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
    await loadAnalyticsData(user.id);
    setLoading(false);
  };

  const loadAnalyticsData = async (uid: string) => {
    try {
      // Load risk predictions
      const { data: predData } = await supabase
        .from("risk_predictions")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(10);
      setPredictions(predData || []);

      // Load detected patterns
      const { data: patternData } = await supabase
        .from("detected_patterns")
        .select("*")
        .eq("user_id", uid)
        .order("last_seen", { ascending: false })
        .limit(10);
      setPatterns(patternData || []);

      // Load anomalies
      const { data: anomalyData } = await supabase
        .from("anomalies")
        .select("*")
        .eq("user_id", uid)
        .eq("is_resolved", false)
        .order("detected_at", { ascending: false });
      setAnomalies(anomalyData || []);

      // Load forecasts
      const { data: forecastData } = await supabase
        .from("trend_forecasts")
        .select("*")
        .eq("user_id", uid)
        .order("forecast_date", { ascending: false })
        .limit(5);
      setForecasts(forecastData || []);

      // Load behavior analytics
      const { data: behaviorData } = await supabase
        .from("user_behavior_analytics")
        .select("*")
        .eq("user_id", uid)
        .order("calculated_at", { ascending: false })
        .limit(5);
      setBehaviorAnalytics(behaviorData || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics data");
    }
  };

  const runMLAnalysis = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ml-analysis", {
        body: { userId }
      });

      if (error) throw error;

      toast.success("ML analysis completed successfully");
      await loadAnalyticsData(userId);
    } catch (error) {
      console.error("Error running ML analysis:", error);
      toast.error("Failed to run ML analysis");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Advanced Analytics - FootprintIQ"
        description="ML-powered analytics and insights for your digital footprint"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Advanced Analytics</h1>
            <p className="text-muted-foreground">
              ML-powered insights and predictions for your digital footprint
            </p>
          </div>
          <Button onClick={runMLAnalysis} disabled={loading}>
            <Brain className="mr-2 h-4 w-4" />
            Run ML Analysis
          </Button>
        </div>

        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="predictions">
              <Target className="mr-2 h-4 w-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="patterns">
              <Activity className="mr-2 h-4 w-4" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="anomalies">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Anomalies
            </TabsTrigger>
            <TabsTrigger value="forecasts">
              <TrendingUp className="mr-2 h-4 w-4" />
              Forecasts
            </TabsTrigger>
            <TabsTrigger value="behavior">
              <BarChart3 className="mr-2 h-4 w-4" />
              Behavior
            </TabsTrigger>
          </TabsList>

          {/* Risk Predictions */}
          <TabsContent value="predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Predictions</CardTitle>
                <CardDescription>
                  ML-powered risk assessment predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {predictions.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No risk predictions available. Run an ML analysis to generate predictions.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {predictions.map((pred) => (
                      <Card key={pred.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <Badge variant={getRiskColor(pred.predicted_risk_level)}>
                                {pred.predicted_risk_level.toUpperCase()}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-2">
                                Confidence: {(pred.confidence_score * 100).toFixed(1)}%
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(pred.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {pred.factors && pred.factors.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Risk Factors:</p>
                              <ul className="text-sm space-y-1">
                                {pred.factors.map((factor: string, idx: number) => (
                                  <li key={idx} className="text-muted-foreground">• {factor}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {pred.recommendations && pred.recommendations.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Recommendations:</p>
                              <ul className="text-sm space-y-1">
                                {pred.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx} className="text-muted-foreground">• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detected Patterns */}
          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detected Patterns</CardTitle>
                <CardDescription>
                  Recurring patterns identified across your scans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {patterns.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No patterns detected yet. Run more scans to identify patterns.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {patterns.map((pattern) => (
                      <Card key={pattern.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={getSeverityColor(pattern.severity)}>
                                  {pattern.severity}
                                </Badge>
                                <Badge variant="outline">{pattern.pattern_type}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  Seen {pattern.occurrence_count}x
                                </span>
                              </div>
                              <p className="text-sm mb-2">{pattern.description}</p>
                              <p className="text-xs text-muted-foreground">
                                Last seen: {new Date(pattern.last_seen).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Anomalies */}
          <TabsContent value="anomalies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Anomalies</CardTitle>
                <CardDescription>
                  Unusual activities and potential security concerns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {anomalies.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No active anomalies detected. Your digital footprint appears normal.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {anomalies.map((anomaly) => (
                      <Alert key={anomaly.id} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{anomaly.anomaly_type}</p>
                              <p className="text-sm mt-1">{anomaly.description}</p>
                              <p className="text-xs mt-2">
                                Detected: {new Date(anomaly.detected_at).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trend Forecasts */}
          <TabsContent value="forecasts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trend Forecasts</CardTitle>
                <CardDescription>
                  Predicted future trends based on historical data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {forecasts.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No forecasts available. More historical data is needed for predictions.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {forecasts.map((forecast) => (
                      <Card key={forecast.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <Badge variant="outline">{forecast.forecast_type}</Badge>
                              <p className="text-sm text-muted-foreground mt-2">
                                Forecast Date: {new Date(forecast.forecast_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium mb-2">Predicted Values:</p>
                            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                              {JSON.stringify(forecast.predicted_values, null, 2)}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Behavior Analytics */}
          <TabsContent value="behavior" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Behavior Analytics</CardTitle>
                <CardDescription>
                  Insights into your privacy management behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                {behaviorAnalytics.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No behavior analytics available. Continue using the platform to generate insights.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {behaviorAnalytics.map((behavior) => (
                      <Card key={behavior.id}>
                        <CardContent className="pt-6">
                          <div className="mb-4">
                            <Badge variant="outline">{behavior.behavior_type}</Badge>
                            <p className="text-xs text-muted-foreground mt-2">
                              Period: {new Date(behavior.period_start).toLocaleDateString()} - 
                              {new Date(behavior.period_end).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {behavior.insights && behavior.insights.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Key Insights:</p>
                              <ul className="text-sm space-y-1">
                                {behavior.insights.map((insight: string, idx: number) => (
                                  <li key={idx} className="text-muted-foreground">• {insight}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Metrics:</p>
                            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                              {JSON.stringify(behavior.metrics, null, 2)}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
