/**
 * NarrativeBucketCard Component
 * 
 * Human-readable category card showing:
 * - Count
 * - One example sentence
 * - Locked indicator: "+ N more (Pro)"
 * 
 * Used in the narrative-first Free results page.
 * Does NOT show provider names anywhere.
 */

import { Lock, ChevronRight, Globe, AlertTriangle, Link2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type ViewModelBucket, type BucketType } from '@/lib/results/resultsViewModel';

interface NarrativeBucketCardProps {
  bucket: ViewModelBucket;
  isFullAccess: boolean;
  onUpgradeClick?: () => void;
  className?: string;
}

const BUCKET_CONFIG: Record<BucketType, { 
  icon: typeof Globe; 
  color: string; 
  bgColor: string;
  description: string;
  examplePrefix: string;
}> = {
  PublicProfiles: { 
    icon: Globe, 
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    description: 'Accounts discovered on public platforms',
    examplePrefix: 'Found on',
  },
  ExposureSignals: { 
    icon: AlertTriangle, 
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    description: 'Data breach and leak exposures',
    examplePrefix: 'Exposed in',
  },
  ReuseIndicators: { 
    icon: Link2, 
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    description: 'Credential reuse patterns detected',
    examplePrefix: 'Pattern found on',
  },
  Connections: { 
    icon: Users, 
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    description: 'Cross-platform identity links',
    examplePrefix: 'Linked to',
  },
};

function getExampleSentence(bucket: ViewModelBucket, config: typeof BUCKET_CONFIG[BucketType]): string {
  const firstItem = bucket.items[0];
  if (!firstItem) return 'No examples available';
  
  // Generate human-readable example without exposing provider
  const platform = firstItem.platform || 'a platform';
  return `${config.examplePrefix} ${platform}`;
}

export function NarrativeBucketCard({
  bucket,
  isFullAccess,
  onUpgradeClick,
  className,
}: NarrativeBucketCardProps) {
  if (bucket.totalCount === 0) {
    return null;
  }

  const config = BUCKET_CONFIG[bucket.type];
  const Icon = config.icon;
  const hiddenCount = bucket.hiddenCount;
  const exampleSentence = getExampleSentence(bucket, config);

  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-md border-border/50', className)}>
      <CardContent className="p-4">
        {/* Header: Icon + Label + Count */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn('p-2 rounded-lg shrink-0', config.bgColor)}>
            <Icon className={cn('h-4 w-4', config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{bucket.label}</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                {bucket.totalCount}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {config.description}
            </p>
          </div>
        </div>

        {/* Example sentence */}
        <div className="pl-11 mb-3">
          <p className="text-xs text-foreground">
            {exampleSentence}
          </p>
        </div>

        {/* Locked items indicator for Free users */}
        {hiddenCount > 0 && !isFullAccess && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground hover:text-primary group justify-start pl-11"
            onClick={onUpgradeClick}
          >
            <Lock className="h-3 w-3 mr-1.5 group-hover:text-primary" />
            + {hiddenCount} more (Pro)
            <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        )}

        {/* Pro: View all link */}
        {isFullAccess && bucket.items.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground hover:text-primary justify-start pl-11"
            onClick={onUpgradeClick}
          >
            View all {bucket.totalCount} {bucket.label.toLowerCase()}
            <ChevronRight className="h-3 w-3 ml-auto" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Empty state for when no buckets have data
 */
export function NarrativeBucketEmptyState() {
  return (
    <Card className="p-8 text-center border-border/50">
      <Globe className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
      <h3 className="text-base font-medium text-foreground mb-2">
        No signals detected
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        We didn't find any public exposure for this identifier. 
        This could mean a minimal digital footprint.
      </p>
    </Card>
  );
}
