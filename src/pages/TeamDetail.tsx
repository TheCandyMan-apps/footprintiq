import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import TeamMembers from "@/components/team/TeamMembers";
import TeamActivity from "@/components/team/TeamActivity";
import TeamPresence from "@/components/team/TeamPresence";
import SharedResources from "@/components/team/SharedResources";

export default function TeamDetail() {
  const { teamId } = useParams();

  const { data: team } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams" as any)
        .select(`
          *,
          team_members(
            id,
            role,
            joined_at
          )
        `)
        .eq("id", teamId)
        .single();

      if (error) throw error;
      return data as any;
    },
  });

  if (!team) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground">@{team.slug}</p>
          {team.description && <p className="mt-2 text-sm">{team.description}</p>}
        </div>
        <TeamPresence teamId={teamId!} />
      </div>

      <Tabs defaultValue="resources" className="space-y-6">
        <TabsList>
          <TabsTrigger value="resources">Shared Resources</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          <SharedResources teamId={teamId!} />
        </TabsContent>

        <TabsContent value="members">
          <TeamMembers teamId={teamId!} />
        </TabsContent>

        <TabsContent value="activity">
          <TeamActivity teamId={teamId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
