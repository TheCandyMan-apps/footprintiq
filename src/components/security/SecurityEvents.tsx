import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function SecurityEvents() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["security-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_events" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "warning";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "success";
      case "failure": return "destructive";
      case "blocked": return "warning";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return <div>Loading security events...</div>;
  }

  return (
    <div className="space-y-4">
      {events?.map((event: any) => (
        <Card key={event.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{event.event_type}</h3>
                <Badge variant={getSeverityColor(event.severity) as any}>
                  {event.severity}
                </Badge>
                <Badge variant={getStatusColor(event.status) as any}>
                  {event.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {event.action} on {event.resource_type}
              </p>
              {event.ip_address && (
                <p className="text-xs text-muted-foreground">IP: {event.ip_address}</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(event.created_at), "PPp")}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
