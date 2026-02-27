import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProfileThumbnail } from './ProfileThumbnail';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, HelpCircle, AlertCircle, ExternalLink, Crosshair, Info, ChevronDown } from 'lucide-react';
import { PlatformExpandedDetail } from './PlatformExpandedDetail';
import { ScanResult } from '@/hooks/useScanResultsData';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { cn } from '@/lib/utils';
import { RESULTS_SEMANTIC_COLORS } from '../styles';
import { LensStatusBadge } from './LensStatusBadge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PlatformIconBadge } from '@/components/ui/PlatformIcon';
import {
  extractPlatformName,
  extractUrl,
  extractUsername,
  extractBioText,
  getInitials,
  generateRiskContext,
  deriveMatchType,
} from '@/lib/results/extractors';
import { getBrokerRemovalGuide } from '@/lib/results/brokerRemovalGuides';

type ClaimType = 'me' | 'not_me';

interface AccountCardProps {
  result: ScanResult;
  jobId: string;
  lensScore: number;
  isFocused: boolean;
  isSelected: boolean;
  verificationResult: LensVerificationResult | null;
  claimStatus: ClaimType | null;
  onFocus: () => void;
  onSelect: () => void;
  onVerificationComplete: (result: LensVerificationResult) => void;
  onClaimChange: (claim: ClaimType | null) => void;
  isDetailLocked?: boolean;
}

const getMatchConfidence = (score: number) => {
  if (score >= 80) return { label: 'High Confidence', shortLabel: 'High', tooltip: 'High confidence reflects strong signal alignment — username, profile data, and platform indicators all correspond. This does not confirm identity; it means the available public signals are consistent.', ...RESULTS_SEMANTIC_COLORS.confidenceHigh, icon: CheckCircle };
  if (score >= 60) return { label: 'Moderate', shortLabel: 'Med', tooltip: 'Moderate confidence means some signals align but others could not be confirmed from public data alone. Further review may be useful.', ...RESULTS_SEMANTIC_COLORS.confidenceMedium, icon: HelpCircle };
  return { label: 'Needs Review', shortLabel: 'Low', tooltip: 'Low confidence means limited public data was available. This does not mean the result is unimportant — the available evidence is insufficient to assess strength either way.', ...RESULTS_SEMANTIC_COLORS.confidenceLow, icon: AlertCircle };
};

export function AccountCard({
  result,
  lensScore,
  isFocused,
  isSelected,
  verificationResult,
  claimStatus,
  onFocus,
  onSelect,
  isDetailLocked = false,
}: AccountCardProps) {
  const meta = useMemo(() => (result.meta || result.metadata || {}) as Record<string, any>, [result]);
  const platformName = useMemo(() => extractPlatformName(result), [result]);
  const profileUrl = useMemo(() => extractUrl(result), [result]);
  const username = useMemo(() => extractUsername(result), [result]);
  const bio = useMemo(() => extractBioText(result), [result]);
  const profileImage = meta.avatar_cached || meta.avatar_url || meta.avatar || meta.profile_image || meta.image || meta.pfp_image;
  const confidence = getMatchConfidence(lensScore);
  const ConfidenceIcon = confidence.icon;
  const matchType = useMemo(() => deriveMatchType(result, lensScore), [result, lensScore]);
  const removalGuide = useMemo(() => getBrokerRemovalGuide(platformName), [platformName]);

  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-card overflow-hidden transition-all duration-150 cursor-pointer shadow-sm',
        'hover:shadow-md hover:border-foreground/25',
        isSelected && 'ring-2 ring-primary border-primary/60 shadow-md',
        isFocused && !isSelected && 'ring-1 ring-primary/50 border-primary/40',
        !isFocused && !isSelected && 'border-border'
      )}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(); }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
    >
      {/* Header: icon + platform + confidence */}
      <div className="flex items-center gap-2 px-2.5 pt-2 pb-1">
        <ProfileThumbnail profileImage={profileImage} platformName={platformName} profileUrl={profileUrl} username={username} size="card" />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[12px] text-foreground truncate leading-none">{platformName}</p>
          {username ? <p className="text-[10px] text-muted-foreground/70 truncate leading-tight">@{username}</p> : <p className="text-[10px] text-muted-foreground/40 truncate leading-tight italic">Username not publicly listed</p>}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground/60 font-medium leading-none cursor-help w-fit" onClick={e => e.stopPropagation()}>
                  {matchType.label}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-[10px] leading-snug">{matchType.tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={cn('h-5 px-1.5 gap-0.5 text-[9px] font-medium shrink-0 cursor-help', confidence.bg, confidence.text, confidence.border)}
              >
                <ConfidenceIcon className="w-2.5 h-2.5" />
                {confidence.shortLabel}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-[10px] leading-snug">
              {confidence.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Bio / risk context */}
      <div className="px-2.5 pb-1">
        {bio ? (
          <p className="text-[10px] text-muted-foreground/70 leading-snug line-clamp-2">{bio}</p>
        ) : null}
        <div className="flex items-center gap-1">
          <p className="text-[9px] text-muted-foreground/50 leading-snug line-clamp-2 italic mt-0.5 flex-1">
            {generateRiskContext(result, lensScore).split('. ')[0]}.
          </p>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors mt-0.5"
                  onClick={e => e.stopPropagation()}
                  aria-label="Why am I seeing this?"
                >
                  <Info className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px] text-[10px] leading-snug">
                <p className="font-medium mb-1">Why am I seeing this?</p>
                <p>{generateRiskContext(result, lensScore)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Broker removal guide link */}
      {removalGuide && (
        <div className="px-2.5 pb-1">
          <Link
            to={removalGuide}
            className="text-[9px] text-accent hover:underline transition-colors"
            onClick={(e) => e.stopPropagation()}
            target="_blank"
          >
            Learn how to remove this listing →
          </Link>
        </div>
      )}

      {/* LENS badge if verified */}
      {verificationResult && (
        <div className="px-2.5 pb-1">
          <LensStatusBadge status={null} score={verificationResult.confidenceScore} compact />
        </div>
      )}

      {/* Claim dot */}
      {claimStatus && (
        <div className="px-2.5 pb-1">
          <span className={cn('inline-flex items-center gap-1 text-[9px]', claimStatus === 'me' ? 'text-green-600' : 'text-red-500')}>
            <span className={cn('w-1.5 h-1.5 rounded-full', claimStatus === 'me' ? 'bg-green-500' : 'bg-red-500')} />
            {claimStatus === 'me' ? 'Claimed' : 'Not me'}
          </span>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center border-t border-border/15 divide-x divide-border/15">
        {profileUrl && (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] text-muted-foreground hover:text-primary hover:bg-muted/10 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            Visit profile
          </a>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
        >
          <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', isSelected && 'rotate-180')} />
          {isSelected ? 'Collapse' : 'Details'}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onFocus(); }}
          className={cn(
            'flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] transition-colors',
            isFocused ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
          )}
        >
          <Crosshair className="w-3 h-3" />
          Focus
        </button>
      </div>

      {/* Expandable Detail Panel */}
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isSelected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border/10 bg-muted/5">
            <PlatformExpandedDetail
              result={result}
              lensScore={lensScore}
              isLocked={isDetailLocked}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
