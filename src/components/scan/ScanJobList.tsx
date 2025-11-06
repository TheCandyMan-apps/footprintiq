import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, ExternalLink, Archive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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
}

export function ScanJobList() {
  const [jobs, setJobs] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('scan_jobs')
        .select('*')
        .eq('kind', 'maigret')
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(25);

      if (error) throw error;
      setJobs(data || []);
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
      const { error } = await supabase
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
