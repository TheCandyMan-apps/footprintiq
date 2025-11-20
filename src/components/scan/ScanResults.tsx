import { useEffect, useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeResults } from '@/hooks/useRealtimeResults';
import { exportResultsToJSON, exportResultsToCSV, groupByStatus } from '@/utils/exporters';
import { ScanProgress } from './ScanProgress';
import { FootprintDNACard } from '@/components/FootprintDNACard';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import { Loader2, FileJson, FileSpreadsheet, ExternalLink, Shield } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ScanResultsProps {
  jobId: string;
}

interface ScanJob {
  id: string;
  username: string;
  status: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  error: string | null;
  all_sites: boolean;
  requested_by: string | null;
}

export function ScanResults({ jobId }: ScanResultsProps) {
  const [job, setJob] = useState<ScanJob | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [broadcastResultCount, setBroadcastResultCount] = useState(0);
  const { results, loading: resultsLoading } = useRealtimeResults(jobId);
  const { toast } = useToast();
  const jobChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const progressChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    loadJob();

    // Subscribe to job status updates
    const channel = supabase
      .channel(`job_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scan_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          const updatedJob = payload.new as ScanJob;
          console.debug('[ScanResults] Job status updated:', updatedJob.status);
          setJob(updatedJob);
          
          // Unsubscribe when job reaches any terminal status
          const terminalStatuses = ['finished', 'error', 'cancelled', 'partial'];
          if (terminalStatuses.includes(updatedJob.status) && jobChannelRef.current) {
            console.debug('[ScanResults] Job terminal, unsubscribing from job channel');
            supabase.removeChannel(jobChannelRef.current);
            jobChannelRef.current = null;
          }
        }
      )
      .subscribe();

    jobChannelRef.current = channel;

    // Subscribe to Maigret progress broadcasts for real-time progress bar updates
    const progressChannel = supabase
      .channel(`scan_progress_${jobId}`)
      .on('broadcast', { event: 'provider_update' }, (payload) => {
        console.debug('[ScanResults] Provider update:', payload);
        // Update broadcast result count for optimistic progress display
        if (payload.payload?.resultCount !== undefined) {
          setBroadcastResultCount(payload.payload.resultCount);
        }
      })
      .on('broadcast', { event: 'scan_complete' }, (payload) => {
        console.debug('[ScanResults] Scan complete broadcast:', payload);
        // Refresh job data on completion
        loadJob();
      })
      .subscribe();

    progressChannelRef.current = progressChannel;

    return () => {
      if (jobChannelRef.current) {
        supabase.removeChannel(jobChannelRef.current);
      }
      if (progressChannelRef.current) {
        supabase.removeChannel(progressChannelRef.current);
      }
    };
  }, [jobId]);

  const loadJob = async () => {
    try {
      // Try new scans table first (used by scan-orchestrate)
      const { data: scanData, error: scanError } = await supabase
        .from('scans')
        .select('id, username, scan_type, status, created_at, user_id')
        .eq('id', jobId)
        .maybeSingle();

      if (scanData) {
        // Map scans table fields to expected ScanJob interface
        const mappedJob: ScanJob = {
          id: scanData.id,
          username: scanData.username || '',
          status: scanData.status,
          created_at: scanData.created_at,
          started_at: scanData.created_at,
          finished_at: scanData.status === 'completed' || scanData.status === 'failed' ? scanData.created_at : null,
          error: null,
          all_sites: false,
          requested_by: scanData.user_id
        };
        console.debug('[ScanResults] Loaded from scans table:', mappedJob);
        setJob(mappedJob);
        setJobLoading(false);
        return;
      }

      // Fallback to legacy scan_jobs table
      const { data, error } = await supabase
        .from('scan_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      console.debug('[ScanResults] Loaded from scan_jobs table:', data);
      setJob(data);
    } catch (error: any) {
      console.error('Failed to load job:', error);
      
      // Provide helpful error message
      const isNotFound = error?.code === 'PGRST116' || error?.message?.includes('not found');
      toast({
        title: isNotFound ? 'Scan Not Found' : 'Error',
        description: isNotFound 
          ? 'This scan may have failed to start. Check your scan quota and credits, then try again.'
          : 'Failed to load scan job details',
        variant: 'destructive',
      });
    } finally {
      setJobLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'found':
        return 'default';
      case 'claimed':
        return 'secondary';
      case 'not_found':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const grouped = useMemo(() => groupByStatus(results), [results]);
  const foundCount = grouped.found.length;
  const claimedCount = grouped.claimed.length;
  const notFoundCount = grouped.not_found.length;
  const unknownCount = grouped.unknown.length;

  if (jobLoading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            Scan Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This scan could not be found. It may have failed to start due to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Monthly scan limit reached</li>
            <li>Insufficient credits</li>
            <li>Tier restrictions on selected providers</li>
            <li>System error during scan creation</li>
          </ul>
          <div className="flex gap-2 pt-4">
            <Button onClick={() => window.location.href = '/scan/advanced'}>
              Start New Scan
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/billing'}>
              Check Quota & Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">Scanning Username:</div>
              <div className="text-2xl sm:text-3xl font-bold text-primary break-words">
                {job.username}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-2">
              <Badge variant={job.status === 'finished' ? 'default' : 'secondary'}>
                {job.status}
              </Badge>
              {job.started_at && (
                <span>Started: {new Date(job.started_at).toLocaleString()}</span>
              )}
              {job.finished_at && (
                <span>Finished: {new Date(job.finished_at).toLocaleString()}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 ring-1 ring-accent/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <Shield className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium text-accent">Scan secured by RLS</span>
              </div>
            </div>
            {job.error && (
              <p className="text-sm text-destructive mt-2">{job.error}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportResultsToJSON(results, jobId)}
              disabled={results.length === 0}
              className="text-xs sm:text-sm"
            >
              <FileJson className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">JSON</span>
              <span className="sm:hidden">JSON</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportResultsToCSV(results, jobId)}
              disabled={results.length === 0}
              className="text-xs sm:text-sm"
            >
              <FileSpreadsheet className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {/* Footprint DNA Card */}
        <FootprintDNACard jobId={jobId} userId={job?.requested_by || undefined} />

        {/* Progress Indicator */}
        <ScanProgress
          startedAt={job.started_at}
          finishedAt={job.finished_at}
          status={job.status}
          resultCount={Math.max(results.length, broadcastResultCount)}
          allSites={job.all_sites || false}
        />

        {resultsLoading && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {job.status === 'running' ? 'Scanning in progress...' : 'Loading results...'}
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {job.status === 'finished'
                ? 'No results captured—try again later or adjust tags.'
                : 'Waiting for results...'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Badge variant="default" className="bg-green-600 text-xs sm:text-sm">
                Found: {foundCount}
              </Badge>
              <Badge variant="secondary" className="bg-blue-600 text-xs sm:text-sm">
                Claimed: {claimedCount}
              </Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">Not Found: {notFoundCount}</Badge>
              {unknownCount > 0 && (
                <Badge variant="outline" className="bg-amber-100 text-xs sm:text-sm">
                  Unknown: {unknownCount}
                </Badge>
              )}
              <Badge variant="outline" className="ml-auto text-xs sm:text-sm">
                Total: {results.length}
              </Badge>
            </div>

            <div className="border rounded-lg overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8 sm:w-12 text-xs sm:text-sm">ID</TableHead>
                    <TableHead className="text-xs sm:text-sm">Site</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="hidden md:table-cell text-xs sm:text-sm">URL</TableHead>
                    <TableHead className="w-12 sm:w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm">
                        {result.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Badge variant="outline" className="font-mono text-[10px] sm:text-xs">
                          {result.site || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(result.status)} className="text-[10px] sm:text-xs">
                          {result.status || 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-md truncate text-xs sm:text-sm text-muted-foreground">
                        {result.url || '-'}
                      </TableCell>
                      <TableCell>
                        {result.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Open profile"
                            >
                              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* AI Insights Panel */}
            <AIInsightsPanel 
              scanData={{
                jobId,
                breaches: grouped.found.length,
                exposures: results.length,
                dataBrokers: grouped.claimed.length,
                darkWeb: grouped.unknown.length,
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
