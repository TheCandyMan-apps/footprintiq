import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Shield, AlertTriangle, Globe, Link2, 
  CheckCircle, Info, Eye, RefreshCw, Users,
  FileWarning, Clock
} from 'lucide-react';
import { LensConfidenceBadge } from '@/components/scan/LensConfidenceBadge';
import { useLensAnalysis } from '@/hooks/useLensAnalysis';
import { ScanJob, ScanResult } from '@/hooks/useScanResultsData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
  return Array.from(platforms).slice(0, 20);
}

// Get profile images from results (simulated - would come from actual metadata)
function getProfileImages(results: any[]): string[] {
  const images: string[] = [];
  results.forEach(r => {
    const meta = r.meta || r.metadata || {};
    if (meta.avatar_url) images.push(meta.avatar_url);
    if (meta.profile_image) images.push(meta.profile_image);
  });
  return images.slice(0, 6);
}

// Generate a human-readable summary
function generateSummary(
  username: string,
  found: number,
  claimed: number,
  breaches: number,
  platforms: string[],
  lensScore: number
): string {
  const total = found + claimed;
  
  if (total === 0) {
    return `We searched for "${username}" across multiple platforms and didn't find any matching accounts. This could mean the username is unique, rarely used online, or spelled differently on various services.`;
  }

  let summary = `We found ${total} account${total !== 1 ? 's' : ''} associated with "${username}" across ${platforms.length} platform${platforms.length !== 1 ? 's' : ''}. `;
  
  if (found > 0) {
    summary += `${found} profile${found !== 1 ? 's were' : ' was'} confirmed as active. `;
  }
  
  if (claimed > 0) {
    summary += `${claimed} username${claimed !== 1 ? 's appear' : ' appears'} to be claimed but may not be actively used. `;
  }

  if (breaches > 0) {
    summary += `We also detected ${breaches} potential data exposure${breaches !== 1 ? 's' : ''} that may warrant attention. `;
  }

  if (lensScore >= 80) {
    summary += `Our analysis indicates high confidence in these findings.`;
  } else if (lensScore >= 60) {
    summary += `Our analysis indicates moderate confidence — some results may benefit from manual verification.`;
  } else {
    summary += `Some findings have lower confidence scores and may require additional verification.`;
  }

  return summary;
}

// Get risk level description
function getRiskLevel(breaches: number, found: number): { level: string; color: string; description: string } {
  if (breaches >= 5) {
    return {
      level: 'Elevated',
      color: 'text-orange-600',
      description: 'Multiple data exposures detected. Review recommended.'
    };
  }
  if (breaches > 0) {
    return {
      level: 'Moderate',
      color: 'text-yellow-600',
      description: 'Some data exposures found. Worth reviewing.'
    };
  }
  if (found > 10) {
    return {
      level: 'Notable',
      color: 'text-blue-600',
      description: 'Significant online presence detected.'
    };
  }
  return {
    level: 'Low',
    color: 'text-green-600',
    description: 'No significant concerns identified.'
  };
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

  const summary = useMemo(() => 
    generateSummary(
      job?.username || 'Unknown',
      grouped.found.length,
      grouped.claimed.length,
      breachCount,
      platforms,
      lensAnalysis.overallScore
    ), 
    [job?.username, grouped, breachCount, platforms, lensAnalysis.overallScore]
  );

  const riskLevel = useMemo(() => 
    getRiskLevel(breachCount, grouped.found.length),
    [breachCount, grouped.found.length]
  );

  const scanDate = job?.finished_at || job?.started_at || job?.created_at;

  return (
    <div className="space-y-6">
      {/* Identity Snapshot Header */}
      <Card className="overflow-hidden border-primary/20">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">{job?.username || 'Unknown'}</h2>
                <LensConfidenceBadge 
                  score={lensAnalysis.overallScore} 
                  reasoning="Overall scan confidence based on data quality and cross-validation"
                  size="md"
                />
              </div>
              <p className="text-muted-foreground">
                Identity scan completed {scanDate ? format(new Date(scanDate), 'MMM d, yyyy') : 'recently'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn('font-medium', riskLevel.color)}>
                {riskLevel.level} Exposure
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Summary & Risk Highlights */}
        <div className="lg:col-span-3 space-y-6">
          {/* Written Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                What We Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {summary}
              </p>
            </CardContent>
          </Card>

          {/* Risk Highlights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Key Observations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Risk Level */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className={cn('p-2 rounded-full', 
                  riskLevel.level === 'Low' ? 'bg-green-500/10' :
                  riskLevel.level === 'Notable' ? 'bg-blue-500/10' :
                  riskLevel.level === 'Moderate' ? 'bg-yellow-500/10' : 'bg-orange-500/10'
                )}>
                  {riskLevel.level === 'Low' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : riskLevel.level === 'Notable' ? (
                    <Eye className="w-4 h-4 text-blue-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">Exposure Level: {riskLevel.level}</p>
                  <p className="text-sm text-muted-foreground">{riskLevel.description}</p>
                </div>
              </div>

              {/* Observations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {grouped.found.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <Users className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Active Presence</p>
                      <p className="text-xs text-muted-foreground">
                        {grouped.found.length} confirmed active profile{grouped.found.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}

                {platforms.length > 3 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <Globe className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Wide Reach</p>
                      <p className="text-xs text-muted-foreground">
                        Present across {platforms.length} different platforms
                      </p>
                    </div>
                  </div>
                )}

                {grouped.claimed.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <Link2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Reserved Names</p>
                      <p className="text-xs text-muted-foreground">
                        {grouped.claimed.length} username{grouped.claimed.length !== 1 ? 's' : ''} claimed but inactive
                      </p>
                    </div>
                  </div>
                )}

                {breachCount > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-orange-500/20 bg-orange-500/5">
                    <FileWarning className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Data Exposure</p>
                      <p className="text-xs text-muted-foreground">
                        {breachCount} potential breach{breachCount !== 1 ? 'es' : ''} detected
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Username Consistency Note */}
              {grouped.found.length > 2 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <RefreshCw className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Username Consistency</p>
                    <p className="text-xs text-muted-foreground">
                      This username appears to be used consistently across multiple platforms, 
                      which is common for personal branding or a primary online identity.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Images & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Images Collage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Profile Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {profileImages.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={img} 
                        alt={`Profile ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className="aspect-square rounded-lg bg-muted/50 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center"
                    >
                      <User className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {profileImages.length > 0 
                  ? `${profileImages.length} profile image${profileImages.length !== 1 ? 's' : ''} collected`
                  : 'Profile images will appear here when available'}
              </p>
            </CardContent>
          </Card>

          {/* Key Statistics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Accounts Found</span>
                <span className="text-lg font-bold text-primary">{grouped.found.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Platforms Checked</span>
                <span className="text-lg font-bold">{platforms.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Analysis Confidence</span>
                <span className={cn('text-lg font-bold',
                  lensAnalysis.overallScore >= 80 ? 'text-green-600' :
                  lensAnalysis.overallScore >= 60 ? 'text-yellow-600' : 'text-orange-600'
                )}>
                  {lensAnalysis.overallScore}%
                </span>
              </div>
              {breachCount > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <span className="text-sm text-orange-700 dark:text-orange-400">Breach Alerts</span>
                  <span className="text-lg font-bold text-orange-600">{breachCount}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scan Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  Scan completed {scanDate ? format(new Date(scanDate), 'MMM d, yyyy \'at\' h:mm a') : 'recently'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Shield className="w-3 h-3" />
                <span>Analyzed with LENS (Layered Entity & Network Scoring)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SummaryTab;
