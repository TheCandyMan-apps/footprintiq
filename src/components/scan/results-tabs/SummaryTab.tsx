import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLensAnalysis } from '@/hooks/useLensAnalysis';
import { ScanJob, ScanResult } from '@/hooks/useScanResultsData';

import { IdentitySnapshotCard } from './summary/IdentitySnapshotCard';
import { InsightsSection, generateInsights } from './summary/InsightsSection';
import { CompactStatsCard } from './summary/CompactStatsCard';
import { ProfileImagesStrip } from './summary/ProfileImagesStrip';
import { RESULTS_SPACING, RESULTS_TYPOGRAPHY, RESULTS_BORDERS } from './styles';

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
  });
  return images.slice(0, 8);
}

function generateSummary(
  username: string,
  found: number,
  claimed: number,
  breaches: number,
  platforms: number
): string {
  const total = found + claimed;
  
  if (total === 0) {
    return `No matching accounts found for "${username}". The username may be unique or spelled differently.`;
  }

  let summary = `Found ${total} account${total !== 1 ? 's' : ''} across ${platforms} platform${platforms !== 1 ? 's' : ''}. `;
  if (found > 0) summary += `${found} confirmed active. `;
  if (breaches > 0) summary += `${breaches} potential exposure${breaches !== 1 ? 's' : ''}.`;

  return summary.trim();
}

function calculateReuseScore(found: number, platforms: number): number {
  if (platforms === 0) return 0;
  return Math.round((found / platforms) * 100);
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
      platforms.length
    ), 
    [job?.username, grouped, breachCount, platforms.length]
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

  return (
    <div className={RESULTS_SPACING.contentMarginSm}>
      {/* Row 1: Identity + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-8 space-y-2">
          <IdentitySnapshotCard
            searchedValue={job?.username || 'Unknown'}
            scanType="username"
            aliases={aliases}
            overallScore={lensAnalysis.overallScore}
          />
          <p className={`${RESULTS_TYPOGRAPHY.caption} px-1 leading-relaxed`}>
            {summary}
          </p>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <CompactStatsCard
            accountsFound={grouped.found.length}
            platformsChecked={platforms.length}
            breachExposure={breachCount}
            reuseSignals={reuseScore}
          />
          
          {profileImages.length > 0 && (
            <ProfileImagesStrip images={profileImages} maxImages={6} />
          )}
        </div>
      </div>

      {/* Row 2: Insights */}
      <Card className={RESULTS_BORDERS.cardBorder}>
        <CardContent className={RESULTS_SPACING.cardPadding}>
          <InsightsSection insights={insights} maxVisible={5} />
        </CardContent>
      </Card>

      {/* Row 3: Footer */}
      <div className="flex items-center justify-end py-1">
        <span className={RESULTS_TYPOGRAPHY.captionMuted}>
          {resultsCount} results analyzed
        </span>
      </div>
    </div>
  );
}

export default SummaryTab;
