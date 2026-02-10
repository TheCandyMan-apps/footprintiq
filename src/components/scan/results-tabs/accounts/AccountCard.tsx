import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, HelpCircle, AlertCircle, ExternalLink, Crosshair } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { cn } from '@/lib/utils';
import { RESULTS_SEMANTIC_COLORS } from '../styles';
import { LensStatusBadge } from './LensStatusBadge';
import { PlatformIconBadge } from '@/components/ui/PlatformIcon';
import {
  extractPlatformName,
  extractUrl,
  extractUsername,
  extractBioText,
  getInitials,
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
  if (score >= 80) return { label: 'High Confidence', shortLabel: 'High', ...RESULTS_SEMANTIC_COLORS.confidenceHigh, icon: CheckCircle };
  if (score >= 60) return { label: 'Moderate', shortLabel: 'Med', ...RESULTS_SEMANTIC_COLORS.confidenceMedium, icon: HelpCircle };
  return { label: 'Needs Review', shortLabel: 'Low', ...RESULTS_SEMANTIC_COLORS.confidenceLow, icon: AlertCircle };
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
        'rounded-lg border bg-card overflow-hidden transition-all duration-100 cursor-pointer',
        'hover:shadow-sm hover:border-border/60',
        isSelected && 'ring-1 ring-primary border-primary/40',
        isFocused && !isSelected && 'ring-1 ring-primary/50 border-primary/30',
        !isFocused && !isSelected && 'border-border/30'
      )}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(); }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
    >
      {/* Header: icon + platform + confidence */}
      <div className="flex items-center gap-2 px-2.5 pt-2 pb-1">
        <div className="relative shrink-0">
          <PlatformIconBadge platform={platformName} url={profileUrl} size="md" position="top-left" />
          <div className="w-8 h-8 rounded overflow-hidden bg-muted/20 border border-border/30 ml-0.5 mt-0.5">
            {profileImage ? (
              <img
                src={profileImage}
                alt={`${platformName} profile photo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={cn('absolute inset-0 flex items-center justify-center bg-primary/4', profileImage ? 'hidden' : 'flex')}>
              <span className="text-[10px] font-semibold text-primary/40">{getInitials(username || platformName)}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[12px] text-foreground truncate leading-none">{platformName}</p>
          {username && <p className="text-[10px] text-muted-foreground/70 truncate leading-tight">@{username}</p>}
        </div>

        <Badge
          variant="outline"
          className={cn('h-5 px-1.5 gap-0.5 text-[9px] font-medium shrink-0', confidence.bg, confidence.text, confidence.border)}
        >
          <ConfidenceIcon className="w-2.5 h-2.5" />
          {confidence.shortLabel}
        </Badge>
      </div>

      {/* Bio */}
      <div className="px-2.5 pb-1">
        {bio ? (
          <p className="text-[10px] text-muted-foreground/70 leading-snug line-clamp-2">{bio}</p>
        ) : profileUrl ? (
          <p className="text-[10px] text-muted-foreground/40 truncate leading-snug">
            {(() => { try { return new URL(profileUrl).hostname.replace('www.', ''); } catch { return ''; } })()}
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground/30 leading-snug italic">No bio available</p>
        )}
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
            Open
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
