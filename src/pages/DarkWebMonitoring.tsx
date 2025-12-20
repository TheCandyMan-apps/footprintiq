import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Plus, Trash2, AlertTriangle, CheckCircle2, Clock, Play, Loader2, ChevronDown, ChevronUp, Eye, Globe, Mail, User, ExternalLink } from "lucide-react";
import { DarkWebFindingsCard } from "@/components/darkweb/DarkWebFindingsCard";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DarkWebMonitoring() {
  const [newTarget, setNewTarget] = useState("");
  const [expandedTargets, setExpandedTargets] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();

  // Fetch targets
  const { data: targets, isLoading } = useQuery({
    queryKey: ["darkweb-targets", workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) throw new Error("No workspace found");

      const { data, error } = await supabase
        .from("darkweb_targets")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!workspace?.id,
  });

  // Fetch findings counts per target
  const { data: findingsCounts } = useQuery({
    queryKey: ["darkweb-findings-counts", workspace?.id],
    queryFn: async () => {
      if (!workspace?.id || !targets?.length) return {};

      const targetIds = targets.map(t => t.id);
      const { data, error } = await supabase
        .from("darkweb_findings")
        .select("target_id, severity")
        .in("target_id", targetIds);

      if (error) throw error;

      // Count findings per target
      const counts: Record<string, { total: number; critical: number; high: number; new: number }> = {};
      for (const finding of data || []) {
        if (!counts[finding.target_id]) {
          counts[finding.target_id] = { total: 0, critical: 0, high: 0, new: 0 };
        }
        counts[finding.target_id].total++;
        if (finding.severity === 'critical') counts[finding.target_id].critical++;
        if (finding.severity === 'high') counts[finding.target_id].high++;
      }
      return counts;
    },
    enabled: !!workspace?.id && !!targets?.length,
  });

  // Fetch all findings for the Findings tab
  const { data: allFindings, isLoading: findingsLoading } = useQuery({
    queryKey: ["darkweb-all-findings", workspace?.id],
    queryFn: async () => {
      if (!workspace?.id || !targets?.length) return [];

      const targetIds = targets.map(t => t.id);
      const { data, error } = await supabase
        .from("darkweb_findings")
        .select("*")
        .in("target_id", targetIds)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return data || [];
    },
    enabled: !!workspace?.id && !!targets?.length,
  });

  // Group findings by target
  const findingsByTarget = allFindings?.reduce((acc, finding) => {
    const targetId = finding.target_id;
    if (!acc[targetId]) acc[targetId] = [];
    acc[targetId].push(finding);
    return acc;
  }, {} as Record<string, typeof allFindings>) || {};

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'domain':
        return <Globe className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getTargetById = (targetId: string) => targets?.find(t => t.id === targetId);

  // Add target mutation
  const addMutation = useMutation({
    mutationFn: async (identifier: string) => {
      if (!workspace?.id) throw new Error("No workspace found");

      // Auto-detect type
      const isEmail = identifier.includes('@');
      const isDomain = identifier.includes('.') && !isEmail;
      const type = isEmail ? 'email' : isDomain ? 'domain' : 'username';

      const { data, error } = await supabase
        .from("darkweb_targets")
        .insert({
          workspace_id: workspace.id,
          value: identifier,
          type,
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
      queryClient.invalidateQueries({ queryKey: ["darkweb-findings-counts"] });
      toast.success("Target removed from monitoring");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove target");
    },
  });

  // Run scan now mutation
  const runScanMutation = useMutation({
    mutationFn: async () => {
      if (!workspace?.id) throw new Error("No workspace found");

      const { data, error } = await supabase.functions.invoke("darkweb/monitor", {
        body: { workspaceId: workspace.id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["darkweb-targets"] });
      queryClient.invalidateQueries({ queryKey: ["darkweb-findings"] });
      queryClient.invalidateQueries({ queryKey: ["darkweb-findings-counts"] });
      const checked = data?.checkedCount || data?.checked || 0;
      const found = data?.newFindings || 0;
      toast.success(`Scan complete: checked ${checked} targets, found ${found} new findings`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Scan failed");
    },
  });

  const handleAdd = () => {
    if (newTarget.trim()) {
      addMutation.mutate(newTarget.trim());
    }
  };

  const toggleExpanded = (targetId: string) => {
    setExpandedTargets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(targetId)) {
        newSet.delete(targetId);
      } else {
        newSet.add(targetId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (active: boolean) => {
    if (active) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  const getFindingsCountBadge = (targetId: string) => {
    const counts = findingsCounts?.[targetId];
    if (!counts || counts.total === 0) {
      return <Badge variant="outline" className="text-green-600 border-green-600/30">No findings</Badge>;
    }

    if (counts.critical > 0) {
      return (
        <Badge variant="destructive">
          {counts.total} finding{counts.total !== 1 ? 's' : ''} ({counts.critical} critical)
        </Badge>
      );
    }

    if (counts.high > 0) {
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">
          {counts.total} finding{counts.total !== 1 ? 's' : ''} ({counts.high} high)
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        {counts.total} finding{counts.total !== 1 ? 's' : ''}
      </Badge>
    );
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

          {/* Tabs for Targets and Findings */}
          <Tabs defaultValue="targets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="targets">Monitored Targets</TabsTrigger>
              <TabsTrigger value="findings" className="relative">
                Findings
                {allFindings && allFindings.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                    {allFindings.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Targets Tab */}
            <TabsContent value="targets" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Monitored Targets</h2>
                <Button
                  onClick={() => runScanMutation.mutate()}
                  disabled={runScanMutation.isPending || !targets?.length}
                  variant="outline"
                  size="sm"
                >
                  {runScanMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Run Scan Now
                </Button>
              </div>
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
                    <Collapsible
                      key={target.id}
                      open={expandedTargets.has(target.id)}
                      onOpenChange={() => toggleExpanded(target.id)}
                    >
                      <Card className="overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {getStatusIcon(target.active)}
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                  {target.value}
                                  <Badge variant="outline" className="text-xs">
                                    {target.type}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Added {new Date(target.created_at).toLocaleDateString()}
                                  {target.last_checked && ` • Last checked ${new Date(target.last_checked).toLocaleDateString()}`}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getFindingsCountBadge(target.id)}
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  {expandedTargets.has(target.id) ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeMutation.mutate(target.id);
                                }}
                                disabled={removeMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <CollapsibleContent>
                          <div className="border-t px-4 py-4">
                            <DarkWebFindingsCard targetId={target.id} />
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Findings Tab */}
            <TabsContent value="findings" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">All Findings</h2>
                <p className="text-sm text-muted-foreground">
                  {allFindings?.length || 0} total discoveries
                </p>
              </div>

              {findingsLoading ? (
                <Card className="p-6 text-center text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading findings...
                </Card>
              ) : !allFindings?.length ? (
                <Card className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Findings</h3>
                  <p className="text-muted-foreground">
                    Great news! No dark web exposures have been detected for your monitored targets.
                  </p>
                </Card>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    {Object.entries(findingsByTarget).map(([targetId, findings]) => {
                      const target = getTargetById(targetId);
                      if (!target) return null;

                      return (
                        <Card key={targetId} className="overflow-hidden">
                          <CardHeader className="bg-muted/30 py-3 px-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getTargetIcon(target.type)}
                                <CardTitle className="text-base font-medium">{target.value}</CardTitle>
                                <Badge variant="outline" className="text-xs">{target.type}</Badge>
                              </div>
                              <Badge variant="secondary">{findings.length} finding{findings.length !== 1 ? 's' : ''}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="divide-y divide-border">
                              {findings.map((finding) => (
                                <div key={finding.id} className="p-4 hover:bg-muted/20 transition-colors">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        {getSeverityBadge(finding.severity)}
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(finding.discovered_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <h4 className="font-medium text-sm truncate">
                                        {finding.finding_type || finding.provider || 'Unknown Source'}
                                      </h4>
                                      {finding.data_exposed && finding.data_exposed.length > 0 && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          Exposed: {finding.data_exposed.join(', ')}
                                        </p>
                                      )}
                                      {finding.metadata && typeof finding.metadata === 'object' && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {Object.entries(finding.metadata as Record<string, unknown>)
                                            .filter(([key]) => !['raw', 'html'].includes(key))
                                            .slice(0, 3)
                                            .map(([key, value]) => (
                                              <Badge key={key} variant="outline" className="text-xs">
                                                {key}: {String(value).substring(0, 30)}
                                              </Badge>
                                            ))}
                                        </div>
                                      )}
                                    </div>
                                    {finding.source_url && (
                                      <a
                                        href={finding.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>

          {/* Info */}
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-2">How it works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Targets are checked daily at 2 AM UTC</li>
              <li>• You'll receive email alerts for new exposures</li>
              <li>• Click the eye icon on any target to view findings</li>
              <li>• Each scan costs 1 premium credit per finding</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
