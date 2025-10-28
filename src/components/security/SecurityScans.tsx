import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export function SecurityScans() {
  const { data: scans, isLoading } = useQuery({
    queryKey: ["security-scans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_scans" as any)
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "failed": return "destructive";
      case "running": return "warning";
      default: return "secondary";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return "destructive";
    if (score >= 50) return "warning";
    return "success";
  };

  if (isLoading) {
    return <div>Loading security scans...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>Start New Scan</Button>
      </div>

      {scans?.map((scan: any) => (
        <Card key={scan.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{scan.scan_type}</h3>
                <Badge variant={getStatusColor(scan.status) as any}>
                  {scan.status}
                  {scan.status === "running" && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
                </Badge>
                {scan.risk_score !== null && (
                  <Badge variant={getRiskColor(scan.risk_score) as any}>
                    Risk: {scan.risk_score}/100
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Target: {scan.target_type}
              </p>
              {scan.vulnerabilities && scan.vulnerabilities.length > 0 && (
                <p className="text-sm">
                  Found {scan.vulnerabilities.length} vulnerabilities
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Started: {format(new Date(scan.started_at), "PPp")}
                {scan.completed_at && ` • Completed: ${format(new Date(scan.completed_at), "PPp")}`}
              </p>
            </div>
            <Button size="sm" variant="outline">View Details</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
