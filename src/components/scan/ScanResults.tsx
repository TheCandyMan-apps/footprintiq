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
  const { results, loading: resultsLoading } = useRealtimeResults(jobId);
  const { toast } = useToast();
  const jobChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
          setJob(updatedJob);
          
          // Unsubscribe when job is finished to stop updates
          if (updatedJob.status === 'finished' && jobChannelRef.current) {
            supabase.removeChannel(jobChannelRef.current);
            jobChannelRef.current = null;
          }
        }
      )
      .subscribe();

    jobChannelRef.current = channel;

    return () => {
      if (jobChannelRef.current) {
        supabase.removeChannel(jobChannelRef.current);
      }
    };
  }, [jobId]);

  const loadJob = async () => {
    try {
      const { data, error } = await supabase
        .from('scan_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error: any) {
      console.error('Failed to load job:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scan job details',
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
        <CardContent className="py-8 text-center text-muted-foreground">
          Job not found
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl sm:text-2xl font-semibold mb-2 break-words">
              Scan Results: {job.username}
            </CardTitle>
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
          resultCount={results.length}
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
                    <TableHead className="w-8 sm:w-12 text-xs sm:text-sm">#</TableHead>
                    <TableHead className="text-xs sm:text-sm">Site</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="hidden md:table-cell text-xs sm:text-sm">URL</TableHead>
                    <TableHead className="w-12 sm:w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.line_no}>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm">
                        {result.line_no}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Badge variant="outline" className="font-mono text-[10px] sm:text-xs">
                          {result.ndjson?.site || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(result.ndjson?.status)} className="text-[10px] sm:text-xs">
                          {result.ndjson?.status || 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-md truncate text-xs sm:text-sm text-muted-foreground">
                        {result.ndjson?.url || '-'}
                      </TableCell>
                      <TableCell>
                        {result.ndjson?.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <a
                              href={result.ndjson.url}
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
