import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLensAnalysis } from '@/hooks/useLensAnalysis';
import { useScanNarrative } from '@/hooks/useScanNarrative';
import { ScanJob, ScanResult } from '@/hooks/useScanResultsData';

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
  const lensAnalysis = useLensAnalysis(results);
  
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
