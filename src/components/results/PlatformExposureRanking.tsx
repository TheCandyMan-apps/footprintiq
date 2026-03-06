import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Lock, ArrowRight, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PlatformRisk = 'low' | 'medium' | 'high' | 'critical';

export interface RankedPlatform {
  name: string;
  risk: PlatformRisk;
  /** Optional explanation for Pro users */
  explanation?: string;
}

interface PlatformExposureRankingProps {
  platforms: RankedPlatform[];
  /** Free users see top 3, Pro sees all */
  isPro?: boolean;
  onUpgradeClick?: () => void;
  className?: string;
}

const RISK_ORDER: Record<PlatformRisk, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function getRiskColor(risk: PlatformRisk) {
  switch (risk) {
    case 'critical': return 'text-red-600 bg-red-600/10 border-red-600/30';
    case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
  }
}

function getRiskLabel(risk: PlatformRisk) {
  switch (risk) {
    case 'critical': return 'Critical Risk';
    case 'high': return 'High Risk';
    case 'medium': return 'Medium Risk';
    case 'low': return 'Low Risk';
  }
}

/**
 * Derive platform risk from scan result data.
 * Risk is based on:
 *  - Profile metadata richness (bio, avatar, followers, location, etc.)
 *  - Public identity signals (real-name patterns, profile presence, high severity)
 *  - Cross-platform correlation confidence (reuse across multiple providers)
 * Call this from the parent to build RankedPlatform[].
 */
export function derivePlatformRisk(rows: any[]): RankedPlatform[] {
  // Group by platform name
  const platformMap = new Map<string, {
    count: number;
    severities: string[];
    kinds: string[];
    providers: Set<string>;
    metaFields: number;
    confidences: number[];
  }>();

  for (const r of rows) {
    const platform = r.site || r.meta?.platform || r.platformName || r.platform_name || r.provider;
    if (!platform) continue;

    const name = String(platform).charAt(0).toUpperCase() + String(platform).slice(1);
    const existing = platformMap.get(name) || {
      count: 0, severities: [], kinds: [], providers: new Set<string>(), metaFields: 0, confidences: [],
    };
    existing.count++;
    if (r.severity) existing.severities.push(r.severity);
    if (r.kind) existing.kinds.push(r.kind);
    if (r.provider) existing.providers.add(r.provider);

    // Count metadata richness (bio, avatar, followers, location, display_name, website, joined)
    const meta = r.meta || {};
    const richFields = ['bio', 'avatar_url', 'display_name', 'followers', 'location', 'website', 'joined'].filter(
      f => meta[f] !== undefined && meta[f] !== null && meta[f] !== ''
    );
    existing.metaFields += richFields.length;

    // Track confidence for correlation scoring
    const conf = typeof r.confidence === 'number' ? r.confidence
      : typeof r.evidence?.confidence_score === 'number' ? r.evidence.confidence_score / 100
      : null;
    if (conf !== null) existing.confidences.push(conf);

    platformMap.set(name, existing);
  }

  const ranked: RankedPlatform[] = [];

  for (const [name, data] of platformMap) {
    // --- Score each risk dimension (0-3 each) ---

    // 1. Metadata richness score
    const metaScore = data.metaFields >= 5 ? 3 : data.metaFields >= 3 ? 2 : data.metaFields >= 1 ? 1 : 0;

    // 2. Public identity signals score
    const hasBreach = data.kinds.some(k => k.includes('breach') || k.includes('leak') || k.includes('pwned'));
    const hasHighSeverity = data.severities.some(s => s === 'high' || s === 'critical');
    const hasPresence = data.kinds.some(k => k.includes('profile_presence') || k.includes('presence.hit'));
    const identityScore = (hasBreach ? 2 : 0) + (hasHighSeverity ? 1 : 0) + (hasPresence ? 0.5 : 0);

    // 3. Cross-platform correlation confidence score
    const avgConf = data.confidences.length > 0
      ? data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length
      : 0;
    const correlationScore = (data.providers.size >= 3 ? 2 : data.providers.size >= 2 ? 1 : 0)
      + (avgConf >= 0.7 ? 1 : avgConf >= 0.4 ? 0.5 : 0);

    const totalScore = metaScore + identityScore + correlationScore;

    let risk: PlatformRisk;
    if (totalScore >= 5) risk = 'critical';
    else if (totalScore >= 3.5) risk = 'high';
    else if (totalScore >= 2) risk = 'medium';
    else risk = 'low';

    const explanation = buildExplanation(name, data, risk, metaScore, correlationScore);
    ranked.push({ name, risk, explanation });
  }

  // Sort by risk (highest first)
  ranked.sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk]);

  return ranked;
}

