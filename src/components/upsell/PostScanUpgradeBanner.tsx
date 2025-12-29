import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTierGating } from '@/hooks/useTierGating';

interface PostScanUpgradeBannerProps {
  totalFindings: number;
  highRiskCount: number;
}

/**
 * Inline banner shown after first scan completes for free users.
 * Non-intrusive, dismissible, positioned after results summary.
 */
export function PostScanUpgradeBanner({ totalFindings, highRiskCount }: PostScanUpgradeBannerProps) {
  const navigate = useNavigate();
  const { isFree, isLoading } = useTierGating();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || !isFree || dismissed) {
    return null;
  }

  const message = highRiskCount > 0
    ? `We found ${highRiskCount} high-risk exposures. Unlock full details to understand why.`
    : totalFindings > 0
    ? `We found ${totalFindings} data points. See the full context with Pro.`
    : 'Unlock full exposure details and reduce false positives with Pro.';

  return (
    <Card className="relative p-4 mb-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-4 pr-6">
        <div className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 flex-shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Unlock full exposure details</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {message}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/pricing')}
          className="flex-shrink-0"
        >
          <TrendingUp className="h-4 w-4 mr-1.5" />
          Upgrade
        </Button>
      </div>

      {/* Subtle microcopy */}
      <p className="text-[10px] text-muted-foreground/60 mt-3 text-center">
        Pro users see source URLs, evidence details, and correlation insights.
      </p>
    </Card>
  );
}
