import { useMemo, useState } from 'react';
import { GraphNode, CATEGORY_CONFIG } from '@/hooks/useCorrelationGraph';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, List, ChevronRight, Pin, PinOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NodeListPanelProps {
  nodes: GraphNode[];
  edges: { source: string; target: string }[];
  focusedNodeId: string | null;
  pinnedNodeIds: Set<string>;
  onNodeSelect: (node: GraphNode) => void;
  onNodeHover: (nodeId: string | null) => void;
  onNodePin: (nodeId: string) => void;
  onSearchChange?: (query: string) => void;
  className?: string;
}

// Confidence level thresholds and display
const getConfidenceLevel = (confidence: number): { label: string; variant: 'default' | 'secondary' | 'outline'; color: string } => {
  const pct = Math.round(confidence * 100);
  if (pct >= 75) return { label: 'Strong', variant: 'default', color: 'text-green-600 dark:text-green-400' };
  if (pct >= 50) return { label: 'Medium', variant: 'secondary', color: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Weak', variant: 'outline', color: 'text-muted-foreground' };
};

export function NodeListPanel({
  nodes,
  edges,
  focusedNodeId,
  pinnedNodeIds,
  onNodeSelect,
  onNodeHover,
  onNodePin,
  onSearchChange,
  className,
}: NodeListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search change and propagate to parent
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  // Calculate node degrees (connection count)
  const nodeDegrees = useMemo(() => {
    const degrees = new Map<string, number>();
    edges.forEach((edge) => {
      if (edge.source !== 'identity-root' && edge.target !== 'identity-root') {
        degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
        degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
      }
    });
    return degrees;
  }, [edges]);

  // Get 1-hop neighborhood when focused
  const focusedNeighborhood = useMemo(() => {
    if (!focusedNodeId) return null;
    
    const neighborIds = new Set<string>();
    neighborIds.add(focusedNodeId);
    
    edges.forEach((edge) => {
      if (edge.source === focusedNodeId) neighborIds.add(edge.target);
      if (edge.target === focusedNodeId) neighborIds.add(edge.source);
    });
    
    return neighborIds;
  }, [focusedNodeId, edges]);

  // Filter nodes: only accounts, apply focus filter if active, then search
  const filteredNodes = useMemo(() => {
    let filtered = nodes.filter(n => n.type === 'account');
    
    // Auto-filter to focused neighborhood when in focus mode
    if (focusedNeighborhood) {
      filtered = filtered.filter(n => focusedNeighborhood.has(n.id));
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => {
        const platform = (n.platform || n.label || '').toLowerCase();
        const username = (n.username || n.meta?.username || '').toLowerCase();
        return platform.includes(query) || username.includes(query);
      });
    }
    
    // Sort: pinned first, then by connection count (degree), then by confidence
    return filtered.sort((a, b) => {
      // Pinned nodes first
      const pinnedA = pinnedNodeIds.has(a.id) ? 1 : 0;
      const pinnedB = pinnedNodeIds.has(b.id) ? 1 : 0;
      if (pinnedB !== pinnedA) return pinnedB - pinnedA;
      
      const degA = nodeDegrees.get(a.id) || 0;
      const degB = nodeDegrees.get(b.id) || 0;
      if (degB !== degA) return degB - degA;
      return b.confidence - a.confidence;
    });
  }, [nodes, focusedNeighborhood, searchQuery, nodeDegrees, pinnedNodeIds]);

  return (
    <div className={cn('flex flex-col bg-background/95 backdrop-blur-sm border-l border-border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {focusedNeighborhood ? 'Neighborhood' : 'Nodes'}
          </span>
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {filteredNodes.length}
          </Badge>
        </div>
        {pinnedNodeIds.size > 0 && (
          <Badge variant="outline" className="text-[9px] h-4 px-1.5 gap-0.5">
            <Pin className="h-2.5 w-2.5" />
            {pinnedNodeIds.size}
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="px-2 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Filter by platform or user..."
            className="h-8 pl-7 pr-7 text-xs"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5"
              onClick={() => handleSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Node List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {filteredNodes.map((node) => {
            const degree = nodeDegrees.get(node.id) || 0;
            const conf = getConfidenceLevel(node.confidence);
            const isFocused = node.id === focusedNodeId;
            const isPinned = pinnedNodeIds.has(node.id);
            const platform = node.platform || node.category || 'unknown';
            const username = node.username || node.meta?.username || node.label || 'Unknown';

            return (
              <div
                key={node.id}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 transition-colors group',
                  'hover:bg-muted/50',
                  isFocused && 'bg-primary/10 border-l-2 border-l-primary',
                  isPinned && !isFocused && 'bg-amber-500/5 border-l-2 border-l-amber-500/50'
                )}
                onMouseEnter={() => onNodeHover(node.id)}
                onMouseLeave={() => onNodeHover(null)}
              >
                {/* Click area for selection */}
                <button
                  onClick={() => onNodeSelect(node)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  {/* Platform Icon */}
                  <PlatformIcon 
                    platform={platform} 
                    url={node.url} 
                    size="sm" 
                    showBorder={false}
                  />

                  {/* Site + Username */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate capitalize">
                      {platform}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {username}
                    </div>
                  </div>

                  {/* Confidence Badge */}
                  <Badge 
                    variant={conf.variant} 
                    className={cn('text-[9px] h-4 px-1.5 shrink-0', conf.color)}
                  >
                    {conf.label}
                  </Badge>

                  {/* Degree (connection count) */}
                  {degree > 0 && (
                    <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground shrink-0">
                      <span>{degree}</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  )}
                </button>

                {/* Pin Button */}
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-6 w-6 shrink-0 transition-opacity',
                          isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNodePin(node.id);
                        }}
                      >
                        {isPinned ? (
                          <PinOff className="h-3 w-3 text-amber-500" />
                        ) : (
                          <Pin className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      {isPinned ? 'Unpin label' : 'Pin label'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}

          {filteredNodes.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              {searchQuery ? 'No matching nodes' : 'No nodes to display'}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer hint */}
      {focusedNeighborhood && (
        <div className="px-3 py-2 border-t border-border bg-muted/30">
          <p className="text-[10px] text-muted-foreground text-center">
            Showing {filteredNodes.length} nodes in focus neighborhood
          </p>
        </div>
      )}
    </div>
  );
}
