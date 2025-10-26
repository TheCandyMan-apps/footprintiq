import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Play,
  Pause,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MonitoringSchedule {
  id: string;
  scan_id: string;
  frequency: string;
  is_active: boolean;
  last_run: string | null;
  next_run: string;
  notification_email: string | null;
  notification_enabled: boolean;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
}

const Monitoring = () => {
  const [schedules, setSchedules] = useState<MonitoringSchedule[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scans, setScans] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newSchedule, setNewSchedule] = useState({
    scanId: "",
    frequency: "weekly",
    notificationEmail: "",
    notificationEnabled: true,
  });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadData = async () => {
    try {
      await Promise.all([loadSchedules(), loadAlerts(), loadScans()]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("monitoring_schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading schedules",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("monitoring_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading alerts",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadScans = async () => {
    try {
      const { data, error } = await supabase
        .from("scans")
        .select("id, scan_type, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setScans(data || []);
    } catch (error: any) {
      console.error("Error loading scans:", error);
    }
  };

  const handleCreateSchedule = async () => {
    if (!newSchedule.scanId) {
      toast({
        title: "Scan required",
        description: "Please select a scan to monitor",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const nextRun = new Date();
      if (newSchedule.frequency === "daily") nextRun.setDate(nextRun.getDate() + 1);
      else if (newSchedule.frequency === "weekly") nextRun.setDate(nextRun.getDate() + 7);
      else nextRun.setMonth(nextRun.getMonth() + 1);

      const { error } = await supabase
        .from("monitoring_schedules")
        .insert([
          {
            user_id: user.id,
            scan_id: newSchedule.scanId,
            frequency: newSchedule.frequency,
            next_run: nextRun.toISOString(),
            notification_email: newSchedule.notificationEmail || null,
            notification_enabled: newSchedule.notificationEnabled,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Monitoring enabled",
        description: "Your monitoring schedule has been created successfully",
      });

      setIsDialogOpen(false);
      setNewSchedule({
        scanId: "",
        frequency: "weekly",
        notificationEmail: "",
        notificationEnabled: true,
      });
      loadSchedules();
    } catch (error: any) {
      toast({
        title: "Error creating schedule",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleSchedule = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("monitoring_schedules")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: isActive ? "Monitoring paused" : "Monitoring resumed",
      });
      loadSchedules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markAlertRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("monitoring_alerts")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      loadAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from("monitoring_alerts")
        .update({ is_resolved: true })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Alert resolved",
      });
      loadAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const unreadAlerts = alerts.filter(a => !a.is_read).length;

  return (
    <>
      <SEO
        title="Monitoring & Alerts — FootprintIQ"
        description="Monitor your digital footprint continuously and receive real-time alerts for new data exposures and breaches"
        canonical="https://footprintiq.app/monitoring"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://footprintiq.app/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Monitoring",
              "item": "https://footprintiq.app/monitoring"
            }
          ]
        }}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <Bell className="w-8 h-8 text-primary" />
                  Monitoring & Alerts
                </h1>
                <p className="text-muted-foreground">
                  Continuous monitoring with real-time alerts for new exposures
                </p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Monitor
              </Button>
            </div>

            <Tabs defaultValue="alerts" className="space-y-6">
              <TabsList>
                <TabsTrigger value="alerts" className="relative">
                  Alerts
                  {unreadAlerts > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 px-1 text-xs">
                      {unreadAlerts}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="schedules">Monitoring Schedules</TabsTrigger>
              </TabsList>

              <TabsContent value="alerts" className="space-y-4">
                {alerts.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No alerts yet</h3>
                    <p className="text-muted-foreground">
                      Set up monitoring to receive alerts for new exposures
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <Card
                        key={alert.id}
                        className={`p-6 ${!alert.is_read ? "border-l-4 border-l-primary" : ""}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <span className="text-sm text-muted-foreground capitalize">
                                {alert.alert_type.replace("_", " ")}
                              </span>
                              {!alert.is_read && (
                                <Badge variant="outline" className="bg-primary/10">
                                  New
                                </Badge>
                              )}
                              {alert.is_resolved && (
                                <Badge variant="outline" className="bg-green-500/10">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{alert.title}</h3>
                            <p className="text-muted-foreground mb-4">{alert.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {!alert.is_read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markAlertRead(alert.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {!alert.is_resolved && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => resolveAlert(alert.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schedules" className="space-y-4">
                {schedules.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No monitoring schedules</h3>
                    <p className="text-muted-foreground mb-6">
                      Create a monitoring schedule to track changes over time
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Schedule
                    </Button>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {schedules.map((schedule) => (
                      <Card key={schedule.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            <span className="font-semibold capitalize">
                              {schedule.frequency}
                            </span>
                          </div>
                          <Badge variant={schedule.is_active ? "default" : "secondary"}>
                            {schedule.is_active ? "Active" : "Paused"}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                          {schedule.last_run && (
                            <p className="text-muted-foreground">
                              Last run: {new Date(schedule.last_run).toLocaleString()}
                            </p>
                          )}
                          <p className="text-muted-foreground">
                            Next run: {new Date(schedule.next_run).toLocaleString()}
                          </p>
                          {schedule.notification_enabled && schedule.notification_email && (
                            <p className="text-muted-foreground">
                              Notifications: {schedule.notification_email}
                            </p>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => toggleSchedule(schedule.id, schedule.is_active)}
                        >
                          {schedule.is_active ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Resume
                            </>
                          )}
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>

      {/* Create Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Monitoring Schedule</DialogTitle>
            <DialogDescription>
              Set up continuous monitoring for a scan to receive alerts about new exposures
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scan">Select Scan</Label>
              <Select value={newSchedule.scanId} onValueChange={(value) => setNewSchedule({ ...newSchedule, scanId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a scan to monitor..." />
                </SelectTrigger>
                <SelectContent>
                  {scans.map((scan) => (
                    <SelectItem key={scan.id} value={scan.id}>
                      {scan.scan_type} - {new Date(scan.created_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Monitoring Frequency</Label>
              <Select value={newSchedule.frequency} onValueChange={(value) => setNewSchedule({ ...newSchedule, frequency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Notification Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={newSchedule.notificationEmail}
                onChange={(e) => setNewSchedule({ ...newSchedule, notificationEmail: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Email Notifications</Label>
              <Switch
                id="notifications"
                checked={newSchedule.notificationEnabled}
                onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, notificationEnabled: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSchedule}>Create Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Monitoring;