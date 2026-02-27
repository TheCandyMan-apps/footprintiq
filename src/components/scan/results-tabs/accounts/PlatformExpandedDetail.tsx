/**
 * PlatformExpandedDetail - Inline accordion panel shown when a platform row is expanded.
 * Displays: confidence explanation, risk context, exposure category, removal priority.
 * For free users, content is blurred with a lock overlay.
 */

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Lock, Shield, AlertTriangle, TrendingDown, Info, ChevronRight, Layers } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  extractPlatformName,
  generateRiskContext,
  deriveMatchType,
} from '@/lib/results/extractors';
import { getPlatformCategory, getCategoryColor, type PlatformCategory } from '@/lib/categoryMapping';
import { getBrokerRemovalGuide } from '@/lib/results/brokerRemovalGuides';

interface PlatformExpandedDetailProps {
  result: ScanResult;
  lensScore: number;
  isLocked?: boolean;
}

// Derive removal priority from confidence + category
function getRemovalPriority(lensScore: number, category: PlatformCategory): {
  level: 'high' | 'medium' | 'low';
  label: string;
  color: string;
  tooltip: string;
} {
  if (category === 'NSFW' || (lensScore >= 80 && (category === 'Social' || category === 'Marketplaces'))) {
    return {
      level: 'high',
      label: 'High Priority',
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      tooltip: 'This platform exposes personal information broadly. Consider reviewing or removing your presence promptly.',
    };
  }
  if (lensScore >= 60 || category === 'Forums') {
    return {
      level: 'medium',
      label: 'Medium Priority',
      color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      tooltip: 'This profile contributes to your digital footprint. Address when convenient as part of a broader cleanup.',
    };
  }
  return {
    level: 'low',
    label: 'Low Priority',
    color: 'bg-muted/30 text-muted-foreground border-border/20',
    tooltip: 'Limited exposure from this platform. Monitor but no immediate action required.',
  };
}

// Explain why this platform increases risk
function getRiskExplanation(platformName: string, category: PlatformCategory, lensScore: number): string {
  const base = `${platformName} is categorised as a ${category} platform.`;
  if (category === 'Social') {
    return `${base} Social platforms often expose real names, photos, and connections, making cross-referencing easier for anyone investigating this identity.`;
  }
  if (category === 'Developer') {
    return `${base} Developer platforms can reveal technical skills, project history, and sometimes email addresses or employer information.`;
  }
  if (category === 'Games') {
    return `${base} Gaming accounts may expose activity patterns, friend lists, and linked social accounts.`;
  }
  if (category === 'NSFW') {
    return `${base} Presence on adult platforms carries significant reputational risk if linked to a real identity.`;
  }
  if (category === 'Crypto') {
    return `${base} Crypto platform presence can indicate financial activity and may attract targeted attacks.`;
  }
  if (category === 'Marketplaces') {
    return `${base} Marketplace profiles often contain shipping addresses, purchase history, and payment information.`;
  }
  if (category === 'Forums') {
    return `${base} Forum posts are often archived indefinitely and may reveal opinions, locations, or personal details shared casually.`;
  }
  return `${base} Any public profile adds to overall digital footprint discoverability.`;
}

export function PlatformExpandedDetail({ result, lensScore, isLocked = false }: PlatformExpandedDetailProps) {
  const platformName = useMemo(() => extractPlatformName(result), [result]);
  const category = useMemo(() => getPlatformCategory(platformName), [platformName]);
  const categoryColor = useMemo(() => getCategoryColor(category), [category]);
  const matchType = useMemo(() => deriveMatchType(result, lensScore), [result, lensScore]);
  const removalPriority = useMemo(() => getRemovalPriority(lensScore, category), [lensScore, category]);
  const riskExplanation = useMemo(() => getRiskExplanation(platformName, category, lensScore), [platformName, category, lensScore]);
  const removalGuide = useMemo(() => getBrokerRemovalGuide(platformName), [platformName]);

  const confidenceExplanation = useMemo(() => {
    if (lensScore >= 80) return 'Strong signal alignment detected. The username, profile data, and platform indicators all correspond. This reflects consistency of public signals, not confirmed ownership.';
    if (lensScore >= 60) return 'Some indicators align but full confirmation was not possible from public data alone. This is common and does not reduce the importance of the finding.';
    return 'Limited public data was available to evaluate this match. The result may still be relevant — the available evidence is simply insufficient to assess signal strength.';
  }, [lensScore]);

  const content = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 text-[11px]">
      {/* Confidence Explanation */}
      <div className="space-y-1.5">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <Shield className="w-3 h-3 text-primary/70" />
                <span className="font-semibold text-foreground text-[10px] uppercase tracking-wide">Match Confidence</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] text-[10px]">
              Confidence reflects how many public signals align with the search query. It does not confirm identity.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-muted-foreground leading-relaxed">{confidenceExplanation}</p>
        <Badge variant="outline" className="text-[9px] h-4 px-1.5">
          {matchType.label} · {lensScore}%
        </Badge>
      </div>

      {/* Risk Explanation */}
      <div className="space-y-1.5">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span className="font-semibold text-foreground text-[10px] uppercase tracking-wide">Why This Increases Risk</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[260px] text-[10px]">
              See which platforms increase your digital exposure and why they matter for privacy.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-muted-foreground leading-relaxed">{riskExplanation}</p>
      </div>

      {/* Exposure Category */}
      <div className="space-y-1.5">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <Layers className="w-3 h-3 text-blue-500" />
                <span className="font-semibold text-foreground text-[10px] uppercase tracking-wide">Exposure Category</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-[10px]">
              Platforms are grouped by type to help you understand where your digital presence is concentrated.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Badge variant="outline" className={cn('text-[10px] h-5 px-2', categoryColor)}>
          {category}
        </Badge>
        <p className="text-muted-foreground/70 text-[10px]">
          {category === 'Other' ? 'Uncategorised platform' : `Grouped under ${category} platforms`}
        </p>
      </div>

      {/* Removal Priority */}
      <div className="space-y-1.5">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <TrendingDown className="w-3 h-3 text-primary/70" />
                <span className="font-semibold text-foreground text-[10px] uppercase tracking-wide">Removal Priority</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] text-[10px]">
              {removalPriority.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Badge variant="outline" className={cn('text-[10px] h-5 px-2', removalPriority.color)}>
          {removalPriority.label}
        </Badge>
        {removalGuide && (
          <a
            href={removalGuide}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-accent hover:underline transition-colors cursor-pointer"
            onClick={e => e.stopPropagation()}
          >
            View removal guide
            <ChevronRight className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div className="relative overflow-hidden">
        <div className="blur-[4px] select-none pointer-events-none opacity-50">
          {content}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/80 border border-border/40 cursor-default">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground">Pro breakdown</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[11px]">
                Unlock full breakdown in Pro
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  return content;
}
