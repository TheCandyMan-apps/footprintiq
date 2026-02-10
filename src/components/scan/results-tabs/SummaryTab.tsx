import { useMemo, lazy, Suspense, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Phone, Globe, Clock, CheckCircle2, FileText, Lock } from 'lucide-react';
import { format } from 'date-fns';

import { ScanJob, ScanResult } from '@/hooks/useScanResultsData';
import { useInvestigation } from '@/contexts/InvestigationContext';
import { useScanNarrative } from '@/hooks/useScanNarrative';
import { flags } from '@/lib/featureFlags';
import { extractProviderHealthFindings, filterOutProviderHealth } from '@/lib/providerHealthUtils';
import { useResultsViewModel } from '@/hooks/useResultsViewModel';
import { aggregateResults } from '@/lib/results/resultsAggregator';

import { IntelligenceBrief } from './summary/IntelligenceBrief';
import { NextStepsPanel } from './summary/NextStepsPanel';
import { FocusedEntityBanner } from './summary/FocusedEntityBanner';
import { ScanNarrativeFeed } from './summary/ScanNarrativeFeed';
import { ProviderHealthPanel } from './ProviderHealthPanel';
import { RiskSnapshotCard } from './RiskSnapshotCard';
import { FreeResultsHeader } from './summary/FreeResultsHeader';
import { ProfilesExposureSection } from './summary/ProfilesExposureSection';
import { ProUpgradeBlock } from './summary/ProUpgradeBlock';
import { ConnectionsPreview } from './summary/ConnectionsPreview';
import { AdvancedModeHint } from './summary/AdvancedModeHint';
import { PostScanUpgradeModal } from '@/components/upsell/PostScanUpgradeModal';
import { IdentityStrengthScore } from '@/components/intelligence/IdentityStrengthScore';
import { UsernameUniquenessScore } from '@/components/intelligence/UsernameUniquenessScore';
import { FootprintClusterMap } from '@/components/intelligence/FootprintClusterMap';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load ReputationSignalsCard for feature-flagged rollout
const ReputationSignalsCard = lazy(() => import('./ReputationSignalsCard'));

