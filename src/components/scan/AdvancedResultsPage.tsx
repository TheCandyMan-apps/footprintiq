/**
 * AdvancedResultsPage Component
 * 
 * Full-featured results page for Pro/Business/Admin users.
 * This component is NEVER mounted for Free users.
 * 
 * Features:
 * - Full tabbed interface (Summary, Accounts, Connections, Timeline, Breaches, Map)
 * - All forensic analysis tools
 * - Export capabilities
 * - Investigation context
 */

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
import { exportResultsToJSON, exportResultsToCSV } from '@/utils/exporters';
import { generateInvestigationReport } from '@/lib/investigationReportPDF';
import { ScanProgress } from './ScanProgress';
import { ResultsTabBar } from './ResultsTabBar';
import { TabSkeleton } from './results-tabs/TabSkeleton';
import { AccountsTabSkeleton } from './results-tabs/accounts/AccountsTabSkeleton';
import { ConnectionsTabSkeleton } from './results-tabs/ConnectionsTabSkeleton';
import { TimelineTabSkeleton } from './results-tabs/TimelineTabSkeleton';
import { InvestigationProvider } from '@/contexts/InvestigationContext';
import { Loader2, Shield } from 'lucide-react';
import { parseISO, isValid } from 'date-fns';
import { LowResultsNotice } from './LowResultsNotice';
import { ExposureScoreCard } from '@/components/results/ExposureScoreCard';
import { ExposureReductionScoreCard } from '@/components/results/ExposureReductionScoreCard';
import { ExposureReducedBadge } from '@/components/results/ExposureStatusSelector';
import { ExposureResolutionTimeline } from '@/components/results/ExposureResolutionTimeline';
import { PrivacyRiskTrendChart } from '@/components/results/PrivacyRiskTrendChart';
import { RemediationNextStepsCard } from '@/components/results/RemediationNextStepsCard';
import { StrategicNextSteps } from '@/components/results/StrategicNextSteps';
import { calculateExposureScore } from '@/lib/exposureScore';
import { calculateExposureReductionScore } from '@/lib/exposureReductionScore';
import { generateExposureDrivers } from '@/lib/exposureScoreDrivers';
import { buildRemediationPlan } from '@/lib/remediationPlan';
import { useExposureStatuses } from '@/hooks/useExposureStatuses';
import type { ExposureStatus } from '@/hooks/useExposureStatuses';
import type { Finding } from '@/lib/ufm';

// Lazy load tab components for performance
const SummaryTab = lazy(() => import('./results-tabs/SummaryTab'));
const AccountsTab = lazy(() => import('./results-tabs/AccountsTab'));
const ConnectionsTab = lazy(() => import('./results-tabs/ConnectionsTab'));
const TimelineTab = lazy(() => import('./results-tabs/TimelineTab'));
const BreachesTab = lazy(() => import('./results-tabs/BreachesTab'));
const MapTab = lazy(() => import('./results-tabs/MapTab'));
const PrivacyCenterTab = lazy(() => import('./results-tabs/PrivacyCenterTab'));
const RemediationPlanTab = lazy(() => import('./results-tabs/RemediationPlanTab'));

interface AdvancedResultsPageProps {
  jobId: string;
}

const VALID_TABS = ['summary', 'accounts', 'connections', 'timeline', 'breaches', 'map', 'remediation', 'privacy'] as const;
type TabValue = typeof VALID_TABS[number];

/** Helper: convert results to Finding[] for score calculators */
function resultsToFindings(results: any[]): Finding[] {
  return results.map(r => ({
    id: r.id || '',
    type: r.kind === 'profile_presence' ? 'social_media' : (r.kind || 'identity'),
    title: r.meta?.title || r.site || '',
    description: '',
    severity: (['low', 'medium', 'high', 'critical', 'info'].includes(r.severity) ? r.severity : 'info') as Finding['severity'],
    confidence:
      typeof (r as any).confidence === 'number' ? (r as any).confidence :
      typeof (r as any).evidence?.confidence_score === 'number' ? (r as any).evidence.confidence_score / 100 :
      0.5,
    provider: r.provider || '',
    providerCategory: '',
    evidence: [],
    impact: '',
    remediation: [],
    tags: [],
    observedAt: r.created_at || new Date().toISOString(),
  }));
}

