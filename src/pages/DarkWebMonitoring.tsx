import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Plus, Trash2, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function DarkWebMonitoring() {
  const [newTarget, setNewTarget] = useState("");
  const queryClient = useQueryClient();

  // Fetch targets
  const { data: targets, isLoading } = useQuery({
    queryKey: ["darkweb-targets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("darkweb_targets")
        .select("*")
        .eq("workspace_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Add target mutation
  const addMutation = useMutation({
    mutationFn: async (identifier: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("darkweb_targets")
        .insert({
          workspace_id: user.id,
          value: identifier,
          type: "email", // Auto-detect type in future
          frequency: "daily",
          active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["darkweb-targets"] });
      setNewTarget("");
      toast.success("Target added to monitoring");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add target");
    },
  });

  // Remove target mutation
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("darkweb_targets")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["darkweb-targets"] });
      toast.success("Target removed from monitoring");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove target");
    },
  });

  const handleAdd = () => {
    if (newTarget.trim()) {
      addMutation.mutate(newTarget.trim());
    }
  };

  const getStatusIcon = (active: boolean) => {
    if (active) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Dark Web Monitoring | FootprintIQ"
        description="Monitor emails, usernames, and domains for exposure on the dark web and data breach databases."
      />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/5">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold">Dark Web Monitoring</h1>
            <p className="text-muted-foreground text-lg">
              24/7 monitoring for credentials, emails, and domains exposed in data breaches
            </p>
          </div>

          {/* Add Target */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add Monitoring Target</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email, username, or domain..."
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Button
                onClick={handleAdd}
                disabled={addMutation.isPending || !newTarget.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              We'll scan daily and alert you of any new breaches or exposures
            </p>
          </Card>

          {/* Targets List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Monitored Targets</h2>
            {isLoading ? (
              <Card className="p-6 text-center text-muted-foreground">
                Loading targets...
              </Card>
            ) : targets?.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                No targets added yet. Add your first target above.
              </Card>
            ) : (
              <div className="grid gap-4">
                {targets?.map((target) => (
                  <Card key={target.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(target.active)}
                        <div className="flex-1">
                          <div className="font-medium">{target.value}</div>
                          <div className="text-sm text-muted-foreground">
                            Added {new Date(target.created_at).toLocaleDateString()}
                            {target.last_checked && ` • Last checked ${new Date(target.last_checked).toLocaleDateString()}`}
                            {` • ${target.frequency} scans`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={target.active ? "default" : "secondary"}>
                          {target.active ? "Active" : "Paused"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMutation.mutate(target.id)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-2">How it works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Targets are checked daily at 2 AM UTC</li>
              <li>• You'll receive email alerts for new exposures</li>
              <li>• Weekly summary reports sent every Monday</li>
              <li>• Each scan costs 1 premium credit</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
