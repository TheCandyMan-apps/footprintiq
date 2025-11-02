import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Trash2, Mail, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DarkWebSubscription {
  id: string;
  keyword: string;
  alert_email: string;
  severity_threshold: string;
  is_active: boolean;
  last_alerted_at: string | null;
  created_at: string;
}

interface AlertHistory {
  id: string;
  alert_sent_to: string;
  severity: string;
  finding_summary: string;
  sent_at: string;
}

export default function DarkWebAlerts() {
  const [subscriptions, setSubscriptions] = useState<DarkWebSubscription[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSeverity, setNewSeverity] = useState("medium");
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
    fetchAlertHistory();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("darkweb_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions((data || []) as any);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to load alert subscriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("darkweb_alert_history")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlertHistory((data || []) as any);
    } catch (error) {
      console.error("Error fetching alert history:", error);
    }
  };

  const handleCreateSubscription = async () => {
    if (!newKeyword.trim() || !newEmail.trim()) {
      toast({
        title: "Validation Error",
        description: "Keyword and email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Get user's workspace
      const { data: workspaces } = await supabase
        .from("workspaces")
        .select("id")
        .limit(1)
        .single();

      if (!workspaces) throw new Error("No workspace found");

      const { error } = await supabase.from("darkweb_subscriptions").insert({
        workspace_id: workspaces.id,
        user_id: session.user.id,
        keyword: newKeyword.trim(),
        alert_email: newEmail.trim(),
        severity_threshold: newSeverity,
        is_active: true,
      } as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Dark web alert subscription created",
      });

      setNewKeyword("");
      setNewEmail("");
      setNewSeverity("medium");
      fetchSubscriptions();
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("darkweb_subscriptions")
        .update({ is_active: !currentState } as any)
        .eq("id", id);

      if (error) throw error;
      fetchSubscriptions();
      toast({
        title: "Success",
        description: `Alert ${!currentState ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      console.error("Error toggling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this alert subscription?")) return;

    try {
      const { error } = await supabase
        .from("darkweb_subscriptions" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchSubscriptions();
      toast({
        title: "Success",
        description: "Alert subscription deleted",
      });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      critical: "destructive",
      high: "default",
      medium: "secondary",
      low: "outline",
    };
    return colors[severity] || "outline";
  };

  return (
    <>
      <SEO
        title="Dark Web Real-Time Alerts — FootprintIQ"
        description="Set up real-time email alerts for dark web mentions. Get notified instantly when your keywords are detected on the dark web."
        canonical="https://footprintiq.app/dark-web-alerts"
      />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Dark Web Real-Time Alerts</h1>
                <p className="text-muted-foreground mt-2">
                  Get instant email notifications when your keywords are detected on the dark web
                </p>
              </div>
            </div>

            {/* Create New Alert */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Alert
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="keyword">Keyword to Monitor</Label>
                  <Input
                    id="keyword"
                    placeholder="email@company.com, username, domain"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Alert Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="security@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="severity">Minimum Severity</Label>
                  <Select value={newSeverity} onValueChange={setNewSeverity}>
                    <SelectTrigger id="severity">
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
                <div className="flex items-end">
                  <Button onClick={handleCreateSubscription} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </div>
              </div>
            </Card>

            {/* Active Subscriptions */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Active Alert Subscriptions</h2>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : subscriptions.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No alert subscriptions yet. Create your first one above to start monitoring the dark web.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold">{sub.keyword}</span>
                          <Badge variant={getSeverityColor(sub.severity_threshold)}>
                            {sub.severity_threshold}+
                          </Badge>
                          {sub.is_active ? (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {sub.alert_email}
                          </span>
                          {sub.last_alerted_at && (
                            <span>
                              Last alert: {new Date(sub.last_alerted_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={sub.is_active}
                          onCheckedChange={() => handleToggleActive(sub.id, sub.is_active)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(sub.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Alert History */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Recent Alerts Sent</h2>
              {alertHistory.length === 0 ? (
                <p className="text-muted-foreground">No alerts sent yet</p>
              ) : (
                <div className="space-y-3">
                  {alertHistory.map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(alert.sent_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{alert.finding_summary}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sent to: {alert.alert_sent_to}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}