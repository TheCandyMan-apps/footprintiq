import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArchiveRestore, Trash2, Loader2, Clock, FileSearch } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Scan = Database['public']['Tables']['scans']['Row'];
type ScanJob = Database['public']['Tables']['scan_jobs']['Row'];

export function ArchivedScans() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [scanJobs, setScanJobs] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadArchivedItems();
  }, []);

  const loadArchivedItems = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Load archived scans
      const { data: scansData, error: scansError } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false });

      if (scansError) throw scansError;
      setScans(scansData || []);

      // Load archived scan jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('scan_jobs')
        .select('*')
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false });

      if (jobsError) throw jobsError;
      setScanJobs(jobsData || []);
    } catch (error: any) {
      console.error('Failed to load archived items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load archived scans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreScan = async (scanId: string) => {
    try {
      const { error } = await supabase
        .from('scans')
        .update({ archived_at: null })
        .eq('id', scanId);

      if (error) throw error;

      toast({
        title: 'Scan restored',
        description: 'The scan has been restored successfully',
      });

      loadArchivedItems();
    } catch (error: any) {
      console.error('Failed to restore scan:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore scan',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    if (!confirm('Are you sure you want to permanently delete this scan? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      toast({
        title: 'Scan deleted',
        description: 'The scan has been permanently deleted',
      });

      loadArchivedItems();
    } catch (error: any) {
      console.error('Failed to delete scan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete scan',
        variant: 'destructive',
      });
    }
  };

  const handleRestoreJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('scan_jobs')
        .update({ archived_at: null })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: 'Scan restored',
        description: 'The scan has been restored successfully',
      });

      loadArchivedItems();
    } catch (error: any) {
      console.error('Failed to restore scan:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore scan',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to permanently delete this scan? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('scan_jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: 'Scan deleted',
        description: 'The scan has been permanently deleted',
      });

      loadArchivedItems();
    } catch (error: any) {
      console.error('Failed to delete scan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete scan',
        variant: 'destructive',
      });
    }
  };

  const getTarget = (scan: Scan) => {
    return scan.email || scan.phone || scan.username || 'Unknown target';
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
      <CardHeader>
        <CardTitle>Archived Scans</CardTitle>
        <CardDescription>
          Restore or permanently delete archived scans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scans">
          <TabsList className="mb-4">
            <TabsTrigger value="scans">
              Regular Scans ({scans.length})
            </TabsTrigger>
            <TabsTrigger value="username-scans">
              Username Scans ({scanJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scans">
            {scans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No archived scans
              </p>
            ) : (
              <div className="space-y-3">
                {scans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{getTarget(scan)}</span>
                        <Badge variant="outline" className="capitalize">
                          <FileSearch className="h-3 w-3 mr-1" />
                          {scan.scan_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Archived {scan.archived_at ? format(new Date(scan.archived_at), 'MMM d, yyyy h:mm a') : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreScan(scan.id)}
                      >
                        <ArchiveRestore className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteScan(scan.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="username-scans">
            {scanJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No archived username scans
              </p>
            ) : (
              <div className="space-y-3">
                {scanJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{job.username}</span>
                        <Badge variant="outline" className="text-xs">
                          {job.plan}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Archived {job.archived_at ? format(new Date(job.archived_at), 'MMM d, yyyy h:mm a') : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreJob(job.id)}
                      >
                        <ArchiveRestore className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
