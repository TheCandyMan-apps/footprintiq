import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, Trash2, FileEdit, TrendingUp } from "lucide-react";

interface ProfileChangesHistoryProps {
  workspaceId: string;
  username?: string;
}

export function ProfileChangesHistory({ workspaceId, username }: ProfileChangesHistoryProps) {
  const { data: changes, isLoading } = useQuery({
    queryKey: ["profile-changes", workspaceId, username],
    queryFn: async () => {
      let query = supabase
        .from("maigret_profile_changes")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("detected_at", { ascending: false })
        .limit(50);

      if (username) {
        query = query.eq("username", username);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return <Sparkles className="w-4 h-4 text-green-500" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'modified':
        return <FileEdit className="w-4 h-4 text-blue-500" />;
      case 'status_changed':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <FileEdit className="w-4 h-4" />;
    }
  };

  const getChangeBadgeColor = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'deleted':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      case 'modified':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'status_changed':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Loading change history...
        </div>
      </Card>
    );
  }

  if (!changes || changes.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p className="mb-2">No profile changes detected yet</p>
          <p className="text-sm">
            Changes will appear here when monitored usernames are updated
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Profile Change History</h3>
          <Badge variant="outline">{changes.length} changes</Badge>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {changes.map((change: any) => (
              <Card key={change.id} className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getChangeIcon(change.change_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-sm">
                        {change.username}
                      </span>
                      <span className="text-muted-foreground">on</span>
                      <span className="font-medium">{change.site}</span>
                      <Badge 
                        variant="outline" 
                        className={getChangeBadgeColor(change.change_type)}
                      >
                        {change.change_type}
                      </Badge>
                    </div>

                    {/* Change details */}
                    <div className="mt-2 text-sm text-muted-foreground">
                      {change.change_type === 'created' && change.change_details?.url && (
                        <div>
                          ✨ New profile found: <a 
                            href={change.change_details.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {change.change_details.url}
                          </a>
                        </div>
                      )}

                      {change.change_type === 'deleted' && change.change_details?.previousUrl && (
                        <div>
                          🗑️ Profile removed: {change.change_details.previousUrl}
                        </div>
                      )}

                      {change.change_type === 'modified' && (
                        <div>
                          📝 URL changed:
                          <br/>
                          <span className="line-through text-xs">
                            {change.change_details?.oldUrl || 'N/A'}
                          </span>
                          <br/>
                          <a 
                            href={change.change_details?.newUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {change.change_details?.newUrl || 'N/A'}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Timestamp and email status */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(change.detected_at))} ago
                      </span>
                      {change.email_sent && (
                        <Badge variant="secondary" className="text-xs">
                          📧 Alert sent
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}
