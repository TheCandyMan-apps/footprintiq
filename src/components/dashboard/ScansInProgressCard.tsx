import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, X, Eye, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ActiveScan {
  id: string;
  type: 'username' | 'advanced';
  target: string;
  status: string;
  createdAt: string;
  progress?: number;
  completedProviders?: number;
  totalProviders?: number;
}

export function ScansInProgressCard() {
  const [scans, setScans] = useState<ActiveScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingScanId, setCancelingScanId] = useState<string | null>(null);
  const [scanToDelete, setScanToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadActiveScans();
    const channel = setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const loadActiveScans = async () => {
    try {
      // Fetch from scan_jobs (username scans)
      const { data: jobs, error: jobsError } = await supabase
        .from('scan_jobs')
        .select('id, username, status, created_at')
        .in('status', ['pending', 'running'])
        .order('created_at', { ascending: false });

      // Fetch from scans (advanced scans)
      const { data: advScans, error: scansError } = await supabase
        .from('scans')
        .select('id, email, first_name, last_name, username, phone, scan_type, status, created_at')
        .in('status', ['pending', 'running'])
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      if (scansError) throw scansError;

      const activeScans: ActiveScan[] = [
        ...(jobs || []).map(job => ({
          id: job.id,
          type: 'username' as const,
          target: job.username,
          status: job.status,
          createdAt: job.created_at,
        })),
        ...(advScans || []).map(scan => {
          // Construct target from available fields
          const targetParts = [
            scan.username,
            scan.email,
            scan.first_name && scan.last_name ? `${scan.first_name} ${scan.last_name}` : null,
            scan.phone,
          ].filter(Boolean);
          
          return {
            id: scan.id,
            type: 'advanced' as const,
            target: targetParts[0] || 'Unknown',
            status: scan.status || 'unknown',
            createdAt: scan.created_at,
          };
        }),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Fetch progress for each scan
      for (const scan of activeScans) {
        const { data: progress } = await supabase
          .from('scan_progress')
          .select('completed_providers, total_providers')
          .eq('scan_id', scan.id)
          .maybeSingle();

        if (progress) {
          scan.completedProviders = progress.completed_providers || 0;
          scan.totalProviders = progress.total_providers || 0;
          scan.progress = scan.totalProviders > 0 
            ? Math.round((scan.completedProviders / scan.totalProviders) * 100)
            : 0;
        }
      }

      setScans(activeScans);
    } catch (error) {
      console.error('Error loading active scans:', error);
      toast.error('Failed to load active scans');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('active_scans_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scan_jobs',
          filter: 'status=in.(pending,running)',
        },
        () => loadActiveScans()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scans',
          filter: 'status=in.(pending,running)',
        },
        () => loadActiveScans()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scan_progress',
        },
        () => loadActiveScans()
      )
      .subscribe();

    return channel;
  };

  const handleCancelScan = async (scanId: string) => {
    setCancelingScanId(scanId);
    try {
      const { error } = await supabase.functions.invoke('cancel-scan', {
        body: { scanId },
      });

      if (error) throw error;
      toast.success('Scan cancelled successfully');
      loadActiveScans();
    } catch (error) {
      console.error('Error cancelling scan:', error);
      toast.error('Failed to cancel scan');
    } finally {
      setCancelingScanId(null);
    }
  };

  const handleDeleteScan = async (scanId: string, type: 'username' | 'advanced') => {
    try {
      const table = type === 'username' ? 'scan_jobs' : 'scans';
      const { error } = await supabase.from(table).delete().eq('id', scanId);

      if (error) throw error;
      toast.success('Scan deleted successfully');
      loadActiveScans();
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast.error('Failed to delete scan');
    } finally {
      setScanToDelete(null);
    }
  };

  const handleViewScan = (scan: ActiveScan) => {
    if (scan.type === 'username') {
      navigate(`/maigret/results/${scan.id}`);
    } else {
      navigate(`/results/${scan.id}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scans in Progress</CardTitle>
          <CardDescription>Active scans being processed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Scans in Progress</CardTitle>
          <CardDescription>
            {scans.length === 0 ? 'No active scans' : `${scans.length} active scan${scans.length > 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No scans currently running</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{scan.target}</span>
                      {getStatusBadge(scan.status)}
                      <Badge variant="outline" className="text-xs">
                        {scan.type === 'username' ? 'Username' : 'Advanced'}
                      </Badge>
                    </div>
                    
                    {scan.progress !== undefined && (
                      <div className="space-y-1">
                        <Progress value={scan.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {scan.completedProviders}/{scan.totalProviders} providers completed
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewScan(scan)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelScan(scan.id)}
                      disabled={cancelingScanId === scan.id}
                    >
                      {cancelingScanId === scan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setScanToDelete(scan.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={scanToDelete !== null} onOpenChange={() => setScanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const scan = scans.find(s => s.id === scanToDelete);
                if (scan) handleDeleteScan(scan.id, scan.type);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
