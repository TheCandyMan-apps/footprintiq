/**
 * RedactedBucketView Component
 * 
 * Displays a bucket of findings with appropriate redaction for Free users.
 * Shows limited items with an upgrade prompt for hidden content.
 */

import { Lock, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type ViewModelBucket, type ViewModelFinding } from '@/lib/results/resultsViewModel';

interface RedactedBucketViewProps {
  bucket: ViewModelBucket;
  isFullAccess: boolean;
  onUpgradeClick?: () => void;
  onItemClick?: (finding: ViewModelFinding) => void;
  className?: string;
}

export function RedactedBucketView({
  bucket,
  isFullAccess,
  onUpgradeClick,
  onItemClick,
  className,
}: RedactedBucketViewProps) {
  if (bucket.totalCount === 0) {
    return null;
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="py-2 px-3 border-b border-border/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5">
            {bucket.label}
            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
              {bucket.totalCount}
            </Badge>
          </CardTitle>
          {!isFullAccess && bucket.hiddenCount > 0 && (
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Lock className="h-2.5 w-2.5" />
              <span>{bucket.hiddenCount} hidden</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Visible items */}
        <div className="divide-y divide-border/10">
          {bucket.items.map((finding, index) => (
            <FindingRow
              key={finding.id}
              finding={finding}
              isFullAccess={isFullAccess}
              onClick={() => onItemClick?.(finding)}
              showConfidence={isFullAccess || index === 0}
            />
          ))}
        </div>
        
        {/* Upgrade prompt for hidden items */}
        {bucket.upgradePrompt && (
          <div className="p-2 bg-muted/30 border-t border-border/20">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-[10px] text-muted-foreground hover:text-foreground"
              onClick={onUpgradeClick}
            >
              <Lock className="h-2.5 w-2.5 mr-1" />
              {bucket.upgradePrompt}
              <ChevronRight className="h-2.5 w-2.5 ml-auto" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FindingRowProps {
  finding: ViewModelFinding;
  isFullAccess: boolean;
  showConfidence: boolean;
  onClick?: () => void;
}

function FindingRow({ finding, isFullAccess, showConfidence, onClick }: FindingRowProps) {
  const confidenceColor = finding.confidence >= 75 
    ? 'text-green-600 dark:text-green-400'
    : finding.confidence >= 50 
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-muted-foreground';

  return (
    <div
      className={cn(
        'p-2 hover:bg-muted/30 transition-colors cursor-pointer',
        finding.isRedacted && 'opacity-70'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[11px] font-medium truncate">
            {finding.platform}
          </span>
          {finding.isRedacted && (
            <EyeOff className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
          )}
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          {showConfidence ? (
            <span className={cn('text-[9px] font-medium', confidenceColor)}>
              {finding.confidence}%
            </span>
          ) : (
            <span className="text-[9px] text-muted-foreground/50">
              Pro
            </span>
          )}
          <Badge 
            variant={finding.status === 'found' ? 'default' : 'secondary'} 
            className="text-[8px] px-1 py-0 h-3.5"
          >
            {finding.status}
          </Badge>
        </div>
      </div>
      
      {finding.evidence && (
        <p className={cn(
          'text-[9px] text-muted-foreground mt-0.5 truncate',
          finding.isRedacted && 'blur-[2px]'
        )}>
          {finding.evidence}
        </p>
      )}
      
      {finding.url && !finding.isRedacted && (
        <a
          href={finding.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] text-primary/70 hover:text-primary mt-0.5 block truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {finding.url}
        </a>
      )}
    </div>
  );
}
