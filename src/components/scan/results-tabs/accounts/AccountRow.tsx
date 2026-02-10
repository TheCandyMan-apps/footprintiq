import { Fragment, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, HelpCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { cn } from '@/lib/utils';
import { RESULTS_SEMANTIC_COLORS } from '../styles';
import { AccountRowActions } from './AccountRowActions';
import { LensStatusBadge } from './LensStatusBadge';
import { PlatformIconBadge } from '@/components/ui/PlatformIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ConfidenceTooltipContent } from './ConfidenceBreakdown';
import {
  extractPlatformName,
  extractUrl,
  extractUsername,
  extractBio,
  getInitials,
} from '@/lib/results/extractors';

type ClaimType = 'me' | 'not_me';

interface AccountRowProps {
  result: ScanResult;
  jobId: string;
  lensScore: number;
  isFocused: boolean;
  isSelected: boolean;
  verificationResult: LensVerificationResult | null;
  claimStatus: ClaimType | null;
  isClaimLoading: boolean;
  onFocus: () => void;
  onSelect: () => void;
  onVerificationComplete: (result: LensVerificationResult) => void;
  onClaimChange: (claim: ClaimType | null) => void;
}

const getMatchConfidence = (score: number) => {
  if (score >= 80) return { 
    label: 'High Confidence', 
    shortLabel: 'High',
    tooltip: 'Strong match — username, profile data, and platform all align.',
    ...RESULTS_SEMANTIC_COLORS.confidenceHigh,
    icon: CheckCircle 
  };
  if (score >= 60) return { 
    label: 'Moderate', 
    shortLabel: 'Med',
    tooltip: 'Partial match — some signals align but others could not be confirmed.',
    ...RESULTS_SEMANTIC_COLORS.confidenceMedium,
    icon: HelpCircle 
  };
  return { 
    label: 'Needs Review', 
    shortLabel: 'Low',
    tooltip: 'Weak match — limited public data available. Manual review recommended.',
    ...RESULTS_SEMANTIC_COLORS.confidenceLow,
    icon: AlertCircle 
  };
};

export function AccountRow({
  result,
  jobId,
  lensScore,
  isFocused,
  isSelected,
  verificationResult,
  claimStatus,
  isClaimLoading,
  onFocus,
  onSelect,
  onVerificationComplete,
  onClaimChange,
}: AccountRowProps) {
  const meta = useMemo(() => (result.meta || result.metadata || {}) as Record<string, any>, [result]);
  const platformName = useMemo(() => extractPlatformName(result), [result]);
  const profileUrl = useMemo(() => extractUrl(result), [result]);
  const username = useMemo(() => extractUsername(result), [result]);
  const bio = useMemo(() => extractBio(result), [result]);
  const signalChips = useMemo(() => {
    const chips: { label: string; href?: string }[] = [];
    if (profileUrl) {
      try { chips.push({ label: new URL(profileUrl).hostname.replace('www.', '') }); } catch {}
    }
     if (meta.followers !== undefined) {
      const f = Number(meta.followers) >= 1000 ? `${(Number(meta.followers)/1000).toFixed(1)}K` : meta.followers;
      chips.push({ label: `${f} followers` });
    }
    if (meta.location && meta.location !== 'Unknown' && meta.location.toLowerCase() !== 'unknown') {
      chips.push({ label: meta.location });
    }
    if (meta.joined) chips.push({ label: `Joined ${meta.joined}` });
    if (meta.website) {
      chips.push({ label: String(meta.website).replace(/^https?:\/\//, '').slice(0, 30), href: String(meta.website) });
    }
    return chips.slice(0, 3);
  }, [profileUrl, meta]);
  const profileImage = meta.avatar_cached || meta.avatar_url || meta.avatar || meta.profile_image || meta.image || meta.pfp_image;
  const confidence = getMatchConfidence(lensScore);
  const ConfidenceIcon = confidence.icon;

  return (
    <div 
      className={cn(
        'flex items-center gap-2 px-2 py-1 min-h-[44px] border-l-2 transition-all duration-75 cursor-pointer group',
        'border-b border-border/15 last:border-b-0',
        !isFocused && !isSelected && 'border-l-transparent hover:border-l-primary/20 hover:bg-muted/8',
        isSelected && !isFocused && 'bg-muted/10 border-l-primary/40',
        isFocused && 'bg-primary/4 border-l-primary'
      )}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(); }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
    >
      {/* LEFT: Platform Icon + Profile Thumbnail */}
      <div className="relative shrink-0 w-12">
        <PlatformIconBadge platform={platformName} url={profileUrl} size="lg" position="top-left" />
        <div className="w-11 h-11 rounded overflow-hidden bg-muted/20 border border-border/30 relative ml-1 mt-1">
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
            <span className="text-[12px] font-semibold text-primary/40">{getInitials(username || platformName)}</span>
          </div>
        </div>
      </div>

      {/* CENTER: Platform + Username + Bio */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 leading-none mb-0.5">
          <span className="font-semibold text-[12px] text-foreground truncate">{platformName}</span>
          {username ? <span className="text-muted-foreground/70 text-[10px] truncate">@{username}</span> : <span className="text-muted-foreground/40 text-[10px] truncate italic">Username not publicly listed</span>}
          {claimStatus && (
            <span className={cn('w-1 h-1 rounded-full shrink-0', claimStatus === 'me' ? 'bg-green-500' : 'bg-red-500')} />
          )}
        </div>
        {signalChips.length > 0 && (
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60 leading-none">
            {signalChips.map((chip, i) => (
              <Fragment key={i}>
                {i > 0 && <span className="text-border">·</span>}
                {chip.href ? (
                  <a href={chip.href} target="_blank" rel="noopener noreferrer"
                     className="hover:text-primary truncate max-w-[120px]"
                     onClick={e => e.stopPropagation()}>{chip.label}</a>
                ) : (
                  <span className="truncate max-w-[120px]">{chip.label}</span>
                )}
              </Fragment>
            ))}
          </div>
        )}
        {bio ? (
          <p className="text-[10px] leading-snug truncate text-muted-foreground/70">{bio}</p>
        ) : profileUrl ? (
          <p className="text-[10px] leading-snug truncate text-muted-foreground/40">
            {(() => { try { return new URL(profileUrl).hostname.replace('www.', ''); } catch { return ''; } })()}
          </p>
        ) : null}
      </div>

      {/* RIGHT: Badges + Actions */}
      <div className="flex items-center gap-1.5 shrink-0 pl-1.5 border-l border-border/15">
        {/* Confidence Badge */}
        <Popover>
          <PopoverTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn('h-5 px-1.5 gap-0.5 text-[9px] font-medium cursor-pointer hover:opacity-80 transition-opacity', confidence.bg, confidence.text, confidence.border)}
              onClick={(e) => e.stopPropagation()}
            >
              <ConfidenceIcon className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">{confidence.shortLabel}</span>
              <Info className="w-2 h-2 opacity-50" />
            </Badge>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-auto p-2" onClick={(e) => e.stopPropagation()}>
            <ConfidenceTooltipContent score={lensScore} username={username} platformName={platformName} meta={meta} hasProfileImage={!!profileImage} />
          </PopoverContent>
        </Popover>

        {/* LENS Badge */}
        {verificationResult && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <LensStatusBadge status={null} score={verificationResult.confidenceScore} compact={false} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top"><p className="text-xs">View LENS verification breakdown</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Always-visible: Open link */}
        {profileUrl && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4.5 w-4.5 rounded text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors" asChild onClick={(e) => e.stopPropagation()}>
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-2.5 h-2.5" /></a>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-[10px]">Open</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Hover-reveal: Secondary actions */}
        <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <AccountRowActions
            findingId={result.id}
            url={profileUrl}
            platform={platformName}
            scanId={jobId}
            isFocused={isFocused}
            onFocus={onFocus}
            verificationResult={verificationResult}
            onVerificationComplete={onVerificationComplete}
            claimStatus={claimStatus}
            onClaimChange={onClaimChange}
            isClaimLoading={isClaimLoading}
          />
        </div>
      </div>
    </div>
  );
}
