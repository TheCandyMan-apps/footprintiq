import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { User, AlertTriangle } from "lucide-react";

export function BehavioralInsights() {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["behavioral-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("behavioral_profiles" as any)
        .select("*")
        .order("last_updated", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "warning";
      default: return "success";
    }
  };

  if (isLoading) {
    return <div>Loading behavioral insights...</div>;
  }

  return (
    <div className="space-y-4">
      {profiles?.map((profile: any) => (
        <Card key={profile.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold capitalize">{profile.profile_type}</h3>
                    {profile.risk_level && (
                      <Badge variant={getRiskLevelColor(profile.risk_level) as any}>
                        {profile.risk_level} risk
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {format(new Date(profile.last_updated), "PPp")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Deviation Score</p>
                <p className="text-lg font-semibold">
                  {profile.deviation_score ? profile.deviation_score.toFixed(2) : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Anomalies Detected</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{profile.anomalies_detected}</p>
                  {profile.anomalies_detected > 0 && (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Risk Level</p>
                <p className="text-lg font-semibold capitalize">
                  {profile.risk_level || "Unknown"}
                </p>
              </div>
            </div>

            {profile.current_behavior && Object.keys(profile.current_behavior).length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Current Behavior Metrics</p>
                <div className="grid gap-2 md:grid-cols-4">
                  {Object.entries(profile.current_behavior).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="p-2 bg-background border rounded">
                      <p className="text-xs text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="font-medium text-sm">
                        {typeof value === 'number' ? value.toFixed(2) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
