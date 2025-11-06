import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ExternalLink, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ScanFinding {
  site: string;
  url: string | null;
  status: string;
  raw: any;
}

interface ScanResultsTableProps {
  jobId: string;
}

export function ScanResultsTable({ jobId }: ScanResultsTableProps) {
  const [findings, setFindings] = useState<ScanFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!jobId) return;

    loadResults();
    setupRealtime();
  }, [jobId]);

  const loadResults = async () => {
    try {
      // Load job details
      const { data: jobData } = await supabase
        .from('scan_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      setJob(jobData);

      // Load findings
      const { data, error } = await supabase
        .from('scan_findings')
        .select('*')
        .eq('job_id', jobId)
        .order('site');

      if (error) throw error;
      setFindings(data || []);
    } catch (error: any) {
      console.error('Failed to load results:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scan results',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel(`scan_findings:${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scan_findings',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          setFindings((prev) => {
            const exists = prev.find((f) => f.site === payload.new.site);
            if (exists) {
              return prev.map((f) => (f.site === payload.new.site ? payload.new as ScanFinding : f));
            }
            return [...prev, payload.new as ScanFinding];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const exportAsJSON = () => {
    const json = JSON.stringify(findings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-${jobId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    const headers = ['Site', 'Status', 'URL'];
    const rows = findings.map((f) => [f.site, f.status, f.url || '']);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-${jobId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'found':
        return 'default';
      case 'not found':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const foundCount = findings.filter((f) => f.status?.toLowerCase() === 'found').length;
  const notFoundCount = findings.filter((f) => f.status?.toLowerCase() === 'not found').length;

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scan Results</CardTitle>
            {job && (
              <p className="text-sm text-muted-foreground mt-1">
                Username: {job.username} • Status: {job.status}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportAsJSON}>
              <FileJson className="mr-2 h-4 w-4" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={exportAsCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {findings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {job?.status === 'running' ? 'Scanning in progress...' : 'No results yet'}
          </p>
        ) : (
          <>
            <div className="flex gap-4 mb-4">
              <Badge variant="default">Found: {foundCount}</Badge>
              <Badge variant="secondary">Not Found: {notFoundCount}</Badge>
              <Badge variant="outline">Total: {findings.length}</Badge>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {findings.map((finding) => (
                    <TableRow key={finding.site}>
                      <TableCell className="font-medium">{finding.site}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(finding.status)}>
                          {finding.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {finding.url || '-'}
                      </TableCell>
                      <TableCell>
                        {finding.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={finding.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