interface SummaryTabProps {
  jobId: string;
  job: ScanJob;
  grouped: {
    found: any[];
    claimed: any[];
    not_found: any[];
    unknown: any[];
  };
  resultsCount: number;
  results: ScanResult[];
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

function getUniquePlatforms(results: ScanResult[]): string[] {
  const platforms = new Set<string>();
  results.forEach(r => {
    const site = r.site || '';
    const meta = (r.meta || r.metadata || {}) as Record<string, any>;
    const platform = site || meta.platform || meta.site || meta.provider || '';
    if (platform) platforms.add(platform);
  });
  return Array.from(platforms);
}

function getProfileImages(results: any[]): string[] {
  const images: string[] = [];
  results.forEach(r => {
    const meta = r.meta || r.metadata || {};
    if (meta.avatar_url) images.push(meta.avatar_url);
    if (meta.profile_image) images.push(meta.profile_image);
    if (meta.image) images.push(meta.image);
  });
  return images.filter(url => url && url.startsWith('http')).slice(0, 4);
}

function calculateReuseScore(found: number, platforms: number): number {
  if (platforms === 0) return 0;
  return Math.round((found / Math.max(platforms, found)) * 100);
}

export function SummaryTab({ 
  jobId, 
  job, 
  grouped, 
  resultsCount, 
  results,
  onExportJSON,
  onExportCSV,
  onExportPDF,
}: SummaryTabProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Post-scan upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const hasShownModalRef = useRef(false);
  
  // Investigation context
  let focusedEntityId: string | null = null;
  let setFocusedEntity: ((id: string | null) => void) | null = null;
  let verifiedEntities: Map<string, any> = new Map();
  
  try {
    const investigation = useInvestigation();
    focusedEntityId = investigation.focusedEntityId;
    setFocusedEntity = investigation.setFocusedEntity;
    verifiedEntities = investigation.verifiedEntities;
  } catch {
    // Context not available
  }

  const focusedResult = useMemo(() => {
    if (!focusedEntityId) return null;
    return results.find(r => r.id === focusedEntityId) || null;
  }, [focusedEntityId, results]);

  // Filter out provider health findings for display metrics
  const displayResults = useMemo(() => filterOutProviderHealth(results), [results]);
  const providerHealthFindings = useMemo(() => extractProviderHealthFindings(results), [results]);

  // Get plan-aware view model
  const { viewModel, plan, isFullAccess, riskSnapshot, buckets, connections } = useResultsViewModel(results);

  // Get aggregated results for authoritative counts
  const aggregated = useMemo(() => aggregateResults(displayResults), [displayResults]);

  const platforms = useMemo(() => getUniquePlatforms(displayResults), [displayResults]);
  const profileImages = useMemo(() => getProfileImages(displayResults), [displayResults]);

  // Use aggregated breach count for accuracy
  const breachCount = aggregated.counts.totalBreaches;

  const reuseScore = useMemo(() => 
    calculateReuseScore(aggregated.counts.publicProfiles, platforms.length),
    [aggregated.counts.publicProfiles, platforms.length]
  );

  const aliases = useMemo(() => {
    const aliasSet = new Set<string>();
    displayResults.forEach(r => {
      const meta = (r.meta || r.metadata || {}) as Record<string, unknown>;
      if (meta.display_name && typeof meta.display_name === 'string' && meta.display_name !== job?.username) {
        aliasSet.add(meta.display_name);
      }
      if (meta.name && typeof meta.name === 'string' && meta.name !== job?.username) {
        aliasSet.add(meta.name);
      }
    });
    return Array.from(aliasSet).slice(0, 5);
  }, [displayResults, job?.username]);

  const scanComplete = (job?.status || '').toLowerCase().includes('complete');
  const scanTime = job?.finished_at || job?.started_at;
  const formattedTime = scanTime ? format(new Date(scanTime), 'MMM d, yyyy • HH:mm') : null;

  // Create aggregated-based risk snapshot for consistency
  const aggregatedRiskSnapshot = useMemo(() => {
    const signalsFound = aggregated.counts.totalProfiles;
    const highConfidenceCount = aggregated.counts.highConfidence;
    
    // Derive risk level from counts
    let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    let status: 'clean' | 'exposed' | 'at_risk' = 'clean';
    
    if (aggregated.counts.totalBreaches > 5) {
      riskLevel = 'critical';
      status = 'at_risk';
    } else if (aggregated.counts.totalBreaches > 0) {
      riskLevel = 'high';
      status = 'exposed';
    } else if (signalsFound > 10) {
      riskLevel = 'moderate';
      status = 'exposed';
    } else if (signalsFound > 3) {
      riskLevel = 'low';
      status = 'exposed';
    }
    
    return {
      status,
      riskLevel,
      signalsFound,
      highConfidenceCount,
      confidencePercentage: isFullAccess ? Math.round((highConfidenceCount / Math.max(1, signalsFound)) * 100) : null,
    };
  }, [aggregated, isFullAccess]);

  // Calculate total hidden count for upgrade prompts
  const totalHiddenCount = useMemo(() => {
    return Object.values(buckets).reduce((sum, bucket) => sum + bucket.hiddenCount, 0);
  }, [buckets]);

  // Show upgrade modal for Free users after scan completes (with delay)
  useEffect(() => {
    if (!isFullAccess && scanComplete && aggregatedRiskSnapshot.signalsFound > 0 && !hasShownModalRef.current) {
      const timer = setTimeout(() => {
        setShowUpgradeModal(true);
        hasShownModalRef.current = true;
      }, 3000); // 3 second delay
      return () => clearTimeout(timer);
    }
  }, [isFullAccess, scanComplete, aggregatedRiskSnapshot.signalsFound]);

  // Navigation helpers
  const navigateToTab = (tab: string) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleClearFocus = () => setFocusedEntity?.(null);
  
  const handleViewFocused = () => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'accounts');
    if (focusedEntityId) params.set('focus', focusedEntityId);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  // Scan type config
  const typeConfig: Record<string, { label: string; icon: React.ElementType }> = {
    username: { label: 'Username', icon: User },
    email: { label: 'Email', icon: Mail },
    phone: { label: 'Phone', icon: Phone },
    domain: { label: 'Domain', icon: Globe },
  };
  const scanType = (job as any)?.scan_type || 'username';
  const config = typeConfig[scanType] || typeConfig.username;
  const TypeIcon = config.icon;

