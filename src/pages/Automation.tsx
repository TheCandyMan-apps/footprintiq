import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Plus, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Automation() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_event: 'alert_created',
    steps: [] as any[],
  });

  const { data: playbooks, isLoading } = useQuery<any[]>({
    queryKey: ['playbooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playbooks' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: playbookRuns } = useQuery<any[]>({
    queryKey: ['playbook-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playbook_runs' as any)
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const createPlaybookMutation = useMutation({
    mutationFn: async (newPlaybook: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('playbooks' as any)
        .insert({
          ...newPlaybook,
          created_by: user.id,
          workspace_id: user.id, // Should use actual workspace
          definition: { steps: newPlaybook.steps },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      toast.success('Playbook created successfully');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create playbook: ${error.message}`);
    },
  });

  const executePlaybookMutation = useMutation({
    mutationFn: async (playbookId: string) => {
      const { data, error } = await supabase.functions.invoke('playbook-execute', {
        body: {
          playbookId,
          triggerData: {
            event: 'manual_trigger',
            timestamp: new Date().toISOString(),
          },
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbook-runs'] });
      toast.success('Playbook executed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to execute playbook: ${error.message}`);
    },
  });

  const deletePlaybookMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('playbooks' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      toast.success('Playbook deleted');
    },
  });

  const togglePlaybookMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('playbooks' as any)
        .update({ enabled })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger_event: 'alert_created',
      steps: [],
    });
    setSelectedPlaybook(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPlaybookMutation.mutate(formData);
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { run: 'notify_slack' }],
    });
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    });
  };

  const updateStep = (index: number, action: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { run: action };
    setFormData({ ...formData, steps: newSteps });
  };

  const availableActions = [
    { value: 'notify_slack', label: 'Send to Slack' },
    { value: 'notify_teams', label: 'Send to Teams' },
    { value: 'send_email', label: 'Send Email' },
    { value: 'send_to_misp', label: 'Push to MISP' },
    { value: 'create_case', label: 'Create Case' },
    { value: 'create_alert', label: 'Create Alert' },
  ];

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <SEO
        title="Automation & Playbooks"
        description="Automate your OSINT workflows with custom playbooks"
      />
      <Header />
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Automation & Playbooks</h1>
            <p className="text-muted-foreground mt-2">
              Build and manage automated workflows
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Playbook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create Playbook</DialogTitle>
                  <DialogDescription>
                    Define an automated workflow that triggers on specific events
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trigger">Trigger Event</Label>
                    <Select
                      value={formData.trigger_event}
                      onValueChange={(value) => setFormData({ ...formData, trigger_event: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alert_created">Alert Created</SelectItem>
                        <SelectItem value="high_risk_finding">High Risk Finding</SelectItem>
                        <SelectItem value="new_breach">New Breach Detected</SelectItem>
                        <SelectItem value="dark_web_mention">Dark Web Mention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Actions</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addStep}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Step
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.steps.map((step, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <span className="text-sm text-muted-foreground">{index + 1}.</span>
                          <Select
                            value={step.run}
                            onValueChange={(value) => updateStep(index, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableActions.map((action) => (
                                <SelectItem key={action.value} value={action.value}>
                                  {action.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStep(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {formData.steps.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No steps added yet. Click "Add Step" to get started.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPlaybookMutation.isPending}>
                    Create Playbook
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playbooks?.map((playbook) => (
            <Card key={playbook.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{playbook.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {playbook.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Badge variant={playbook.enabled ? 'default' : 'secondary'}>
                    {playbook.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trigger:</span>
                      <span className="font-medium">{playbook.trigger_event}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Steps:</span>
                      <span className="font-medium">
                        {(playbook.definition as any)?.steps?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Runs:</span>
                      <span className="font-medium">{playbook.run_count}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => executePlaybookMutation.mutate(playbook.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePlaybookMutation.mutate({
                        id: playbook.id,
                        enabled: !playbook.enabled
                      })}
                    >
                      {playbook.enabled ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deletePlaybookMutation.mutate(playbook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {playbooks?.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No playbooks yet. Create one to automate your workflows.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}