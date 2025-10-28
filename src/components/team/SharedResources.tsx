import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, FileText, Search, Eye, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ResourceComments from "./ResourceComments";

interface SharedResourcesProps {
  teamId: string;
}

export default function SharedResources({ teamId }: SharedResourcesProps) {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  const { data: resources } = useQuery({
    queryKey: ["shared-resources", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shared_resources" as any)
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "scan": return <Search className="h-4 w-4" />;
      case "case": return <FileText className="h-4 w-4" />;
      case "report": return <FileText className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  const getPermissionBadges = (permissions: any) => {
    const perms = [];
    if (permissions?.view) perms.push(<Badge key="view" variant="outline"><Eye className="h-3 w-3 mr-1" />View</Badge>);
    if (permissions?.edit) perms.push(<Badge key="edit" variant="outline"><Edit className="h-3 w-3 mr-1" />Edit</Badge>);
    if (permissions?.delete) perms.push(<Badge key="delete" variant="outline"><Trash2 className="h-3 w-3 mr-1" />Delete</Badge>);
    return perms;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Shared Resources ({resources?.length || 0})</CardTitle>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Resource
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resources?.map((resource) => (
              <div key={resource.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getResourceIcon(resource.resource_type)}
                    <div>
                      <p className="font-medium capitalize">{resource.resource_type}</p>
                      <p className="text-xs text-muted-foreground">ID: {resource.resource_id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        Shared {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {getPermissionBadges(resource.permissions)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedResource(selectedResource === resource.id ? null : resource.id)}
                >
                  {selectedResource === resource.id ? "Hide Comments" : "View Comments"}
                </Button>
                {selectedResource === resource.id && (
                  <ResourceComments
                    teamId={teamId}
                    resourceType={resource.resource_type}
                    resourceId={resource.resource_id}
                  />
                )}
              </div>
            ))}
            {!resources || resources.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No shared resources yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
