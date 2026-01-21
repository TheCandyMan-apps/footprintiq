import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { 
  GraphNode, CorrelationGraphData, 
  CATEGORY_CONFIG, EDGE_REASON_CONFIG 
} from '@/hooks/useCorrelationGraph';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Layers, Focus, RefreshCw, X, Search, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface CorrelationGraphProps {
  data: CorrelationGraphData;
  focusedNodeId: string | null;
  onNodeClick: (node: GraphNode | null) => void;
  onNodeDoubleClick: (node: GraphNode) => void;
  onFocusNode?: (nodeId: string | null) => void;
  className?: string;
}

const LENS_COLORS = {
  verified: '#22c55e',
  likely: '#f59e0b',
  unclear: '#6b7280',
};

// Default: show identity + top N strongest connected accounts
const NEIGHBORHOOD_SIZE = 25;

export function CorrelationGraph({
  data,
  focusedNodeId,
  onNodeClick,
  onNodeDoubleClick,
  onFocusNode,
  className,
}: CorrelationGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [groupByPlatform, setGroupByPlatform] = useState(false);
  const [internalFocusedId, setInternalFocusedId] = useState<string | null>(null);
  const [showAllNodes, setShowAllNodes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    type: 'node' | 'edge';
    content: { displayName: string; username?: string; confidence?: number; reason?: string };
  } | null>(null);

  // Use external focusedNodeId if provided, otherwise use internal state
  const activeFocusedId = focusedNodeId ?? internalFocusedId;

  // Compute neighborhood: identity-root + top N strongest connected accounts
  const { neighborhoodNodes, neighborhoodEdges, hiddenCount } = useMemo(() => {
    if (showAllNodes || data.nodes.length <= NEIGHBORHOOD_SIZE + 1) {
      return { 
        neighborhoodNodes: data.nodes, 
        neighborhoodEdges: data.edges,
        hiddenCount: 0 
      };
    }

    // Get all account nodes with their connection strength
    const accountNodes = data.nodes.filter(n => n.type === 'account');
    const nodeStrength = new Map<string, number>();

    // Calculate strength as max weight of edges connected to each node
    data.edges.forEach(edge => {
      if (edge.source !== 'identity-root' && edge.target !== 'identity-root') {
        // Correlation edge - use its weight
        const weight = edge.weight;
        nodeStrength.set(edge.source, Math.max(nodeStrength.get(edge.source) || 0, weight));
        nodeStrength.set(edge.target, Math.max(nodeStrength.get(edge.target) || 0, weight));
      }
    });

    // Sort accounts by strength (correlation edge weight), then by confidence
    const sortedAccounts = [...accountNodes].sort((a, b) => {
      const strengthA = nodeStrength.get(a.id) || 0;
      const strengthB = nodeStrength.get(b.id) || 0;
      if (strengthB !== strengthA) return strengthB - strengthA;
      return b.confidence - a.confidence;
    });

    // Take top N
    const topAccounts = sortedAccounts.slice(0, NEIGHBORHOOD_SIZE);
    const topAccountIds = new Set(topAccounts.map(n => n.id));

    // Include identity-root
    const identityNode = data.nodes.find(n => n.type === 'identity');
    const filteredNodes = identityNode 
      ? [identityNode, ...topAccounts]
      : topAccounts;
    
    // Only include edges where both endpoints are in the neighborhood
    const nodeIdSet = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = data.edges.filter(e => 
      nodeIdSet.has(e.source) && nodeIdSet.has(e.target)
    );

    return {
      neighborhoodNodes: filteredNodes,
      neighborhoodEdges: filteredEdges,
      hiddenCount: accountNodes.length - topAccounts.length,
    };
  }, [data, showAllNodes]);

  // Filter nodes by search query
  const { displayNodes, displayEdges, searchMatchCount } = useMemo(() => {
    if (!searchQuery.trim()) {
      return { 
        displayNodes: neighborhoodNodes, 
        displayEdges: neighborhoodEdges,
        searchMatchCount: 0 
      };
    }

    const query = searchQuery.toLowerCase().trim();
    
    // Find matching nodes (search in platform and username)
    const matchingNodes = data.nodes.filter(n => {
      if (n.type === 'identity') return true; // Always include identity
      const platform = (n.platform || n.label || '').toLowerCase();
      const username = (n.meta?.username || '').toLowerCase();
      return platform.includes(query) || username.includes(query);
    });

    const matchingIds = new Set(matchingNodes.map(n => n.id));
    
    // Include edges only between matching nodes
    const matchingEdges = data.edges.filter(e =>
      matchingIds.has(e.source) && matchingIds.has(e.target)
    );

    return {
      displayNodes: matchingNodes,
      displayEdges: matchingEdges,
      searchMatchCount: matchingNodes.filter(n => n.type === 'account').length,
    };
  }, [data, neighborhoodNodes, neighborhoodEdges, searchQuery]);

  // Build cytoscape elements from displayed (filtered) graph data
  const buildElements = useCallback(() => {
    const elements: cytoscape.ElementDefinition[] = [];

    // Pre-calculate node degrees (number of connections) from displayed edges
    const nodeDegrees = new Map<string, number>();
    displayEdges.forEach((edge) => {
      nodeDegrees.set(edge.source, (nodeDegrees.get(edge.source) || 0) + 1);
      nodeDegrees.set(edge.target, (nodeDegrees.get(edge.target) || 0) + 1);
    });

    displayNodes.forEach((node) => {
      const categoryConfig = CATEGORY_CONFIG[node.category] || CATEGORY_CONFIG.other;
      const lensColor = node.lensStatus ? LENS_COLORS[node.lensStatus] : LENS_COLORS.unclear;
      const degree = nodeDegrees.get(node.id) || 1;
      
      elements.push({
        data: {
          id: node.id,
          label: node.label,
          displayName: node.displayName, // Full display name for tooltips
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
          platform: node.platform,
          username: node.username || node.meta?.username,
          degree, // Store degree for sizing
          parent: groupByPlatform && node.type === 'account' ? `group-${node.category}` : undefined,
        },
        classes: [node.type, node.lensStatus || 'unclear'].filter(Boolean).join(' '),
      });
    });

    if (groupByPlatform) {
      const categories = new Set(displayNodes.filter(n => n.type === 'account').map(n => n.category));
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

    displayEdges.forEach((edge) => {
      // Determine edge class based on reason for color coding
      const reasonClasses: string[] = [];
      if (edge.reason === 'bio_similarity' || edge.reason === 'similar_bio') {
        reasonClasses.push('reason-bio');
      } else if (edge.reason === 'username_reuse' || edge.reason === 'same_username' || edge.reason === 'similar_username') {
        reasonClasses.push('reason-username');
      } else if (edge.reason === 'image_reuse' || edge.reason === 'same_image') {
        reasonClasses.push('reason-image');
      } else if (edge.reason === 'shared_email') {
        reasonClasses.push('reason-email');
      } else if (edge.reason === 'shared_link' || edge.reason === 'shared_domain') {
        reasonClasses.push('reason-link');
      }
      
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
        classes: reasonClasses.join(' '),
      });
    });

    return elements;
  }, [displayNodes, displayEdges, groupByPlatform]);

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
        // Account nodes - base style
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
            'width': 30,
            'height': 30,
            'shape': 'ellipse',
            'text-opacity': 0, // Hidden by default
            'transition-property': 'text-opacity, width, height, border-width',
            'transition-duration': 150,
          },
        },
        // Low-degree nodes (1-2 connections)
        {
          selector: 'node.account[degree <= 2]',
          style: {
            'width': 28,
            'height': 28,
          },
        },
        // Medium-degree nodes (3-4 connections)
        {
          selector: 'node.account[degree >= 3][degree <= 4]',
          style: {
            'width': 36,
            'height': 36,
          },
        },
        // High-degree nodes (5-7 connections) - larger with emphasis
        {
          selector: 'node.account[degree >= 5][degree <= 7]',
          style: {
            'width': 44,
            'height': 44,
            'border-width': 4,
            'font-size': 10,
          },
        },
        // Very high-degree nodes (8+ connections) - largest
        {
          selector: 'node.account[degree >= 8]',
          style: {
            'width': 52,
            'height': 52,
            'border-width': 5,
            'font-size': 11,
            'font-weight': 'bold',
          },
        },
        // LENS verified nodes - strong highlight with glow effect
        {
          selector: 'node.verified',
          style: {
            'border-color': LENS_COLORS.verified,
            'border-width': 4,
            'background-opacity': 1,
            'overlay-color': LENS_COLORS.verified,
            'overlay-opacity': 0.15,
            'overlay-padding': '4px',
          },
        },
        {
          selector: 'node.likely',
          style: {
            'border-color': LENS_COLORS.likely,
            'border-width': 3,
          },
        },
        {
          selector: 'node.unclear',
          style: {
            'border-color': LENS_COLORS.unclear,
            'border-width': 2,
            'border-style': 'dashed',
            'background-opacity': 0.85,
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
        // Account↔Account correlation edges - base style with width by confidence
        {
          selector: 'edge[source != "identity-root"]',
          style: {
            'line-style': 'solid',
            'z-index': 10,
            'line-color': '#64748b', // Default slate, overridden by reason classes
          },
        },
        // High confidence edges (>= 80)
        {
          selector: 'edge[source != "identity-root"][confidence >= 80]',
          style: {
            'width': 3.5,
            'line-opacity': 0.85,
          },
        },
        // Medium-high confidence edges (70-80)
        {
          selector: 'edge[source != "identity-root"][confidence >= 70][confidence < 80]',
          style: {
            'width': 2.5,
            'line-opacity': 0.7,
          },
        },
        // Medium confidence edges (60-70)
        {
          selector: 'edge[source != "identity-root"][confidence >= 60][confidence < 70]',
          style: {
            'width': 2,
            'line-opacity': 0.55,
          },
        },
        // Low confidence edges (< 60)
        {
          selector: 'edge[source != "identity-root"][confidence < 60]',
          style: {
            'width': 1.5,
            'line-opacity': 0.4,
            'line-style': 'dashed',
          },
        },
        // === EDGE COLORS BY REASON ===
        // Bio similarity - Blue
        {
          selector: 'edge.reason-bio',
          style: {
            'line-color': '#3b82f6', // blue-500
          },
        },
        // Username reuse - Purple
        {
          selector: 'edge.reason-username',
          style: {
            'line-color': '#8b5cf6', // violet-500
          },
        },
        // Image match - Green
        {
          selector: 'edge.reason-image',
          style: {
            'line-color': '#22c55e', // green-500
          },
        },
        // Email link - Amber
        {
          selector: 'edge.reason-email',
          style: {
            'line-color': '#f59e0b', // amber-500
          },
        },
        // Shared link/domain - Cyan
        {
          selector: 'edge.reason-link',
          style: {
            'line-color': '#06b6d4', // cyan-500
          },
        },
        // Very low confidence - extra faded (applies after reason colors)
        {
          selector: 'edge[source != "identity-root"][confidence < 55]',
          style: {
            'line-opacity': 0.3,
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
        // Correlation edges highlighted on hover (emphasized further)
        {
          selector: 'edge.correlation-highlight',
          style: {
            'line-color': '#2563eb',
            'line-opacity': 0.95,
            'width': 4,
            'z-index': 800,
          },
        },
        // Strong correlation edges in focus mode
        {
          selector: 'edge.strong-correlation',
          style: {
            'line-opacity': 1,
            'width': 4.5,
            'z-index': 900,
          },
        },
        // Identity edges kept faint when non-root is hovered
        {
          selector: 'edge.identity-faint',
          style: {
            'line-opacity': 0.1,
            'width': 0.5,
            'z-index': 0,
          },
        },
      ],
      layout: groupByPlatform 
        ? {
            name: 'cose',
            animate: true,
            animationDuration: 600,
            // High repulsion for grouped mode
            nodeRepulsion: () => 15000,
            idealEdgeLength: () => 150,
            gravity: 0.3,
            nestingFactor: 1.5,
            numIter: 1000,
            // Collision detection via node overlap removal
            nodeOverlap: 50,
            // Cluster interconnected nodes
            edgeElasticity: () => 100,
          }
        : {
            name: 'cose',
            animate: true,
            animationDuration: 600,
            // Increased node repulsion for better spacing
            nodeRepulsion: () => 12000,
            idealEdgeLength: (edge: any) => {
              // Shorter edges for correlation (to cluster connected nodes)
              const isIdentityEdge = edge.data('source') === 'identity-root';
              return isIdentityEdge ? 180 : 80;
            },
            // Lower gravity pushes identity-root slightly off-center
            gravity: 0.25,
            // More iterations for better convergence
            numIter: 1500,
            // Collision detection - minimum spacing between nodes
            nodeOverlap: 40,
            // Edge elasticity - stronger for correlations (pulls connected nodes together)
            edgeElasticity: (edge: any) => {
              const isIdentityEdge = edge.data('source') === 'identity-root';
              return isIdentityEdge ? 45 : 200;
            },
            padding: 60,
            // Randomize initial positions for varied layouts
            randomize: false,
            // Component spacing
            componentSpacing: 120,
          },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    // ========== HOVER HANDLERS ==========

    // Node hover - prioritize correlation edges
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      if (node.data('isGroup')) return;

      // Clear previous hover classes
      cy.elements().removeClass('hovered neighbor unhovered correlation-highlight identity-faint');
      
      // Add hover class to the node
      node.addClass('hovered');
      
      const connectedEdges = node.connectedEdges();
      const isRootNode = node.id() === 'identity-root';
      
      // Separate correlation edges from identity edges
      const correlationEdges = connectedEdges.filter((edge: cytoscape.EdgeSingular) => 
        edge.data('source') !== 'identity-root' && edge.data('target') !== 'identity-root'
      );
      const identityEdges = connectedEdges.filter((edge: cytoscape.EdgeSingular) => 
        edge.data('source') === 'identity-root' || edge.data('target') === 'identity-root'
      );
      
      // Highlight correlation edges first (stronger)
      correlationEdges.addClass('neighbor correlation-highlight');
      correlationEdges.connectedNodes().addClass('neighbor');
      
      // Keep identity edges faint unless root is selected
      if (isRootNode) {
        identityEdges.addClass('neighbor');
        identityEdges.connectedNodes().addClass('neighbor');
      } else {
        identityEdges.addClass('identity-faint');
      }
      
      // Dim unrelated elements
      const relatedElements = node.union(correlationEdges).union(correlationEdges.connectedNodes());
      if (isRootNode) {
        cy.elements().not(node).not(connectedEdges).not(connectedEdges.connectedNodes()).addClass('unhovered');
      } else {
        cy.elements().not(relatedElements).not(identityEdges).addClass('unhovered');
      }

      // Show tooltip with displayName (never shows "Unknown")
      const pos = node.renderedPosition();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const displayName = node.data('displayName') || node.data('label') || 'Profile';
        const username = node.data('username');
        const confidence = node.data('confidence');
        
        setTooltipData({
          x: containerRect.left + pos.x,
          y: containerRect.top + pos.y - 50,
          type: 'node',
          content: {
            displayName,
            username: displayName.includes(username) ? undefined : username, // Avoid duplication
            confidence,
          },
        });
      }
    });

    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('hovered neighbor unhovered correlation-highlight identity-faint');
      setTooltipData(null);
    });

    // Edge hover
    cy.on('mouseover', 'edge', (evt) => {
      const edge = evt.target;
      
      cy.elements().removeClass('hovered neighbor unhovered correlation-highlight identity-faint');
      edge.addClass('hovered');
      edge.connectedNodes().addClass('neighbor');
      cy.elements().not(edge).not(edge.connectedNodes()).addClass('unhovered');

      // Show edge tooltip
      const midpoint = edge.midpoint();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const reasonLabel = edge.data('reasonLabel') || EDGE_REASON_CONFIG[edge.data('reason') as keyof typeof EDGE_REASON_CONFIG]?.label || 'Connection';
        setTooltipData({
          x: containerRect.left + midpoint.x,
          y: containerRect.top + midpoint.y - 30,
          type: 'edge',
          content: {
            displayName: reasonLabel,
            reason: edge.data('details'),
            confidence: edge.data('confidence'),
          },
        });
      }
    });

    cy.on('mouseout', 'edge', () => {
      cy.elements().removeClass('hovered neighbor unhovered correlation-highlight identity-faint');
      setTooltipData(null);
    });

    // ========== CLICK HANDLERS ==========

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (node.data('isGroup')) return;
      
      const nodeId = node.id();
      const graphNode: GraphNode = {
        id: nodeId,
        type: node.data('type'),
        label: node.data('label'),
        displayName: node.data('displayName') || node.data('label') || 'Profile',
        platform: node.data('platform'),
        username: node.data('username'),
        category: node.data('category'),
        url: node.data('url'),
        imageUrl: node.data('imageUrl'),
        confidence: node.data('confidence'),
        lensStatus: node.data('lensStatus'),
        meta: node.data('meta'),
        result: node.data('result'),
      };
      
      // Trigger focus mode on click (toggle if already focused)
      if (nodeId !== 'identity-root') {
        setInternalFocusedId(prev => prev === nodeId ? null : nodeId);
        onFocusNode?.(nodeId);
      }
      
      onNodeClick(graphNode);
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        // Clear focus when clicking background
        setInternalFocusedId(null);
        onFocusNode?.(null);
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
        displayName: node.data('displayName') || node.data('label') || 'Profile',
        platform: node.data('platform'),
        username: node.data('username'),
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
  }, [displayNodes, displayEdges, groupByPlatform, buildElements, onNodeClick, onNodeDoubleClick, onFocusNode]);

  // Handle focus mode - prioritize correlation edges
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass('dimmed highlighted focused strong-correlation');

    if (!activeFocusedId) return;

    const focusedNode = cy.getElementById(activeFocusedId);
    if (!focusedNode.length) return;

    const connectedEdges = focusedNode.connectedEdges();
    const connectedNodes = connectedEdges.connectedNodes();
    
    // Separate correlation edges (account↔account) from identity edges
    const correlationEdges = connectedEdges.filter((edge: cytoscape.EdgeSingular) => 
      edge.data('source') !== 'identity-root' && edge.data('target') !== 'identity-root'
    );
    const identityEdges = connectedEdges.filter((edge: cytoscape.EdgeSingular) => 
      edge.data('source') === 'identity-root' || edge.data('target') === 'identity-root'
    );
    
    // Get strongest correlation edges (confidence >= 70)
    const strongEdges = correlationEdges.filter((edge: cytoscape.EdgeSingular) => 
      edge.data('confidence') >= 70
    );
    
    // Get neighbors via correlation edges (not identity)
    const correlationNeighbors = correlationEdges.connectedNodes().not(focusedNode);
    
    // Get second-degree via strong correlations
    const secondDegreeEdges = correlationNeighbors.connectedEdges().filter((edge: cytoscape.EdgeSingular) => 
      edge.data('source') !== 'identity-root' && edge.data('target') !== 'identity-root'
    );
    const secondDegreeNodes = secondDegreeEdges.connectedNodes();

    // Dim everything first
    cy.elements().addClass('dimmed');
    
    // Highlight focused node
    focusedNode.removeClass('dimmed').addClass('focused');
    
    // Highlight correlation edges and their neighbors strongly
    correlationEdges.removeClass('dimmed').addClass('highlighted');
    strongEdges.addClass('strong-correlation');
    correlationNeighbors.removeClass('dimmed').addClass('highlighted');
    
    // Show identity edges but keep them subtle
    identityEdges.removeClass('dimmed');
    
    // Show second-degree nodes (less emphasis)
    secondDegreeNodes.removeClass('dimmed');
    
    // Animate to focused node
    cy.animate({
      center: { eles: focusedNode },
      zoom: 1.5,
      duration: 300,
    });
  }, [activeFocusedId]);

  // Clear focus handler
  const handleClearFocus = useCallback(() => {
    setInternalFocusedId(null);
    onFocusNode?.(null);
    
    const cy = cyRef.current;
    if (cy) {
      cy.elements().removeClass('dimmed highlighted focused strong-correlation');
      cy.fit(undefined, 30);
    }
  }, [onFocusNode]);

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

  const handleRelayout = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    
    // Re-run the layout with fresh random positions
    cy.layout({
      name: 'cose',
      animate: true,
      animationDuration: 800,
      nodeRepulsion: () => 12000,
      idealEdgeLength: (edge: any) => {
        const isIdentityEdge = edge.data('source') === 'identity-root';
        return isIdentityEdge ? 180 : 80;
      },
      gravity: 0.25,
      numIter: 1500,
      nodeOverlap: 40,
      edgeElasticity: (edge: any) => {
        const isIdentityEdge = edge.data('source') === 'identity-root';
        return isIdentityEdge ? 45 : 200;
      },
      padding: 60,
      randomize: true, // Randomize for fresh layout
      componentSpacing: 120,
    } as any).run();
  }, []);

  return (
    <div className={cn('relative flex flex-col h-full', className)}>
      {/* Top Controls Bar - Search + Show All + Status */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-2 pointer-events-none">
        {/* Search Input */}
        <div className="relative pointer-events-auto">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search platform or username..."
            className="h-8 w-48 pl-7 pr-2 text-xs bg-background/95 backdrop-blur-sm border-border"
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

        {/* Search Results Badge */}
        {searchQuery && (
          <Badge variant="secondary" className="pointer-events-auto text-xs h-6">
            {searchMatchCount} found
          </Badge>
        )}

        {/* Neighborhood Status / Show All Toggle */}
        {!searchQuery && hiddenCount > 0 && (
          <div className="flex items-center gap-2 pointer-events-auto">
            <Badge 
              variant={showAllNodes ? "default" : "secondary"} 
              className="text-xs h-6 cursor-pointer"
              onClick={() => setShowAllNodes(!showAllNodes)}
            >
              {showAllNodes ? (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Showing all {data.nodes.filter(n => n.type === 'account').length}
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Top {NEIGHBORHOOD_SIZE} • {hiddenCount} hidden
                </>
              )}
            </Badge>
          </div>
        )}

        {/* Focus Mode Badge - Centered */}
        {activeFocusedId && (
          <div className="flex-1 flex justify-center pointer-events-auto">
            <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-lg text-xs font-medium">
              <Focus className="h-3 w-3" />
              <span>Focus Mode</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-primary-foreground/20 rounded-full ml-0.5"
                onClick={handleClearFocus}
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

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
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRelayout}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Re-layout Graph</TooltipContent>
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
                <div className="font-semibold">{tooltipData.content.displayName}</div>
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
                <div className="font-semibold">{tooltipData.content.displayName}</div>
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
