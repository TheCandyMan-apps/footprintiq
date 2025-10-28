import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface TeamActivityProps {
  teamId: string;
}

export default function TeamActivity({ teamId }: TeamActivityProps) {
  const { data: activities } = useQuery({
    queryKey: ["team-activity", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_activity_log" as any)
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as any[];
    },
  });

  const getActionBadge = (action: string) => {
    if (action.includes("create")) return <Badge>Created</Badge>;
    if (action.includes("update")) return <Badge variant="secondary">Updated</Badge>;
    if (action.includes("delete")) return <Badge variant="destructive">Deleted</Badge>;
    if (action.includes("share")) return <Badge variant="outline">Shared</Badge>;
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {activities?.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getActionBadge(activity.action)}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  {activity.resource_type && (
                    <p className="text-xs text-muted-foreground">
                      {activity.resource_type} · {activity.resource_id?.slice(0, 8)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    by User {activity.user_id.slice(0, 8)}
                  </p>
                </div>
              </div>
            ))}
            {!activities || activities.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No activity yet</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
