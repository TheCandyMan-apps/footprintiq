/**
 * ConnectionsPreview Component
 * 
 * Shows a visual preview of the connections graph with locked/blurred nodes
 * for Free users. Displays 2-3 unlabeled nodes and blurs/skeletons the rest.
 * 
 * Overlay text: "Connections detected but hidden on Free"
 * CTA: "Unlock full connections graph →"
 */

import { Lock, Network, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type ConnectionsViewModel } from '@/lib/results/resultsViewModel';

interface ConnectionsPreviewProps {
  connections: ConnectionsViewModel;
  isFullAccess: boolean;
  onUpgradeClick?: () => void;
  onViewFullClick?: () => void;
  className?: string;
}

export function ConnectionsPreview({
  connections,
  isFullAccess,
  onUpgradeClick,
  onViewFullClick,
  className,
}: ConnectionsPreviewProps) {
  if (connections.totalNodes === 0) {
    return null;
  }

  const visibleNodes = connections.visibleNodes.filter(n => !n.isLocked);
  const lockedNodes = connections.visibleNodes.filter(n => n.isLocked);
  const totalLocked = connections.totalNodes - visibleNodes.length;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-semibold">Connections</h3>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {connections.totalNodes}
            </Badge>
          </div>
          {isFullAccess && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={onViewFullClick}
            >
              View graph
            </Button>
          )}
        </div>

        {/* Visual preview area */}
        <div className="relative min-h-[180px] bg-gradient-to-b from-muted/30 to-muted/5">
          {/* Node grid visualization */}
          <div className="flex flex-wrap gap-2 justify-center p-6 relative z-10">
            {/* Visible nodes (2-3 unlabeled for Free) */}
            {visibleNodes.slice(0, isFullAccess ? 6 : 3).map((node, i) => (
              <div
                key={node.id}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full border shadow-sm",
                  isFullAccess 
                    ? "bg-card border-border/50" 
                    : "bg-muted/60 border-border/30"
                )}
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                {isFullAccess ? (
                  <span className="text-xs font-medium truncate max-w-[80px]">
                    {node.platform}
                  </span>
                ) : (
                  // Unlabeled for Free users - just show "Account"
                  <span className="text-xs text-muted-foreground">
                    Account {i + 1}
                  </span>
                )}
              </div>
            ))}

            {/* Blurred/skeleton nodes for Free */}
            {!isFullAccess && lockedNodes.slice(0, 3).map((node, i) => (
              <div
                key={node.id}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted/40 border border-border/20 blur-[2px] opacity-50"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                <span className="text-xs font-medium truncate max-w-[80px]">
                  ••••••
                </span>
              </div>
            ))}

            {/* Placeholder for more locked */}
            {!isFullAccess && totalLocked > 3 && (
              <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-muted/20 border border-dashed border-border/30">
                <Lock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  +{totalLocked - 3} more
                </span>
              </div>
            )}
          </div>

          {/* Connection lines (decorative) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="connLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <line x1="25%" y1="35%" x2="50%" y2="50%" stroke="url(#connLineGradient)" strokeWidth="1" />
            <line x1="75%" y1="35%" x2="50%" y2="50%" stroke="url(#connLineGradient)" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="35%" y2="75%" stroke="url(#connLineGradient)" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="65%" y2="75%" stroke="url(#connLineGradient)" strokeWidth="1" />
          </svg>

          {/* Overlay for Free users */}
          {!isFullAccess && totalLocked > 0 && (
            <>
              {/* Gradient fade overlay */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-20" />
              
              {/* Centered overlay text */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 z-30">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Connections detected but hidden on Free
                </p>
                <Button 
                  variant="default"
                  size="sm" 
                  className="h-8 text-xs gap-1.5"
                  onClick={onUpgradeClick}
                >
                  Unlock full connections graph
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
