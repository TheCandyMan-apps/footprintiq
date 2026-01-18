import { useEffect, useState, useRef, lazy, Suspense, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useScanResultsData, ScanJob } from '@/hooks/useScanResultsData';
import { exportResultsToJSON, exportResultsToCSV } from '@/utils/exporters';
import { generateInvestigationReport } from '@/lib/investigationReportPDF';
import { ScanProgress } from './ScanProgress';
import { ResultsTabBar } from './ResultsTabBar';
import { TabSkeleton } from './results-tabs/TabSkeleton';
import { Loader2, FileJson, FileSpreadsheet, Shield, FileText } from 'lucide-react';

// Lazy load tab components for performance
const SummaryTab = lazy(() => import('./results-tabs/SummaryTab'));
const AccountsTab = lazy(() => import('./results-tabs/AccountsTab'));
const ConnectionsTab = lazy(() => import('./results-tabs/ConnectionsTab'));
const TimelineTab = lazy(() => import('./results-tabs/TimelineTab'));
const BreachesTab = lazy(() => import('./results-tabs/BreachesTab'));
const MapTab = lazy(() => import('./results-tabs/MapTab'));

interface ScanResultsProps {
  jobId: string;
}

const VALID_TABS = ['summary', 'accounts', 'connections', 'timeline', 'breaches', 'map'] as const;
type TabValue = typeof VALID_TABS[number];

export function ScanResults({ jobId }: ScanResultsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [job, setJob] = useState<ScanJob | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [broadcastResultCount, setBroadcastResultCount] = useState(0);
  const { toast } = useToast();

  // Get initial tab from URL or default to 'summary'
  const tabFromUrl = searchParams.get('tab') as TabValue | null;
  const initialTab = tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'summary';
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  // Update URL when tab changes
  const handleTabChange = useCallback((value: string) => {
    const newTab = value as TabValue;
    setActiveTab(newTab);
    
    // Update URL without full page reload
    if (newTab === 'summary') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', newTab);
    }
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);
  const jobChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const progressChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Use centralized data hook
  const { 
    results, 
    loading: resultsLoading, 
    grouped, 
    tabCounts, 
    hasGeoData, 
    geoLocations, 
    breachResults 
  } = useScanResultsData(jobId);

  useEffect(() => {
    loadJob();

    // Subscribe to scan status updates (scans table used by n8n workflow)
    const channel = supabase
      .channel(`scan_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scans',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          const updatedScan = payload.new as any;
          console.debug('[ScanResults] Scan status updated:', updatedScan.status);
          
          // Map scans table fields to ScanJob interface
          const mappedJob: ScanJob = {
            id: updatedScan.id,
            username: updatedScan.username || '',
            status: updatedScan.status,
            created_at: updatedScan.created_at,
            started_at: updatedScan.created_at,
            finished_at: updatedScan.completed_at || null,
            error: updatedScan.error_message || null,
            all_sites: false,
            requested_by: updatedScan.user_id
          };
          setJob(mappedJob);
          
          // Unsubscribe when job reaches any terminal status
          const terminalStatuses = ['finished', 'error', 'cancelled', 'partial', 'completed', 'completed_partial', 'failed', 'failed_timeout'];
          if (terminalStatuses.includes(updatedScan.status) && jobChannelRef.current) {
            console.debug('[ScanResults] Scan terminal, unsubscribing from channel');
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
        if (payload.payload?.resultCount !== undefined) {
          setBroadcastResultCount(payload.payload.resultCount);
        }
      })
      .on('broadcast', { event: 'scan_complete' }, (payload) => {
        console.debug('[ScanResults] Scan complete broadcast:', payload);
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
        const mappedJob: ScanJob = {
          id: scanData.id,
          username: scanData.username || '',
          status: scanData.status,
          created_at: scanData.created_at,
          started_at: scanData.created_at,
          finished_at: ['completed', 'completed_partial', 'failed', 'failed_timeout'].includes(scanData.status) ? scanData.created_at : null,
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
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold">Scan Not Found</h2>
          </div>
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
              <Badge variant={['finished', 'completed', 'completed_partial'].includes(job.status) ? 'default' : 'secondary'}>
                {job.status === 'completed_partial' ? 'Completed (Partial)' : job.status}
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
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportResultsToJSON(results as any[], jobId)}
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
              onClick={() => exportResultsToCSV(results as any[], jobId)}
              disabled={results.length === 0}
              className="text-xs sm:text-sm"
            >
              <FileSpreadsheet className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                generateInvestigationReport({
                  job,
                  results,
                  grouped,
                  tabCounts,
                  breachResults,
                  geoLocations,
                });
                toast({
                  title: 'Report Generated',
                  description: 'Your PDF investigation report is downloading.',
                });
              }}
              disabled={results.length === 0}
              className="text-xs sm:text-sm"
            >
              <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">PDF Report</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4 sm:p-6 md:p-8 space-y-4">
        {/* Progress Indicator */}
        <ScanProgress
          startedAt={job.started_at}
          finishedAt={job.finished_at}
          status={job.status}
          resultCount={Math.max(results.length, broadcastResultCount)}
          allSites={job.all_sites || false}
        />

        {job.status === 'pending' && job.started_at && Date.now() - new Date(job.started_at).getTime() > 120000 && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-pulse">
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              ⚠️ Scan taking longer than usual - workers still processing results
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Large scans (Maigret/Sherlock) can take up to 2 minutes. Results will appear as providers complete.
            </p>
          </div>
        )}

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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Sticky Tab Bar */}
            <ResultsTabBar tabCounts={tabCounts} hasGeoData={hasGeoData} />

            {/* Tab Content - Lazy Loaded */}
            <div className="mt-6">
              <TabsContent value="summary" className="mt-0">
                <Suspense fallback={<TabSkeleton />}>
                  <SummaryTab 
                    jobId={jobId} 
                    job={job} 
                    grouped={grouped} 
                    resultsCount={results.length}
                    results={results}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="accounts" className="mt-0">
                <Suspense fallback={<TabSkeleton />}>
                  <AccountsTab results={results} jobId={jobId} />
                </Suspense>
              </TabsContent>

              <TabsContent value="connections" className="mt-0">
                <Suspense fallback={<TabSkeleton />}>
                  <ConnectionsTab results={results} username={job.username} />
                </Suspense>
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                <Suspense fallback={<TabSkeleton />}>
                  <TimelineTab 
                    scanId={jobId} 
                    results={results} 
                    username={job.username}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="breaches" className="mt-0">
                <Suspense fallback={<TabSkeleton />}>
                  <BreachesTab results={results} breachResults={breachResults} />
                </Suspense>
              </TabsContent>

              {hasGeoData && (
                <TabsContent value="map" className="mt-0">
                  <Suspense fallback={<TabSkeleton />}>
                    <MapTab locations={geoLocations} />
                  </Suspense>
                </TabsContent>
              )}
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
