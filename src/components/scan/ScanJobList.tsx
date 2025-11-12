import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, ExternalLink, Archive, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/hooks/useWorkspace';

interface ScanJob {
  id: string;
  username: string;
  status: string;
  plan: string;
  created_at: string;
  tags: string | null;
  all_sites: boolean;
  artifacts: string[];
  error: string | null;
  providers_completed: number | null;
  providers_total: number | null;
}

export function ScanJobList() {
  const [jobs, setJobs] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();

  const loadJobs = async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const client: any = supabase;
      const { data, error } = await client
        .from('scan_jobs')
        .select('*')
        .eq('kind', 'maigret')
        .eq('workspace_id', workspace.id)
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(25);

      if (error) throw error;
      setJobs((data || []) as ScanJob[]);
    } catch (error: any) {
      console.error('Failed to load jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scan jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();

    // Subscribe to real-time scan updates
    if (!workspace?.id) return;

    const channel = supabase
      .channel('scan_jobs_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scan_jobs',
          filter: `workspace_id=eq.${workspace.id}`,
        },
        (payload) => {
          const updatedJob = payload.new as ScanJob;
          setJobs((prevJobs) =>
            prevJobs.map((job) =>
              job.id === updatedJob.id ? { ...job, ...updatedJob } : job
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspace?.id]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'finished':
        return 'default';
      case 'running':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleArchiveJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const client: any = supabase;
      const { error } = await client
        .from('scan_jobs')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Scan archived successfully',
      });

      loadJobs();
    } catch (error: any) {
      console.error('Failed to archive job:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive scan',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between p-6 md:p-8">
        <CardTitle className="text-2xl font-semibold">Recent Scans</CardTitle>
        <Button variant="outline" size="sm" onClick={loadJobs}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-6 md:p-8 pt-0">
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No scans yet. Start your first scan to see results here.
          </p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                onClick={() => navigate(`/scan/usernames/${job.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{job.username}</span>
                    <Badge variant={getStatusVariant(job.status)} className="text-xs">
                      {job.status === 'running' && (
                        <Activity className="h-3 w-3 mr-1 animate-pulse" />
                      )}
                      {job.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {job.plan}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </span>
                    {job.tags && <span>• {job.tags}</span>}
                    {job.all_sites && <span>• All Sites</span>}
                    {job.artifacts.length > 0 && (
                      <span>• {job.artifacts.length} artifacts</span>
                    )}
                  </div>
                  
                  {/* Real-time Progress Bar */}
                  {job.status === 'running' && job.providers_total && job.providers_total > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">
                          Scanning providers...
                        </span>
                        <span className="text-primary font-semibold animate-fade-in">
                          {job.providers_completed || 0} / {job.providers_total}
                        </span>
                      </div>
                      <Progress 
                        value={((job.providers_completed || 0) / job.providers_total) * 100} 
                        className="h-2 animate-scale-in"
                      />
                    </div>
                  )}
                  
                  {job.error && (
                    <p className="text-xs text-destructive mt-1 line-clamp-1">{job.error}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/scan/usernames/${job.id}`);
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleArchiveJob(job.id, e)}
                    className="hover:bg-muted"
                    title="Archive scan"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
