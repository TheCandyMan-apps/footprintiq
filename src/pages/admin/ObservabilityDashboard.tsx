import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Activity, AlertTriangle, CheckCircle, XCircle, TrendingUp, Play, AlertCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Label } from "@/components/ui/label";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

export default function ObservabilityDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRunningMonitor, setIsRunningMonitor] = useState(false);

  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "medium" as const,
    impact: "",
    slack_thread_url: "",
  });

  const { data: slos } = useQuery({
    queryKey: ["slo-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slo_definitions")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentMeasurements } = useQuery({
    queryKey: ["slo-measurements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slo_measurements")
        .select("*, slo_definitions(*)")
        .order("measured_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: incidents } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: alertEvents } = useQuery({
    queryKey: ["alert-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alert_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const runMonitor = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("slo-monitor");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slo-measurements"] });
      queryClient.invalidateQueries({ queryKey: ["alert-events"] });
      toast({
        title: "SLO Check Complete",
        description: "Monitoring check executed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Monitor Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsRunningMonitor(false);
    },
  });

  const createIncident = useMutation({
    mutationFn: async (data: typeof newIncident) => {
      const { data: result, error } = await supabase.functions.invoke("create-incident", {
        body: data,
      });
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setIsCreateDialogOpen(false);
      setNewIncident({
        title: "",
        description: "",
        severity: "medium",
        impact: "",
        slack_thread_url: "",
      });
      toast({
        title: "Incident Created",
        description: "Incident has been logged and is being tracked",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Incident",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRunMonitor = () => {
    setIsRunningMonitor(true);
    runMonitor.mutate();
  };

  const getSLOStatus = (slo: any) => {
    const recent = recentMeasurements
      ?.filter((m) => m.slo_id === slo.id)
      .slice(0, 5);
    
    if (!recent || recent.length === 0) return "unknown";
    
    const violationCount = recent.filter((m) => m.is_violation).length;
    if (violationCount === 0) return "healthy";
    if (violationCount < recent.length / 2) return "degraded";
    return "critical";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-600";
      case "degraded": return "text-yellow-600";
      case "critical": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "degraded": return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "critical": return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Observability Dashboard"
        description="Monitor SLOs, incidents, and system health"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <AdminBreadcrumb currentPage="Observability Dashboard" />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Observability</h1>
            <p className="text-muted-foreground">
              SLO monitoring, alerts, and incident management
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleRunMonitor}
              disabled={isRunningMonitor}
              variant="outline"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunningMonitor ? "Running..." : "Run Check"}
            </Button>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Create Incident
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Incident</DialogTitle>
                  <DialogDescription>
                    Log a new incident for tracking and resolution
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      placeholder="Brief incident description"
                      value={newIncident.title}
                      onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Detailed incident information"
                      value={newIncident.description}
                      onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Severity</Label>
                    <Select
                      value={newIncident.severity}
                      onValueChange={(value: any) => setNewIncident({ ...newIncident, severity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Impact (optional)</Label>
                    <Textarea
                      placeholder="User impact and affected systems"
                      value={newIncident.impact}
                      onChange={(e) => setNewIncident({ ...newIncident, impact: e.target.value })}
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label>Slack Thread URL (optional)</Label>
                    <Input
                      placeholder="https://workspace.slack.com/archives/..."
                      value={newIncident.slack_thread_url}
                      onChange={(e) => setNewIncident({ ...newIncident, slack_thread_url: e.target.value })}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createIncident.mutate(newIncident)}
                    disabled={!newIncident.title || createIncident.isPending}
                  >
                    {createIncident.isPending ? "Creating..." : "Create Incident"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="slos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="slos">
              <TrendingUp className="w-4 h-4 mr-2" />
              SLOs
            </TabsTrigger>
            <TabsTrigger value="incidents">
              <AlertCircle className="w-4 h-4 mr-2" />
              Incidents
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="slos" className="space-y-4">
            {slos?.map((slo) => {
              const status = getSLOStatus(slo);
              const recentForSlo = recentMeasurements
                ?.filter((m) => m.slo_id === slo.id)
                .slice(0, 1)[0];

              return (
                <Card key={slo.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status)}
                        <div>
                          <CardTitle>{slo.name}</CardTitle>
                          <CardDescription>{slo.description}</CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          slo.severity === "critical"
                            ? "destructive"
                            : slo.severity === "high"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {slo.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Target</div>
                        <div className="font-semibold">{slo.target_value}{slo.slo_type === 'latency' ? 'ms' : slo.slo_type === 'error_rate' ? '%' : ''}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Current</div>
                        <div className={`font-semibold ${getStatusColor(status)}`}>
                          {recentForSlo ? recentForSlo.measured_value.toFixed(1) : '—'}
                          {slo.slo_type === 'latency' ? 'ms' : slo.slo_type === 'error_rate' ? '%' : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Window</div>
                        <div className="font-semibold">{slo.measurement_window}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="incidents">
            <div className="space-y-4">
              {incidents && incidents.length > 0 ? (
                incidents.map((incident) => (
                  <Card key={incident.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{incident.incident_number}</Badge>
                            <Badge
                              variant={
                                incident.status === "resolved"
                                  ? "outline"
                                  : incident.severity === "critical"
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {incident.severity}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{incident.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {incident.description}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={incident.status === "resolved" ? "outline" : "default"}
                        >
                          {incident.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Started</div>
                          <div>{new Date(incident.started_at).toLocaleString()}</div>
                        </div>
                        {incident.resolved_at && (
                          <div>
                            <div className="text-muted-foreground">Resolved</div>
                            <div>{new Date(incident.resolved_at).toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <p>No incidents reported</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-4">
              {alertEvents && alertEvents.length > 0 ? (
                alertEvents.map((alert) => (
                  <Card key={alert.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{alert.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {alert.message}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            alert.severity === "critical"
                              ? "destructive"
                              : alert.severity === "high"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <p>No alerts triggered</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
