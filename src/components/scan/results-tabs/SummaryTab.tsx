import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLensAnalysis } from '@/hooks/useLensAnalysis';
import { useScanNarrative } from '@/hooks/useScanNarrative';
import { ScanJob, ScanResult } from '@/hooks/useScanResultsData';
import { useInvestigation } from '@/contexts/InvestigationContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crosshair, X, ExternalLink } from 'lucide-react';

import { IdentitySnapshotCard } from './summary/IdentitySnapshotCard';
import { CompactStatsCard } from './summary/CompactStatsCard';
import { ProfileImagesStrip } from './summary/ProfileImagesStrip';
import { ScanNarrativeFeed } from './summary/ScanNarrativeFeed';
import { KeyFindingsPanel, generateKeyFindings } from './summary/KeyFindingsPanel';
import { SummaryActions } from './summary/SummaryActions';

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
    if (r.site) platforms.add(r.site);
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
  return images.filter(url => url && url.startsWith('http')).slice(0, 8);
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
  const lensAnalysis = useLensAnalysis(results);
  
  // Get focus state from investigation context
  let focusedEntityId: string | null = null;
  let setFocusedEntity: ((id: string | null) => void) | null = null;
  
  try {
    const investigation = useInvestigation();
    focusedEntityId = investigation.focusedEntityId;
    setFocusedEntity = investigation.setFocusedEntity;
  } catch {
    // Context not available - no focus state
  }

  // Find the focused result details
  const focusedResult = useMemo(() => {
    if (!focusedEntityId) return null;
    return results.find(r => r.id === focusedEntityId) || null;
  }, [focusedEntityId, results]);

  const handleClearFocus = () => {
    setFocusedEntity?.(null);
  };

  const handleViewFocused = () => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'accounts');
    params.set('focus', focusedEntityId || '');
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };
  
  const platforms = useMemo(() => getUniquePlatforms(results), [results]);
  const profileImages = useMemo(() => getProfileImages(results), [results]);
  
  const breachCount = useMemo(() => {
    return results.filter((r: any) => {
      const kind = (r.kind || '').toLowerCase();
      const site = (r.site || '').toLowerCase();
      return kind.includes('breach') || kind.includes('leak') || site.includes('breach') || site.includes('hibp');
    }).length;
  }, [results]);

  const reuseScore = useMemo(() => 
    calculateReuseScore(grouped.found.length, platforms.length),
    [grouped.found.length, platforms.length]
  );

  const aliases = useMemo(() => {
    const aliasSet = new Set<string>();
    results.forEach(r => {
      const meta = (r.meta || r.metadata || {}) as Record<string, unknown>;
      if (meta.display_name && typeof meta.display_name === 'string' && meta.display_name !== job?.username) {
        aliasSet.add(meta.display_name);
      }
      if (meta.name && typeof meta.name === 'string' && meta.name !== job?.username) {
        aliasSet.add(meta.name);
      }
    });
    return Array.from(aliasSet).slice(0, 5);
  }, [results, job?.username]);

  // Scan narrative from events
  const narrative = useScanNarrative(jobId, job?.username || '', 'username');

  // Key findings
  const keyFindings = useMemo(() => 
    generateKeyFindings(grouped.found.length, platforms.length, breachCount, reuseScore, aliases),
    [grouped.found.length, platforms.length, breachCount, reuseScore, aliases]
  );

  // Calculate scan duration
  const scanDuration = useMemo(() => {
    if (job?.started_at && job?.finished_at) {
      return new Date(job.finished_at).getTime() - new Date(job.started_at).getTime();
    }
    return narrative.scanDuration;
  }, [job?.started_at, job?.finished_at, narrative.scanDuration]);

  // Determine scan status
  const scanStatus = useMemo(() => {
    const status = (job?.status || '').toLowerCase();
    if (status.includes('complete')) return 'completed';
    if (status.includes('running') || status.includes('pending')) return 'running';
    if (status.includes('fail') || status.includes('error')) return 'failed';
    if (status.includes('partial')) return 'partial';
    return 'completed';
  }, [job?.status]);

  const handleNewScan = () => navigate('/');

  return (
    <div className="space-y-3">
      {/* Focused Entity Banner */}
      {focusedResult && (
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Crosshair className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-medium text-foreground">Focused Entity:</span>
              <span className="text-xs text-muted-foreground ml-1.5 truncate">
                {focusedResult.site || 'Unknown'} 
                {focusedResult.url && (
                  <span className="text-muted-foreground/60 ml-1">
                    ({new URL(focusedResult.url).hostname})
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px]"
              onClick={handleViewFocused}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleClearFocus}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Main 8/4 grid layout - tight spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left column - 8 cols (main briefing content) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Identity Snapshot - compact header */}
          <IdentitySnapshotCard
            searchedValue={job?.username || 'Unknown'}
            scanType="username"
            aliases={aliases}
            overallScore={lensAnalysis.overallScore}
            scanTime={job?.finished_at || job?.started_at}
            scanDuration={scanDuration}
            scanStatus={scanStatus}
          />

          {/* Scan Narrative - What we did/are doing */}
          <ScanNarrativeFeed
            items={narrative.items}
            summary={narrative.summary}
            isLoading={narrative.isLoading}
            isComplete={narrative.isComplete}
            estimatedTimeRemaining={narrative.estimatedTimeRemaining}
          />

          {/* Key Findings - actionable intelligence */}
          <KeyFindingsPanel findings={keyFindings} scanId={jobId} />
        </div>

        {/* Right column - 4 cols (supporting info) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Profile Images */}
          {profileImages.length > 0 && (
            <ProfileImagesStrip images={profileImages} maxImages={6} />
          )}

          {/* Compact Stats */}
          <CompactStatsCard
            accountsFound={grouped.found.length}
            platformsChecked={platforms.length}
            breachExposure={breachCount}
            reuseSignals={reuseScore}
          />

          {/* Actions - compact buttons */}
          <SummaryActions
            onExportJSON={onExportJSON}
            onExportCSV={onExportCSV}
            onExportPDF={onExportPDF}
            onNewScan={handleNewScan}
            disabled={results.length === 0}
          />
        </div>
      </div>

      {/* Footer - minimal */}
      <div className="text-[11px] text-muted-foreground/70 text-center pt-1.5 border-t border-border/30">
        {platforms.length > 0 ? `${platforms.length} platforms` : 'Multiple sources'} • {resultsCount} results
      </div>
    </div>
  );
}

export default SummaryTab;
