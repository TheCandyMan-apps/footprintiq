import { useMemo, useState } from 'react';
import { GraphNode, CATEGORY_CONFIG } from '@/hooks/useCorrelationGraph';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, List, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeListPanelProps {
  nodes: GraphNode[];
  edges: { source: string; target: string }[];
  focusedNodeId: string | null;
  onNodeSelect: (node: GraphNode) => void;
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
  onNodeSelect,
  className,
}: NodeListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

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
    
    // Sort by connection count (degree) descending, then by confidence
    return filtered.sort((a, b) => {
      const degA = nodeDegrees.get(a.id) || 0;
      const degB = nodeDegrees.get(b.id) || 0;
      if (degB !== degA) return degB - degA;
      return b.confidence - a.confidence;
    });
  }, [nodes, focusedNeighborhood, searchQuery, nodeDegrees]);

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
      </div>

      {/* Search */}
      <div className="px-2 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by platform or user..."
            className="h-8 pl-7 pr-7 text-xs"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5"
              onClick={() => setSearchQuery('')}
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
            const platform = node.platform || node.category || 'unknown';
            const username = node.username || node.meta?.username || node.label || 'Unknown';

            return (
              <button
                key={node.id}
                onClick={() => onNodeSelect(node)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                  'hover:bg-muted/50',
                  isFocused && 'bg-primary/10 border-l-2 border-l-primary'
                )}
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
