import { useEffect, useRef, useCallback, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { 
  GraphNode, CorrelationGraphData, 
  CATEGORY_CONFIG, EDGE_REASON_CONFIG 
} from '@/hooks/useCorrelationGraph';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Layers, Focus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CorrelationGraphProps {
  data: CorrelationGraphData;
  focusedNodeId: string | null;
  onNodeClick: (node: GraphNode | null) => void;
  onNodeDoubleClick: (node: GraphNode) => void;
  className?: string;
}

const LENS_COLORS = {
  verified: '#22c55e',
  likely: '#f59e0b',
  unclear: '#6b7280',
};

export function CorrelationGraph({
  data,
  focusedNodeId,
  onNodeClick,
  onNodeDoubleClick,
  className,
}: CorrelationGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [groupByPlatform, setGroupByPlatform] = useState(false);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    type: 'node' | 'edge';
    content: { label: string; username?: string; confidence?: number; reason?: string };
  } | null>(null);

  // Build cytoscape elements from graph data
  const buildElements = useCallback(() => {
    const elements: cytoscape.ElementDefinition[] = [];

    data.nodes.forEach((node) => {
      const categoryConfig = CATEGORY_CONFIG[node.category] || CATEGORY_CONFIG.other;
      const lensColor = node.lensStatus ? LENS_COLORS[node.lensStatus] : LENS_COLORS.unclear;
      
      elements.push({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          category: node.category,
          categoryColor: categoryConfig.color,
          lensColor,
          lensStatus: node.lensStatus,
          confidence: node.confidence,
          url: node.url,
          imageUrl: node.imageUrl,
          meta: node.meta,
          result: node.result,
          username: node.meta?.username,
          parent: groupByPlatform && node.type === 'account' ? `group-${node.category}` : undefined,
        },
        classes: [node.type, node.lensStatus || 'unclear'].filter(Boolean).join(' '),
      });
    });

    if (groupByPlatform) {
      const categories = new Set(data.nodes.filter(n => n.type === 'account').map(n => n.category));
      categories.forEach((cat) => {
        const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;
        elements.push({
          data: {
            id: `group-${cat}`,
            label: config.label,
            isGroup: true,
            categoryColor: config.color,
          },
          classes: 'group-node',
        });
      });
    }

    data.edges.forEach((edge) => {
      elements.push({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          reason: edge.reason,
          reasonLabel: edge.reasonLabel,
          weight: edge.weight,
          confidence: edge.confidence,
          details: edge.details,
        },
      });
    });

    return elements;
  }, [data, groupByPlatform]);

  // Initialize cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const elements = buildElements();
    
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        // Identity (root) node - always show label
        {
          selector: 'node.identity',
          style: {
            'background-color': 'hsl(var(--primary))',
            'border-width': 3,
            'border-color': 'hsl(var(--primary))',
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'font-size': 12,
            'font-weight': 'bold',
            'color': 'hsl(var(--foreground))',
            'text-outline-width': 2,
            'text-outline-color': 'hsl(var(--background))',
            'width': 50,
            'height': 50,
            'shape': 'diamond',
            'text-opacity': 1,
          },
        },
        // Account nodes - hide labels by default (show on hover/focus)
        {
          selector: 'node.account',
          style: {
            'background-color': 'data(categoryColor)',
            'border-width': 3,
            'border-color': 'data(lensColor)',
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'font-size': 9,
            'color': 'hsl(var(--foreground))',
            'text-outline-width': 1.5,
            'text-outline-color': 'hsl(var(--background))',
            'width': 32,
            'height': 32,
            'shape': 'ellipse',
            'text-opacity': 0, // Hidden by default
            'transition-property': 'text-opacity, width, height, border-width',
            'transition-duration': 150,
          },
        },
        // LENS status variants
        {
          selector: 'node.verified',
          style: {
            'border-color': LENS_COLORS.verified,
            'border-width': 3,
          },
        },
        {
          selector: 'node.likely',
          style: {
            'border-color': LENS_COLORS.likely,
            'border-width': 2,
          },
        },
        {
          selector: 'node.unclear',
          style: {
            'border-color': LENS_COLORS.unclear,
            'border-width': 2,
            'border-style': 'dashed',
          },
        },
        // Hovered node - show label and enlarge
        {
          selector: 'node.hovered',
          style: {
            'text-opacity': 1,
            'width': 40,
            'height': 40,
            'border-width': 4,
            'z-index': 900,
            'font-size': 10,
            'font-weight': 'bold',
          },
        },
        // Hovered edge
        {
          selector: 'edge.hovered',
          style: {
            'line-color': 'hsl(var(--primary))',
            'line-opacity': 1,
            'width': 4,
            'z-index': 900,
          },
        },
        // Connected to hovered (neighbors)
        {
          selector: 'node.neighbor',
          style: {
            'text-opacity': 0.8,
            'opacity': 1,
          },
        },
        {
          selector: 'edge.neighbor',
          style: {
            'line-opacity': 0.8,
            'width': 2.5,
          },
        },
        // Unhovered state (dimmed when something is hovered)
        {
          selector: 'node.unhovered',
          style: {
            'opacity': 0.4,
            'text-opacity': 0,
          },
        },
        {
          selector: 'edge.unhovered',
          style: {
            'opacity': 0.15,
          },
        },
        // Group (compound) nodes
        {
          selector: 'node.group-node',
          style: {
            'background-color': 'data(categoryColor)',
            'background-opacity': 0.1,
            'border-width': 2,
            'border-color': 'data(categoryColor)',
            'border-opacity': 0.5,
            'label': 'data(label)',
            'text-valign': 'top',
            'text-margin-y': -8,
            'font-size': 11,
            'font-weight': 'bold',
            'color': 'data(categoryColor)',
            'padding': '20px',
            'shape': 'roundrectangle',
          },
        },
        // Base edge styling
        {
          selector: 'edge',
          style: {
            'width': 1,
            'line-color': '#94a3b8',
            'line-opacity': 0.25,
            'curve-style': 'bezier',
            'target-arrow-shape': 'none',
            'transition-property': 'line-opacity, width, line-color',
            'transition-duration': 150,
          },
        },
        // Identity→Account edges (de-emphasized - thin, light, dashed)
        {
          selector: 'edge[source = "identity-root"]',
          style: {
            'line-color': '#cbd5e1',
            'line-opacity': 0.2,
            'line-style': 'dashed',
            'width': 0.75,
            'z-index': 1,
          },
        },
        // Account↔Account correlation edges (emphasized)
        {
          selector: 'edge[source != "identity-root"]',
          style: {
            'line-color': '#3b82f6',
            'line-opacity': 0.65,
            'line-style': 'solid',
            'z-index': 10,
          },
        },
        // Strong correlation edges (weight >= 0.85)
        {
          selector: 'edge[source != "identity-root"][weight >= 0.85]',
          style: {
            'width': 3,
            'line-opacity': 0.8,
            'line-color': '#2563eb',
          },
        },
        // Medium correlation edges (0.7 <= weight < 0.85)
        {
          selector: 'edge[source != "identity-root"][weight >= 0.7][weight < 0.85]',
          style: {
            'width': 2.5,
            'line-opacity': 0.7,
            'line-color': '#3b82f6',
          },
        },
        // Low-medium correlation edges (0.6 <= weight < 0.7)
        {
          selector: 'edge[source != "identity-root"][weight >= 0.6][weight < 0.7]',
          style: {
            'width': 2,
            'line-opacity': 0.55,
            'line-color': '#60a5fa',
          },
        },
        // Weak correlation edges (weight < 0.6)
        {
          selector: 'edge[source != "identity-root"][weight < 0.6]',
          style: {
            'width': 1.5,
            'line-style': 'dashed',
            'line-opacity': 0.4,
            'line-color': '#93c5fd',
          },
        },
        // Selected states
        {
          selector: 'node:selected',
          style: {
            'overlay-color': 'hsl(var(--primary))',
            'overlay-opacity': 0.2,
            'overlay-padding': '6px',
          },
        },
        // Dimmed state for focus mode
        {
          selector: 'node.dimmed',
          style: {
            'opacity': 0.2,
            'text-opacity': 0,
          },
        },
        {
          selector: 'edge.dimmed',
          style: {
            'opacity': 0.08,
          },
        },
        // Highlighted state for focused paths
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 4,
            'border-color': 'hsl(var(--primary))',
            'z-index': 999,
            'text-opacity': 1,
          },
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': 'hsl(var(--primary))',
            'line-opacity': 0.9,
            'width': 3,
            'z-index': 999,
          },
        },
        // Focused node (the actual focused one)
        {
          selector: 'node.focused',
          style: {
            'border-width': 5,
            'border-color': 'hsl(var(--primary))',
            'width': 48,
            'height': 48,
            'font-size': 12,
            'font-weight': 'bold',
            'text-opacity': 1,
            'z-index': 1000,
          },
        },
      ],
      layout: groupByPlatform 
        ? {
            name: 'cose',
            animate: true,
            animationDuration: 500,
            nodeRepulsion: () => 8000,
            idealEdgeLength: () => 120,
            gravity: 0.5,
            nestingFactor: 1.2,
          }
        : {
            name: 'cose',
            animate: true,
            animationDuration: 500,
            nodeRepulsion: () => 6000,
            idealEdgeLength: () => 100,
            gravity: 0.4,
            padding: 50,
          },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    // ========== HOVER HANDLERS ==========

    // Node hover
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      if (node.data('isGroup')) return;

      // Clear previous hover classes
      cy.elements().removeClass('hovered neighbor unhovered');
      
      // Add hover classes
      node.addClass('hovered');
      const connectedEdges = node.connectedEdges();
      const connectedNodes = connectedEdges.connectedNodes();
      connectedEdges.addClass('neighbor');
      connectedNodes.addClass('neighbor');
      
      // Dim unrelated elements
      cy.elements().not(node).not(connectedEdges).not(connectedNodes).addClass('unhovered');

      // Show tooltip
      const pos = node.renderedPosition();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        setTooltipData({
          x: containerRect.left + pos.x,
          y: containerRect.top + pos.y - 50,
          type: 'node',
          content: {
            label: node.data('label'),
            username: node.data('username'),
            confidence: node.data('confidence'),
          },
        });
      }
    });

    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('hovered neighbor unhovered');
      setTooltipData(null);
    });

    // Edge hover
    cy.on('mouseover', 'edge', (evt) => {
      const edge = evt.target;
      
      cy.elements().removeClass('hovered neighbor unhovered');
      edge.addClass('hovered');
      edge.connectedNodes().addClass('neighbor');
      cy.elements().not(edge).not(edge.connectedNodes()).addClass('unhovered');

      // Show edge tooltip
      const midpoint = edge.midpoint();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        setTooltipData({
          x: containerRect.left + midpoint.x,
          y: containerRect.top + midpoint.y - 30,
          type: 'edge',
          content: {
            label: edge.data('reasonLabel') || EDGE_REASON_CONFIG[edge.data('reason') as keyof typeof EDGE_REASON_CONFIG]?.label || 'Connection',
            reason: edge.data('details'),
            confidence: edge.data('confidence'),
          },
        });
      }
    });

    cy.on('mouseout', 'edge', () => {
      cy.elements().removeClass('hovered neighbor unhovered');
      setTooltipData(null);
    });

    // ========== CLICK HANDLERS ==========

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (node.data('isGroup')) return;
      
      const graphNode: GraphNode = {
        id: node.id(),
        type: node.data('type'),
        label: node.data('label'),
        category: node.data('category'),
        url: node.data('url'),
        imageUrl: node.data('imageUrl'),
        confidence: node.data('confidence'),
        lensStatus: node.data('lensStatus'),
        meta: node.data('meta'),
        result: node.data('result'),
      };
      onNodeClick(graphNode);
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        onNodeClick(null);
      }
    });

    cy.on('dbltap', 'node', (evt) => {
      const node = evt.target;
      if (node.data('isGroup')) return;
      
      const graphNode: GraphNode = {
        id: node.id(),
        type: node.data('type'),
        label: node.data('label'),
        category: node.data('category'),
        url: node.data('url'),
        imageUrl: node.data('imageUrl'),
        confidence: node.data('confidence'),
        lensStatus: node.data('lensStatus'),
        meta: node.data('meta'),
        result: node.data('result'),
      };
      onNodeDoubleClick(graphNode);
    });

    // ========== ZOOM-BASED LABEL VISIBILITY ==========
    
    cy.on('zoom', () => {
      const zoom = cy.zoom();
      // Show all labels when zoomed in enough
      if (zoom > 1.2) {
        cy.nodes('.account').style('text-opacity', 0.8);
      } else {
        cy.nodes('.account').not('.hovered').not('.focused').not('.highlighted').style('text-opacity', 0);
      }
    });

    cyRef.current = cy;

    cy.one('layoutstop', () => {
      cy.fit(undefined, 30);
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [data, groupByPlatform, buildElements, onNodeClick, onNodeDoubleClick]);

  // Handle focus mode
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass('dimmed highlighted focused');

    if (!focusedNodeId) return;

    const focusedNode = cy.getElementById(focusedNodeId);
    if (!focusedNode.length) return;

    const connectedEdges = focusedNode.connectedEdges();
    const connectedNodes = connectedEdges.connectedNodes();
    const secondDegreeEdges = connectedNodes.connectedEdges();
    const secondDegreeNodes = secondDegreeEdges.connectedNodes();

    cy.elements().addClass('dimmed');
    focusedNode.removeClass('dimmed').addClass('focused');
    connectedEdges.removeClass('dimmed').addClass('highlighted');
    connectedNodes.removeClass('dimmed').addClass('highlighted');
    secondDegreeNodes.removeClass('dimmed');
    
    cy.animate({
      center: { eles: focusedNode },
      zoom: 1.5,
      duration: 300,
    });
  }, [focusedNodeId]);

  // Control handlers
  const handleZoomIn = useCallback(() => {
    cyRef.current?.zoom({
      level: (cyRef.current.zoom() || 1) * 1.3,
      renderedPosition: { x: containerRef.current!.clientWidth / 2, y: containerRef.current!.clientHeight / 2 },
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    cyRef.current?.zoom({
      level: (cyRef.current.zoom() || 1) * 0.7,
      renderedPosition: { x: containerRef.current!.clientWidth / 2, y: containerRef.current!.clientHeight / 2 },
    });
  }, []);

  const handleFit = useCallback(() => {
    cyRef.current?.fit(undefined, 30);
  }, []);

  const handleReset = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    
    cy.elements().removeClass('dimmed highlighted focused hovered neighbor unhovered');
    cy.fit(undefined, 30);
    onNodeClick(null);
  }, [onNodeClick]);

  const handleCenter = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const identityNode = cy.getElementById('identity-root');
    if (identityNode.length) {
      cy.animate({
        center: { eles: identityNode },
        zoom: 1.2,
        duration: 300,
      });
    }
  }, []);

  return (
    <div className={cn('relative flex flex-col h-full', className)}>
      {/* Bottom-left Controls (SherlockEye style) */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1 bg-background/90 backdrop-blur-sm rounded-lg border border-border p-1.5 shadow-lg">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Zoom In</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Zoom Out</TooltipContent>
          </Tooltip>

          <div className="w-full h-px bg-border my-0.5" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFit}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Fit to View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCenter}>
                <Focus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Center on Identity</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Reset View</TooltipContent>
          </Tooltip>

          <div className="w-full h-px bg-border my-0.5" />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-8 w-8">
                <Switch
                  id="group-toggle"
                  checked={groupByPlatform}
                  onCheckedChange={setGroupByPlatform}
                  className="h-4 w-7 data-[state=checked]:bg-primary"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {groupByPlatform ? 'Disable' : 'Enable'} Grouping
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Bottom-right Legend */}
      <div className="absolute bottom-3 right-3 z-10 bg-background/90 backdrop-blur-sm rounded-lg border border-border p-2 shadow-lg">
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
          Confidence
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: LENS_COLORS.verified, backgroundColor: LENS_COLORS.verified + '40' }} />
            <span className="text-[10px]">Strong</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: LENS_COLORS.likely, backgroundColor: LENS_COLORS.likely + '40' }} />
            <span className="text-[10px]">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-dashed" style={{ borderColor: LENS_COLORS.unclear, backgroundColor: LENS_COLORS.unclear + '20' }} />
            <span className="text-[10px]">Weak</span>
          </div>
        </div>
      </div>

      {/* Custom Tooltip */}
      {tooltipData && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipData.x,
            top: tooltipData.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-lg px-3 py-2 text-xs max-w-[200px]">
            {tooltipData.type === 'node' ? (
              <>
                <div className="font-semibold">{tooltipData.content.label}</div>
                {tooltipData.content.username && (
                  <div className="text-muted-foreground">@{tooltipData.content.username}</div>
                )}
                {tooltipData.content.confidence !== undefined && (
                  <div className="mt-1 text-[10px]">
                    <span className="text-muted-foreground">Confidence:</span>{' '}
                    <span className="font-medium">{tooltipData.content.confidence}%</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="font-semibold">{tooltipData.content.label}</div>
                {tooltipData.content.reason && (
                  <div className="text-muted-foreground mt-0.5">{tooltipData.content.reason}</div>
                )}
                {tooltipData.content.confidence !== undefined && (
                  <div className="mt-1 text-[10px]">
                    <span className="text-muted-foreground">Strength:</span>{' '}
                    <span className="font-medium">{tooltipData.content.confidence}%</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Graph container */}
      <div
        ref={containerRef}
        className="flex-1 bg-gradient-to-br from-background via-background to-muted/5"
        style={{ cursor: 'grab' }}
      />
    </div>
  );
}
