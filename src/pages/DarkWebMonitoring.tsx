import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, EyeOff, Plus, Trash2, AlertTriangle, Shield, Clock, Bell } from "lucide-react";
import { SEO } from "@/components/SEO";
import { format } from "date-fns";

export default function DarkWebMonitoring() {
  const queryClient = useQueryClient();
  const [newTarget, setNewTarget] = useState({ type: "email", value: "", frequency: "daily" });

  // Fetch dark web targets
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
      return data;
    },
  });

  // Fetch findings for each target
  const { data: findings } = useQuery({
    queryKey: ["darkweb-findings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("darkweb_findings")
        .select(`
          *,
          darkweb_targets!inner(workspace_id)
        `)
        .eq("darkweb_targets.workspace_id", user.id)
        .order("observed_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: !!targets && targets.length > 0,
  });

  // Create target mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("darkweb_targets").insert({
        workspace_id: user.id,
        type: newTarget.type,
        value: newTarget.value,
        frequency: newTarget.frequency,
        active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["darkweb-targets"] });
      toast.success("Dark web target added");
      setNewTarget({ type: "email", value: "", frequency: "daily" });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add target");
    },
  });

  // Toggle target active status
  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("darkweb_targets")
        .update({ active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["darkweb-targets"] });
      toast.success("Target updated");
    },
  });

  // Delete target mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("darkweb_targets")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["darkweb-targets"] });
      toast.success("Target removed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.value.trim()) {
      toast.error("Please enter a value to monitor");
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Dark Web Monitoring | FootprintIQ"
        description="Monitor the dark web for your email, username, domain, or other identifiers. Get instant alerts when new mentions appear."
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/10 to-warning/10 shadow-elegant">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-destructive bg-clip-text text-transparent">
                Dark Web Monitoring
              </h1>
              <p className="text-muted-foreground mt-2">
                Get alerted when your identifiers appear on the dark web
              </p>
            </div>
          </div>

          {/* Add New Target */}
          <Card className="p-6 hover:shadow-elevated transition-all duration-300 border-muted/50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Add Monitoring Target</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newTarget.type} onValueChange={(v) => setNewTarget({ ...newTarget, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="username">Username</SelectItem>
                      <SelectItem value="domain">Domain</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="keyword">Keyword</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    placeholder={`Enter ${newTarget.type}...`}
                    value={newTarget.value}
                    onChange={(e) => setNewTarget({ ...newTarget, value: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={newTarget.frequency} onValueChange={(v) => setNewTarget({ ...newTarget, frequency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Target"}
              </Button>
            </form>
          </Card>

          <Tabs defaultValue="targets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="targets">
                <Eye className="w-4 h-4 mr-2" />
                Active Targets ({targets?.filter(t => t.active).length || 0})
              </TabsTrigger>
              <TabsTrigger value="findings">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Findings ({findings?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Targets Tab */}
            <TabsContent value="targets" className="space-y-4 mt-6">
              {isLoading ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Loading targets...</p>
                </Card>
              ) : !targets || targets.length === 0 ? (
                <Card className="p-12 text-center">
                  <EyeOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No monitoring targets yet</h3>
                  <p className="text-muted-foreground">Add a target above to start monitoring the dark web</p>
                </Card>
              ) : (
                targets.map((target) => {
                  const targetFindings = findings?.filter(f => f.target_id === target.id) || [];
                  
                  return (
                    <Card key={target.id} className="p-6 hover:shadow-elevated transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant={target.active ? "default" : "secondary"}>
                              {target.type}
                            </Badge>
                            <code className="text-lg font-mono font-semibold">{target.value}</code>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Frequency: {target.frequency}</span>
                            </div>
                            {target.last_checked && (
                              <div className="flex items-center gap-1">
                                <Bell className="w-4 h-4" />
                                <span>Last checked: {format(new Date(target.last_checked), "MMM d, yyyy h:mm a")}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{targetFindings.length} finding(s)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground">Active</Label>
                            <Switch
                              checked={target.active}
                              onCheckedChange={(checked) => toggleMutation.mutate({ id: target.id, active: checked })}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Remove this monitoring target?")) {
                                deleteMutation.mutate(target.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* Findings Tab */}
            <TabsContent value="findings" className="space-y-4 mt-6">
              {!findings || findings.length === 0 ? (
                <Card className="p-12 text-center">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-semibold mb-2">No dark web findings</h3>
                  <p className="text-muted-foreground">Your monitored targets haven't been found on the dark web</p>
                </Card>
              ) : (
                findings.map((finding) => (
                  <Card key={finding.id} className="p-6 border-l-4 border-l-destructive hover:shadow-elevated transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="destructive">{finding.provider}</Badge>
                          {finding.is_new && <Badge variant="outline">NEW</Badge>}
                        </div>
                        <p className="text-sm font-mono text-muted-foreground mb-2">{finding.url}</p>
                        <p className="text-xs text-muted-foreground">
                          Observed: {format(new Date(finding.observed_at), "MMM d, yyyy h:mm a")}
                        </p>
                        {finding.meta && Object.keys(finding.meta).length > 0 && (
                          <details className="mt-3">
                            <summary className="text-sm cursor-pointer text-primary hover:underline">View metadata</summary>
                            <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(finding.meta, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
