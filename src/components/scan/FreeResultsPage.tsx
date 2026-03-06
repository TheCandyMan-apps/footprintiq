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
import { ScanProgress } from './ScanProgress';
import { LowResultsNotice } from './LowResultsNotice';
import { Loader2, Shield, Eye, HelpCircle, Lock, ArrowRight, Check, User, MapPin, Users, ExternalLink, Clock, TrendingUp, BarChart3, CheckCircle2, Send } from 'lucide-react';
import { aggregateResults, type AggregatedProfile } from '@/lib/results/resultsAggregator';
import { filterOutProviderHealth } from '@/lib/providerHealthUtils';
import { ExposureScoreCard } from '@/components/results/ExposureScoreCard';
import { PlatformExposureRanking, derivePlatformRisk } from '@/components/results/PlatformExposureRanking';
import { ExposureReductionScoreCard } from '@/components/results/ExposureReductionScoreCard';
import { ExposureReducedBadge } from '@/components/results/ExposureStatusSelector';
import { calculateExposureScore, type ExposureLevel } from '@/lib/exposureScore';
import { calculateExposureReductionScore } from '@/lib/exposureReductionScore';
import { generateExposureDrivers } from '@/lib/exposureScoreDrivers';
import type { Finding } from '@/lib/ufm';
import { filterFindings } from '@/lib/findingFilters';
// PostScanUpgradeModal removed to reduce upsell fatigue
import { analytics } from '@/lib/analytics';
import { useNavigate } from 'react-router-dom';
import { useExposureStatuses } from '@/hooks/useExposureStatuses';
import type { ExposureStatus } from '@/hooks/useExposureStatuses';

import { HiddenInsightsTeaser } from '@/components/results/HiddenInsightsTeaser';
import { ScanDepthIndicator } from '@/components/results/ScanDepthIndicator';
import { RemediationNextStepsCard } from '@/components/results/RemediationNextStepsCard';
import { buildRemediationPlan } from '@/lib/remediationPlan';
import { AccountRow } from './results-tabs/accounts/AccountRow';
import { ConnectionsPreviewGraph } from './results-tabs/connections/ConnectionsPreviewGraph';
import { StrategicNextSteps } from '@/components/results/StrategicNextSteps';
import { LockedTabsPreview } from '@/components/results/LockedTabsPreview';
import { PostScanInlineUpgrade } from '@/components/conversion/PostScanInlineUpgrade';
import { InlineUpgradeModal } from '@/components/results/InlineUpgradeModal';
// FreeProComparisonStrip + RemediationPlanTab removed to reduce upsell redundancy
import { TimelinePreview } from './results-tabs/TimelinePreview';
import { AttentionSection } from './AttentionSection';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { InlineLensVerification, getLensEligibleIndices } from './results-tabs/accounts/InlineLensVerification';
import { LazySection } from './LazySection';
import { MobileCollapsible } from './MobileCollapsible';
import { AccountsListSkeleton } from './skeletons/ProfileCardSkeleton';
import { ConfidenceBreakdownSkeleton } from './skeletons/ConfidenceBreakdownSkeleton';
import { PlatformTeaser } from '@/components/results/PlatformTeaser';
import { ExposureBreakdown } from '@/components/results/ExposureBreakdown';
import { IdentityCorrelationRisk } from '@/components/results/IdentityCorrelationRisk';
import { IdentityGraphPreview } from '@/components/results/IdentityGraphPreview';
import { InvestigatorInsight } from '@/components/results/InvestigatorInsight';
import { IdentitySignalsDetected } from '@/components/results/IdentitySignalsDetected';
import { PlatformCategoriesDetected } from '@/components/results/PlatformCategoriesDetected';

