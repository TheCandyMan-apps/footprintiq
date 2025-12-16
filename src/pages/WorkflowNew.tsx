import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function WorkflowNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger_type: "manual",
  });

  const { workspace, loading: workspaceLoading } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Workflow name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!workspace?.id) {
        throw new Error("No workspace found");
      }

      const { error } = await supabase
        .from("workflows")
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          trigger_type: formData.trigger_type,
          enabled: true,
          config: {},
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workflow created successfully",
      });

      navigate("/workflows");
    } catch (error: any) {
      console.error("Error creating workflow:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create workflow",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/workflows")}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workflows
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Workflow</CardTitle>
          <CardDescription>
            Set up an automated workflow to streamline your security operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Weekly User Scan"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this workflow does..."
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger">Trigger Type</Label>
              <Select
                value={formData.trigger_type}
                onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}
                disabled={loading}
              >
                <SelectTrigger id="trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Workflow
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/workflows")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