  // Scan narrative for persistent progress/completion feed
  const narrative = useScanNarrative(jobId, job?.username || '', scanType);

  // Check if any buckets have data
  const hasBucketData = Object.values(buckets).some(b => b.totalCount > 0);

  // Render narrative-first layout for Free users
  if (!isFullAccess) {
    return (
      <div className="space-y-5">
        {/* Narrative Header - "Here's what we found" */}
        <FreeResultsHeader
          username={job?.username || 'Unknown'}
          scanType={scanType}
          isFullAccess={isFullAccess}
        />

        {/* Risk Snapshot Card - Using aggregated counts */}
        <RiskSnapshotCard
          snapshot={aggregatedRiskSnapshot}
          plan={plan}
          isFullAccess={isFullAccess}
          variant="narrative"
        />

        {/* Unified Profiles & Exposure Section */}
        <ProfilesExposureSection
          results={displayResults}
          isFullAccess={isFullAccess}
          onUpgradeClick={handleUpgradeClick}
          onViewAllClick={() => navigateToTab('accounts')}
        />

        {/* Connections Preview - Graph with overlay */}
        {connections.totalNodes > 0 && (
          <ConnectionsPreview
            connections={connections}
            isFullAccess={isFullAccess}
            onUpgradeClick={handleUpgradeClick}
            onViewFullClick={() => navigateToTab('connections')}
          />
        )}

        {/* Inline Pro Upgrade Block - Using aggregated counts */}
        <ProUpgradeBlock
          variant="default"
          signalsFound={aggregatedRiskSnapshot.signalsFound}
          hiddenCount={totalHiddenCount}
          onUpgradeClick={handleUpgradeClick}
        />

        {/* Post-Scan Upgrade Modal - Using aggregated counts */}
        <PostScanUpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
          lockedSectionsCount={totalHiddenCount}
          signalsFound={aggregatedRiskSnapshot.signalsFound}
          highRiskCount={aggregated.counts.totalBreaches}
        />
        
        {/* Subtle hint for Standard users to try Advanced mode */}
        <AdvancedModeHint scanComplete={scanComplete} />
      </div>
    );
  }

