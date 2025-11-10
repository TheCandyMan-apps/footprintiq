import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Anomaly {
  anomaly_type: string;
  severity: string;
  description: string;
  metadata?: any;
}

interface AnomalyDetectorProps {
  scanId: string;
  findings?: any[];
}

export function AnomalyDetector({ scanId, findings = [] }: AnomalyDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  const handleDetect = async () => {
    setIsDetecting(true);
    console.log("Starting anomaly detection for scan:", scanId);
    
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to use anomaly detection");
        return;
      }

      console.log("Calling detect-anomalies function...");
      const { data, error } = await supabase.functions.invoke("detect-anomalies", {
        body: { scanId },
      });

      console.log("Function response:", { data, error });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      setAnomalies(data.anomalies || []);
      
      if (data.anomalies?.length > 0) {
        toast.success(`Detected ${data.anomalies.length} anomalies`);
      } else {
        toast.success("No anomalies detected");
      }
    } catch (error: any) {
      console.error("Detection error:", error);
      
      // More specific error messages
      if (error.message?.includes("LOVABLE_API_KEY")) {
        toast.error("AI analysis is not configured");
      } else if (error.message?.includes("Payment required")) {
        toast.error("AI credits needed - please top up your workspace");
      } else if (error.message?.includes("Rate limit")) {
        toast.error("Rate limit exceeded - please try again later");
      } else {
        toast.error(error.message || "Failed to detect anomalies");
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === "critical" || severity === "high") {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Anomaly Detection
        </CardTitle>
        <CardDescription>
          AI-powered behavioral analysis and anomaly detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleDetect} disabled={isDetecting}>
          {isDetecting ? "Analyzing..." : "Run Anomaly Detection"}
        </Button>

        {anomalies.length > 0 && (
          <div className="space-y-3">
            {anomalies.map((anomaly, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityIcon(anomaly.severity)}
                        <Badge variant={getSeverityColor(anomaly.severity) as any}>
                          {anomaly.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {anomaly.anomaly_type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm">{anomaly.description}</p>
                      {anomaly.metadata && (
                        <pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                          {JSON.stringify(anomaly.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
