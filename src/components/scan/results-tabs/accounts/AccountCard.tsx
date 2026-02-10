import { useMemo, useState } from 'react';
import { ProfileThumbnail } from './ProfileThumbnail';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, HelpCircle, AlertCircle, ExternalLink, Crosshair } from 'lucide-react';
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
} from '@/lib/results/extractors';

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
}

const getMatchConfidence = (score: number) => {
  if (score >= 80) return { label: 'High Confidence', shortLabel: 'High', tooltip: 'Strong match — username, profile data, and platform all align.', ...RESULTS_SEMANTIC_COLORS.confidenceHigh, icon: CheckCircle };
  if (score >= 60) return { label: 'Moderate', shortLabel: 'Med', tooltip: 'Partial match — some signals align but others could not be confirmed.', ...RESULTS_SEMANTIC_COLORS.confidenceMedium, icon: HelpCircle };
  return { label: 'Needs Review', shortLabel: 'Low', tooltip: 'Weak match — limited public data available. Manual review recommended.', ...RESULTS_SEMANTIC_COLORS.confidenceLow, icon: AlertCircle };
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
}: AccountCardProps) {
  const meta = useMemo(() => (result.meta || result.metadata || {}) as Record<string, any>, [result]);
  const platformName = useMemo(() => extractPlatformName(result), [result]);
  const profileUrl = useMemo(() => extractUrl(result), [result]);
  const username = useMemo(() => extractUsername(result), [result]);
  const bio = useMemo(() => extractBioText(result), [result]);
  const profileImage = meta.avatar_cached || meta.avatar_url || meta.avatar || meta.profile_image || meta.image || meta.pfp_image;
  const confidence = getMatchConfidence(lensScore);
  const ConfidenceIcon = confidence.icon;

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
        <p className="text-[9px] text-muted-foreground/50 leading-snug line-clamp-2 italic mt-0.5">
          {generateRiskContext(result, lensScore).split('. ')[0]}.
        </p>
      </div>

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
    </div>
  );
}
