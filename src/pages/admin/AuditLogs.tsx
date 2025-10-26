import { useState } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Search, Shield } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function AuditLogs() {
  const { workspace, can } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', workspace?.id, actionFilter],
    queryFn: async () => {
      if (!workspace) return [];
      
      let query = supabase
        .from('audit_logs' as any)
        .select('*, profiles(email, full_name)')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (actionFilter !== 'all') {
        query = query.ilike('action', `${actionFilter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!workspace && can('view_audit'),
  });

  const filteredLogs = auditLogs.filter((log: any) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(search) ||
      log.resource_type.toLowerCase().includes(search) ||
      log.profiles?.email?.toLowerCase().includes(search)
    );
  });

  if (!can('view_audit')) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to view audit logs.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Audit Logs"
        description="View and search workspace audit logs"
      />
      
      <div className="container py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
          <p className="text-muted-foreground">
            View all actions performed in your workspace
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by action, resource, or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="filter">Filter by Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger id="filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="workspace">Workspace</SelectItem>
                  <SelectItem value="member">Members</SelectItem>
                  <SelectItem value="api_key">API Keys</SelectItem>
                  <SelectItem value="scan">Scans</SelectItem>
                  <SelectItem value="case">Cases</SelectItem>
                  <SelectItem value="subscription">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading audit logs...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {log.profiles?.full_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {log.profiles?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{log.resource_type}</span>
                        {log.resource_id && (
                          <code className="text-xs text-muted-foreground">
                            {log.resource_id.substring(0, 8)}...
                          </code>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.ip_address || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
