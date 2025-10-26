import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Pattern {
  pattern_type: string;
  title: string;
  description: string;
  severity: string;
  confidence: number;
  recommendations: string[];
}

export function BehavioralPatterns() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    loadExistingPatterns();
  }, []);

  const loadExistingPatterns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("detected_patterns")
        .select("*")
        .eq("user_id", user.id)
        .order("first_detected", { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        const formattedPatterns = data.map((p: any) => ({
          pattern_type: p.pattern_type,
          title: (p.metadata as any)?.title || p.pattern_type,
          description: p.description,
          severity: p.severity,
          confidence: (p.metadata as any)?.confidence || 0.8,
          recommendations: (p.metadata as any)?.recommendations || [],
        }));
        setPatterns(formattedPatterns);
        setHasAnalyzed(true);
      }
    } catch (error) {
      console.error("Failed to load patterns:", error);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Authentication required");
        return;
      }

      const { data, error } = await supabase.functions.invoke("ml-analysis", {
        body: { userId: user.id },
      });

      if (error) throw error;

      setPatterns(data.patterns || []);
      setHasAnalyzed(true);
      
      if (data.patterns?.length > 0) {
        toast.success(`Detected ${data.patterns.length} behavioral patterns`);
      } else {
        toast.info("No patterns detected yet. Perform more scans for better analysis.");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze patterns");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case "trend": return <TrendingUp className="h-4 w-4" />;
      case "anomaly": return <AlertTriangle className="h-4 w-4" />;
      case "habit": return <Brain className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Behavioral Pattern Analysis
        </CardTitle>
        <CardDescription>
          ML-powered analysis of your scanning behavior and trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAnalyzed && (
          <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
            {isAnalyzing ? "Analyzing..." : "Run Behavioral Analysis"}
          </Button>
        )}

        {hasAnalyzed && patterns.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              Not enough data for pattern analysis yet.
            </p>
            <Button onClick={handleAnalyze} disabled={isAnalyzing} variant="outline">
              {isAnalyzing ? "Re-analyzing..." : "Re-analyze"}
            </Button>
          </div>
        )}

        {patterns.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {patterns.length} patterns detected
              </p>
              <Button onClick={handleAnalyze} disabled={isAnalyzing} variant="outline" size="sm">
                {isAnalyzing ? "Re-analyzing..." : "Refresh"}
              </Button>
            </div>

            <div className="space-y-3">
              {patterns.map((pattern, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          {getPatternIcon(pattern.pattern_type)}
                          <h4 className="font-medium">{pattern.title}</h4>
                        </div>
                        <Badge variant={getSeverityColor(pattern.severity) as any}>
                          {pattern.severity}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {pattern.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Confidence: {Math.round(pattern.confidence * 100)}%</span>
                      </div>

                      {pattern.recommendations?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Recommendations:</p>
                          <ul className="text-xs space-y-1">
                            {pattern.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
