import { Button } from '@/components/ui/button';
import { Lock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTierGating } from '@/hooks/useTierGating';
import { cn } from '@/lib/utils';

interface GatedContentProps {
  /** Content to show when user has access */
  children: React.ReactNode;
  /** Feature name for gating check */
  feature?: string;
  /** Alternative: directly specify if gated */
  isGated?: boolean;
  /** Type of content being gated (for messaging) */
  contentType?: 'url' | 'evidence' | 'timeline' | 'correlation' | 'confidence' | 'context' | 'export' | 'details';
  /** Show compact inline prompt vs card-style */
  compact?: boolean;
  /** Custom class name */
  className?: string;
  /** Fallback content to show blurred (optional preview) */
  fallback?: React.ReactNode;
}

const CONTENT_LABELS: Record<string, string> = {
  url: 'Source URLs',
  evidence: 'Evidence details',
  timeline: 'Timeline view',
  correlation: 'Correlation data',
  confidence: 'Confidence explanation',
  context: 'Context enrichment',
  export: 'Export options',
  details: 'Full details',
};

/** Educational microcopy for different content types */
const CONTENT_MICROCOPY: Record<string, string> = {
  url: 'Most people don\'t realise this information is publicly accessible.',
  evidence: 'Public data becomes risky when combined.',
  timeline: 'Patterns reveal more than individual data points.',
  correlation: 'Attackers rely on correlation, not hacking.',
  confidence: 'False positives happen — validation matters.',
  context: 'Context helps distinguish real matches from noise.',
  export: 'Documentation supports informed decision-making.',
  details: 'Understanding exposure is the first step to protection.',
};

/** CTA copy variations for different content types */
const CTA_COPY: Record<string, { primary: string; secondary: string }> = {
  url: { primary: 'See why this result exists', secondary: 'Unlock source URLs to verify findings' },
  evidence: { primary: 'Unlock full exposure details', secondary: 'View evidence to understand your risk' },
  timeline: { primary: 'See why this result exists', secondary: 'Track changes in your digital footprint' },
  correlation: { primary: 'Unlock full exposure details', secondary: 'See how your data connects' },
  confidence: { primary: 'Reduce false positives with Pro', secondary: 'Understand confidence scoring' },
  context: { primary: 'Reduce false positives with Pro', secondary: 'Fetch context to validate matches' },
  export: { primary: 'Unlock full exposure details', secondary: 'Export detailed reports' },
  details: { primary: 'See why this result exists', secondary: 'Get the full picture' },
};

/**
 * GatedContent - Wraps content that should be hidden/blurred for Free users.
 * Shows blurred placeholder with inline upgrade prompt.
 */
export function GatedContent({
  children,
  feature = 'results_depth',
  isGated,
  contentType = 'details',
  compact = false,
  className,
  fallback,
}: GatedContentProps) {
  const navigate = useNavigate();
  const { isFree, isLoading } = useTierGating();

  // Determine if content should be gated
  const shouldGate = isGated !== undefined ? isGated : isFree;

  // Loading state - show nothing or skeleton
  if (isLoading) {
    return (
      <div className={cn('animate-pulse bg-muted/50 rounded', className)}>
        {fallback || <div className="h-12" />}
      </div>
    );
  }

  // User has access - show content
  if (!shouldGate) {
    return <>{children}</>;
  }

  // Gated - show blurred placeholder with upgrade prompt
  const label = CONTENT_LABELS[contentType] || 'This content';

  if (compact) {
    return (
      <div className={cn('relative', className)}>
        {/* Blurred fallback content */}
        {fallback && (
          <div className="blur-sm select-none pointer-events-none opacity-60">
            {fallback}
          </div>
        )}
        
        {/* Overlay with upgrade prompt */}
        <div className={cn(
          'flex items-center gap-2 text-sm text-muted-foreground',
          fallback && 'absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[1px] rounded'
        )}>
          <Lock className="h-3.5 w-3.5" />
          <span>{label} require Pro</span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-primary"
            onClick={() => navigate('/settings/billing')}
          >
            Upgrade
          </Button>
        </div>
      </div>
    );
  }

  const microcopy = CONTENT_MICROCOPY[contentType] || CONTENT_MICROCOPY.details;
  const ctaCopy = CTA_COPY[contentType] || CTA_COPY.details;

  return (
    <div className={cn('relative', className)}>
      {/* Blurred fallback content */}
      {fallback && (
        <div className="blur-sm select-none pointer-events-none opacity-50">
          {fallback}
        </div>
      )}

      {/* Overlay card with upgrade prompt */}
      <div className={cn(
        'rounded-lg border border-border/50 bg-muted/30 p-4',
        fallback && 'absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-[2px]'
      )}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{ctaCopy.primary}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {ctaCopy.secondary}
            </p>
          </div>
          {/* Educational microcopy */}
          <p className="text-[10px] text-muted-foreground/70 italic max-w-[200px]">
            {microcopy}
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/pricing')}
            className="mt-1"
          >
            <TrendingUp className="h-4 w-4 mr-1.5" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if specific result depth features are gated
 */
export function useResultsGating() {
  const { isFree, isLoading } = useTierGating();

  return {
    isLoading,
    isFree,
    // Free users CAN see:
    canSeeTotalCount: true,
    canSeeCategorySummary: true,
    canSeeRiskScore: true,
    // Free users CANNOT see:
    canSeeSourceUrls: !isFree,
    canSeeEvidence: !isFree,
    canSeeTimeline: !isFree,
    canSeeCorrelation: !isFree,
    canSeeConfidenceExplanation: !isFree,
    canSeeContextEnrichment: !isFree,
    canExportDetails: !isFree,
  };
}