function buildExplanation(
  name: string,
  data: { count: number; severities: string[]; kinds: string[] },
  risk: PlatformRisk,
  metaScore?: number,
  correlationScore?: number,
): string {
  const parts: string[] = [];

  if (data.count > 1) {
    parts.push(`${data.count} signals detected`);
  }

  const breachCount = data.kinds.filter(k =>
    k.includes('breach') || k.includes('leak')
  ).length;

  if (breachCount > 0) {
    parts.push(`${breachCount} breach association${breachCount > 1 ? 's' : ''}`);
  }

  if (data.kinds.includes('profile_presence') || data.kinds.includes('presence.hit')) {
    parts.push('public profile detected');
  }

  if (metaScore !== undefined && metaScore >= 2) {
    parts.push('rich profile metadata');
  }

  if (correlationScore !== undefined && correlationScore >= 2) {
    parts.push('strong cross-platform correlation');
  }

  if (parts.length === 0) {
    parts.push('presence detected');
  }

  return `${name}: ${parts.join(', ')}.`;
}

const FREE_LIMIT = 3;

export function PlatformExposureRanking({
  platforms,
  isPro = false,
  onUpgradeClick,
  className,
}: PlatformExposureRankingProps) {
  if (platforms.length === 0) return null;

  const visiblePlatforms = isPro ? platforms : platforms.slice(0, FREE_LIMIT);
  const hiddenCount = isPro ? 0 : Math.max(0, platforms.length - FREE_LIMIT);

  return (
    <Card className={cn('border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden', className)}>
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary flex-shrink-0" />
          <h3 className="text-sm font-semibold text-foreground">Platform Exposure Ranking</h3>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground border-border/50">
            {platforms.length} platform{platforms.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Platform list */}
        <div className="space-y-2">
          {visiblePlatforms.map((platform, i) => {
            const colorClasses = getRiskColor(platform.risk);
            const [textColor, bgColor, borderColor] = colorClasses.split(' ');

            return (
              <div
                key={platform.name}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-muted-foreground/50 font-mono w-4 text-right flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {platform.name}
                    </p>
                    {isPro && platform.explanation && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                        {platform.explanation}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn('text-[10px] px-2 py-0.5 flex-shrink-0 font-medium', bgColor, textColor, borderColor)}
                >
                  {getRiskLabel(platform.risk)}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Locked / hidden section for free users */}
        {!isPro && hiddenCount > 0 && (
          <div className="pt-2 border-t border-border/30 space-y-2">
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>+{hiddenCount} more platform{hiddenCount !== 1 ? 's' : ''} with exposure details</span>
              </div>
              {onUpgradeClick && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onUpgradeClick}
                  className="text-xs gap-1.5 flex-shrink-0 border-primary/30 text-primary hover:bg-primary/5"
                >
                  Unlock Full Ranking
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              See all platforms, risk explanations, and remediation guidance.
            </p>
          </div>
        )}

        {/* Empty locked slots for visual teaser */}
        {!isPro && hiddenCount > 0 && (
          <div className="space-y-1.5">
            {Array.from({ length: Math.min(hiddenCount, 2) }).map((_, i) => (
              <div
                key={`locked-${i}`}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/20 opacity-40 blur-[2px] select-none pointer-events-none"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground/50 font-mono w-4 text-right">
                    {FREE_LIMIT + i + 1}
                  </span>
                  <div className="h-3 w-24 bg-muted-foreground/20 rounded" />
                </div>
                <div className="h-4 w-16 bg-muted-foreground/20 rounded-full" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
