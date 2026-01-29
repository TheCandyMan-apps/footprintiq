/**
 * ConnectionsPreviewGraph Component
 * 
 * A limited, read-only graph preview for Free users.
 * Shows up to 10-15 nodes with visible edges and labels,
 * but disables all interactions (pan, zoom, click).
 */

import { useEffect, useRef, useMemo } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScanResult } from '@/hooks/useScanResultsData';

// Maximum nodes to display in preview mode
const PREVIEW_NODE_LIMIT = 12;

// Category color palette (consistent with MindMapGraph)
const CATEGORY_COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#f97316', '#22c55e', '#ef4444', '#a855f7',
];

function getCategoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash) + category.charCodeAt(i);
    hash |= 0;
  }
  return CATEGORY_COLOR_PALETTE[Math.abs(hash) % CATEGORY_COLOR_PALETTE.length];
}

// Simple category inference from platform name
function inferCategory(platform: string): string {
  const p = platform.toLowerCase();
  if (['twitter', 'facebook', 'instagram', 'tiktok', 'snapchat', 'threads', 'mastodon'].some(s => p.includes(s))) return 'Social';
  if (['github', 'gitlab', 'stackoverflow', 'npm', 'pypi'].some(s => p.includes(s))) return 'Developer';
  if (['discord', 'telegram', 'slack', 'whatsapp'].some(s => p.includes(s))) return 'Messaging';
  if (['twitch', 'steam', 'xbox', 'playstation', 'epic'].some(s => p.includes(s))) return 'Gaming';
  if (['youtube', 'vimeo', 'spotify', 'soundcloud'].some(s => p.includes(s))) return 'Media';
  if (['linkedin', 'glassdoor', 'indeed'].some(s => p.includes(s))) return 'Professional';
  if (['reddit', 'quora', 'medium', 'substack'].some(s => p.includes(s))) return 'Forums';
  if (['amazon', 'ebay', 'etsy', 'shopify'].some(s => p.includes(s))) return 'E-Commerce';
  return 'Other';
}

interface ConnectionsPreviewGraphProps {
  results: ScanResult[];
  username: string;
  onUpgradeClick: () => void;
  className?: string;
}

export function ConnectionsPreviewGraph({
  results,
  username,
  onUpgradeClick,
  className,
}: ConnectionsPreviewGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  // Extract nodes from results (limit to PREVIEW_NODE_LIMIT)
  const { nodes, edges, totalCount } = useMemo(() => {
    const foundResults = results.filter(r => 
      r.status === 'found' || r.status === 'claimed'
    ).slice(0, PREVIEW_NODE_LIMIT);

    const nodeList: { id: string; label: string; category: string; color: string }[] = [];
    const edgeList: { source: string; target: string }[] = [];
    const seenUrls = new Set<string>();

    // Add center node (username)
    nodeList.push({
      id: 'center',
      label: username,
      category: 'center',
      color: 'hsl(var(--primary))',
    });

    foundResults.forEach((result, index) => {
      const url = result.url || `node-${index}`;
      if (seenUrls.has(url)) return;
      seenUrls.add(url);

      const platform = result.site || 'Unknown';
      const category = inferCategory(platform);
      const nodeId = `profile-${index}`;

      nodeList.push({
        id: nodeId,
        label: platform,
        category,
        color: getCategoryColor(category),
      });

      // Connect to center
      edgeList.push({ source: 'center', target: nodeId });
    });

    return {
      nodes: nodeList,
      edges: edgeList,
      totalCount: results.filter(r => r.status === 'found' || r.status === 'claimed').length,
    };
  }, [results, username]);

  // Initialize Cytoscape graph
  useEffect(() => {
    if (!containerRef.current || nodes.length <= 1) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...nodes.map(n => ({
          data: { 
            id: n.id, 
            label: n.label,
            color: n.color,
            isCenter: n.id === 'center',
          },
        })),
        ...edges.map((e, i) => ({
          data: { 
            id: `edge-${i}`, 
            source: e.source, 
            target: e.target,
          },
        })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'font-size': '10px',
            'color': 'hsl(var(--foreground))',
            'text-margin-y': 6,
            'width': 28,
            'height': 28,
            'border-width': 2,
            'border-color': 'hsl(var(--border))',
            'text-outline-width': 2,
            'text-outline-color': 'hsl(var(--background))',
          },
        },
        {
          selector: 'node[?isCenter]',
          style: {
            'width': 40,
            'height': 40,
            'font-size': '12px',
            'font-weight': 'bold',
            'border-width': 3,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': 'hsl(var(--border))',
            'opacity': 0.6,
            'curve-style': 'bezier',
          },
        },
      ],
      layout: {
        name: 'concentric',
        concentric: (node: any) => node.data('isCenter') ? 2 : 1,
        levelWidth: () => 1,
        minNodeSpacing: 50,
        padding: 30,
      },
      // Disable all interactions for preview mode
      userZoomingEnabled: false,
      userPanningEnabled: false,
      boxSelectionEnabled: false,
      selectionType: 'single',
      autoungrabify: true,
      autounselectify: true,
    });

    cyRef.current = cy;

    // Run layout
    cy.layout({
      name: 'concentric',
      concentric: (node: any) => node.data('isCenter') ? 2 : 1,
      levelWidth: () => 1,
      minNodeSpacing: 50,
      padding: 30,
      animate: false,
    }).run();

    // Fit to container
    cy.fit(undefined, 20);

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [nodes, edges]);

  const hiddenCount = Math.max(0, totalCount - PREVIEW_NODE_LIMIT);

  return (
    <div className={cn('relative rounded-lg overflow-hidden border border-border/50', className)}>
      {/* Graph container */}
      <div 
        ref={containerRef} 
        className="h-64 bg-muted/10"
        style={{ touchAction: 'none' }}
      />

      {/* Preview mode overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top gradient for text readability */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background/80 to-transparent" />
        
        {/* Preview mode badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/80 backdrop-blur-sm rounded-full border border-border/50">
            <Lock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Preview mode — unlock Pro for full graph interaction
            </span>
          </div>
        </div>

        {/* Bottom gradient with CTA */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent pt-12 pb-4 pointer-events-auto">
          <div className="flex flex-col items-center gap-2 px-4">
            {hiddenCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {hiddenCount} more connection{hiddenCount > 1 ? 's' : ''} hidden
              </p>
            )}
            <Button 
              onClick={onUpgradeClick}
              size="sm"
              className="gap-2"
            >
              <Lock className="h-3.5 w-3.5" />
              Unlock Pro to explore full connections
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectionsPreviewGraph;
