import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { SecurityEvents } from "@/components/security/SecurityEvents";
import { ComplianceChecks } from "@/components/security/ComplianceChecks";
import { SecurityScans } from "@/components/security/SecurityScans";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Security() {
  const { data: stats } = useQuery({
    queryKey: ["security-stats"],
    queryFn: async () => {
      const { data: events } = await supabase
        .from("security_events" as any)
        .select("severity")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: scans } = await supabase
        .from("security_scans" as any)
        .select("status")
        .eq("status", "completed");

      return {
        criticalEvents: events?.filter((e: any) => e.severity === "critical").length || 0,
        totalEvents: events?.length || 0,
        completedScans: scans?.length || 0,
      };
    },
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Center</h1>
        <p className="text-muted-foreground">Monitor and manage security events, compliance, and vulnerabilities</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Events</p>
              <p className="text-2xl font-bold">{stats?.criticalEvents || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Events (7d)</p>
              <p className="text-2xl font-bold">{stats?.totalEvents || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Security Scans</p>
              <p className="text-2xl font-bold">{stats?.completedScans || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="scans">Vulnerability Scans</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <SecurityEvents />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ComplianceChecks />
        </TabsContent>

        <TabsContent value="scans" className="space-y-4">
          <SecurityScans />
        </TabsContent>
      </Tabs>
    </div>
  );
}
