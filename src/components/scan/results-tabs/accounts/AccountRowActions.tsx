import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Crosshair, ExternalLink, ChevronRight, 
  UserCheck, UserX, Loader2, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForensicVerification, LensVerificationResult } from '@/hooks/useForensicVerification';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RESULTS_ACTION_CLUSTER } from '../styles';

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
      <div className={RESULTS_ACTION_CLUSTER.container}>
        {/* Open Link */}
        {url && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={RESULTS_ACTION_CLUSTER.button}
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-[10px]">Open</TooltipContent>
          </Tooltip>
        )}

        {/* Focus Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                RESULTS_ACTION_CLUSTER.button,
                isFocused && RESULTS_ACTION_CLUSTER.buttonActive
              )}
              onClick={(e) => {
                e.stopPropagation();
                onFocus();
              }}
            >
              <Crosshair className="w-2.5 h-2.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-[10px]">{isFocused ? 'Clear' : 'Focus'}</TooltipContent>
        </Tooltip>

        {/* LENS Verify Button */}
        {url && !verificationResult && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={RESULTS_ACTION_CLUSTER.button}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVerify();
                }}
                disabled={isVerifyingNow}
              >
                {isVerifyingNow ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <Sparkles className="w-2.5 h-2.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-[10px]">Verify</TooltipContent>
          </Tooltip>
        )}

        {/* Claim Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                RESULTS_ACTION_CLUSTER.button,
                claimStatus === 'me' && 'bg-green-500/15 text-green-600',
                claimStatus === 'not_me' && 'bg-red-500/15 text-red-600'
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (!claimStatus) handleClaimToggle('me');
                else if (claimStatus === 'me') handleClaimToggle('not_me');
                else onClaimChange(null);
              }}
              disabled={isClaimLoading}
            >
              {isClaimLoading ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
              ) : claimStatus === 'not_me' ? (
                <UserX className="w-2.5 h-2.5" />
              ) : (
                <UserCheck className="w-2.5 h-2.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-[10px]">
            {!claimStatus && 'Claim'}
            {claimStatus === 'me' && 'Yours'}
            {claimStatus === 'not_me' && 'Not you'}
          </TooltipContent>
        </Tooltip>

        {/* Expand */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={RESULTS_ACTION_CLUSTER.button}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
            >
              <ChevronRight className={cn(
                'w-2.5 h-2.5 transition-transform duration-100',
                isExpanded && 'rotate-90'
              )} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-[10px]">{isExpanded ? 'Less' : 'More'}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