/** Helper to compute and render ExposureScoreCard for Pro users */
function AdvancedExposureScoreSection({ results, scanId }: { results: any[]; scanId: string }) {
  const findings = useMemo(() => resultsToFindings(results), [results]);
  const {
    statuses, history, updateStatus, getStatus, getScoreImprovement, loadHistory,
  } = useExposureStatuses(scanId);

  // Load history on mount for Pro timeline
  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Apply status overrides to findings for score calculation
  const adjustedFindings = useMemo(() => {
    return findings.map(f => {
      const status = statuses[f.id]?.status;
      if (status === 'resolved') {
        return { ...f, type: 'resolved' as any, tags: [...(f.tags || []), 'resolved'] };
      }
      if (status === 'ignored') {
        return { ...f, type: 'ignored' as any, tags: [...(f.tags || []), 'ignored'] };
      }
      return f;
    });
  }, [findings, statuses]);

  const scoreResult = useMemo(() => calculateExposureScore(adjustedFindings), [adjustedFindings]);
  const reductionResult = useMemo(() => calculateExposureReductionScore(adjustedFindings), [adjustedFindings]);

  const drivers = useMemo(() => generateExposureDrivers(results), [results]);
  const level = scoreResult.score >= 80 ? 'severe' as const : scoreResult.level;

  const interpretationMap: Record<string, string> = {
    low: 'Limited public discoverability detected for this identifier.',
    moderate: 'This identifier appears across multiple public platforms.',
    high: 'High public surface area across independent platforms.',
    severe: 'Extensive public exposure detected across many sources.',
  };

  const plan = useMemo(() => buildRemediationPlan(drivers, level), [drivers, level]);

  // Mock historical data for Pro (in production this would come from DB)
  const mockHistory = useMemo(() => {
    const score = reductionResult.score;
    return [
      { date: '2w ago', score: Math.max(0, score - 12) },
      { date: '1w ago', score: Math.max(0, score - 5) },
      { date: 'Now', score },
    ];
  }, [reductionResult.score]);

  const previousScore = mockHistory.length > 1 ? mockHistory[mockHistory.length - 2].score : undefined;
  const scoreImprovement = getScoreImprovement();

  return (
    <>
      <ExposureReductionScoreCard
        score={reductionResult.score}
        level={reductionResult.level}
        previousScore={previousScore}
        history={mockHistory}
        className="mb-4"
      />
      {scoreImprovement > 0 && (
        <div className="mb-4 flex items-center justify-center">
          <ExposureReducedBadge points={scoreImprovement} />
        </div>
      )}
      <ExposureScoreCard
        score={scoreResult.score}
        level={level}
        drivers={drivers}
        categories={scoreResult.categories}
        interpretation={interpretationMap[level] || interpretationMap.low}
        className="mb-4"
      />
      <RemediationNextStepsCard
        drivers={drivers}
        plan={plan}
        className="mb-4"
      />
      <PrivacyRiskTrendChart findings={adjustedFindings} className="mb-4" />
      {history.length > 0 && (
        <ExposureResolutionTimeline history={history} className="mb-4" />
      )}
      <StrategicNextSteps className="mb-4" />
    </>
  );
}
export function AdvancedResultsPage({ jobId }: AdvancedResultsPageProps) {

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
    breachResults,
    refetch: refetchResults
  } = useScanResultsData(jobId);

  // Calculate timeline event count for conditional visibility
  const timelineEventCount = useMemo(() => {
    let count = 0;
    (results as any[]).forEach(result => {
      const meta = (result.meta || result.metadata || {}) as Record<string, any>;
      
      const dateFields = [
        meta.created_at, meta.joined, meta.registered, meta.member_since,
        meta.last_seen, meta.last_active, meta.last_login, meta.updated_at, meta.last_post,
        meta.breach_date, meta.pwned_date, meta.leak_date, meta.exposed_at,
        meta.profile_updated, meta.bio_updated
      ];
      
      dateFields.forEach(field => {
        if (field) {
          if (typeof field === 'number') {
            count++;
          } else if (typeof field === 'string') {
            try {
              const d = parseISO(field);
              if (isValid(d)) count++;
            } catch {
              if (/\b(20\d{2}|19\d{2})\b/.test(field)) count++;
            }
          }
        }
      });
    });
    return count;
  }, [results]);

  const showTimeline = timelineEventCount > 0;

  useEffect(() => {
    loadJob();

    // Subscribe to scan status updates
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
          const target = updatedScan.username || updatedScan.email || updatedScan.phone || '';
          
          const mappedJob: ScanJob = {
            id: updatedScan.id,
            username: target,
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
          
          const terminalStatuses = ['finished', 'error', 'cancelled', 'partial', 'completed', 'completed_partial', 'completed_empty', 'failed', 'failed_timeout'];
          if (terminalStatuses.includes(updatedScan.status) && jobChannelRef.current) {
            supabase.removeChannel(jobChannelRef.current);
            jobChannelRef.current = null;
          }
        }
      )
      .subscribe();

    jobChannelRef.current = channel;

    // Subscribe to progress broadcasts
    // IMPORTANT: Must match backend broadcast topic (n8n-scan-progress uses `scan_progress:${scanId}`)
    const progressChannel = supabase
      .channel(`scan_progress:${jobId}`)
      .on('broadcast', { event: 'provider_update' }, (payload) => {
        if (payload.payload?.resultCount !== undefined) {
          setBroadcastResultCount(payload.payload.resultCount);
        }
      })
      .on('broadcast', { event: 'scan_complete' }, () => {
        loadJob();
      })
      .subscribe();

    progressChannelRef.current = progressChannel;

    return () => {
      if (jobChannelRef.current) supabase.removeChannel(jobChannelRef.current);
      if (progressChannelRef.current) supabase.removeChannel(progressChannelRef.current);
    };
  }, [jobId]);

  // Fallback poll for scan status (every 5 seconds) in case realtime events are missed
  const terminalStatuses = ['completed', 'completed_partial', 'completed_empty', 'failed', 'failed_timeout', 'finished', 'error', 'cancelled'];
  
  // Determine if scan is in a terminal state
  const isTerminalStatus = job?.status ? terminalStatuses.includes(job.status) : false;
  
  useEffect(() => {
    if (!job || isTerminalStatus) {
      return;
    }
    
    const interval = setInterval(() => {
      loadJob();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [job?.status, isTerminalStatus]);

  // Reload results when scan completes but we have no results (handles missed realtime events)
  useEffect(() => {
    if (job?.status && ['completed', 'completed_empty', 'completed_partial'].includes(job.status) && results.length === 0) {
      refetchResults();
    }
  }, [job?.status, results.length, refetchResults]);

  const loadJob = async () => {
    try {
      const { data: scanData } = await supabase
        .from('scans')
        .select('id, username, email, phone, scan_type, status, created_at, completed_at, user_id')
        .eq('id', jobId)
        .maybeSingle();

      if (scanData) {
        const target = scanData.username || scanData.email || scanData.phone || '';
        
        const mappedJob: ScanJob = {
          id: scanData.id,
          username: target,
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

  // Action handlers for toolbar
  const handleExportJSON = () => exportResultsToJSON(results as any[], jobId);
  const handleExportCSV = () => exportResultsToCSV(results as any[], jobId);
  const handleExportPDF = () => {
    if (!job) return;
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
    if (!job) return;
    const target = job.target ?? job.username ?? '';
    const scanType = job.scan_type || 'username';
    
    if (scanType === 'email') {
      window.location.href = `/email-breach-check?q=${encodeURIComponent(target)}`;
    } else {
      window.location.href = `/scan/usernames?q=${encodeURIComponent(target)}`;
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
            <Button onClick={() => window.location.href = '/scan'}>
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
              Large scans can take up to 2 minutes. Results will appear as providers complete.
            </p>
          </div>
        )}

        {/* Only show loading state if scan is still in progress - never for terminal statuses */}
        {resultsLoading && results.length === 0 && !isTerminalStatus ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {job.status === 'running' ? 'Scanning in progress...' : 'Loading results...'}
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-12">
            {isTerminalStatus
              ? <LowResultsNotice variant="zero" />
              : <p className="text-sm text-muted-foreground text-center">Waiting for results...</p>}
          </div>
        ) : (
          /* ===== FULL TABBED INTERFACE ===== */
          <InvestigationProvider scanId={jobId}>
            <AdvancedExposureScoreSection results={results} scanId={jobId} />
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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

              <p className="mt-3 text-[11px] text-muted-foreground/60">
                Results show public correlations, not verified identities.{' '}
                <a href="/guides/interpret-osint-results" className="underline underline-offset-2 hover:text-primary transition-colors">Learn how to interpret results</a>
              </p>

              <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/30 text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground/70">Why this matters:</span>{' '}
                Understanding what is publicly visible about you helps you make informed privacy decisions. These results are observational — they describe what was found, not what it means about you. The goal is awareness, not alarm.
              </div>

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
                  <Suspense fallback={<AccountsTabSkeleton />}>
                    <AccountsTab results={results} jobId={jobId} />
                  </Suspense>
                </TabsContent>

                <TabsContent value="connections" className="mt-0">
                  <Suspense fallback={<ConnectionsTabSkeleton />}>
                    <ConnectionsTab 
                      results={results} 
                      username={job.username} 
                      jobId={jobId} 
                    />
                  </Suspense>
                </TabsContent>

                {showTimeline && (
                  <TabsContent value="timeline" className="mt-0">
                    <Suspense fallback={<TimelineTabSkeleton />}>
                      <TimelineTab 
                        scanId={jobId} 
                        results={results} 
                        username={job.username}
                        isPremium={true}
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

                <TabsContent value="remediation" className="mt-0">
                  <Suspense fallback={<TabSkeleton />}>
                    <RemediationPlanTab results={results} onExportPDF={handleExportPDF} />
                  </Suspense>
                </TabsContent>

                <TabsContent value="privacy" className="mt-0">
                  <Suspense fallback={<TabSkeleton />}>
                    <PrivacyCenterTab scanId={jobId} />
                  </Suspense>
                </TabsContent>
              </div>
            </Tabs>
          </InvestigationProvider>
        )}
      </CardContent>
      <div className="px-6 pb-4 space-y-2">
        <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed">
          All results are based on publicly accessible information. Nothing here implies wrongdoing or malicious intent. 
          Use this data responsibly for self-assessment, authorised research, or risk awareness.
          {" · "}
          <a href="/guides/interpret-osint-results" className="underline underline-offset-2 hover:text-muted-foreground/70 transition-colors">
            How to interpret these results
          </a>
        </p>
        <p className="text-[10px] text-muted-foreground/40 text-center leading-relaxed">
          FootprintIQ is an ethical OSINT platform designed to help individuals understand their public digital footprint. It analyses publicly available information to identify potential account exposure and correlation risks, while emphasising accuracy, transparency, and responsible interpretation.
        </p>
      </div>
    </Card>
  );
}

export default AdvancedResultsPage;
