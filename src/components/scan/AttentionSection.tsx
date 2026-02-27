/**
 * AttentionSection — "What Requires Attention?" conversion block.
 * Shows highlighted higher-risk exposures with context, then a blurred
 * Action Plan teaser with benefit-driven CTA.
 */

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertTriangle,
  Shield,
  Lock,
  ArrowRight,
  Network,
  ListChecks,
  TrendingDown,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPlatformCategory, getCategoryColor } from '@/lib/categoryMapping';
import type { AggregatedProfile } from '@/lib/results/resultsAggregator';

interface AttentionSectionProps {
  profiles: AggregatedProfile[];
  totalExposures: number;
  onUpgradeClick: () => void;
}

// Risk explanations mapped to platform categories
const RISK_CONTEXTS: Record<string, { label: string; explanation: string }> = {
  Social: {
    label: 'Identity correlation risk',
    explanation: 'Social profiles expose real names, photos, and connections that can be cross-referenced to build a complete identity profile.',
  },
  Developer: {
    label: 'Professional exposure',
    explanation: 'Developer platforms may reveal employer info, email addresses, and project history linked to your identity.',
  },
  NSFW: {
    label: 'Reputational risk',
    explanation: 'Presence on adult platforms carries significant reputational risk if linked to a real identity.',
  },
  Games: {
    label: 'Activity pattern exposure',
    explanation: 'Gaming accounts expose activity patterns, friend lists, and potentially linked social accounts.',
  },
  Marketplaces: {
    label: 'Financial data exposure',
    explanation: 'Marketplace profiles often contain shipping addresses and purchase history tied to your identity.',
  },
  Forums: {
    label: 'Archived content risk',
    explanation: 'Forum posts are archived indefinitely and may reveal opinions, locations, or personal details shared casually.',
  },
  Crypto: {
    label: 'Financial activity exposure',
    explanation: 'Crypto platform presence can indicate financial activity and may attract targeted social engineering.',
  },
  Other: {
    label: 'Digital footprint contribution',
    explanation: 'Any public profile increases overall discoverability and may be combined with other signals.',
  },
};

function getHigherRiskProfiles(profiles: AggregatedProfile[]): AggregatedProfile[] {
  // Prioritize: NSFW > Social with high confidence > Marketplaces > Forums > rest
  const scored = profiles.map(p => {
    const cat = getPlatformCategory(p.platform);
    let score = 0;
    if (cat === 'NSFW') score = 100;
    else if (cat === 'Social') score = 70 + (p.confidence || 0) * 0.3;
    else if (cat === 'Marketplaces') score = 60;
    else if (cat === 'Forums') score = 50;
    else if (cat === 'Crypto') score = 45;
    else if (cat === 'Developer') score = 40;
    else score = 20;
    // Boost high-confidence results
    if ((p.confidence || 0) >= 80) score += 15;
    return { profile: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.profile);
}

export function AttentionSection({ profiles, totalExposures, onUpgradeClick }: AttentionSectionProps) {
  const higherRisk = useMemo(() => getHigherRiskProfiles(profiles), [profiles]);

  if (profiles.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* ═══ WHAT REQUIRES ATTENTION ═══ */}
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold">What Requires Attention?</h3>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-help" onClick={e => e.preventDefault()}>
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-[11px]">
                    These exposures carry higher risk based on platform type and signal strength. Addressing them first provides the most impact.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{totalExposures}</span> total exposures found — {higherRisk.length} flagged as higher risk.
            </p>
          </div>

          {/* Higher Risk Exposures */}
          <div className="space-y-2.5">
            {higherRisk.map((profile) => {
              const category = getPlatformCategory(profile.platform);
              const categoryColor = getCategoryColor(category);
              const riskContext = RISK_CONTEXTS[category] || RISK_CONTEXTS.Other;

              return (
                <div
                  key={profile.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {profile.platform.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground capitalize">{profile.platform}</span>
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                        Higher Risk
                      </Badge>
                      <Badge variant="outline" className={cn('text-[9px] h-4 px-1.5', categoryColor)}>
                        {category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                      <span className="text-[11px] font-medium text-muted-foreground">{riskContext.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                      {riskContext.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Impersonation / correlation warning */}
          <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/20 border border-border/30">
            <Eye className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              When the same identifier appears across multiple platforms, it becomes significantly easier to correlate profiles and build a comprehensive identity picture — increasing impersonation and social engineering risk.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ BLURRED ACTION PLAN & EXPOSURE PRIORITY ═══ */}
      <Card className="overflow-hidden border-border/50 relative group cursor-pointer" onClick={onUpgradeClick}>
        {/* Blurred preview content */}
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <ListChecks className="h-4 w-4 text-primary/70" />
            <h3 className="text-sm font-semibold">Action Plan & Exposure Priority</h3>
            <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
          </div>

          {/* Blurred content */}
          <div className="blur-[5px] select-none pointer-events-none space-y-3 opacity-60">
            {/* Fake remediation steps */}
            <div className="space-y-2">
              {['Review and restrict privacy settings on social platforms', 'Request removal from data aggregator listings', 'Deactivate dormant accounts on unused platforms'].map((step, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-md bg-muted/20 border border-border/20">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-xs text-foreground">{step}</span>
                </div>
              ))}
            </div>

            {/* Fake risk impact */}
            <div className="p-3 rounded-md bg-muted/15 border border-border/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Risk Impact Analysis</span>
              </div>
              <div className="h-4 w-3/4 bg-muted/30 rounded" />
              <div className="h-4 w-1/2 bg-muted/20 rounded mt-1.5" />
            </div>

            {/* Fake correlation graph */}
            <div className="p-3 rounded-md bg-muted/15 border border-border/20">
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Identity Correlation Graph</span>
              </div>
              <div className="h-24 bg-muted/20 rounded flex items-center justify-center">
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="w-8 h-8 rounded-full bg-muted/40 border-2 border-muted/30" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Overlay with CTA */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40 flex items-end justify-center pb-6">
          <div className="text-center space-y-3 max-w-xs">
            <p className="text-sm font-semibold text-foreground">
              See exactly which exposures to fix first — and how
            </p>
            <p className="text-[11px] text-muted-foreground">
              Get platform-specific removal steps, risk-ranked priorities, and an identity correlation map.
            </p>
            <Button
              className="gap-2 h-11 px-6 text-sm shadow-md group-hover:shadow-lg transition-shadow"
              onClick={(e) => { e.stopPropagation(); onUpgradeClick(); }}
            >
              Unlock Full Exposure Report
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-[9px] text-muted-foreground/50">
              Includes remediation plan · Risk impact scores · Correlation graph
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
