import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Crosshair, ExternalLink, ChevronRight, 
  UserCheck, UserX, Loader2, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForensicVerification, LensVerificationResult } from '@/hooks/useForensicVerification';
import { LensStatusBadge } from './LensStatusBadge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ClaimType = 'me' | 'not_me';

interface AccountRowActionsProps {
  findingId: string;
  url: string | null;
  platform: string;
  scanId: string;
  isFocused: boolean;
  onFocus: () => void;
  verificationResult: LensVerificationResult | null;
  onVerificationComplete: (result: LensVerificationResult) => void;
  claimStatus: ClaimType | null;
  onClaimChange: (claim: ClaimType | null) => void;
  isClaimLoading?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function AccountRowActions({
  findingId,
  url,
  platform,
  scanId,
  isFocused,
  onFocus,
  verificationResult,
  onVerificationComplete,
  claimStatus,
  onClaimChange,
  isClaimLoading = false,
  isExpanded,
  onToggleExpand,
}: AccountRowActionsProps) {
  const { verify, isVerifying } = useForensicVerification();
  const [localVerifying, setLocalVerifying] = useState(false);

  const handleVerify = async () => {
    if (!url || isVerifying || localVerifying) return;
    
    setLocalVerifying(true);
    const result = await verify({ url, platform, scanId, findingId });
    if (result) {
      onVerificationComplete(result);
    }
    setLocalVerifying(false);
  };

  const handleClaimToggle = (claim: ClaimType) => {
    if (claimStatus === claim) {
      onClaimChange(null);
    } else {
      onClaimChange(claim);
    }
  };

  const isVerifyingNow = isVerifying || localVerifying;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 shrink-0">
        {/* Open Link */}
        {url && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Open profile</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Focus Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                isFocused 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onFocus();
              }}
            >
              <Crosshair className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{isFocused ? 'Unfocus' : 'Focus'}</p>
          </TooltipContent>
        </Tooltip>

        {/* LENS Verify Button */}
        {url && !verificationResult && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVerify();
                }}
                disabled={isVerifyingNow}
              >
                {isVerifyingNow ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">LENS Verify</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Claim Toggle - Simplified */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                claimStatus === 'me' && 'bg-green-500/10 text-green-600',
                claimStatus === 'not_me' && 'bg-red-500/10 text-red-600',
                !claimStatus && 'text-muted-foreground hover:text-foreground'
              )}
              onClick={(e) => {
                e.stopPropagation();
                // Cycle: null -> me -> not_me -> null
                if (!claimStatus) handleClaimToggle('me');
                else if (claimStatus === 'me') handleClaimToggle('not_me');
                else onClaimChange(null);
              }}
              disabled={isClaimLoading}
            >
              {isClaimLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : claimStatus === 'not_me' ? (
                <UserX className="w-4 h-4" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {!claimStatus && 'Mark as yours'}
              {claimStatus === 'me' && 'Claimed as you'}
              {claimStatus === 'not_me' && 'Marked as not you'}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Expand */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          <ChevronRight className={cn(
            'w-4 h-4 transition-transform',
            isExpanded && 'rotate-90'
          )} />
        </Button>
      </div>
    </TooltipProvider>
  );
}
