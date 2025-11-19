import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, Activity, Lock, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function SecurityDashboard() {
  const { data: securityEvents, isLoading } = useQuery({
    queryKey: ["security-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Real-time updates every 5s
  });

  const stats = {
    total: securityEvents?.length || 0,
    critical: securityEvents?.filter((e) => e.severity === "critical").length || 0,
    high: securityEvents?.filter((e) => e.severity === "high").length || 0,
    medium: securityEvents?.filter((e) => e.severity === "medium").length || 0,
    last24h: securityEvents?.filter(
      (e) => new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length || 0,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "sql_injection":
        return <AlertTriangle className="h-4 w-4" />;
      case "xss":
        return <AlertTriangle className="h-4 w-4" />;
      case "rate_limit":
        return <Activity className="h-4 w-4" />;
      case "auth_failure":
        return <Lock className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor security events and potential threats
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24h</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.last24h}</div>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">Requires immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.high}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.medium}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="high">High</TabsTrigger>
          <TabsTrigger value="injection">Injection Attempts</TabsTrigger>
          <TabsTrigger value="auth">Auth Failures</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Recent security events and potential threats</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading events...</div>
              ) : !securityEvents || securityEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No security events recorded</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-xs">
                          {format(new Date(event.created_at), "MMM dd, HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(event.event_type)}
                            <span className="text-sm">{event.event_type.replace(/_/g, " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{event.endpoint}</TableCell>
                        <TableCell className="max-w-md truncate">{event.message}</TableCell>
                        <TableCell className="font-mono text-xs">{String(event.ip_address || "N/A")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical">
          <Card>
            <CardHeader>
              <CardTitle>Critical Events</CardTitle>
              <CardDescription>Immediate attention required</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents
                    ?.filter((e) => e.severity === "critical")
                    .map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-xs">
                          {format(new Date(event.created_at), "MMM dd, HH:mm:ss")}
                        </TableCell>
                        <TableCell>{event.event_type.replace(/_/g, " ")}</TableCell>
                        <TableCell className="font-mono text-xs">{event.endpoint}</TableCell>
                        <TableCell>{event.message}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high">
          <Card>
            <CardHeader>
              <CardTitle>High Priority Events</CardTitle>
              <CardDescription>Requires attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents
                    ?.filter((e) => e.severity === "high")
                    .map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-xs">
                          {format(new Date(event.created_at), "MMM dd, HH:mm:ss")}
                        </TableCell>
                        <TableCell>{event.event_type.replace(/_/g, " ")}</TableCell>
                        <TableCell className="font-mono text-xs">{event.endpoint}</TableCell>
                        <TableCell>{event.message}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="injection">
          <Card>
            <CardHeader>
              <CardTitle>Injection Attempts</CardTitle>
              <CardDescription>SQL injection and XSS attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents
                    ?.filter((e) => e.event_type === "sql_injection" || e.event_type === "xss")
                    .map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-xs">
                          {format(new Date(event.created_at), "MMM dd, HH:mm:ss")}
                        </TableCell>
                        <TableCell>{event.event_type.replace(/_/g, " ")}</TableCell>
                        <TableCell className="font-mono text-xs">{event.endpoint}</TableCell>
                        <TableCell>{event.message}</TableCell>
                        <TableCell className="font-mono text-xs">{String(event.ip_address)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Failures</CardTitle>
              <CardDescription>Failed login attempts and unauthorized access</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents
                    ?.filter((e) => e.event_type === "auth_failure")
                    .map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-xs">
                          {format(new Date(event.created_at), "MMM dd, HH:mm:ss")}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{event.endpoint}</TableCell>
                        <TableCell>{event.message}</TableCell>
                        <TableCell className="font-mono text-xs">{String(event.ip_address)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
