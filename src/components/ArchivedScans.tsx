import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArchiveRestore, Trash2, Loader2, Clock, FileSearch, X } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Scan = Database['public']['Tables']['scans']['Row'];
type ScanJob = Database['public']['Tables']['scan_jobs']['Row'];

export function ArchivedScans() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [scanJobs, setScanJobs] = useState<ScanJob[]>([]);
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set());
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
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

  const handleBulkRestore = async (type: 'scans' | 'jobs') => {
    const selected = type === 'scans' ? selectedScans : selectedJobs;
    if (selected.size === 0) return;

    try {
      const table = type === 'scans' ? 'scans' : 'scan_jobs';
      const { error } = await supabase
        .from(table as any)
        .update({ archived_at: null })
        .in('id', Array.from(selected));

      if (error) throw error;

      toast({
        title: `${selected.size} scans restored`,
        description: 'The selected scans have been restored successfully',
      });

      if (type === 'scans') {
        setSelectedScans(new Set());
      } else {
        setSelectedJobs(new Set());
      }

      loadArchivedItems();
    } catch (error: any) {
      console.error('Failed to restore scans:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore scans',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async (type: 'scans' | 'jobs') => {
    const selected = type === 'scans' ? selectedScans : selectedJobs;
    if (selected.size === 0) return;

    if (!confirm(`Are you sure you want to permanently delete ${selected.size} scans? This action cannot be undone.`)) {
      return;
    }

    try {
      const table = type === 'scans' ? 'scans' : 'scan_jobs';
      const { error } = await supabase
        .from(table as any)
        .delete()
        .in('id', Array.from(selected));

      if (error) throw error;

      toast({
        title: `${selected.size} scans deleted`,
        description: 'The selected scans have been permanently deleted',
      });

      if (type === 'scans') {
        setSelectedScans(new Set());
      } else {
        setSelectedJobs(new Set());
      }

      loadArchivedItems();
    } catch (error: any) {
      console.error('Failed to delete scans:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete scans',
        variant: 'destructive',
      });
    }
  };

  const toggleScanSelection = (scanId: string) => {
    const newSelected = new Set(selectedScans);
    if (newSelected.has(scanId)) {
      newSelected.delete(scanId);
    } else {
      newSelected.add(scanId);
    }
    setSelectedScans(newSelected);
  };

  const toggleJobSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const toggleSelectAllScans = () => {
    if (selectedScans.size === scans.length) {
      setSelectedScans(new Set());
    } else {
      setSelectedScans(new Set(scans.map(s => s.id)));
    }
  };

  const toggleSelectAllJobs = () => {
    if (selectedJobs.size === scanJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(scanJobs.map(j => j.id)));
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
            {/* Bulk Actions Bar */}
            {selectedScans.size > 0 && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {selectedScans.size} scan{selectedScans.size !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedScans(new Set())}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkRestore('scans')}
                  >
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Restore Selected
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkDelete('scans')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}

            {scans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No archived scans
              </p>
            ) : (
              <div className="space-y-3">
                {/* Select All */}
                <div className="flex items-center gap-3 px-4 py-2 border-b">
                  <Checkbox
                    checked={selectedScans.size === scans.length && scans.length > 0}
                    onCheckedChange={toggleSelectAllScans}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all {scans.length} scans
                  </span>
                </div>
                {scans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center gap-3 p-4 border rounded-lg"
                  >
                    <Checkbox
                      checked={selectedScans.has(scan.id)}
                      onCheckedChange={() => toggleScanSelection(scan.id)}
                    />
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
            {/* Bulk Actions Bar */}
            {selectedJobs.size > 0 && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {selectedJobs.size} scan{selectedJobs.size !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedJobs(new Set())}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkRestore('jobs')}
                  >
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Restore Selected
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkDelete('jobs')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}

            {scanJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No archived username scans
              </p>
            ) : (
              <div className="space-y-3">
                {/* Select All */}
                <div className="flex items-center gap-3 px-4 py-2 border-b">
                  <Checkbox
                    checked={selectedJobs.size === scanJobs.length && scanJobs.length > 0}
                    onCheckedChange={toggleSelectAllJobs}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all {scanJobs.length} scans
                  </span>
                </div>
                {scanJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 p-4 border rounded-lg"
                  >
                    <Checkbox
                      checked={selectedJobs.has(job.id)}
                      onCheckedChange={() => toggleJobSelection(job.id)}
                    />
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