// Number of full Pro-style results to show for Free users
const FREE_PREVIEW_LIMIT = 3;

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
  const level: ExposureLevel = scoreResult.level;

  const interpretationMap: Record<ExposureLevel, string> = {
    low: 'Limited public discoverability detected for this identifier.',
    moderate: 'This identifier appears across multiple public platforms.',
    high: 'High public surface area across independent platforms.',
    very_high: 'Significant exposure detected across many sources.',
    critical: 'Extensive public exposure detected across many sources.',
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

/** Internal helper to render Platform Exposure Ranking */
function PlatformExposureRankingSection({ results, isPro, onUpgradeClick }: { results: ScanResult[]; isPro: boolean; onUpgradeClick: () => void }) {
  const platforms = useMemo(() => derivePlatformRisk(results as any[]), [results]);
  if (platforms.length === 0) return null;
  return (
    <PlatformExposureRanking
      platforms={platforms}
      isPro={isPro}
      onUpgradeClick={onUpgradeClick}
    />
  );
}


/** Exposure Reduction Score™ for Free users (score only, locked trends) */
function FreeReductionScore({ results, onUpgradeClick }: { results: ScanResult[]; onUpgradeClick: () => void }) {
  const reductionResult = useMemo(() => {
    const findings: Finding[] = (results as any[]).map(r => ({
      id: r.id || '',
      type: r.kind === 'profile_presence' ? 'social_media' : (r.kind || 'identity'),
      title: r.meta?.title || r.site || '',
      description: '',
      severity: (['low', 'medium', 'high', 'critical', 'info'].includes(r.severity) ? r.severity : 'info') as Finding['severity'],
      confidence: typeof (r as any).confidence === 'number' ? (r as any).confidence : 0.5,
      provider: r.provider || '',
      providerCategory: '',
      evidence: [],
      impact: '',
      remediation: [],
      tags: [],
      observedAt: r.created_at || new Date().toISOString(),
    }));
    return calculateExposureReductionScore(findings);
  }, [results]);

  return (
    <ExposureReductionScoreCard
      score={reductionResult.score}
      level={reductionResult.level}
      isLocked
      onUpgradeClick={onUpgradeClick}
    />
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

  // Use centralized data hook (includes refetch from the same realtime instance)
  const { 
    results, 
    loading: resultsLoading, 
    breachResults,
    refetch,
  } = useScanResultsData(jobId);

  // Exposure status tracking (Free: marking only, no history)
  const { statuses, updateStatus, getStatus, getScoreImprovement } = useExposureStatuses(jobId);

  const handleExposureStatusChange = useCallback(async (findingId: string, platformName: string, newStatus: ExposureStatus) => {
    await updateStatus(findingId, platformName, newStatus);
  }, [updateStatus]);


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
    // Backend uses two channel name formats: `scan_progress:${scanId}` (colon) and `scan_progress_${scanId}` (underscore)
    // We subscribe to both to handle all backend functions correctly
    const handleProviderUpdate = (payload: any) => {
      if (payload.payload?.resultCount !== undefined) {
        setBroadcastResultCount(payload.payload.resultCount);
      }
    };
    const handleScanComplete = () => {
      loadJob();
      // Delay refetch to allow DB writes to fully commit before reading results
      setTimeout(() => refetch(), 800);
      setTimeout(() => refetch(), 2500);
    };

    const progressChannel = supabase
      .channel(`scan_progress:${jobId}`)
      .on('broadcast', { event: 'provider_update' }, handleProviderUpdate)
      .on('broadcast', { event: 'scan_complete' }, handleScanComplete)
      .subscribe();

    // Also subscribe to underscore format used by enqueue-maigret-scan
    const progressChannelAlt = supabase
      .channel(`scan_progress_${jobId}`)
      .on('broadcast', { event: 'provider_update' }, handleProviderUpdate)
      .on('broadcast', { event: 'scan_complete' }, handleScanComplete)
      .on('broadcast', { event: 'scan_failed' }, handleScanComplete)
      .subscribe();

    progressChannelRef.current = progressChannel;

    return () => {
      if (jobChannelRef.current) supabase.removeChannel(jobChannelRef.current);
      if (progressChannelRef.current) supabase.removeChannel(progressChannelRef.current);
      supabase.removeChannel(progressChannelAlt);
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

  // Track whether we're still retrying after scan completion (race condition guard)
  const [recentlyCompleted, setRecentlyCompleted] = useState(false);
  const recentlyCompletedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reload results when scan completes but we have no results yet (race condition guard)
  useEffect(() => {
    if (!job?.status || !['completed', 'completed_empty', 'completed_partial'].includes(job.status) || results.length > 0) return;
    
    // Mark as recently completed — show loading spinner instead of "no results" for up to 15s
    setRecentlyCompleted(true);
    recentlyCompletedTimerRef.current = setTimeout(() => setRecentlyCompleted(false), 90000);
    
    // Trigger refetch which starts the 30s polling loop in useRealtimeResults
    refetch();
    const t1 = setTimeout(() => refetch(), 1000);
    const t2 = setTimeout(() => refetch(), 3000);
    const t3 = setTimeout(() => refetch(), 6000);
    return () => { 
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      if (recentlyCompletedTimerRef.current) clearTimeout(recentlyCompletedTimerRef.current);
    };
  }, [job?.status, results.length]);

  // Clear recentlyCompleted as soon as results arrive
  useEffect(() => {
    if (results.length > 0 && recentlyCompleted) {
      setRecentlyCompleted(false);
      if (recentlyCompletedTimerRef.current) clearTimeout(recentlyCompletedTimerRef.current);
    }
  }, [results.length, recentlyCompleted]);

   // Post-scan upgrade modal removed to reduce upsell fatigue (session replay feedback)

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

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Compute risk level for tracking metadata
  const uniquePlatformCount = new Set(foundProfiles.map(p => p.platform)).size;
  const riskLevel = totalProfiles >= 8 || highConfidenceCount >= 5 || uniquePlatformCount >= 6
    ? 'HIGH' : totalProfiles >= 4 || highConfidenceCount >= 2 || uniquePlatformCount >= 3
    ? 'MEDIUM' : 'LOW';

  // Compute exposure score for tracking metadata
  const exposureScore = useMemo(() => {
    if (!results || results.length === 0) return 0;
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
    return calculateExposureScore(findings).score;
  }, [results]);

  const trackingMeta = useMemo(() => ({
    scan_id: jobId,
    username,
    platform_count: uniquePlatformCount,
    exposure_score: exposureScore,
    risk_level: riskLevel,
  }), [jobId, username, uniquePlatformCount, exposureScore, riskLevel]);

  const handleUpgradeClick = () => {
    analytics.trackEvent('upgrade_cta_clicked', trackingMeta);
    setShowUpgradeModal(true);
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
    <>
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
            {recentlyCompleted ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Loading results…</p>
              </div>
            ) : isTerminalStatus ? (
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

            {/* ===== EXPOSURE REDUCTION SCORE™ ===== */}
            <FreeReductionScore results={results} onUpgradeClick={handleUpgradeClick} />
            {getScoreImprovement() > 0 && (
              <div className="mt-2 flex items-center justify-center">
                <ExposureReducedBadge points={getScoreImprovement()} />
              </div>
            )}
            {/* ===== EXPOSURE SCORE HERO CARD ===== */}
            <ExposureScoreCardSection results={results} onUpgradeClick={handleUpgradeClick} />

            {/* ===== PLATFORM EXPOSURE RANKING ===== */}
            <PlatformExposureRankingSection results={results} isPro={false} onUpgradeClick={handleUpgradeClick} />

            {/* ===== MONITORING NUDGE (mobile only, below exposure block) ===== */}
            <div className="md:hidden flex items-center gap-2 px-1 py-1.5">
              <Shield className="h-3.5 w-3.5 text-primary/60 shrink-0" />
              <p className="text-[11px] text-muted-foreground/70">
                Unlock ongoing monitoring with a{' '}
                <button onClick={handleUpgradeClick} className="text-primary hover:underline font-medium">free account</button>.
              </p>
            </div>
            {/* ===== RISK SNAPSHOT (with emotional context) ===== */}
            <MobileCollapsible
              storageKey="risk-snapshot"
              title="Risk Snapshot"
              icon={<Shield className="h-4 w-4 text-primary" />}
            >
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-4">
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

                {/* Subtle hint instead of CTA */}
                <p className="text-[10px] text-muted-foreground/60 mt-3 text-center">
                  Pro users see risk-ranked findings with confidence scores.
                </p>
              </CardContent>
            </Card>
            </MobileCollapsible>

            {/* ===== PLATFORM TEASER (first 3 platforms, rest locked) ===== */}
            {foundProfiles.length > 0 && (
              <PlatformTeaser
                platforms={foundProfiles.map(p => ({
                  name: p.platform,
                  url: p.url || undefined,
                  username: p.username || undefined,
                  confidence: p.confidence,
                }))}
                onUpgradeClick={handleUpgradeClick}
                onInteraction={() => analytics.trackEvent('platform_teaser_clicked', trackingMeta)}
              />
            )}

            {/* ===== IDENTITY CORRELATION RISK ===== */}
            {foundProfiles.length > 0 && (
              <IdentityCorrelationRisk
                profileCount={totalProfiles}
                highConfidenceCount={highConfidenceCount}
                uniquePlatforms={new Set(foundProfiles.map(p => p.platform)).size}
              />
            )}

            {/* ===== IDENTITY ANALYSIS UPGRADE CTA ===== */}
            {foundProfiles.length > 0 && (
              <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Unlock Full Identity Analysis</h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This identifier appears across many platforms and may allow accounts to be linked to the same person.
                  </p>

                  <div className="space-y-2">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pro reveals:</p>
                    <ul className="space-y-1.5">
                      {[
                        'All detected platforms',
                        'Identity correlation map',
                        'Exposure prioritisation',
                        'Platform risk ranking',
                        'AI attribution insights',
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-foreground">
                          <Check className="h-3 w-3 text-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    size="sm"
                    className="w-full gap-2 bg-primary hover:bg-primary/90 h-11"
                    onClick={() => {
                      analytics.trackEvent('upgrade_cta_clicked', { ...trackingMeta, placement: 'post_correlation_risk' });
                      handleUpgradeClick();
                    }}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Unlock Full Analysis
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ===== IDENTITY SIGNALS DETECTED ===== */}
            {foundProfiles.length > 0 && (
              <IdentitySignalsDetected
                username={username}
                profileCount={totalProfiles}
                platforms={[...new Set(foundProfiles.map(p => p.platform))]}
                highConfidenceCount={highConfidenceCount}
                onUpgradeClick={handleUpgradeClick}
                onInteraction={() => analytics.trackEvent('identity_signals_clicked', trackingMeta)}
              />
            )}

            {/* ===== EXPOSURE BREAKDOWN ===== */}
            {foundProfiles.length > 0 && (
              <ExposureBreakdown
                profileCount={totalProfiles}
                uniquePlatforms={new Set(foundProfiles.map(p => p.platform)).size}
                hasUsernameReuse={new Set(foundProfiles.map(p => p.platform)).size < foundProfiles.length}
                onUpgradeClick={handleUpgradeClick}
                onInteraction={() => analytics.trackEvent('exposure_breakdown_clicked', trackingMeta)}
              />
            )}

            {/* ===== AI ATTRIBUTION INSIGHTS (moved up) ===== */}
            {foundProfiles.length > 0 && (
              <Card className="overflow-hidden border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">AI Attribution Insights</h3>
                      <p className="text-xs text-muted-foreground">
                        FootprintIQ AI analysis identifies signals that may link profiles across platforms.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/15">
                    <p className="text-xs font-medium text-foreground">
                      3 AI attribution insights detected
                    </p>
                  </div>

                  {/* Blurred preview rows */}
                  <div className="space-y-2">
                    {['Cross-platform handle correlation suggests shared identity across social and developer platforms',
                      'Naming convention analysis reveals structured pattern consistent with professional usage',
                      'Temporal registration clustering detected — accounts created within a similar timeframe',
                    ].map((text, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-muted/20 border border-border/20 blur-[5px] select-none pointer-events-none opacity-50"
                      >
                        <p className="text-xs text-foreground">{text}</p>
                      </div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    className="w-full gap-2 bg-primary hover:bg-primary/90 h-10"
                    onClick={() => {
                      analytics.trackEvent('upgrade_cta_clicked', { ...trackingMeta, placement: 'ai_attribution_insights' });
                      handleUpgradeClick();
                    }}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Unlock AI Attribution Insights
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {foundProfiles.length > 1 && (
              <IdentityGraphPreview
                profileCount={foundProfiles.length}
                platforms={[...new Set(foundProfiles.map(p => p.platform))]}
                username={username}
                onUpgradeClick={handleUpgradeClick}
                onInteraction={() => analytics.trackEvent('identity_graph_preview_clicked', trackingMeta)}
              />
            )}

            {/* ===== INVESTIGATOR INSIGHT ===== */}
            {foundProfiles.length > 0 && (
              <InvestigatorInsight
                username={username}
                profileCount={totalProfiles}
                scanType={job?.scan_type}
                onUpgradeClick={handleUpgradeClick}
                onInsightExpand={() => analytics.trackEvent('investigator_insight_expand', trackingMeta)}
              />
            )}


            {/* ===== PLATFORM CATEGORIES DETECTED ===== */}
            {foundProfiles.length > 0 && (
              <PlatformCategoriesDetected
                platforms={[...new Set(foundProfiles.map(p => p.platform))]}
                onUpgradeClick={handleUpgradeClick}
                onInteraction={() => analytics.trackEvent('platform_categories_clicked', trackingMeta)}
              />
            )}

            <MobileCollapsible
              storageKey="public-profiles"
              title="Public profiles found"
              icon={<User className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              badge={<Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{totalProfiles}</Badge>}
            >
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-4">
                <div className="mb-4 hidden md:block">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold">Public profiles found</h3>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {totalProfiles}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Showing {Math.min(FREE_PREVIEW_LIMIT, foundProfiles.length)} of {totalProfiles} detected profiles
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-3 md:hidden">
                  Showing {Math.min(FREE_PREVIEW_LIMIT, foundProfiles.length)} of {totalProfiles} detected profiles
                </p>

                {previewProfiles.length > 0 ? (
                  <div className="space-y-0 border border-border/30 rounded-lg overflow-hidden">
                    {/* Full Pro-style AccountRow for first 3 results with inline LENS */}
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
                              exposureStatus={getStatus(profile.id)}
                              onExposureStatusChange={handleExposureStatusChange}
                              isDetailLocked={true}
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
                    
                    {/* Blurred placeholder rows for hidden profiles */}
                    {hiddenCount > 0 && (
                      <>
                        {/* Blurred fake rows */}
                        {Array.from({ length: Math.min(3, hiddenCount) }).map((_, i) => (
                          <div
                            key={`blur-${i}`}
                            className="flex items-center gap-3 px-4 py-3 border-t border-border/30 blur-[5px] select-none pointer-events-none opacity-40"
                          >
                            <div className="w-8 h-8 rounded-full bg-muted" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3.5 w-28 rounded bg-muted" />
                              <div className="h-2.5 w-40 rounded bg-muted/60" />
                            </div>
                            <div className="h-5 w-14 rounded-full bg-muted/50" />
                          </div>
                        ))}

                        {/* Lock divider with count */}
                        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-muted/30 border-t border-border/30">
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-medium">
                            +{hiddenCount} additional profiles detected across multiple platforms
                          </span>
                        </div>
                        
                        {/* Upgrade CTA */}
                        <div className="p-4 bg-muted/20 border-t border-border/30 text-center space-y-3">
                          <Button 
                            onClick={() => {
                              analytics.trackEvent('upgrade_cta_clicked', { ...trackingMeta, placement: 'profiles_list' });
                              handleUpgradeClick();
                            }}
                            className="gap-2 h-11 px-6"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Unlock Full Platform Discovery
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                          <p className="text-[10px] text-muted-foreground/50">
                            From £14.99/mo · Cancel anytime
                          </p>
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
            </MobileCollapsible>

            {/* ===== EXPOSURE SUMMARY (lazy-loaded, collapsible on mobile) ===== */}
            <LazySection fallback={<ConfidenceBreakdownSkeleton />}>
            <MobileCollapsible
              storageKey="exposure-summary"
              title="Exposure summary"
              icon={<Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            >
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-4">
                <div className="mb-3 hidden md:block">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-sm font-semibold">Exposure summary</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on public sources, this identifier appears on platforms that commonly expose:
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-3 md:hidden">
                  Platforms that commonly expose this identifier:
                </p>

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
            </MobileCollapsible>
            </LazySection>

            {/* ===== WHAT REQUIRES ATTENTION + BLURRED ACTION PLAN ===== */}
            {foundProfiles.length > 0 && (
              <LazySection fallback={<ConfidenceBreakdownSkeleton />}>
                <AttentionSection
                  profiles={foundProfiles}
                  totalExposures={signalsFound}
                  onUpgradeClick={handleUpgradeClick}
                />
              </LazySection>
            )}

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

            {/* ===== CONNECTIONS PREVIEW (lazy-loaded) ===== */}
            {totalConnections > 1 && (
              <LazySection fallback={<ConfidenceBreakdownSkeleton />}>
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
                    <ConnectionsPreviewGraph
                      results={displayResults}
                      username={username}
                      onUpgradeClick={handleUpgradeClick}
                    />
                  </CardContent>
                </Card>
              </LazySection>
            )}

            {/* ===== TIMELINE PREVIEW (lazy-loaded) ===== */}
            {foundProfiles.length > 0 && (
              <LazySection fallback={<ConfidenceBreakdownSkeleton />}>
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
              </LazySection>
            )}

            {/* ===== TELEGRAM TEASER ===== */}
            <Card className="overflow-hidden border-border/50 relative">
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground/60" />
                <p className="text-xs font-medium text-muted-foreground">Telegram Intelligence — Pro only</p>
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={handleUpgradeClick}>
                  Unlock
                </Button>
              </div>
              <CardContent className="p-4 opacity-40">
                <div className="flex items-center gap-2 mb-1">
                  <Send className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Telegram Intelligence</h3>
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-green-500/30 text-green-600 dark:text-green-400">
                    <Shield className="h-2.5 w-2.5 mr-0.5" />Public data only
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Profile, channels, entities, and phone presence from public Telegram data.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-14 rounded bg-muted/30" />
                  <div className="h-14 rounded bg-muted/30" />
                </div>
              </CardContent>
            </Card>

            {/* ===== STRATEGIC NEXT STEPS ===== */}
            <StrategicNextSteps />

            {/* ===== YOUR PRIVACY RISK SNAPSHOT ===== */}
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Your Privacy Risk Snapshot</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A summary of your current digital exposure and risk posture.
                  </p>
                </div>

                {/* Current scores (visible to Free) */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="text-lg font-bold text-foreground">{signalsFound}</div>
                    <div className="text-[10px] text-muted-foreground">Exposures Found</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="text-lg font-bold text-foreground">{highConfidenceCount}</div>
                    <div className="text-[10px] text-muted-foreground">High Confidence</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="text-lg font-bold text-foreground">{totalBreaches}</div>
                    <div className="text-[10px] text-muted-foreground">Breach Links</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ===== LOCKED INTELLIGENCE TABS (single consolidated upsell) ===== */}
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-4">
                <LockedTabsPreview onUpgradeClick={handleUpgradeClick} />
              </CardContent>
            </Card>

            {/* ===== POST-SCAN INLINE UPGRADE (contextual, data-driven CTA) ===== */}
            <PostScanInlineUpgrade
              exposureCount={signalsFound}
              hiddenCount={hiddenCount}
              highConfidenceCount={highConfidenceCount}
            />
          </div>
        )}
      </CardContent>
    </Card>
    <InlineUpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </>
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