  // Pro/Business: Full access layout (existing)
  return (
    <div className="space-y-1.5">
      {/* Brief Header - Compact scan identifier */}
      <div className="flex items-center justify-between gap-2 px-0.5 py-1 border-b border-border/15">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded bg-muted/40 flex items-center justify-center shrink-0">
            <TypeIcon className="h-2.5 w-2.5 text-muted-foreground" />
          </div>
          <span className="text-[12px] font-semibold truncate">{job?.username || 'Unknown'}</span>
          <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 font-normal uppercase tracking-wide">
            {config.label}
          </Badge>
          {aliases.length > 0 && (
            <span className="text-[9px] text-muted-foreground/70 hidden sm:inline">
              aka {aliases.slice(0, 2).join(', ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/60 shrink-0">
          {scanComplete && (
            <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
          )}
          {formattedTime && (
            <span className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">{formattedTime}</span>
            </span>
          )}
        </div>
      </div>

      {/* Intelligence Brief - Compact card */}
      <div className="border border-border/20 rounded bg-card p-2.5 space-y-2.5">
        {/* 0) Risk Snapshot - Using aggregated counts */}
        <RiskSnapshotCard
          snapshot={aggregatedRiskSnapshot}
          plan={plan}
          isFullAccess={isFullAccess}
        />

        {/* 1) Scan Narrative Feed - What we did / Live progress */}
        <ScanNarrativeFeed
          items={narrative.items}
          summary={narrative.summary}
          isLoading={narrative.isLoading}
          isComplete={narrative.isComplete}
          estimatedTimeRemaining={narrative.estimatedTimeRemaining}
          variant="compact"
        />

        {/* 2) What We Found - Using aggregated counts */}
        <IntelligenceBrief
          username={job?.username || 'Unknown'}
          accountsFound={aggregated.counts.totalProfiles}
          platformsCount={platforms.length}
          breachCount={aggregated.counts.totalBreaches}
          reuseScore={reuseScore}
          aliases={aliases}
          scanComplete={scanComplete}
          profileImages={profileImages}
          verifiedCount={verifiedEntities.size}
        />

        {/* Intelligence Tiles - Identity Strength, Uniqueness, Clusters */}
        {scanComplete && aggregated.counts.totalProfiles > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ErrorBoundary fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
              <IdentityStrengthScore scanId={jobId} />
            </ErrorBoundary>
            <ErrorBoundary fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
              <UsernameUniquenessScore scanId={jobId} />
            </ErrorBoundary>
            <ErrorBoundary fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
              <FootprintClusterMap scanId={jobId} />
            </ErrorBoundary>
          </div>
        )}

        {/* Unified Profiles & Exposure Section */}
        <ProfilesExposureSection
          results={displayResults}
          isFullAccess={isFullAccess}
          onUpgradeClick={() => navigateToTab('breaches')}
          onViewAllClick={() => navigateToTab('accounts')}
        />

        {/* Provider Health Panel - Show unconfigured providers */}
        {providerHealthFindings.length > 0 && (
          <ProviderHealthPanel findings={providerHealthFindings} variant="compact" />
        )}

        {/* 3) Focused Entity (if active) */}
        {focusedResult && (
          <FocusedEntityBanner
            result={focusedResult}
            onView={handleViewFocused}
            onClear={handleClearFocus}
          />
        )}

        {/* 4) Recommended Next Steps */}
        <NextStepsPanel
          accountsFound={grouped.found.length}
          breachCount={breachCount}
          hasFocusedEntity={!!focusedEntityId}
          verifiedCount={verifiedEntities.size}
          onNavigateToAccounts={() => navigateToTab('accounts')}
          onNavigateToConnections={() => navigateToTab('connections')}
          onNavigateToBreaches={() => navigateToTab('breaches')}
          onExport={onExportPDF}
        />

        {/* 5) Reputation & Abuse Signals (Pro feature, feature-flagged) */}
        {flags.spamhausEnrichment && (
          <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg" />}>
            <ReputationSignalsCard scanId={jobId} />
          </Suspense>
        )}
      </div>

      {/* Compact Footer Stats - Using aggregated counts */}
      <div className="flex items-center justify-between px-0.5 text-[9px] text-muted-foreground/50">
        <div className="flex items-center gap-2">
          <span><strong className="text-foreground/60">{aggregated.counts.totalProfiles}</strong> profiles</span>
          <span><strong className="text-foreground/60">{platforms.length}</strong> platforms</span>
          {breachCount > 0 && (
            <span className="text-destructive/70"><strong>{breachCount}</strong> exposures</span>
          )}
          {verifiedEntities.size > 0 && (
            <span className="text-green-600/70 dark:text-green-400/70"><strong>{verifiedEntities.size}</strong> verified</span>
          )}
        </div>
        <span className="flex items-center gap-0.5">
          <FileText className="w-2.5 h-2.5" />
          {aggregated.counts.totalProfiles}
        </span>
      </div>

      {/* What to do next — shown after scan completes */}
      {scanComplete && (
        <div className="mt-5 p-4 rounded-lg bg-muted/15 border border-border/25">
          <h4 className="text-xs font-medium text-foreground/80 mb-2">What to do next</h4>
          <ul className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 w-1 h-1 rounded-full bg-muted-foreground/30" />
              Review privacy settings on any high-confidence accounts you recognise — you decide what stays public.
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 w-1 h-1 rounded-full bg-muted-foreground/30" />
              Consider reclaiming or closing accounts you no longer use, if that feels right for you.
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 w-1 h-1 rounded-full bg-muted-foreground/30" />
              Where practical, using different usernames for different contexts can reduce cross-platform correlation.
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5 w-1 h-1 rounded-full bg-muted-foreground/30" />
              No action needed is a perfectly valid outcome — these results are for your awareness, not a to-do list.
            </li>
          </ul>
        </div>
      )}

      {/* Subtle hint for Standard users to try Advanced mode */}
      <AdvancedModeHint scanComplete={scanComplete} />
    </div>
  );
}

export default SummaryTab;
