import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Presence {
  user_id: string;
  status: string;
  current_page?: string;
  last_seen: string;
}

interface TeamPresenceProps {
  teamId: string;
}

export default function TeamPresence({ teamId }: TeamPresenceProps) {
  const [presence, setPresence] = useState<Presence[]>([]);

  useEffect(() => {
    const updatePresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("team_presence" as any)
        .upsert({
          team_id: teamId,
          user_id: user.id,
          status: "online",
          current_page: window.location.pathname,
          last_seen: new Date().toISOString(),
        });
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000);

    const channel = supabase
      .channel(`team-presence-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_presence",
          filter: `team_id=eq.${teamId}`,
        },
        async () => {
          const { data } = await supabase
            .from("team_presence" as any)
            .select("*")
            .eq("team_id", teamId)
            .eq("status", "online");

          if (data) setPresence(data as any[]);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [teamId]);

  const onlineUsers = presence.filter((p) => p.status === "online");

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="gap-1">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        {onlineUsers.length} online
      </Badge>
      <TooltipProvider>
        <div className="flex -space-x-2">
          {onlineUsers.slice(0, 5).map((p) => (
            <Tooltip key={p.user_id}>
              <TooltipTrigger>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {p.user_id.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">User {p.user_id.slice(0, 8)}</p>
                {p.current_page && (
                  <p className="text-xs text-muted-foreground">{p.current_page}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
          {onlineUsers.length > 5 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border-2 border-background text-xs">
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
