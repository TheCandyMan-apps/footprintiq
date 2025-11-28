import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/admin/AdminNav";

export default function WorkspaceAudit() {
  const [eventType, setEventType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["workspace-audit", eventType],
    queryFn: async () => {
      let query = supabase
        .from("activity_logs" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (eventType !== "all") {
        query = query.ilike("action", `${eventType}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredLogs = auditLogs.filter((log: any) => {
    if (!searchQuery) return true;
    return (
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getActionBadge = (action: string) => {
    if (action.includes("created")) return <Badge>Created</Badge>;
    if (action.includes("updated")) return <Badge variant="secondary">Updated</Badge>;
    if (action.includes("deleted")) return <Badge variant="destructive">Deleted</Badge>;
    if (action.includes("invited")) return <Badge variant="outline">Invited</Badge>;
    return <Badge variant="secondary">{action}</Badge>;
  };

  const exportCSV = () => {
    const csv = [
      ["Timestamp", "Action", "Entity Type", "User ID", "IP Address"].join(","),
      ...filteredLogs.map((log: any) =>
        [
          new Date(log.created_at).toISOString(),
          log.action,
          log.entity_type,
          log.user_id,
          log.ip_address || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0">
            <AdminNav />
          </aside>

          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                <Shield className="h-7 w-7" />
                Workspace Audit Log
              </h1>
              <p className="text-muted-foreground">
                Complete audit trail of workspace activities
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{auditLogs.length}</CardTitle>
                  <CardDescription>Total Events</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {new Set(auditLogs.map((l: any) => l.user_id)).size}
                  </CardTitle>
                  <CardDescription>Unique Users</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {auditLogs.filter((l: any) => l.action?.includes("deleted")).length}
                  </CardTitle>
                  <CardDescription>Deletions</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Audit Events</CardTitle>
                <CardDescription>Real-time activity log with filters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Filter by action, entity, or user..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger id="event-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="workspace">Workspace</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="comment">Comment</SelectItem>
                        <SelectItem value="upload">Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={exportCSV} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>{getActionBadge(log.action)}</TableCell>
                          <TableCell>
                            <code className="text-xs">{log.entity_type}</code>
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {log.user_id?.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="text-xs">
                            {log.ip_address || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredLogs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No audit events found
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
