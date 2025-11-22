import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileSearch, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditViewer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  
  // Filters
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(7); // days

  useEffect(() => {
    checkAuth();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (roleData?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    await fetchAuditData();
  };

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      // Fetch workspaces for filter
      const { data: workspaceData } = await supabase
        .from('workspaces')
        .select('id, name')
        .order('name');

      setWorkspaces(workspaceData || []);

      // Fetch audit logs
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      let query = supabase
        .from('audit_activity')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (selectedWorkspace && selectedWorkspace !== 'all') {
        query = query.eq('workspace_id', selectedWorkspace);
      }

      if (selectedAction && selectedAction !== 'all') {
        query = query.eq('action', selectedAction);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by search query if present
      let filteredData = data || [];
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredData = filteredData.filter(log => 
          log.action?.toLowerCase().includes(lowerQuery) ||
          log.user_id?.toLowerCase().includes(lowerQuery) ||
          JSON.stringify(log.meta)?.toLowerCase().includes(lowerQuery)
        );
      }

      setAuditLogs(filteredData);

    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Workspace', 'User', 'Action', 'Metadata'];
    const rows = auditLogs.map(log => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.workspace_id || 'N/A',
      log.user_id || 'System',
      log.action,
      JSON.stringify(log.meta || {})
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();

    toast({
      title: 'Export Complete',
      description: `Exported ${auditLogs.length} audit log entries`
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('started')) return 'default';
    if (action.includes('failed') || action.includes('error')) return 'destructive';
    if (action.includes('completed') || action.includes('success')) return 'secondary';
    return 'outline';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Audit Log Viewer</h1>
              <p className="text-muted-foreground mt-1">
                System activity and user actions
              </p>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle>Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Workspace</label>
                  <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Workspaces</SelectItem>
                      {workspaces.map(ws => (
                        <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Action Type</label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="scan.started">Scan Started</SelectItem>
                      <SelectItem value="scan.completed">Scan Completed</SelectItem>
                      <SelectItem value="scan.failed">Scan Failed</SelectItem>
                      <SelectItem value="provider.disabled">Provider Disabled</SelectItem>
                      <SelectItem value="credits.charged">Credits Charged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <Select value={dateRange.toString()} onValueChange={(v) => setDateRange(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Last 24 hours</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Button onClick={fetchAuditData} size="sm">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSearch className="h-5 w-5" />
                <CardTitle>Audit Entries ({auditLogs.length})</CardTitle>
              </div>
              <CardDescription>
                Showing logs from the last {dateRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No audit logs found for the selected filters
                  </div>
                ) : (
                  auditLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                          </span>
                        </div>
                        {log.meta && Object.keys(log.meta).length > 0 && (
                          <div className="text-sm text-muted-foreground font-mono">
                            {JSON.stringify(log.meta, null, 2).slice(0, 150)}
                            {JSON.stringify(log.meta).length > 150 && '...'}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>User: {log.user_id?.slice(0, 8) || 'System'}</div>
                        {log.workspace_id && (
                          <div>WS: {log.workspace_id.slice(0, 8)}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
