/**
 * ConnectionsPreviewOverlay Component
 * 
 * Overlay for connections graph showing locked/blurred nodes for Free users.
 */

import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type ConnectionsViewModel } from '@/lib/results/resultsViewModel';

interface ConnectionsPreviewOverlayProps {
  connections: ConnectionsViewModel;
  isFullAccess: boolean;
  onUpgradeClick?: () => void;
  className?: string;
}

export function ConnectionsPreviewOverlay({
  connections,
  isFullAccess,
  onUpgradeClick,
  className,
}: ConnectionsPreviewOverlayProps) {
  if (isFullAccess || !connections.isPartiallyLocked) {
    return null;
  }

  const lockedCount = connections.totalNodes - connections.maxVisibleNodes;

  return (
    <div className={cn(
      'absolute inset-0 pointer-events-none z-10',
      className
    )}>
      {/* Gradient overlay on locked areas */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
      
      {/* Upgrade CTA */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg max-w-xs text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">
              {lockedCount} more connections
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2">
            Unlock the full identity graph to see all connections and relationships.
          </p>
          <Button
            size="sm"
            className="h-7 text-[10px] gap-1"
            onClick={onUpgradeClick}
          >
            <Sparkles className="h-3 w-3" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to determine which nodes should be blurred in the connections graph
 */
export function useConnectionsBlur(
  nodeIds: string[],
  connections: ConnectionsViewModel,
  isFullAccess: boolean
): Set<string> {
  if (isFullAccess) {
    return new Set();
  }

  const blurredSet = new Set<string>();
  const visibleSet = new Set(
    connections.visibleNodes
      .filter(n => !n.isLocked)
      .map(n => n.id)
  );

  nodeIds.forEach(id => {
    if (!visibleSet.has(id)) {
      blurredSet.add(id);
    }
  });

  return blurredSet;
}
