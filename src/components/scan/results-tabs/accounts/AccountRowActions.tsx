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
      <div className="flex items-center gap-0.5 shrink-0">
        {/* LENS Status Badge (if verified) */}
        {verificationResult && (
          <LensStatusBadge 
            status={null}
            score={verificationResult.confidenceScore}
            compact
            className="mr-1"
          />
        )}

        {/* Focus Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isFocused ? 'secondary' : 'ghost'}
              size="icon"
              className={cn(
                'h-7 w-7',
                isFocused && 'ring-2 ring-primary ring-offset-1'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onFocus();
              }}
            >
              <Crosshair className={cn(
                'w-3.5 h-3.5',
                isFocused && 'text-primary'
              )} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{isFocused ? 'Unfocus entity' : 'Focus this entity'}</p>
          </TooltipContent>
        </Tooltip>

        {/* LENS Verify Button */}
        {url && !verificationResult && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVerify();
                }}
                disabled={isVerifyingNow}
              >
                {isVerifyingNow ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">LENS Verify</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Claim Toggle */}
        <div className="flex items-center border rounded-md overflow-hidden mx-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={claimStatus === 'me' ? 'default' : 'ghost'}
                size="icon"
                className={cn(
                  'h-7 w-7 rounded-none',
                  claimStatus === 'me' && 'bg-green-600 hover:bg-green-700'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClaimToggle('me');
                }}
                disabled={isClaimLoading}
              >
                {isClaimLoading && claimStatus !== 'me' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <UserCheck className="w-3 h-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">This is me</p>
            </TooltipContent>
          </Tooltip>
          
          <div className="w-px h-4 bg-border" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={claimStatus === 'not_me' ? 'default' : 'ghost'}
                size="icon"
                className={cn(
                  'h-7 w-7 rounded-none',
                  claimStatus === 'not_me' && 'bg-red-600 hover:bg-red-700'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClaimToggle('not_me');
                }}
                disabled={isClaimLoading}
              >
                {isClaimLoading && claimStatus !== 'not_me' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <UserX className="w-3 h-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Not me</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Open Link */}
        {url && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Open profile</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Expand */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
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
