import { useEffect, useState, useRef, lazy, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useScanResultsData, ScanJob } from '@/hooks/useScanResultsData';
import { useWorkspace } from '@/hooks/useWorkspace';
import { exportResultsToJSON, exportResultsToCSV } from '@/utils/exporters';
import { generateInvestigationReport } from '@/lib/investigationReportPDF';
import { ScanProgress } from './ScanProgress';
import { ResultsTabBar } from './ResultsTabBar';
import { TabSkeleton } from './results-tabs/TabSkeleton';
import { InvestigationProvider } from '@/contexts/InvestigationContext';
import { Loader2, Shield } from 'lucide-react';
import { parseISO, isValid } from 'date-fns';

// Lazy load tab components for performance
const SummaryTab = lazy(() => import('./results-tabs/SummaryTab'));
const AccountsTab = lazy(() => import('./results-tabs/AccountsTab'));
const ConnectionsTab = lazy(() => import('./results-tabs/ConnectionsTab'));
const TimelineTab = lazy(() => import('./results-tabs/TimelineTab'));
const BreachesTab = lazy(() => import('./results-tabs/BreachesTab'));
const MapTab = lazy(() => import('./results-tabs/MapTab'));
const FreeResultsView = lazy(() => import('./results-tabs/FreeResultsView'));

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
  const { workspace } = useWorkspace();

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

  // Calculate timeline event count for conditional visibility
  const timelineEventCount = useMemo(() => {
    let count = 0;
    (results as any[]).forEach(result => {
      const meta = (result.meta || result.metadata || {}) as Record<string, any>;
      
      // Check for various date signals
      const dateFields = [
        meta.created_at, meta.joined, meta.registered, meta.member_since,
        meta.last_seen, meta.last_active, meta.last_login, meta.updated_at, meta.last_post,
        meta.breach_date, meta.pwned_date, meta.leak_date, meta.exposed_at,
        meta.profile_updated, meta.bio_updated
      ];
      
      dateFields.forEach(field => {
        if (field) {
          // Try to parse the date
          if (typeof field === 'number') {
            count++;
          } else if (typeof field === 'string') {
            try {
              const d = parseISO(field);
              if (isValid(d)) count++;
            } catch {
              // Check for year pattern
              if (/\b(20\d{2}|19\d{2})\b/.test(field)) count++;
            }
          }
        }
      });
    });
    return count;
  }, [results]);

  // Determine if Timeline tab should be visible
  // Hide for Free users when no meaningful data exists
  const showTimeline = useMemo(() => {
    const isFree = !workspace?.plan || workspace.plan === 'free';
    // Always show for paid users, show for free users only if there are timeline events
    return !isFree || timelineEventCount > 0;
  }, [workspace?.plan, timelineEventCount]);

  // Determine if user has Pro/Admin access (for Advanced UI routing)
  // Free users NEVER see Advanced UI - they are routed to FreeResultsView
  const isPremium = useMemo(() => {
    const plan = (workspace?.plan || 'free').toLowerCase();
    // Only these plans get Advanced UI: pro, admin, business, enterprise
    // Legacy names are normalized: premium, analyst, family -> pro; enterprise -> business
    const advancedPlans = ['pro', 'admin', 'business', 'enterprise', 'premium', 'analyst', 'family'];
    return advancedPlans.includes(plan);
  }, [workspace?.plan]);

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
          
          // Compute target from available fields
          const target = updatedScan.username || updatedScan.email || updatedScan.phone || '';
          
          // Map scans table fields to ScanJob interface
          const mappedJob: ScanJob = {
            id: updatedScan.id,
            username: target, // backward compat
            target: target,
            scan_type: updatedScan.scan_type || undefined,
            status: updatedScan.status,
            created_at: updatedScan.created_at,
            started_at: updatedScan.created_at,
            finished_at: updatedScan.completed_at || null,
            // Backward/forward compatible error column
            error: updatedScan.analysis_error || updatedScan.error_message || null,
            all_sites: false,
            requested_by: updatedScan.user_id
          };
          setJob(mappedJob);
          
          // Unsubscribe when job reaches any terminal status
          const terminalStatuses = ['finished', 'error', 'cancelled', 'partial', 'completed', 'completed_partial', 'completed_empty', 'failed', 'failed_timeout'];
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
    // IMPORTANT: Must match backend broadcast topic (n8n-scan-progress uses `scan_progress:${scanId}`)
    const progressChannel = supabase
      .channel(`scan_progress:${jobId}`)
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
        .select('id, username, email, phone, scan_type, status, created_at, completed_at, user_id')
        .eq('id', jobId)
        .maybeSingle();

      if (scanData) {
        // Compute target from available fields
        const target = scanData.username || scanData.email || scanData.phone || '';
        
        const mappedJob: ScanJob = {
          id: scanData.id,
          username: target, // backward compat: set username to target
          target: target,
          scan_type: scanData.scan_type || undefined,
          status: scanData.status,
          created_at: scanData.created_at,
          started_at: scanData.created_at,
          finished_at: scanData.completed_at || null,
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

  // Action handlers for toolbar
  const handleExportJSON = () => exportResultsToJSON(results as any[], jobId);
  const handleExportCSV = () => exportResultsToCSV(results as any[], jobId);
  const handleExportPDF = () => {
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
  };
  const handleNewScan = () => {
    const target = job.target ?? job.username ?? '';
    const scanType = job.scan_type || 'username';
    
    if (scanType === 'email') {
      window.location.href = `/email-breach-check?q=${encodeURIComponent(target)}`;
    } else {
      window.location.href = `/scan/usernames?q=${encodeURIComponent(target)}`;
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 p-2.5 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <Shield className="h-8 w-8 text-primary/60 hidden sm:block" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">Scan Results for:</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="default" className="text-sm sm:text-base px-3 py-1 font-semibold">
                    {job.target ?? job.username}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({job.scan_type === 'email' ? 'Email' : job.scan_type === 'phone' ? 'Phone' : 'Username'})
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={['finished', 'completed', 'completed_partial', 'completed_empty'].includes(job.status) ? 'default' : 'secondary'} className="text-xs">
                {job.status === 'completed_partial' ? 'Partial' : job.status === 'completed_empty' ? 'No results' : job.status}
              </Badge>
              {job.started_at && (
                <span>Started: {new Date(job.started_at).toLocaleString()}</span>
              )}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent/10 ring-1 ring-accent/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <Shield className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-medium text-accent">Secured & Compliant</span>
              </div>
            </div>
            {job.error && (
              <p className="text-xs text-destructive mt-1">{job.error}</p>
            )}
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
              {['finished', 'completed', 'completed_partial', 'completed_empty', 'failed', 'failed_timeout'].includes(job.status)
                ? 'No results captured—try again later or adjust tags.'
                : 'Waiting for results...'}
            </p>
          </div>
        ) : !isPremium ? (
          /* ===== FREE USER: Dedicated FreeResultsView (no tabs) ===== */
          <Suspense fallback={<TabSkeleton />}>
            <FreeResultsView 
              jobId={jobId}
              job={job}
              results={results}
            />
          </Suspense>
        ) : (
          /* ===== PRO/BUSINESS USER: Full tabbed interface ===== */
          <InvestigationProvider scanId={jobId}>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              {/* Sticky Tab Bar with Toolbar */}
              <ResultsTabBar 
                tabCounts={tabCounts} 
                hasGeoData={hasGeoData} 
                showTimeline={showTimeline}
                onExportJSON={handleExportJSON}
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                onNewScan={handleNewScan}
                actionsDisabled={results.length === 0}
              />

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
                    <ConnectionsTab results={results} username={job.username} jobId={jobId} />
                  </Suspense>
                </TabsContent>

                {showTimeline && (
                  <TabsContent value="timeline" className="mt-0">
                    <Suspense fallback={<TabSkeleton />}>
                      <TimelineTab 
                        scanId={jobId} 
                        results={results} 
                        username={job.username}
                        isPremium={isPremium}
                      />
                    </Suspense>
                  </TabsContent>
                )}

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
          </InvestigationProvider>
        )}
      </CardContent>
    </Card>
  );
}
