import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Bell, BellOff, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MonitoredUsernamesManagerProps {
  workspaceId: string;
}

export function MonitoredUsernamesManager({ workspaceId }: MonitoredUsernamesManagerProps) {
  const [newUsername, setNewUsername] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const queryClient = useQueryClient();

  const { data: monitoredUsernames, isLoading } = useQuery({
    queryKey: ["monitored-usernames", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maigret_monitored_usernames")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("maigret_monitored_usernames")
        .insert({
          username: newUsername.trim(),
          workspace_id: workspaceId,
          user_id: user.id,
          alert_email: alertEmail.trim() || null,
          email_alerts_enabled: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitored-usernames", workspaceId] });
      setNewUsername("");
      setAlertEmail("");
      toast.success("Username added to monitoring");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add username");
    },
  });

  const toggleAlertsMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("maigret_monitored_usernames")
        .update({ email_alerts_enabled: enabled })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitored-usernames", workspaceId] });
      toast.success("Alert settings updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("maigret_monitored_usernames")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitored-usernames", workspaceId] });
      toast.success("Username removed from monitoring");
    },
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Monitored Usernames</h3>
          <p className="text-sm text-muted-foreground">
            Track changes to user profiles over time and receive email alerts
          </p>
        </div>

        {/* Add new username */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="username">Username to Monitor</Label>
              <Input
                id="username"
                placeholder="Enter username..."
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-email">Alert Email (optional)</Label>
              <Input
                id="alert-email"
                type="email"
                placeholder="your@email.com"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => addMutation.mutate()}
                disabled={!newUsername.trim() || addMutation.isPending}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Monitoring
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            We'll check this username every 24 hours and alert you of any changes
          </p>
        </div>

        {/* List of monitored usernames */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading monitored usernames...
            </div>
          ) : !monitoredUsernames || monitoredUsernames.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No usernames being monitored yet. Add one above to get started.
            </div>
          ) : (
            monitoredUsernames.map((monitored: any) => (
              <Card key={monitored.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-primary">
                        {monitored.username}
                      </span>
                      {monitored.email_alerts_enabled ? (
                        <Badge variant="default" className="gap-1">
                          <Bell className="w-3 h-3" />
                          Alerts On
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <BellOff className="w-3 h-3" />
                          Alerts Off
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {monitored.alert_email && (
                        <span>📧 {monitored.alert_email}</span>
                      )}
                      {monitored.last_checked_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last checked {formatDistanceToNow(new Date(monitored.last_checked_at))} ago
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={monitored.email_alerts_enabled}
                      onCheckedChange={(enabled) =>
                        toggleAlertsMutation.mutate({ id: monitored.id, enabled })
                      }
                      disabled={toggleAlertsMutation.isPending}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(monitored.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
