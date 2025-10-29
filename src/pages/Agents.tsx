import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Clock, CheckCircle, XCircle, TrendingUp, FileText, Database } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_configs' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: runs = [] } = useQuery({
    queryKey: ['agent-runs', selectedAgent],
    queryFn: async () => {
      let query = supabase
        .from('agent_runs' as any)
        .select('*, agent_configs(name)')
        .order('started_at', { ascending: false })
        .limit(20);
      
      if (selectedAgent) {
        query = query.eq('agent_id', selectedAgent);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const toggleAgentMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('agent_configs' as any)
        .update({ is_enabled: enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Agent updated');
      supabase.from('agent_configs').select('*');
    },
  });

  const executeAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const { data, error } = await supabase.functions.invoke('agent-execute', {
        body: { agentId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Agent executed in ${data.runtimeMs}ms`);
      supabase.from('agent_runs').select('*');
    },
  });

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-5 w-5" />;
      case 'summary': return <FileText className="h-5 w-5" />;
      case 'data_qa': return <Database className="h-5 w-5" />;
      default: return <Play className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      success: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      failed: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      running: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
      pending: { variant: "outline", icon: <Clock className="h-3 w-3" /> },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="AI Agents - FootprintIQ"
        description="Manage internal AI agents for automated analysis and intelligence gathering"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI Agents</h1>
            <p className="text-muted-foreground">
              Automated analysts working on your internal data
            </p>
          </div>

          <Tabs defaultValue="agents" className="space-y-4">
            <TabsList>
              <TabsTrigger value="agents">Active Agents</TabsTrigger>
              <TabsTrigger value="runs">Execution History</TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <Card key={agent.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getAgentIcon(agent.agent_type)}
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                        </div>
                        <Switch
                          checked={agent.is_enabled}
                          onCheckedChange={(enabled) =>
                            toggleAgentMutation.mutate({ id: agent.id, enabled })
                          }
                        />
                      </div>
                      <CardDescription>{agent.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Type</span>
                          <Badge variant="outline">{agent.agent_type}</Badge>
                        </div>
                        {agent.schedule && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Schedule</span>
                            <code className="text-xs">{agent.schedule}</code>
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => executeAgentMutation.mutate(agent.id)}
                          disabled={!agent.is_enabled || executeAgentMutation.isPending}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Run Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="runs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Executions</CardTitle>
                  <CardDescription>Last 20 agent runs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {runs.map((run) => (
                      <div 
                        key={run.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{run.agent_configs?.name || 'Unknown Agent'}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(run.started_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {run.runtime_ms && (
                            <span className="text-sm text-muted-foreground">
                              {run.runtime_ms}ms
                            </span>
                          )}
                          {getStatusBadge(run.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
