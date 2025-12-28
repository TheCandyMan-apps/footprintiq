import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, TrendingUp, Clock, Link2, Shield, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResultsGating } from './GatedContent';
import { cn } from '@/lib/utils';

export type InsightType = 'timeline' | 'correlation' | 'confidence' | 'context';

interface LockedInsightBlockProps {
  type: InsightType;
  className?: string;
}

const INSIGHT_CONFIG: Record<InsightType, {
  icon: React.ReactNode;
  title: string;
  description: string;
  why: string;
}> = {
  timeline: {
    icon: <Clock className="h-5 w-5" />,
    title: 'Exposure Timeline',
    description: 'This data appears across multiple sources over time.',
    why: 'Upgrade to see when and where.',
  },
  correlation: {
    icon: <Link2 className="h-5 w-5" />,
    title: 'Correlation Detected',
    description: 'Identifiers may be linked across platforms.',
    why: 'Unlock Pro to review correlations.',
  },
  confidence: {
    icon: <Shield className="h-5 w-5" />,
    title: 'Confidence & Validation',
    description: 'This finding has supporting context.',
    why: 'Upgrade to reduce false positives.',
  },
  context: {
    icon: <Search className="h-5 w-5" />,
    title: 'Contextual Enrichment',
    description: 'Public page context available.',
    why: 'Upgrade to fetch and review.',
  },
};

/**
 * LockedInsightBlock - Shows a locked insight preview for Free users
 * with a soft upgrade CTA. Designed to be embedded inline within scan results.
 */
export function LockedInsightBlock({ type, className }: LockedInsightBlockProps) {
  const navigate = useNavigate();
  const { isFree, isLoading } = useResultsGating();
  
  // Don't render for Pro/Business users
  if (!isFree && !isLoading) {
    return null;
  }

  const config = INSIGHT_CONFIG[type];

  return (
    <Card className={cn(
      'relative overflow-hidden border-dashed border-border/60',
      className
    )}>
      {/* Blurred preview background */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="h-full w-full bg-gradient-to-br from-muted/30 via-muted/20 to-transparent">
          {/* Faux data lines */}
          <div className="p-4 space-y-2 blur-[3px] opacity-40">
            <div className="h-3 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
            <div className="h-3 w-2/3 bg-muted rounded" />
            <div className="flex gap-2 mt-3">
              <div className="h-6 w-16 bg-primary/20 rounded" />
              <div className="h-6 w-20 bg-accent/20 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 p-4 flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 p-2.5 rounded-lg bg-primary/10 text-primary">
          {config.icon}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm text-foreground">
              {config.title}
            </h4>
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {config.description}
          </p>
          <p className="text-xs text-muted-foreground/80 italic">
            {config.why}
          </p>
        </div>

        {/* Upgrade CTA */}
        <div className="flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/settings/billing')}
            className="gap-1.5 text-xs"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Upgrade
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * LockedInsightsGrid - Shows all locked insights in a grid layout
 * Useful for scan detail views to show what Pro unlocks.
 */
export function LockedInsightsGrid({ className }: { className?: string }) {
  const { isFree, isLoading } = useResultsGating();
  
  if (!isFree && !isLoading) {
    return null;
  }

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      <LockedInsightBlock type="timeline" />
      <LockedInsightBlock type="correlation" />
      <LockedInsightBlock type="confidence" />
      <LockedInsightBlock type="context" />
    </div>
  );
}
