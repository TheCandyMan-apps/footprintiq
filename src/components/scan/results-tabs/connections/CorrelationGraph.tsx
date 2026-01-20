import { useEffect, useRef, useCallback, useState } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular } from 'cytoscape';
import { 
  GraphNode, GraphEdge, CorrelationGraphData, 
  CATEGORY_CONFIG, EDGE_REASON_CONFIG 
} from '@/hooks/useCorrelationGraph';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Layers } from 'lucide-react';
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
  verified: '#22c55e', // green-500
  likely: '#f59e0b',   // amber-500
  unclear: '#6b7280',  // gray-500
};

export function CorrelationGraph({
  data,
  focusedNodeId,
  onNodeClick,
  onNodeDoubleClick,
  className,
}: CorrelationGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [groupByPlatform, setGroupByPlatform] = useState(false);

  // Build cytoscape elements from graph data
  const buildElements = useCallback(() => {
    const elements: cytoscape.ElementDefinition[] = [];

    // Add nodes
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
          // For grouping
          parent: groupByPlatform && node.type === 'account' ? `group-${node.category}` : undefined,
        },
        classes: [node.type, node.lensStatus || 'unclear'].filter(Boolean).join(' '),
      });
    });

    // Add compound nodes for grouping
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

    // Add edges
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
        // Identity (root) node
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
          },
        },
        // Account nodes
        {
          selector: 'node.account',
          style: {
            'background-color': 'data(categoryColor)',
            'border-width': 3,
            'border-color': 'data(lensColor)',
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'font-size': 10,
            'color': 'hsl(var(--foreground))',
            'text-outline-width': 1.5,
            'text-outline-color': 'hsl(var(--background))',
            'width': 36,
            'height': 36,
            'shape': 'ellipse',
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
            'padding': 20,
            'shape': 'roundrectangle',
          },
        },
        // Edges
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#64748b',
            'line-opacity': 0.5,
            'curve-style': 'bezier',
            'target-arrow-shape': 'none',
          },
        },
        // Edges from identity root
        {
          selector: 'edge[source = "identity-root"]',
          style: {
            'line-color': 'hsl(var(--primary))',
            'line-opacity': 0.5,
            'line-style': 'solid',
          },
        },
        // Highlighted/selected states
        {
          selector: 'node:selected',
          style: {
            'overlay-color': 'hsl(var(--primary))',
            'overlay-opacity': 0.2,
            'overlay-padding': '6px',
          },
        },
        // Dimmed state for unfocused nodes
        {
          selector: 'node.dimmed',
          style: {
            'opacity': 0.25,
          },
        },
        {
          selector: 'edge.dimmed',
          style: {
            'opacity': 0.1,
          },
        },
        // Highlighted state for focused paths
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 4,
            'border-color': 'hsl(var(--primary))',
            'z-index': 999,
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

    // Event handlers
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

    cyRef.current = cy;

    // Fit after layout
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

    // Clear all classes first
    cy.elements().removeClass('dimmed highlighted focused');

    if (!focusedNodeId) return;

    const focusedNode = cy.getElementById(focusedNodeId);
    if (!focusedNode.length) return;

    // Get connected nodes and edges
    const connectedEdges = focusedNode.connectedEdges();
    const connectedNodes = connectedEdges.connectedNodes();
    
    // Also get second-degree connections for path highlighting
    const secondDegreeEdges = connectedNodes.connectedEdges();
    const secondDegreeNodes = secondDegreeEdges.connectedNodes();

    // Dim everything
    cy.elements().addClass('dimmed');

    // Highlight the focused node
    focusedNode.removeClass('dimmed').addClass('focused');

    // Highlight direct connections
    connectedEdges.removeClass('dimmed').addClass('highlighted');
    connectedNodes.removeClass('dimmed').addClass('highlighted');

    // Partially highlight second-degree (for path visibility)
    secondDegreeNodes.removeClass('dimmed');
    
    // Center on focused node
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
    
    cy.elements().removeClass('dimmed highlighted focused');
    cy.fit(undefined, 30);
    onNodeClick(null);
  }, [onNodeClick]);

  return (
    <div className={cn('relative flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg border border-border p-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Zoom In</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Zoom Out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFit}>
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Fit to View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Reset View</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-1" />

          <div className="flex items-center gap-1.5 px-1">
            <Switch
              id="group-toggle"
              checked={groupByPlatform}
              onCheckedChange={setGroupByPlatform}
              className="h-4 w-7 data-[state=checked]:bg-primary"
            />
            <Label htmlFor="group-toggle" className="text-[10px] text-muted-foreground cursor-pointer">
              <Layers className="h-3 w-3" />
            </Label>
          </div>
        </TooltipProvider>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 flex flex-wrap gap-2 bg-background/80 backdrop-blur-sm rounded-lg border border-border p-2 max-w-[200px]">
        <div className="w-full text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
          Confidence
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: LENS_COLORS.verified, backgroundColor: LENS_COLORS.verified + '40' }} />
          <span className="text-[10px]">Verified</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: LENS_COLORS.likely, backgroundColor: LENS_COLORS.likely + '40' }} />
          <span className="text-[10px]">Likely</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-dashed" style={{ borderColor: LENS_COLORS.unclear, backgroundColor: LENS_COLORS.unclear + '20' }} />
          <span className="text-[10px]">Unclear</span>
        </div>
      </div>

      {/* Graph container */}
      <div
        ref={containerRef}
        className="flex-1 bg-gradient-to-br from-background via-background to-muted/10"
        style={{ cursor: 'grab' }}
      />
    </div>
  );
}
