import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface RateLimitInfo {
  endpoint: string;
  current_count: number;
  limit_per_window: number;
  window_start: string;
  window_seconds: number;
}

export function RateLimitMonitor() {
  const [limits, setLimits] = useState<RateLimitInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRateLimits();
    const interval = setInterval(loadRateLimits, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadRateLimits = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from("rate_limits")
        .select("endpoint, current_count, limit_per_window, window_start, window_seconds")
        .eq("identifier", user.user.id)
        .order("current_count", { ascending: false });

      if (!error && data) {
        setLimits(data);
      }
    } catch (error) {
      console.error("Error loading rate limits:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (windowStart: string, windowSeconds: number) => {
    const start = new Date(windowStart).getTime();
    const now = Date.now();
    const elapsed = (now - start) / 1000;
    const remaining = Math.max(0, windowSeconds - elapsed);
    
    if (remaining < 60) return `${Math.floor(remaining)}s`;
    return `${Math.floor(remaining / 60)}m`;
  };

  const getStatusColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage < 50) return "text-green-600";
    if (percentage < 80) return "text-yellow-600";
    return "text-destructive";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Limit Monitor</CardTitle>
        <CardDescription>
          Track your API usage and rate limits in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {limits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
            <p>No rate limits active</p>
            <p className="text-sm">Make some API calls to see your usage</p>
          </div>
        ) : (
          limits.map((limit, idx) => {
            const percentage = (limit.current_count / limit.limit_per_window) * 100;
            const isNearLimit = percentage >= 80;

            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{limit.endpoint}</span>
                    {isNearLimit && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Near Limit
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={getStatusColor(limit.current_count, limit.limit_per_window)}>
                      {limit.current_count} / {limit.limit_per_window}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeRemaining(limit.window_start, limit.window_seconds)}
                    </Badge>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })
        )}

        <div className="pt-4 border-t">
          <div className="text-sm space-y-1">
            <p className="font-medium">Rate Limit Information</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Free tier: 100 requests/hour per endpoint</li>
              <li>Premium tier: 1000 requests/hour per endpoint</li>
              <li>Enterprise tier: Custom limits available</li>
              <li>Limits reset automatically at the end of each window</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
