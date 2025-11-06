import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMaigretEntitlement } from '@/hooks/useMaigretEntitlement';
import { Loader2, RefreshCw, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

interface ScanJobListProps {
  refreshTrigger?: number;
  onJobSelect?: (jobId: string) => void;
}

export function ScanJobList({ refreshTrigger, onJobSelect }: ScanJobListProps) {
  const [jobs, setJobs] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkUsernames, setBulkUsernames] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const { toast } = useToast();
  const { isPremium } = useMaigretEntitlement();

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('scan_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

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

  useEffect(() => {
    loadJobs();
  }, [refreshTrigger]);

  const handleBulkEnqueue = async () => {
    const usernames = bulkUsernames
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (usernames.length === 0) {
      toast({
        title: 'No Usernames',
        description: 'Please enter at least one username',
        variant: 'destructive',
      });
      return;
    }

    setBulkLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-enqueue-maigret', {
        body: { usernames },
      });

      if (error) throw error;

      toast({
        title: 'Bulk Scan Queued',
        description: data.message || `${data.created} scans created`,
      });

      setBulkUsernames('');
      loadJobs();
    } catch (error: any) {
      console.error('Bulk enqueue error:', error);
      toast({
        title: 'Bulk Scan Failed',
        description: error.message || 'Failed to create bulk scans',
        variant: 'destructive',
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Scans</CardTitle>
        <div className="flex gap-2">
          {isPremium && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Bulk Scan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Username Scan</DialogTitle>
                  <DialogDescription>
                    Enter one username per line to scan multiple usernames at once
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Usernames</Label>
                    <Textarea
                      placeholder="johndoe&#10;janedoe&#10;user123"
                      value={bulkUsernames}
                      onChange={(e) => setBulkUsernames(e.target.value)}
                      rows={10}
                      disabled={bulkLoading}
                    />
                  </div>
                  <Button
                    onClick={handleBulkEnqueue}
                    disabled={bulkLoading}
                    className="w-full"
                  >
                    {bulkLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Scans...
                      </>
                    ) : (
                      'Start Bulk Scan'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" size="sm" onClick={loadJobs}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No scans yet. Start your first scan above.
          </p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => onJobSelect?.(job.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{job.username}</span>
                    <Badge variant={getStatusColor(job.status)} className="text-xs">
                      {job.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {job.plan}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                    {job.tags && <span>• {job.tags}</span>}
                    {job.all_sites && <span>• All Sites</span>}
                    {job.artifacts.length > 0 && (
                      <span>• {job.artifacts.length} artifacts</span>
                    )}
                  </div>
                  {job.error && (
                    <p className="text-xs text-destructive mt-1">{job.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
