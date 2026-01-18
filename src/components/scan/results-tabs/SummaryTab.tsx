import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLensAnalysis } from '@/hooks/useLensAnalysis';
import { ScanJob, ScanResult } from '@/hooks/useScanResultsData';

import { IdentitySnapshotCard } from './summary/IdentitySnapshotCard';
import { TopSignalsList, generateSignals } from './summary/TopSignalsList';
import { CompactStatsCard } from './summary/CompactStatsCard';
import { ProfileImagesStrip } from './summary/ProfileImagesStrip';
import { RecommendedActionsCard } from './summary/RecommendedActionsCard';
import { SummaryToolbar } from './summary/SummaryToolbar';

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
}

// Extract unique platforms from results
function getUniquePlatforms(results: ScanResult[]): string[] {
  const platforms = new Set<string>();
  results.forEach(r => {
    if (r.site) platforms.add(r.site);
  });
  return Array.from(platforms);
}

// Get profile images from results
function getProfileImages(results: any[]): string[] {
  const images: string[] = [];
  results.forEach(r => {
    const meta = r.meta || r.metadata || {};
    if (meta.avatar_url) images.push(meta.avatar_url);
    if (meta.profile_image) images.push(meta.profile_image);
  });
  return images.slice(0, 8);
}

// Generate a human-readable summary
function generateSummary(
  username: string,
  found: number,
  claimed: number,
  breaches: number,
  platforms: number,
  lensScore: number
): string {
  const total = found + claimed;
  
  if (total === 0) {
    return `We searched for "${username}" across multiple platforms and didn't find any matching accounts. This could mean the username is unique, rarely used online, or spelled differently on various services.`;
  }

  let summary = `We found ${total} account${total !== 1 ? 's' : ''} for "${username}" across ${platforms} platform${platforms !== 1 ? 's' : ''}. `;
  
  if (found > 0) {
    summary += `${found} confirmed active. `;
  }

  if (breaches > 0) {
    summary += `${breaches} potential data exposure${breaches !== 1 ? 's' : ''} detected. `;
  }

  if (lensScore >= 80) {
    summary += `High confidence in findings.`;
  } else if (lensScore >= 60) {
    summary += `Some results may benefit from manual verification.`;
  }

  return summary;
}

// Calculate reuse score based on username consistency
function calculateReuseScore(found: number, platforms: number): number {
  if (platforms === 0) return 0;
  const ratio = found / platforms;
  return Math.round(ratio * 100);
}

export function SummaryTab({ jobId, job, grouped, resultsCount, results }: SummaryTabProps) {
  const lensAnalysis = useLensAnalysis(results);
  
  const platforms = useMemo(() => getUniquePlatforms(results), [results]);
  const profileImages = useMemo(() => getProfileImages(grouped.found), [grouped.found]);
  
  const breachCount = useMemo(() => {
    const breachKeywords = ['breach', 'hibp', 'leak', 'pwned', 'compromised'];
    return results.filter(r => {
      const site = (r.site || '').toLowerCase();
      const status = (r.status || '').toLowerCase();
      return breachKeywords.some(k => site.includes(k) || status.includes(k));
    }).length;
  }, [results]);

  const reuseScore = useMemo(() => 
    calculateReuseScore(grouped.found.length, platforms.length),
    [grouped.found.length, platforms.length]
  );

  const summary = useMemo(() => 
    generateSummary(
      job?.username || 'Unknown',
      grouped.found.length,
      grouped.claimed.length,
      breachCount,
      platforms.length,
      lensAnalysis.overallScore
    ), 
    [job?.username, grouped, breachCount, platforms.length, lensAnalysis.overallScore]
  );

  const signals = useMemo(() => 
    generateSignals(
      grouped.found.length,
      grouped.claimed.length,
      breachCount,
      platforms.length,
      reuseScore
    ),
    [grouped.found.length, grouped.claimed.length, breachCount, platforms.length, reuseScore]
  );

  // Extract potential aliases from results (e.g., variations found)
  const aliases = useMemo(() => {
    const aliasSet = new Set<string>();
    results.forEach(r => {
      // Use type assertion since meta can have various shapes
      const meta = (r.meta || r.metadata || {}) as Record<string, unknown>;
      if (meta.display_name && typeof meta.display_name === 'string' && meta.display_name !== job?.username) {
        aliasSet.add(meta.display_name);
      }
      if (meta.alias && typeof meta.alias === 'string') {
        aliasSet.add(meta.alias);
      }
    });
    return Array.from(aliasSet).slice(0, 5);
  }, [results, job?.username]);

  const handleRescan = () => {
    // Navigate to scan page with pre-filled username
    window.location.href = `/scan/usernames?q=${encodeURIComponent(job?.username || '')}`;
  };

  const handleExport = () => {
    // Trigger export - this would typically use a toast or modal
    console.log('Export triggered for job:', jobId);
  };

  return (
    <div className="space-y-4">
      {/* Above the fold: 8-col left + 4-col right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - 8 cols */}
        <div className="lg:col-span-8 space-y-4">
          {/* Identity Snapshot */}
          <IdentitySnapshotCard
            searchedValue={job?.username || 'Unknown'}
            scanType="username"
            aliases={aliases}
            overallScore={lensAnalysis.overallScore}
          />

          {/* What we found paragraph */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                What We Found
              </h4>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {summary}
              </p>
            </CardContent>
          </Card>

          {/* Top Signals */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <TopSignalsList signals={signals} maxItems={5} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 4 cols */}
        <div className="lg:col-span-4 space-y-4">
          {/* Compact Stats */}
          <CompactStatsCard
            accountsFound={grouped.found.length}
            platformsChecked={platforms.length}
            breachExposure={breachCount}
            reuseSignals={reuseScore}
          />

          {/* Profile Images Strip */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <ProfileImagesStrip images={profileImages} maxImages={6} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Below the fold */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recommended Actions - spans 8 cols */}
        <div className="lg:col-span-8">
          <RecommendedActionsCard
            breachCount={breachCount}
            foundCount={grouped.found.length}
            claimedCount={grouped.claimed.length}
          />
        </div>

        {/* Toolbar - spans 4 cols */}
        <div className="lg:col-span-4">
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-4">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Actions
              </h4>
              <SummaryToolbar 
                onRescan={handleRescan}
                onExport={handleExport}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SummaryTab;
