import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function Workflows() {
  const navigate = useNavigate();

  const { data: userWorkspace } = useQuery({
    queryKey: ["user-workspace"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: workflows } = useQuery({
    queryKey: ["workflows", userWorkspace?.workspace_id],
    queryFn: async () => {
      if (!userWorkspace?.workspace_id) return [];
      
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("workspace_id", userWorkspace.workspace_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userWorkspace?.workspace_id,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Automate your security operations</p>
        </div>
        <Button onClick={() => navigate("/workflows/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows?.map((workflow) => (
          <Card key={workflow.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{workflow.name}</CardTitle>
                <Badge variant={workflow.enabled ? "default" : "secondary"}>
                  {workflow.enabled ? "Active" : "Paused"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{workflow.description}</p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  {workflow.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Badge variant="outline" className="capitalize">{workflow.trigger_type}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
