import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLensAnalysis } from '@/hooks/useLensAnalysis';
import { ScanJob, ScanResult } from '@/hooks/useScanResultsData';

import { IdentitySnapshotCard } from './summary/IdentitySnapshotCard';
import { InsightsSection, generateInsights } from './summary/InsightsSection';
import { CompactStatsCard } from './summary/CompactStatsCard';
import { ProfileImagesStrip } from './summary/ProfileImagesStrip';

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
    return `No matching accounts found for "${username}". The username may be unique or spelled differently on various services.`;
  }

  let summary = `Found ${total} account${total !== 1 ? 's' : ''} across ${platforms} platform${platforms !== 1 ? 's' : ''}. `;
  
  if (found > 0) summary += `${found} confirmed active. `;
  if (breaches > 0) summary += `${breaches} potential exposure${breaches !== 1 ? 's' : ''}.`;

  return summary.trim();
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

  const insights = useMemo(() => 
    generateInsights(
      grouped.found.length,
      grouped.claimed.length,
      breachCount,
      platforms.length,
      reuseScore,
      lensAnalysis.overallScore
    ),
    [grouped.found.length, grouped.claimed.length, breachCount, platforms.length, reuseScore, lensAnalysis.overallScore]
  );

  // Extract potential aliases from results
  const aliases = useMemo(() => {
    const aliasSet = new Set<string>();
    results.forEach(r => {
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
    window.location.href = `/scan/usernames?q=${encodeURIComponent(job?.username || '')}`;
  };

  const handleExport = () => {
    console.log('Export triggered for job:', jobId);
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Identity + Stats side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Identity Snapshot + Summary */}
        <div className="lg:col-span-8 space-y-3">
          <IdentitySnapshotCard
            searchedValue={job?.username || 'Unknown'}
            scanType="username"
            aliases={aliases}
            overallScore={lensAnalysis.overallScore}
          />
          
          {/* Brief summary inline */}
          <p className="text-sm text-muted-foreground px-1 leading-relaxed">
            {summary}
          </p>
        </div>

        {/* Right: Stats + Images */}
        <div className="lg:col-span-4 space-y-3">
          <CompactStatsCard
            accountsFound={grouped.found.length}
            platformsChecked={platforms.length}
            breachExposure={breachCount}
            reuseSignals={reuseScore}
          />
          
          {profileImages.length > 0 && (
            <div className="px-1">
              <ProfileImagesStrip images={profileImages} maxImages={6} />
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Insights Section (replaces large cards) */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <InsightsSection insights={insights} maxVisible={5} />
        </CardContent>
      </Card>

      {/* Row 3: Results count footer */}
      <div className="flex items-center justify-end py-1 px-1">
        <span className="text-xs text-muted-foreground">
          {resultsCount} results analyzed
        </span>
      </div>
    </div>
  );
}

export default SummaryTab;
