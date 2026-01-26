/**
 * NarrativeBucketCard Component
 * 
 * Compact bucket card showing count, 1 example, and "+ N more (locked)"
 * for the narrative-first Free results page.
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

const BUCKET_CONFIG: Record<BucketType, { icon: typeof Globe; color: string; description: string }> = {
  PublicProfiles: { 
    icon: Globe, 
    color: 'text-blue-600 dark:text-blue-400',
    description: 'Accounts discovered on public platforms'
  },
  ExposureSignals: { 
    icon: AlertTriangle, 
    color: 'text-destructive',
    description: 'Data breach and leak exposures'
  },
  ReuseIndicators: { 
    icon: Link2, 
    color: 'text-amber-600 dark:text-amber-400',
    description: 'Credential reuse patterns detected'
  },
  Connections: { 
    icon: Users, 
    color: 'text-purple-600 dark:text-purple-400',
    description: 'Cross-platform identity links'
  },
};

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
  const exampleItem = bucket.items[0];
  const hiddenCount = bucket.hiddenCount;

  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-md', className)}>
      <CardContent className="p-3">
        {/* Header: Icon + Label + Count */}
        <div className="flex items-center gap-2 mb-2">
          <div className={cn('p-1.5 rounded-lg bg-muted/50', config.color)}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-medium truncate">{bucket.label}</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                {bucket.totalCount}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {config.description}
            </p>
          </div>
        </div>

        {/* Example item preview */}
        {exampleItem && (
          <div className="pl-7 mb-2">
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-border/30">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {exampleItem.platform}
                </p>
                {exampleItem.evidence && (
                  <p className={cn(
                    'text-[10px] text-muted-foreground truncate mt-0.5',
                    exampleItem.isRedacted && 'blur-[2px]'
                  )}>
                    {exampleItem.evidence}
                  </p>
                )}
              </div>
              {isFullAccess && exampleItem.confidence > 0 && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-[9px] px-1.5 h-4 shrink-0',
                    exampleItem.confidence >= 75 
                      ? 'text-green-600 dark:text-green-400 border-green-500/30'
                      : 'text-muted-foreground border-border'
                  )}
                >
                  {exampleItem.confidence}%
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Locked items CTA */}
        {hiddenCount > 0 && !isFullAccess && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-[10px] text-muted-foreground hover:text-primary group pl-7"
            onClick={onUpgradeClick}
          >
            <Lock className="h-2.5 w-2.5 mr-1 group-hover:text-primary" />
            + {hiddenCount} more {hiddenCount === 1 ? 'source' : 'sources'} (Pro)
            <ChevronRight className="h-2.5 w-2.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        )}

        {/* Pro: View all link */}
        {isFullAccess && bucket.items.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-[10px] text-muted-foreground hover:text-primary pl-7"
            onClick={onUpgradeClick}
          >
            View all {bucket.totalCount} {bucket.label.toLowerCase()}
            <ChevronRight className="h-2.5 w-2.5 ml-auto" />
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
    <Card className="p-6 text-center">
      <Globe className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
      <h3 className="text-sm font-medium text-foreground mb-1">
        No signals detected
      </h3>
      <p className="text-xs text-muted-foreground">
        We didn't find any public exposure for this identifier. 
        This could mean a minimal digital footprint.
      </p>
    </Card>
  );
}
