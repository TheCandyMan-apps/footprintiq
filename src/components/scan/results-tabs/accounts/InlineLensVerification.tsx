/**
 * InlineLensVerification Component
 * 
 * Provides inline LENS verification for Free users directly on AccountRow results.
 * - Shows "Eligible for LENS verification" on eligible results
 * - Allows ONE verification per user (lifetime)
 * - After verification, shows inline result
 * - Locks further verification with upgrade prompt
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Lock, 
  Loader2,
  CheckCircle,
  HelpCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { useLensPreview, LensConfidenceLevel, LensPreviewResult } from '@/hooks/useLensPreview';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface InlineLensVerificationProps {
  profileId: string;
  platform: string;
  username?: string;
  url?: string | null;
  scanId: string;
  /** Whether this profile is eligible for LENS verification */
  isEligible: boolean;
  /** Index of the result (used for determining eligibility) */
  resultIndex: number;
}

const CONFIDENCE_CONFIG: Record<LensConfidenceLevel, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeVariant: 'default' | 'secondary' | 'outline';
  className: string;
}> = {
  likely: {
    label: 'Likely match',
    icon: CheckCircle,
    badgeVariant: 'default',
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
  },
  unclear: {
    label: 'Unclear',
    icon: HelpCircle,
    badgeVariant: 'secondary',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  unlikely: {
    label: 'Unlikely match',
    icon: XCircle,
    badgeVariant: 'outline',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export function InlineLensVerification({
  profileId,
  platform,
  username,
  url,
  scanId,
  isEligible,
  resultIndex,
}: InlineLensVerificationProps) {
  const navigate = useNavigate();
  const { 
    hasUsedPreview, 
    isLoading, 
    isVerifying, 
    previewResult, 
    verifyProfile,
    verifiedProfileId 
  } = useLensPreview();
  
  const [localVerifying, setLocalVerifying] = useState(false);
  const [localResult, setLocalResult] = useState<LensPreviewResult | null>(null);

  // Check if THIS specific profile was verified
  const isThisProfileVerified = verifiedProfileId === profileId || localResult !== null;
  const resultToShow = localResult || (isThisProfileVerified ? previewResult : null);

  const handleVerify = async () => {
    setLocalVerifying(true);
    try {
      const result = await verifyProfile({
        id: profileId,
        platform,
        username,
        url,
        scanId,
      });
      if (result) {
        setLocalResult(result);
      }
    } finally {
      setLocalVerifying(false);
    }
  };

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/pricing');
  };

  // Loading initial state
  if (isLoading) {
    return null;
  }

  // If THIS profile was verified, show the inline result
  if (isThisProfileVerified && resultToShow) {
    const config = CONFIDENCE_CONFIG[resultToShow.confidenceLevel];
    const Icon = config.icon;
    
    return (
      <div className="mt-2 pt-2 border-t border-border/30">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant={config.badgeVariant}
            className={cn("gap-1 text-[10px] h-5", config.className)}
          >
            <Icon className="h-3 w-3" />
            LENS: {config.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {resultToShow.explanation.slice(0, 80)}{resultToShow.explanation.length > 80 ? '...' : ''}
          </span>
        </div>
      </div>
    );
  }

  // If user has already used their preview on ANOTHER profile
  if (hasUsedPreview && !isThisProfileVerified) {
    // Only show lock on eligible profiles
    if (!isEligible) return null;
    
    return (
      <div className="mt-2 pt-2 border-t border-border/30">
        <button
          onClick={handleUpgradeClick}
          className="flex items-center gap-2 text-[10px] text-muted-foreground hover:text-primary transition-colors group"
        >
          <Lock className="h-3 w-3" />
          <span>Upgrade to verify all findings with LENS</span>
          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    );
  }

  // Verifying this profile
  if (localVerifying || (isVerifying && !localResult)) {
    return (
      <div className="mt-2 pt-2 border-t border-border/30">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span>Verifying with LENS...</span>
        </div>
      </div>
    );
  }

  // Show "Eligible" badge with verify button for eligible profiles
  if (isEligible) {
    return (
      <div className="mt-2 pt-2 border-t border-border/30">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className="gap-1 text-[10px] h-5 bg-primary/5 text-primary border-primary/30"
          >
            <Sparkles className="h-3 w-3" />
            Eligible for LENS verification
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-2 text-[10px] text-primary hover:text-primary gap-1"
            onClick={(e) => {
              e.stopPropagation();
              handleVerify();
            }}
          >
            Verify (free preview)
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-[9px] text-muted-foreground/60 mt-1">
          One-time free verification • Powered by LENS
        </p>
      </div>
    );
  }

  // Not eligible, don't show anything
  return null;
}

/**
 * Determines which result indices are eligible for LENS verification
 * Returns indices [1, 4, 7] for variety (not just the first one)
 */
export function getLensEligibleIndices(totalResults: number): number[] {
  if (totalResults === 0) return [];
  if (totalResults === 1) return [0];
  if (totalResults <= 3) return [0, 1];
  // For larger result sets, mark 3 results as eligible
  return [1, 4, 7].filter(i => i < totalResults);
}
