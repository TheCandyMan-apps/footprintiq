import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Clock, Bell, Calendar, History, CheckCircle2, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface AutoUpdateSettings {
  id: string;
  enabled: boolean;
  schedule: 'daily' | 'weekly';
  last_check_at: string | null;
  last_update_at: string | null;
  notification_enabled: boolean;
  modules_to_watch: string[];
}

interface UpdateHistoryItem {
  id: string;
  module_name: string;
  old_version: string;
  new_version: string;
  status: 'success' | 'failed';
  error_message: string | null;
  changelog: string | null;
  updated_at: string;
}

interface ReconNgAutoUpdateSettingsProps {
  workspaceId: string;
}

export function ReconNgAutoUpdateSettings({ workspaceId }: ReconNgAutoUpdateSettingsProps) {
  const [settings, setSettings] = useState<AutoUpdateSettings | null>(null);
  const [history, setHistory] = useState<UpdateHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      loadSettings();
      loadHistory();
    }
  }, [workspaceId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('recon_ng_auto_updates')
        .select('*')
        .eq('workspace_id', workspaceId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data as AutoUpdateSettings);
      } else {
        // Create default settings
        const { data: newSettings, error: insertError } = await supabase
          .from('recon_ng_auto_updates')
          .insert({
            workspace_id: workspaceId,
            enabled: false,
            schedule: 'weekly',
            notification_enabled: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings as AutoUpdateSettings);
      }
    } catch (error: any) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load auto-update settings");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('recon_ng_update_history')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory((data || []) as UpdateHistoryItem[]);
    } catch (error: any) {
      console.error("Error loading history:", error);
    }
  };

  const updateSettings = async (updates: Partial<AutoUpdateSettings>) => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('recon_ng_auto_updates')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ ...settings, ...updates });
      toast.success("Settings updated successfully");
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">Loading settings...</div>
      </Card>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Auto-Update Settings</h3>
            <p className="text-sm text-muted-foreground">
              Automatically check for and install module updates on a schedule
            </p>
          </div>

          <div className="space-y-4">
            {/* Enable Auto-Updates */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="enabled">Enable Auto-Updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically update installed modules
                  </p>
                </div>
              </div>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(enabled) => updateSettings({ enabled })}
                disabled={saving}
              />
            </div>

            {/* Schedule */}
            {settings.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="schedule">Update Schedule</Label>
                      <p className="text-xs text-muted-foreground">
                        How often to check for updates
                      </p>
                    </div>
                  </div>
                  <Select
                    value={settings.schedule}
                    onValueChange={(schedule: 'daily' | 'weekly') => 
                      updateSettings({ schedule })
                    }
                    disabled={saving}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="notifications">Update Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified when modules are updated
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="notifications"
                    checked={settings.notification_enabled}
                    onCheckedChange={(notification_enabled) => 
                      updateSettings({ notification_enabled })
                    }
                    disabled={saving}
                  />
                </div>
              </>
            )}

            {/* Last Check Info */}
            {settings.last_check_at && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last checked:</span>
                  <span>{format(new Date(settings.last_check_at), 'PPp')}</span>
                </div>
                {settings.last_update_at && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Last updated:</span>
                    <span>{format(new Date(settings.last_update_at), 'PPp')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Update History */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5" />
              Update History
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={loadHistory}
            >
              Refresh
            </Button>
          </div>

          <ScrollArea className="h-[400px]">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No update history yet
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono">{item.module_name}</code>
                          {item.status === 'success' ? (
                            <Badge variant="default" className="flex items-center gap-1 bg-success text-success-foreground">
                              <CheckCircle2 className="h-3 w-3" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.old_version && `v${item.old_version} → `}
                          v{item.new_version}
                        </div>
                        {item.changelog && (
                          <p className="text-xs text-muted-foreground">{item.changelog}</p>
                        )}
                        {item.error_message && (
                          <p className="text-xs text-destructive">{item.error_message}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(item.updated_at), 'PPp')}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}
