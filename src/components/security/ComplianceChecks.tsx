import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

export function ComplianceChecks() {
  const { data: checks, isLoading } = useQuery({
    queryKey: ["compliance-checks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_checks" as any)
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass": return <CheckCircle className="h-5 w-5 text-success" />;
      case "fail": return <XCircle className="h-5 w-5 text-destructive" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-warning" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass": return "success";
      case "fail": return "destructive";
      case "warning": return "warning";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return <div>Loading compliance checks...</div>;
  }

  return (
    <div className="space-y-4">
      {checks?.map((check: any) => (
        <Card key={check.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1">
                {getStatusIcon(check.status)}
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{check.check_type}</h3>
                  <Badge variant={getStatusColor(check.status) as any}>
                    {check.status}
                  </Badge>
                  <Badge variant="outline">{check.regulation}</Badge>
                </div>
                {check.remediation && (
                  <p className="text-sm text-muted-foreground">{check.remediation}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Last checked: {format(new Date(check.checked_at), "PPp")}
                </p>
              </div>
            </div>
            {check.status !== "pass" && (
              <Button size="sm" variant="outline">
                Fix Issues
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
