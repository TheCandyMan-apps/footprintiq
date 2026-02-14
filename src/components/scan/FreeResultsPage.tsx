/**
 * FreeResultsPage Component
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONTENT CONTRACT - STRICTLY ENFORCED
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This component MUST be the ONLY page rendered for users with plan === "free".
 * It is architecturally separate from AdvancedResultsPage.
 * 
 * ─────────────────────────────────────────────────────────────────────────────────
 * ALLOWED CONTENT (exhaustive list):
 * ─────────────────────────────────────────────────────────────────────────────────
 * 1. Header + Subtext:
 *    - "Here's what we found"
 *    - "You're viewing a limited summary of an advanced scan."
 * 
 * 2. Risk Snapshot:
 *    - Counts ONLY (Signals detected, High-confidence, Overall risk = "Unclear")
 *    - NO charts, gauges, graphs, or visualizations
 * 
 * 3. Profiles & Exposure Summary:
 *    - Total profile count (aggregated)
 *    - 2–3 example profiles (max 3)
 *    - "+ N more profiles (Pro)" indicator
 * 
 * 4. Connections Teaser:
 *    - Static placeholder card only
 *    - Text: "Connections detected" / "Related profiles and entities were found..."
 *    - NO Cytoscape, NO graph initialization, NO live visualization
 * 
 * 5. Single Pro Upgrade Block:
 *    - Benefits list
 *    - "Unlock Pro" CTA
 * 
 * ─────────────────────────────────────────────────────────────────────────────────
 * EXCLUDED CONTENT (never import, mount, or render):
 * ─────────────────────────────────────────────────────────────────────────────────
 * - Timeline Analysis component
 * - Relationship Graph / Connections graph (live Cytoscape)
 * - Digital Footprint DNA widget
 * - Privacy Score widget
 * - Catfish Detection component
 * - Anomaly Detection component
 * - Continuous Monitoring component
 * - Data Analytics Overview charts
 * - Data Quality & Source Analysis
 * - Export Artifacts / Export buttons
 * - Provider cards (Predicta, Maigret, etc.)
 * - "View Detailed Metadata" panels
 * - Any expandable JSON blocks
 * - Share / Removal action buttons
 * 
 * ─────────────────────────────────────────────────────────────────────────────────
 * EMPTY STATE HANDLING:
 * ─────────────────────────────────────────────────────────────────────────────────
 * If data is missing, show simple text empty states, NOT charts or complex UI.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useScanResultsData, ScanJob, ScanResult } from '@/hooks/useScanResultsData';
import { useRealtimeResults } from '@/hooks/useRealtimeResults';
import { ScanProgress } from './ScanProgress';
import { LowResultsNotice } from './LowResultsNotice';
import { Loader2, Shield, Eye, HelpCircle, Lock, ArrowRight, Check, User, MapPin, Users, ExternalLink, Clock } from 'lucide-react';
import { aggregateResults, type AggregatedProfile } from '@/lib/results/resultsAggregator';
import { filterOutProviderHealth } from '@/lib/providerHealthUtils';
import { ExposureScoreCard } from '@/components/results/ExposureScoreCard';
import { calculateExposureScore } from '@/lib/exposureScore';
import { generateExposureDrivers } from '@/lib/exposureScoreDrivers';
import type { Finding } from '@/lib/ufm';
import { filterFindings } from '@/lib/findingFilters';
import { PostScanUpgradeModal } from '@/components/upsell/PostScanUpgradeModal';
import { useNavigate } from 'react-router-dom';

import { HiddenInsightsTeaser } from '@/components/results/HiddenInsightsTeaser';
import { ScanDepthIndicator } from '@/components/results/ScanDepthIndicator';
import { RemediationNextStepsCard } from '@/components/results/RemediationNextStepsCard';
import { buildRemediationPlan } from '@/lib/remediationPlan';
import { AccountRow } from './results-tabs/accounts/AccountRow';
import { ConnectionsPreviewGraph } from './results-tabs/connections/ConnectionsPreviewGraph';
import { StrategicNextSteps } from '@/components/results/StrategicNextSteps';
import { TimelinePreview } from './results-tabs/TimelinePreview';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { InlineLensVerification, getLensEligibleIndices } from './results-tabs/accounts/InlineLensVerification';

// Number of full Pro-style results to show for Free users
const FREE_PREVIEW_LIMIT = 10;

/**
 * Adapter: Convert AggregatedProfile to ScanResult format for AccountRow
 * The ScanResult type has flexible meta field that AccountRow reads
 */
