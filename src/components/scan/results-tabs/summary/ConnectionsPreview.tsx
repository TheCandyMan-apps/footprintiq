/**
 * ConnectionsPreview Component
 * 
 * Shows a visual preview of the connections graph with locked/blurred nodes
 * for Free users. Displays a few visible nodes and locks the rest.
 */

import { Lock, Network, Sparkles, ArrowRight } from 'lucide-react';
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
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-medium">Identity Connections</h3>
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

        {/* Visual preview */}
        <div className="relative p-4 min-h-[140px] bg-gradient-to-b from-muted/20 to-muted/5">
          {/* Node grid visualization */}
          <div className="flex flex-wrap gap-2 justify-center">
            {/* Visible nodes */}
            {visibleNodes.slice(0, 6).map((node, i) => (
              <div
                key={node.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-card border border-border/50 shadow-sm"
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[10px] font-medium truncate max-w-[80px]">
                  {node.platform}
                </span>
              </div>
            ))}

            {/* Locked/blurred nodes preview */}
            {!isFullAccess && lockedNodes.slice(0, 3).map((node, i) => (
              <div
                key={node.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/50 border border-border/30 opacity-50 blur-[1px]"
              >
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <span className="text-[10px] font-medium truncate max-w-[80px]">
                  {node.platform}
                </span>
              </div>
            ))}

            {/* Placeholder for more locked */}
            {!isFullAccess && totalLocked > 3 && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-muted/30 border border-border/20">
                <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  +{totalLocked - 3} more
                </span>
              </div>
            )}
          </div>

          {/* Connection lines (decorative) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Decorative lines */}
            <line x1="30%" y1="40%" x2="50%" y2="50%" stroke="url(#lineGradient)" strokeWidth="1" />
            <line x1="70%" y1="40%" x2="50%" y2="50%" stroke="url(#lineGradient)" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="40%" y2="70%" stroke="url(#lineGradient)" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="60%" y2="70%" stroke="url(#lineGradient)" strokeWidth="1" />
          </svg>

          {/* Locked overlay for Free users */}
          {!isFullAccess && totalLocked > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/95 via-background/60 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Upgrade CTA for Free users */}
        {!isFullAccess && totalLocked > 0 && (
          <div className="p-3 border-t border-border/30 bg-muted/20">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {totalLocked} connection{totalLocked !== 1 ? 's' : ''} locked
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Unlock the full identity graph
                </p>
              </div>
              <Button 
                size="sm" 
                className="h-7 text-xs shrink-0"
                onClick={onUpgradeClick}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
