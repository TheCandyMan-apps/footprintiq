import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  CreditCard, 
  Activity, 
  Key, 
  Loader2, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserActivityPanelProps {
  userId: string;
}

interface ScanActivity {
  id: string;
  scan_type: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  results_count: number | null;
}

interface CreditTransaction {
  id: string;
  delta: number;
  reason: string;
  created_at: string;
  meta: any;
}

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: any;
  created_at: string;
}

interface WorkspaceInfo {
  id: string;
  name: string;
  created_at: string;
  plan: string;
}

export function UserActivityPanel({ userId }: UserActivityPanelProps) {
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<ScanActivity[]>([]);
  const [credits, setCredits] = useState<CreditTransaction[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);

  useEffect(() => {
    fetchAllActivity();
  }, [userId]);

  const fetchAllActivity = async () => {
    setLoading(true);
    try {
      // Get user's workspaces
      const { data: workspacesData } = await supabase
        .from('workspaces')
        .select('id, name, created_at, plan')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      setWorkspaces(workspacesData || []);

      const workspaceIds = workspacesData?.map(w => w.id) || [];

      // Get scans from user's workspaces
      if (workspaceIds.length > 0) {
        const { data: scansData } = await supabase
          .from('scans')
          .select('id, scan_type, username, email, phone, status, created_at, completed_at')
          .in('workspace_id', workspaceIds)
          .order('created_at', { ascending: false })
          .limit(50);

        setScans((scansData || []).map(s => ({ ...s, results_count: null })));

        // Get credit transactions
        const { data: creditsData } = await supabase
          .from('credits_ledger')
          .select('id, delta, reason, created_at, meta')
          .in('workspace_id', workspaceIds)
          .order('created_at', { ascending: false })
          .limit(50);

        setCredits(creditsData || []);
      }

      // Get activity logs for this user
      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('id, action, entity_type, entity_id, metadata, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      setActivities(activityData || []);
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getScanTarget = (scan: ScanActivity) => {
    return scan.username || scan.email || scan.phone || 'Unknown target';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="scans" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="scans" className="flex items-center gap-1">
          <Search className="h-3 w-3" />
          Scans ({scans.length})
        </TabsTrigger>
        <TabsTrigger value="credits" className="flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          Credits ({credits.length})
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Activity ({activities.length})
        </TabsTrigger>
        <TabsTrigger value="workspaces" className="flex items-center gap-1">
          <Key className="h-3 w-3" />
          Workspaces ({workspaces.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scans" className="mt-4">
        <ScrollArea className="h-[300px]">
          {scans.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No scans found for this user
            </div>
          ) : (
            <div className="space-y-2">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(scan.status)}
                    <div>
                      <div className="font-medium text-sm">{getScanTarget(scan)}</div>
                      <div className="text-xs text-muted-foreground">
                        {scan.scan_type} • {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {scan.results_count !== null && (
                      <Badge variant="secondary" className="text-xs">
                        {scan.results_count} results
                      </Badge>
                    )}
                    <Badge 
                      variant={scan.status === 'completed' ? 'default' : scan.status === 'failed' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {scan.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="credits" className="mt-4">
        <ScrollArea className="h-[300px]">
          {credits.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No credit transactions found
            </div>
          ) : (
            <div className="space-y-2">
              {credits.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                >
                  <div>
                    <div className="font-medium text-sm">{tx.reason}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge 
                    variant={tx.delta > 0 ? 'default' : 'destructive'}
                    className="text-sm font-mono"
                  >
                    {tx.delta > 0 ? '+' : ''}{tx.delta}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="activity" className="mt-4">
        <ScrollArea className="h-[300px]">
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No activity logs found
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                >
                  <div>
                    <div className="font-medium text-sm">{log.action.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-muted-foreground">
                      {log.entity_type} • {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {log.entity_type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="workspaces" className="mt-4">
        <ScrollArea className="h-[300px]">
          {workspaces.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No workspaces found
            </div>
          ) : (
            <div className="space-y-2">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                >
                  <div>
                    <div className="font-medium text-sm">{ws.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Created {formatDistanceToNow(new Date(ws.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge variant="secondary">{ws.plan}</Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}