function aggregatedProfileToScanResult(profile: AggregatedProfile): ScanResult {
  return {
    id: profile.id,
    site: profile.platform,
    status: profile.status,
    url: profile.url || '',
    meta: {
      username: profile.username || undefined,
      display_name: profile.displayName || undefined,
      bio: profile.bio || undefined,
      avatar_url: profile.avatarUrl || undefined,
      followers: profile.metadata.followers,
      following: profile.metadata.following,
      location: profile.metadata.location,
      joined: profile.metadata.joined,
      website: profile.metadata.website,
    } as ScanResult['meta'],
    evidence: [],
  };
}

interface FreeResultsPageProps {
  jobId: string;
}

// Pro benefits for upgrade block
const PRO_BENEFITS = [
  'Confidence scoring & false-positive filtering',
  'Full source list & evidence context',
  'Labeled connections graph',
  'Exposure timeline (historical vs active)',
  'Recommended next steps',
];

/** Internal helper to compute and render the ExposureScoreCard for Free users */
function ExposureScoreCardSection({ results, onUpgradeClick }: { results: ScanResult[]; onUpgradeClick: () => void }) {
  const scoreResult = useMemo(() => {
    // Map ScanResultRows to minimal Finding-compatible objects for the score calculator
    const findings: Finding[] = (results as any[]).map(r => ({
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
    return calculateExposureScore(findings);
  }, [results]);

  const drivers = useMemo(() => generateExposureDrivers(results as any), [results]);
  const level = scoreResult.score >= 80 ? 'severe' as const : scoreResult.level;

  const interpretationMap: Record<string, string> = {
    low: 'Limited public discoverability detected for this identifier.',
    moderate: 'This identifier appears across multiple public platforms.',
    high: 'High public surface area across independent platforms.',
    severe: 'Extensive public exposure detected across many sources.',
  };

  const freeBadgeLabel = scoreResult.score >= 10 && scoreResult.score <= 24 ? 'Emerging exposure' : undefined;
  const plan = useMemo(() => buildRemediationPlan(drivers, level), [drivers, level]);

  return (
    <>
      <ExposureScoreCard
        score={scoreResult.score}
        level={level}
        drivers={drivers}
        isLocked
        maxDrivers={3}
        interpretation={interpretationMap[level] || interpretationMap.low}
        badgeLabel={freeBadgeLabel}
        onUpgradeClick={onUpgradeClick}
      />
      <RemediationNextStepsCard
        drivers={drivers}
        plan={plan}
        isLocked
        onUpgradeClick={onUpgradeClick}
        className="mt-4"
      />
    </>
  );
}

export function FreeResultsPage({ jobId }: FreeResultsPageProps) {

  const navigate = useNavigate();
  const [job, setJob] = useState<ScanJob | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [broadcastResultCount, setBroadcastResultCount] = useState(0);
  const { toast } = useToast();
  const jobChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const progressChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Use centralized data hook
  const { 
    results, 
    loading: resultsLoading, 
    breachResults 
  } = useScanResultsData(jobId);

  // Use realtime results hook for refetch capability
  const { refetch } = useRealtimeResults(jobId);

  // Post-scan upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const hasShownModalRef = useRef(false);

  // Filter out provider health findings AND apply Focus Mode filtering (hide gaming lookup sites like OP.GG)
  const displayResults = useMemo(() => {
    const healthFiltered = filterOutProviderHealth(results);
    return filterFindings(healthFiltered as any, { hideSearch: true, focusMode: true }) as ScanResult[];
  }, [results]);
  
  // Get aggregated results for authoritative counts
  const aggregated = useMemo(() => aggregateResults(displayResults), [displayResults]);
  
  // Define terminal statuses once for consistent checking
  const terminalStatuses = ['finished', 'error', 'cancelled', 'partial', 'completed', 'completed_partial', 'completed_empty', 'failed', 'failed_timeout'];
  const isTerminalStatus = job?.status ? terminalStatuses.includes(job.status) : false;
  const scanComplete = (job?.status || '').toLowerCase().includes('complete');
  const username = job?.username || job?.target || 'Unknown';
  
  // Calculate metrics from aggregated data (single source of truth)
  const signalsFound = aggregated.counts.totalProfiles;
  const highConfidenceCount = aggregated.counts.highConfidence;
  const totalProfiles = aggregated.counts.totalProfiles;
  const totalBreaches = aggregated.counts.totalBreaches;
  
  // Filter to only 'found' profiles for display (limit to FREE_PREVIEW_LIMIT for Free)
  const foundProfiles = aggregated.profiles.filter(p => p.status === 'found' || p.status === 'claimed');
  const previewProfiles = foundProfiles.slice(0, FREE_PREVIEW_LIMIT);
  const hiddenCount = Math.max(0, foundProfiles.length - FREE_PREVIEW_LIMIT);
  
  // Connections count for teaser display
  const totalConnections = foundProfiles.length;
  
  // State for AccountRow interactions
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, LensVerificationResult>>({});
  const [claimStatuses, setClaimStatuses] = useState<Record<string, 'me' | 'not_me' | null>>({});
  
  // Handler callbacks for AccountRow
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedRowId(prev => prev === id ? null : id);
  }, []);
  
  const handleFocus = useCallback((id: string) => {
    setFocusedRowId(prev => prev === id ? null : id);
  }, []);
  
  const handleVerificationComplete = useCallback((id: string, result: LensVerificationResult) => {
    setVerificationResults(prev => ({ ...prev, [id]: result }));
  }, []);
  
  const handleClaimChange = useCallback((id: string, claim: 'me' | 'not_me' | null) => {
    setClaimStatuses(prev => ({ ...prev, [id]: claim }));
  }, []);

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

  // Fallback poll for scan status (every 5 seconds)
  useEffect(() => {
    if (!job || ['completed', 'completed_partial', 'completed_empty', 'failed', 'failed_timeout'].includes(job.status)) {
      return;
    }
    
    const interval = setInterval(() => {
      loadJob();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [job?.status]);

  // Reload results when scan completes but we have no results
  useEffect(() => {
    if (job?.status && ['completed', 'completed_empty'].includes(job.status) && results.length === 0 && refetch) {
      refetch();
    }
  }, [job?.status, results.length, refetch]);

  // Show upgrade modal after scan completes
  useEffect(() => {
    if (scanComplete && signalsFound > 0 && !hasShownModalRef.current) {
      const timer = setTimeout(() => {
        setShowUpgradeModal(true);
        hasShownModalRef.current = true;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanComplete, signalsFound]);

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

  const handleUpgradeClick = () => {
    navigate('/pricing');
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
              <Badge variant={['finished', 'completed', 'completed_partial'].includes(job.status) ? 'default' : 'secondary'} className="text-xs">
                {job.status === 'completed_partial' ? 'Partial' : job.status}
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
        {/* Progress Indicator - only show while scan is in progress or if complete with no results */}
        {(!scanComplete || results.length === 0) && (
          <ScanProgress
            startedAt={job.started_at}
            finishedAt={job.finished_at}
            status={job.status}
            resultCount={Math.max(results.length, broadcastResultCount)}
            allSites={job.all_sites || false}
          />
        )}

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
          <div className="py-12 text-center space-y-4">
            {isTerminalStatus ? (
              job.scan_type === 'email' ? (
                // Positive messaging for email scans with no breaches found
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Good news — no breaches found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We checked <strong>{job.target || job.username}</strong> against known data breaches and public exposure databases. No matches were found.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-left">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">What this means:</strong> This email wasn't found in the breach databases we checked (including Holehe's 120+ site registry). 
                      However, not all breaches are publicly reported. Consider enabling ongoing monitoring for future alerts.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/pricing')}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Enable Continuous Monitoring
                  </Button>
                </div>
              ) : (
                <LowResultsNotice variant="zero" />
              )
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Waiting for results...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* ===== HEADER: "Here's what we found" ===== */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Here's what we found
                </h1>
                <p className="text-sm text-muted-foreground">
                  You're viewing a limited summary of an advanced scan.
                </p>
              </div>

              {/* Searched identifier badge */}
              <div className="flex items-center justify-center">
                <Badge 
                  variant="secondary" 
                  className="h-7 px-4 gap-2 text-sm font-medium"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {username}
                </Badge>
              </div>

              {/* Trust line */}
              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/70">
                <span className="flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  Public sources only
                </span>
                <span>•</span>
                <span>Ethical OSINT</span>
                <span>•</span>
                <span>No monitoring</span>
              </div>
            </div>

            {/* ===== EXPOSURE SCORE HERO CARD ===== */}
            <ExposureScoreCardSection results={results} onUpgradeClick={handleUpgradeClick} />


            {/* ===== RISK SNAPSHOT (with emotional context) ===== */}
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Risk Snapshot</h3>
                </div>

                {/* Enhanced emotional context */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    ⚠️ {signalsFound} public exposure signals detected
                  </p>
                  {totalBreaches > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Including {totalBreaches} potential exposure{totalBreaches > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {signalsFound}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Signals detected
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {highConfidenceCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      High-confidence
                    </div>
                  </div>

                  <div className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center gap-1 cursor-help">
                            <span className="text-lg font-semibold text-muted-foreground">
                              Unclear
                            </span>
                            <HelpCircle className="h-3 w-3 text-muted-foreground/60" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top" 
                          className="max-w-[220px] text-center p-3"
                        >
                          <p className="text-xs">
                            Free scans confirm presence. Pro clarifies risk and relevance.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Overall risk
                    </div>
                  </div>
                </div>

                {/* CTA inside risk snapshot */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-4 h-8 text-xs text-primary hover:text-primary gap-1"
                  onClick={handleUpgradeClick}
                >
                  <Lock className="h-3 w-3" />
                  See which ones matter
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

            {/* ===== NEW: HIDDEN INSIGHTS TEASER (blurred AI summary) ===== */}
            <HiddenInsightsTeaser signalsCount={signalsFound} />

            {/* ===== PUBLIC PROFILES FOUND (Pro-style AccountRow for first 10) ===== */}
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-4">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold">Public profiles found</h3>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {totalProfiles}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Viewing first {Math.min(FREE_PREVIEW_LIMIT, foundProfiles.length)} of {totalProfiles} findings in full detail.
                  </p>
                </div>

                {previewProfiles.length > 0 ? (
                  <div className="space-y-0 border border-border/30 rounded-lg overflow-hidden">
                    {/* Full Pro-style AccountRow for first 10 results with inline LENS */}
                    {(() => {
                      // Compute LENS-eligible indices once
                      const eligibleIndices = getLensEligibleIndices(previewProfiles.length);
                      
                      return previewProfiles.map((profile, index) => {
                        const scanResult = aggregatedProfileToScanResult(profile);
                        // Generate a consistent LENS score based on profile confidence
                        const lensScore = profile.confidence || 65;
                        const isLensEligible = eligibleIndices.includes(index);
                        
                        return (
                          <div key={profile.id}>
                            <AccountRow
                              result={scanResult}
                              jobId={jobId}
                              lensScore={lensScore}
                              isFocused={focusedRowId === profile.id}
                              isSelected={expandedRowId === profile.id}
                              verificationResult={verificationResults[profile.id] || null}
                              claimStatus={claimStatuses[profile.id] || null}
                              isClaimLoading={false}
                              onFocus={() => handleFocus(profile.id)}
                              onSelect={() => handleToggleExpand(profile.id)}
                              onVerificationComplete={(result) => handleVerificationComplete(profile.id, result)}
                              onClaimChange={(claim) => handleClaimChange(profile.id, claim)}
                            />
                            {/* Inline LENS verification for eligible profiles */}
                            <div className="px-4 pb-2">
                              <InlineLensVerification
                                profileId={profile.id}
                                platform={profile.platform}
                                username={profile.username}
                                url={profile.url}
                                scanId={jobId}
                                isEligible={isLensEligible}
                                resultIndex={index}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                    
                    {/* Lock Divider - shown after the 10th result */}
                    {hiddenCount > 0 && (
                      <>
                        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-muted/30 border-t border-border/30">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-medium">
                            You've seen {Math.min(FREE_PREVIEW_LIMIT, foundProfiles.length)} of {totalProfiles} findings
                          </span>
                        </div>
                        
                        {/* Locked Results Block */}
                        <div className="p-4 bg-muted/20 border-t border-border/30 text-center space-y-3">
                          <p className="text-sm font-medium text-foreground">
                            {hiddenCount} more finding{hiddenCount > 1 ? 's' : ''} available in Pro
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Unlock verification, risk analysis, and full metadata
                          </p>
                          <Button 
                            onClick={handleUpgradeClick}
                            className="gap-2"
                          >
                            <Lock className="h-4 w-4" />
                            Unlock Pro
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No profiles detected in this scan.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* ===== EXPOSURE SUMMARY ===== */}
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-4">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-sm font-semibold">Exposure summary</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on public sources, this identifier appears on platforms that commonly expose:
                  </p>
                </div>

                <ul className="space-y-1.5 mb-3">
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/60 shrink-0" />
                    Reused usernames across sites
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/60 shrink-0" />
                    Historical activity on inactive platforms
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/60 shrink-0" />
                    Profiles indexed by data aggregators
                  </li>
                </ul>

                <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" />
                  Details and affected platforms are available in Pro.
                </p>
              </CardContent>
            </Card>

            {/* ===== NOTABLE PATTERN INSIGHT ===== */}
            {foundProfiles.length > 0 && (
              <Card className="overflow-hidden border-border/50 bg-muted/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Eye className="h-4 w-4 text-primary/70" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">One notable pattern</h3>
                      <p className="text-xs text-muted-foreground">
                        {/* Rotate insight based on scan ID hash for variety */}
                        {jobId.charCodeAt(0) % 2 === 0
                          ? "Some profiles appear on platforms users often forget they signed up for."
                          : "This identifier appears across different types of platforms, not just social media."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ===== NEW: SCAN DEPTH INDICATOR ===== */}
            <ScanDepthIndicator
              visibleCount={previewProfiles.length}
              totalCount={foundProfiles.length}
            />

            {/* LENS Verification is now inline within AccountRow results */}

            {/* ===== CONNECTIONS PREVIEW (Real interactive graph preview) ===== */}
            {totalConnections > 1 && (
              <Card className="overflow-hidden border-border/50">
                <CardContent className="p-4">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-sm font-semibold">Connections graph</h3>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        Preview
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      See how profiles connect across platforms.
                    </p>
                  </div>
                  
                  {/* Real graph preview with limited nodes */}
                  <ConnectionsPreviewGraph
                    results={displayResults}
                    username={username}
                    onUpgradeClick={handleUpgradeClick}
                  />
                </CardContent>
              </Card>
            )}

            {/* ===== TIMELINE PREVIEW (Real data, read-only) ===== */}
            {foundProfiles.length > 0 && (
              <Card className="overflow-hidden border-border/50">
                <CardContent className="p-4">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <h3 className="text-sm font-semibold">Exposure timeline</h3>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        Preview
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When this identity appeared across the web.
                    </p>
                  </div>
                  
                  <TimelinePreview
                    results={displayResults}
                    username={username}
                    onUpgradeClick={handleUpgradeClick}
                  />
                </CardContent>
              </Card>
            )}

            {/* ===== STRATEGIC NEXT STEPS ===== */}
            <StrategicNextSteps />

            {/* ===== PERSONALIZED PRO VALUE BLOCK ===== */}
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1">
                    What Pro would reveal for <span className="text-primary">{username}</span>
                  </h3>
                </div>

                <ul className="space-y-2.5 mb-5">
                  <li className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>All {totalProfiles} profiles and where they appear</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Which profiles are likely the same person</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>How identifiers connect across platforms</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Which findings are likely false positives</span>
                  </li>
                </ul>

                <Button className="w-full" size="lg" onClick={handleUpgradeClick}>
                  Unlock Pro to view full analysis
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <p className="mt-3 text-center text-xs text-muted-foreground/80">
                  Most people upgrade after seeing how many profiles are involved.
                </p>

                <p className="mt-3 text-center text-[10px] text-muted-foreground/70 flex items-center justify-center gap-1.5">
                  <Shield className="h-2.5 w-2.5" />
                  Public sources only • Ethical OSINT • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>

      {/* Post-Scan Upgrade Modal */}
      <PostScanUpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        lockedSectionsCount={hiddenCount}
        signalsFound={signalsFound}
        highRiskCount={totalBreaches}
      />
    </Card>
  );
}

/**
 * Enhanced profile preview row for Free users
 * Shows actual metadata when available, hides placeholder text
 */
function ProfilePreviewRow({ profile }: { profile: AggregatedProfile }) {
  const platformInitial = profile.platform.charAt(0).toUpperCase();
  
  // Check if we have meaningful metadata to display
  const hasFollowers = profile.metadata.followers !== undefined && profile.metadata.followers > 0;
  const hasLocation = profile.metadata.location && profile.metadata.location !== 'Unknown';
  const hasUrl = !!profile.url;
  
  // Filter out placeholder bios
  const isPlaceholderBio = (bio: string | null): boolean => {
    if (!bio) return true;
    const placeholders = [
      'profile found on',
      'unknown platform',
      'no bio available',
      'no description',
    ];
    const lowerBio = bio.toLowerCase();
    return placeholders.some(p => lowerBio.includes(p));
  };
  
  const displayBio = !isPlaceholderBio(profile.bio) ? profile.bio : null;
  
  // Generate contextual info when no bio
  const contextualInfo = !displayBio && (hasFollowers || hasLocation);
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 ring-1 ring-primary/10">
        <span className="text-sm font-semibold text-primary">
          {platformInitial}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium capitalize">
            {profile.platform}
          </span>
          {profile.username && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-mono">
              @{profile.username}
            </Badge>
          )}
          {hasUrl && (
            <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
          )}
        </div>
        
        {/* Show actual bio if available */}
        {displayBio && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {displayBio.slice(0, 60)}{displayBio.length > 60 ? '...' : ''}
          </p>
        )}
        
        {/* Show metadata when no bio */}
        {contextualInfo && (
          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
            {hasFollowers && (
              <span className="flex items-center gap-1">
                <Users className="h-2.5 w-2.5" />
                {profile.metadata.followers?.toLocaleString()} followers
              </span>
            )}
            {hasLocation && (
              <span className="flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />
                {profile.metadata.location}
              </span>
            )}
          </div>
        )}
        
        {/* Fallback: show verification context */}
        {!displayBio && !contextualInfo && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
              <Shield className="h-2.5 w-2.5" />
              <span>Verified on {profile.sources.length} source{profile.sources.length > 1 ? 's' : ''}</span>
            </div>
            <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5">
              Pro
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

export default FreeResultsPage;
