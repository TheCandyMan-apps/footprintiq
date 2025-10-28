import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Settings, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Teams() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", slug: "", description: "" });

  const { data: teams, refetch } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("teams" as any)
        .select(`
          *,
          team_members!inner(role)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const createTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: team, error: teamError } = await supabase
        .from("teams" as any)
        .insert({
          name: newTeam.name,
          slug: newTeam.slug,
          description: newTeam.description,
          owner_id: user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from("team_members" as any)
        .insert({
          team_id: (team as any).id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      toast.success("Team created successfully");
      setIsCreating(false);
      setNewTeam({ name: "", slug: "", description: "" });
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Collaborate with your team on security investigations</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>Set up a new team workspace for collaboration</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="Security Team Alpha"
                />
              </div>
              <div>
                <Label htmlFor="slug">Team Slug</Label>
                <Input
                  id="slug"
                  value={newTeam.slug}
                  onChange={(e) => setNewTeam({ ...newTeam, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  placeholder="security-team-alpha"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Describe your team's purpose..."
                />
              </div>
              <Button onClick={createTeam} className="w-full">Create Team</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams?.map((team) => (
          <Card key={team.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/teams/${team.id}`)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {team.name}
                  </CardTitle>
                  <CardDescription>@{team.slug}</CardDescription>
                </div>
                {team.team_members[0]?.role === "owner" && (
                  <Crown className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{team.description}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span className="capitalize">{team.team_members[0]?.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
