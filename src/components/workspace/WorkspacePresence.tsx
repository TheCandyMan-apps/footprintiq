import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users } from "lucide-react";

interface PresenceUser {
  user_id: string;
  status: string;
  last_seen: string;
  metadata?: {
    email?: string;
    page?: string;
  };
}

export function WorkspacePresence() {
  const { workspace } = useWorkspace();
  const [presence, setPresence] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!workspace) return;

    const channel = supabase.channel(`workspace:${workspace.id}:presence`);

    // Track own presence
    const updatePresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await channel.track({
        user_id: user.id,
        status: "online",
        metadata: {
          email: user.email,
          page: window.location.pathname,
        },
      });
    };

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as any[];
        setPresence(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await updatePresence();
        }
      });

    // Update presence every 30s
    const interval = setInterval(updatePresence, 30000);

    // Update on page change
    const handleRouteChange = () => updatePresence();
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("popstate", handleRouteChange);
      supabase.removeChannel(channel);
    };
  }, [workspace]);

  const onlineUsers = presence.filter((p) => p.status === "online");

  if (!workspace || onlineUsers.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          {onlineUsers.length} online
        </Badge>
        <div className="flex -space-x-2">
          {onlineUsers.slice(0, 5).map((user) => (
            <Tooltip key={user.user_id}>
              <TooltipTrigger>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user.metadata?.email?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p className="font-medium">{user.metadata?.email}</p>
                  <p className="text-muted-foreground">{user.metadata?.page}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          {onlineUsers.length > 5 && (
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="bg-muted text-xs">
                +{onlineUsers.length - 5}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
