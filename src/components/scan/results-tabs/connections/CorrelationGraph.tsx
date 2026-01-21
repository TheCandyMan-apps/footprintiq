import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { 
  GraphNode, CorrelationGraphData, 
  CATEGORY_CONFIG, EDGE_REASON_CONFIG 
} from '@/hooks/useCorrelationGraph';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Focus, RefreshCw, X, Search, Eye, Expand, Shrink, Zap, Info, List } from 'lucide-react';
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
import { NodeListPanel } from './NodeListPanel';

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

// Edge colors by reason (priority order for multi-reason edges)
const EDGE_REASON_COLORS: Record<string, { color: string; label: string; priority: number }> = {
  image_reuse: { color: '#22c55e', label: 'Image Match', priority: 1 },     // green-500
  same_image: { color: '#22c55e', label: 'Image Match', priority: 1 },
  username_reuse: { color: '#8b5cf6', label: 'Username Reuse', priority: 2 }, // violet-500
  same_username: { color: '#8b5cf6', label: 'Username Reuse', priority: 2 },
  similar_username: { color: '#8b5cf6', label: 'Username Reuse', priority: 2 },
  shared_link: { color: '#f97316', label: 'Shared Link', priority: 3 },      // orange-500
  shared_domain: { color: '#f97316', label: 'Shared Link', priority: 3 },
  bio_similarity: { color: '#3b82f6', label: 'Bio Similarity', priority: 4 }, // blue-500
  similar_bio: { color: '#3b82f6', label: 'Bio Similarity', priority: 4 },
  shared_email: { color: '#f59e0b', label: 'Shared Email', priority: 5 },    // amber-500
};

// Default: show identity + top N strongest connected accounts (Curated View)
const CURATED_SIZE = 12;

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
  const [curatedView, setCuratedView] = useState(true); // Curated view is default
  const [searchQuery, setSearchQuery] = useState('');
  const [showStrongestOnly, setShowStrongestOnly] = useState(true); // Default ON
  const [focusHops, setFocusHops] = useState<1 | 2>(1); // 1-hop or 2-hop neighborhood
  const [isZoomedIn, setIsZoomedIn] = useState(false); // Track zoom level for label hint
  const [showNodeList, setShowNodeList] = useState<boolean | null>(null); // null = auto (show when labels off)
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    type: 'node' | 'edge';
    content: { 
      displayName: string; 
      confidencePct?: number; 
      reason?: string; 
      isMultiReason?: boolean;
      // Enhanced node tooltip fields
      platform?: string;
      username?: string;
      domain?: string;
      connectionReasons?: string[];
    };
  } | null>(null);

  // Use external focusedNodeId if provided, otherwise use internal state
  const activeFocusedId = focusedNodeId ?? internalFocusedId;

  // Minimum confidence for "strongest edges only" filter
  const STRONG_EDGE_THRESHOLD = 60;

  // Compute curated view: identity-root + top 12 accounts by correlation weight, then degree
  const { curatedNodes, curatedEdges, totalAccountCount, curatedCount } = useMemo(() => {
    const accountNodes = data.nodes.filter(n => n.type === 'account');
    const totalCount = accountNodes.length;
    
    // If showing all or fewer than curated size, return all
    if (!curatedView || totalCount <= CURATED_SIZE) {
      const edges = showStrongestOnly 
        ? data.edges.filter(e => e.source === 'identity-root' || e.confidence >= STRONG_EDGE_THRESHOLD)
        : data.edges;
      return { 
        curatedNodes: data.nodes, 
        curatedEdges: edges,
        totalAccountCount: totalCount,
        curatedCount: totalCount,
      };
    }

    // Calculate node scores: correlation weight (primary) + degree (secondary)
    const nodeCorrelationWeight = new Map<string, number>();
    const nodeDegree = new Map<string, number>();

    data.edges.forEach(edge => {
      // Count degree for all edges
      nodeDegree.set(edge.source, (nodeDegree.get(edge.source) || 0) + 1);
      nodeDegree.set(edge.target, (nodeDegree.get(edge.target) || 0) + 1);
      
      // Track max correlation weight (exclude identity edges)
      if (edge.source !== 'identity-root' && edge.target !== 'identity-root') {
        const weight = edge.weight || edge.confidence / 100;
        nodeCorrelationWeight.set(edge.source, Math.max(nodeCorrelationWeight.get(edge.source) || 0, weight));
        nodeCorrelationWeight.set(edge.target, Math.max(nodeCorrelationWeight.get(edge.target) || 0, weight));
      }
    });

    // Sort accounts by: 1) highest correlation weight, 2) highest degree (fallback)
    const sortedAccounts = [...accountNodes].sort((a, b) => {
      const weightA = nodeCorrelationWeight.get(a.id) || 0;
      const weightB = nodeCorrelationWeight.get(b.id) || 0;
      if (weightB !== weightA) return weightB - weightA;
      
      // Fallback to degree centrality
      const degreeA = nodeDegree.get(a.id) || 0;
      const degreeB = nodeDegree.get(b.id) || 0;
      if (degreeB !== degreeA) return degreeB - degreeA;
      
      // Final fallback: confidence
      return b.confidence - a.confidence;
    });

    // Take top N for curated view
    const topAccounts = sortedAccounts.slice(0, CURATED_SIZE);
    const topAccountIds = new Set(topAccounts.map(n => n.id));

    // Include identity-root
    const identityNode = data.nodes.find(n => n.type === 'identity');
    const filteredNodes = identityNode 
      ? [identityNode, ...topAccounts]
      : topAccounts;
    
    // Only include edges where both endpoints are in the curated set
    const nodeIdSet = new Set(filteredNodes.map(n => n.id));
    let filteredEdges = data.edges.filter(e => 
      nodeIdSet.has(e.source) && nodeIdSet.has(e.target)
    );
    
    // Apply strongest edges filter
    if (showStrongestOnly) {
      filteredEdges = filteredEdges.filter(e => 
        e.source === 'identity-root' || e.confidence >= STRONG_EDGE_THRESHOLD
      );
    }

    return {
      curatedNodes: filteredNodes,
      curatedEdges: filteredEdges,
      totalAccountCount: totalCount,
      curatedCount: CURATED_SIZE,
    };
  }, [data, curatedView, showStrongestOnly]);

  // Filter nodes by search query
  const { displayNodes, displayEdges, searchMatchCount } = useMemo(() => {
    if (!searchQuery.trim()) {
      return { 
        displayNodes: curatedNodes, 
        displayEdges: curatedEdges,
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
  }, [data, curatedNodes, curatedEdges, searchQuery]);

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
      
      // Truncate long labels with ellipsis (max 12 chars for graph display)
      const rawLabel = node.label || '';
      const truncatedLabel = rawLabel.length > 12 ? rawLabel.slice(0, 11) + '…' : rawLabel;
      
      elements.push({
        data: {
          id: node.id,
          label: truncatedLabel,
          fullLabel: rawLabel, // Keep full label for tooltips
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
      // Get all reasons for this edge
      const reasons = edge.reasons || [edge.reason];
      const reasonLabels = edge.reasonLabels || [edge.reasonLabel];
      
      // Find the strongest reason (lowest priority number) for edge color
      let strongestReason = edge.reason;
      let strongestPriority = 999;
      
      reasons.forEach((r) => {
        const config = EDGE_REASON_COLORS[r];
        if (config && config.priority < strongestPriority) {
          strongestPriority = config.priority;
          strongestReason = r;
        }
      });
      
      // Determine edge class based on strongest reason for color coding
      const reasonClasses: string[] = [];
      if (strongestReason === 'bio_similarity' || strongestReason === 'similar_bio') {
        reasonClasses.push('reason-bio');
      } else if (strongestReason === 'username_reuse' || strongestReason === 'same_username' || strongestReason === 'similar_username') {
        reasonClasses.push('reason-username');
      } else if (strongestReason === 'image_reuse' || strongestReason === 'same_image') {
        reasonClasses.push('reason-image');
      } else if (strongestReason === 'shared_email') {
        reasonClasses.push('reason-email');
      } else if (strongestReason === 'shared_link' || strongestReason === 'shared_domain') {
        reasonClasses.push('reason-link');
      }
      
      // Build combined tooltip for multi-reason edges
      const tooltipReasons = reasons.length > 1 
        ? reasons.map(r => EDGE_REASON_COLORS[r]?.label || r).join(' + ')
        : edge.reasonLabel;
      
      elements.push({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          reason: edge.reason,
          reasons: reasons,
          reasonLabel: edge.reasonLabel,
          reasonLabels: reasonLabels,
          tooltipReasons: tooltipReasons,
          weight: edge.weight,
          confidence: edge.confidence,
          details: edge.details,
          isMultiReason: reasons.length > 1,
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
        // Identity (root) node - diamond/shield shape, larger, stronger border
        {
          selector: 'node.identity',
          style: {
            'background-color': 'hsl(var(--primary))',
            'border-width': 5,
            'border-color': 'hsl(var(--primary))',
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'font-size': 12,
            'font-weight': 'bold',
            'color': 'hsl(var(--foreground))',
            'text-outline-width': 2.5,
            'text-outline-color': 'hsl(var(--background))',
            'width': 52,
            'height': 52,
            'shape': 'diamond',
            'text-opacity': 1,
            'z-index': 100,
            'transition-property': 'width, height, border-width, opacity',
            'transition-duration': 200,
          },
        },
        // Account nodes - base style (no labels by default)
        {
          selector: 'node.account',
          style: {
            'background-color': 'data(categoryColor)',
            'border-width': 2,
            'border-color': 'data(lensColor)',
            'label': '', // No label by default
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'font-size': 9,
            'color': 'hsl(var(--foreground))',
            'text-outline-width': 1.5,
            'text-outline-color': 'hsl(var(--background))',
            'text-wrap': 'ellipsis',
            'text-max-width': '120px',
            'width': 22,
            'height': 22,
            'shape': 'ellipse',
            'transition-property': 'width, height, border-width, opacity, background-opacity',
            'transition-duration': 200,
          },
        },
        // Low-degree nodes (1-2 connections) - base size
        {
          selector: 'node.account[degree <= 2]',
          style: {
            'width': 20,
            'height': 20,
          },
        },
        // Medium-degree nodes (3-5 connections) - slight increase
        {
          selector: 'node.account[degree >= 3][degree <= 5]',
          style: {
            'width': 26,
            'height': 26,
          },
        },
        // High-degree nodes (6-9 connections) - moderate increase
        {
          selector: 'node.account[degree >= 6][degree <= 9]',
          style: {
            'width': 32,
            'height': 32,
            'border-width': 3,
            'font-size': 9,
          },
        },
        // Very high-degree nodes (10+ connections) - largest but modest
        {
          selector: 'node.account[degree >= 10]',
          style: {
            'width': 38,
            'height': 38,
            'border-width': 3,
            'font-size': 10,
            'font-weight': 'bold',
          },
        },
        // LENS verified nodes - strong highlight with glow effect
        {
          selector: 'node.verified',
          style: {
            'border-color': LENS_COLORS.verified,
            'border-width': 3,
            'background-opacity': 1,
            'overlay-color': LENS_COLORS.verified,
            'overlay-opacity': 0.12,
            'overlay-padding': '3px',
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
            'border-width': 1.5,
            'border-style': 'dashed',
            'background-opacity': 0.8,
          },
        },
        // Hovered node - show label with background
        {
          selector: 'node.hovered',
          style: {
            'label': 'data(label)',
            'width': 32,
            'height': 32,
            'border-width': 3,
            'z-index': 900,
            'font-size': 9,
            'font-weight': 'bold',
            'text-background-color': 'hsl(var(--background))',
            'text-background-opacity': 0.85,
            'text-background-padding': '2px',
          },
        },
        // Hovered edge - thicker and darker
        {
          selector: 'edge.hovered',
          style: {
            'line-color': 'hsl(var(--primary))',
            'line-opacity': 1,
            'width': 4,
            'z-index': 900,
          },
        },
        // Connected to hovered (neighbors) - show labels
        {
          selector: 'node.neighbor',
          style: {
            'label': 'data(label)',
            'opacity': 1,
          },
        },
        {
          selector: 'edge.neighbor',
          style: {
            'line-opacity': 0.7,
            'width': 2,
          },
        },
        // Unhovered state (very dimmed when something is hovered)
        {
          selector: 'node.unhovered',
          style: {
            'opacity': 0.2,
            'label': '',
          },
        },
        {
          selector: 'edge.unhovered',
          style: {
            'opacity': 0.04,
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
        // Base edge styling - very light by default for spotlight effect
        {
          selector: 'edge',
          style: {
            'width': 0.75,
            'line-color': '#94a3b8',
            'line-opacity': 0.08, // Very light by default (zoomed out)
            'curve-style': 'bezier',
            'target-arrow-shape': 'none',
            'label': '', // No labels when zoomed out
            'transition-property': 'line-opacity, width, line-color',
            'transition-duration': 200,
          },
        },
        // Identity→Account edges - straight/haystack for cleaner radial pattern
        {
          selector: 'edge[source = "identity-root"]',
          style: {
            'line-color': '#cbd5e1',
            'line-opacity': 0.05,
            'line-style': 'dashed',
            'width': 0.5,
            'z-index': 1,
            'curve-style': 'straight', // Cleaner radial from center
          },
        },
        // Account↔Account correlation edges - bezier with control point distance
        {
          selector: 'edge[source != "identity-root"]',
          style: {
            'line-style': 'solid',
            'z-index': 10,
            'line-color': '#64748b',
            'line-opacity': 0.1,
            'curve-style': 'bezier',
            'control-point-step-size': 50, // Separate overlapping edges
          },
        },
        // ========== ZOOMED-IN STATE - increased visibility ==========
        {
          selector: 'edge.zoomed-in',
          style: {
            'line-opacity': 0.25,
            'width': 1.25,
          },
        },
        {
          selector: 'edge.zoomed-in[source = "identity-root"]',
          style: {
            'line-opacity': 0.12,
            'width': 0.75,
          },
        },
        {
          selector: 'edge.zoomed-in[source != "identity-root"][confidence >= 70]',
          style: {
            'line-opacity': 0.4,
            'width': 2,
          },
        },
        // High confidence edges (>= 80)
        {
          selector: 'edge[source != "identity-root"][confidence >= 80]',
          style: {
            'width': 1.5,
            'line-opacity': 0.2,
          },
        },
        // Medium-high confidence edges (70-80)
        {
          selector: 'edge[source != "identity-root"][confidence >= 70][confidence < 80]',
          style: {
            'width': 1.25,
            'line-opacity': 0.15,
          },
        },
        // Medium confidence edges (60-70)
        {
          selector: 'edge[source != "identity-root"][confidence >= 60][confidence < 70]',
          style: {
            'width': 1,
            'line-opacity': 0.12,
          },
        },
        // Low confidence edges (< 60)
        {
          selector: 'edge[source != "identity-root"][confidence < 60]',
          style: {
            'width': 0.75,
            'line-opacity': 0.08,
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
        // Shared link/domain - Orange
        {
          selector: 'edge.reason-link',
          style: {
            'line-color': '#f97316', // orange-500
          },
        },
        // Selected states
        {
          selector: 'node:selected',
          style: {
            'label': 'data(label)',
            'overlay-color': 'hsl(var(--primary))',
            'overlay-opacity': 0.2,
            'overlay-padding': '5px',
          },
        },
        // ========== FOCUS MODE - SPOTLIGHT EFFECT ==========
        // Dimmed state for non-neighborhood nodes when focus active (very faded)
        {
          selector: 'node.dimmed',
          style: {
            'opacity': 0.08,
            'label': '',
            'background-opacity': 0.3,
          },
        },
        {
          selector: 'edge.dimmed',
          style: {
            'line-opacity': 0.02,
          },
        },
        // Highlighted state for focused paths - show labels, strong visibility
        {
          selector: 'node.highlighted',
          style: {
            'label': 'data(label)',
            'opacity': 1,
            'border-width': 3,
            'border-color': 'hsl(var(--primary))',
            'z-index': 999,
            'text-background-color': 'hsl(var(--background))',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
          },
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': 'hsl(var(--primary))',
            'line-opacity': 0.9,
            'width': 3.5,
            'z-index': 999,
          },
        },
        // Focused node (the actual focused one) - +40% size, strong border, spotlight
        {
          selector: 'node.focused',
          style: {
            'label': 'data(label)',
            'border-width': 5,
            'border-color': 'hsl(var(--primary))',
            'width': 44, // ~40% larger than base 32
            'height': 44,
            'font-size': 11,
            'font-weight': 'bold',
            'text-background-color': 'hsl(var(--background))',
            'text-background-opacity': 0.9,
            'text-background-padding': '3px',
            'z-index': 1000,
            'overlay-color': 'hsl(var(--primary))',
            'overlay-opacity': 0.15,
            'overlay-padding': '6px',
          },
        },
        // Correlation edges highlighted on hover (emphasized further)
        {
          selector: 'edge.correlation-highlight',
          style: {
            'line-color': '#2563eb',
            'line-opacity': 0.9,
            'width': 3.5,
            'z-index': 800,
          },
        },
        // Strong correlation edges in focus mode - thicker/darker
        {
          selector: 'edge.strong-correlation',
          style: {
            'line-opacity': 1,
            'width': 4,
            'z-index': 900,
          },
        },
        // Identity edges kept faint when non-root is hovered
        {
          selector: 'edge.identity-faint',
          style: {
            'line-opacity': 0.03,
            'width': 0.5,
            'z-index': 0,
          },
        },
        // Neighbor nodes in focus mode - normal size but visible
        {
          selector: 'node.focus-neighbor',
          style: {
            'label': 'data(label)',
            'opacity': 1,
            'background-opacity': 1,
            'text-background-color': 'hsl(var(--background))',
            'text-background-opacity': 0.75,
            'text-background-padding': '2px',
          },
        },
        // Neighbor edges in focus mode - strong visibility
        {
          selector: 'edge.focus-neighbor',
          style: {
            'line-opacity': 0.9,
            'width': 3,
            'z-index': 800,
          },
        },
      ],
      // SherlockEye-style layout: visible islands with whitespace and readable clusters
      layout: groupByPlatform 
        ? {
            name: 'cose',
            animate: true,
            animationDuration: 1000,
            fit: true,
            // Very high repulsion for clean grouped separation
            nodeRepulsion: () => 120000,
            idealEdgeLength: () => 280,
            gravity: 0.03,
            nestingFactor: 2.5,
            numIter: 3000,
            // Strong collision avoidance
            nodeOverlap: 150,
            edgeElasticity: () => 40,
            padding: 80,
            componentSpacing: 300,
            randomize: false,
            coolingFactor: 0.97,
            initialTemp: 500,
            minTemp: 0.5,
          }
        : {
            name: 'cose',
            animate: true,
            animationDuration: 1000,
            fit: true,
            // Significantly increased repulsion for visible islands
            nodeRepulsion: (node: any) => {
              // Identity node has massive repulsion to stay clearly separated
              return node.id() === 'identity-root' ? 350000 : 100000;
            },
            idealEdgeLength: (edge: any) => {
              // Long edges from identity → accounts create clear star pattern
              // Longer correlation edges reduce tight clumps
              const isIdentityEdge = edge.data('source') === 'identity-root';
              return isIdentityEdge ? 400 : 180;
            },
            // Very low gravity - let clusters float as islands
            gravity: 0.02,
            // More iterations for stable, settled layout
            numIter: 4000,
            // Strong overlap removal - prevent node collisions
            nodeOverlap: 200,
            // Moderate elasticity - avoid springy spaghetti
            edgeElasticity: (edge: any) => {
              const isIdentityEdge = edge.data('source') === 'identity-root';
              return isIdentityEdge ? 10 : 80;
            },
            padding: 80,
            randomize: false,
            // Wide component spacing for disconnected clusters (islands)
            componentSpacing: 350,
            // Slower cooling for more stable convergence
            coolingFactor: 0.98,
            initialTemp: 600,
            minTemp: 0.3,
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

      // Show enhanced tooltip with platform, username, domain, confidence, connection reasons
      const pos = node.renderedPosition();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const platform = node.data('platform') || node.data('label') || 'Profile';
        const username = node.data('username') || node.data('meta')?.username;
        const url = node.data('url') || '';
        const confidence = node.data('confidence');
        const confidencePct = typeof confidence === 'number' ? Math.round(confidence * 100) : undefined;
        
        // Extract domain from URL if available
        let domain: string | undefined;
        if (url) {
          try {
            domain = new URL(url).hostname.replace('www.', '');
          } catch {
            domain = undefined;
          }
        }
        
        // Get connection reasons from connected correlation edges
        const connectedEdges = node.connectedEdges();
        const correlationEdges = connectedEdges.filter((edge: cytoscape.EdgeSingular) => 
          edge.data('source') !== 'identity-root' && edge.data('target') !== 'identity-root'
        );
        
        // Collect unique reasons from connected edges
        const reasonSet = new Set<string>();
        correlationEdges.forEach((edge: cytoscape.EdgeSingular) => {
          const reasons = edge.data('reasons') || [edge.data('reason')];
          reasons.forEach((r: string) => {
            const config = EDGE_REASON_COLORS[r];
            if (config) {
              reasonSet.add(config.label);
            }
          });
        });
        const connectionReasons = Array.from(reasonSet).slice(0, 3); // Top 3 reasons
        
        setTooltipData({
          x: containerRect.left + pos.x,
          y: containerRect.top + pos.y - 50,
          type: 'node',
          content: {
            displayName: platform,
            platform,
            username,
            domain,
            confidencePct,
            connectionReasons,
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

      // Show edge tooltip - use tooltipReasons for multi-reason edges
      const midpoint = edge.midpoint();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const tooltipReasons = edge.data('tooltipReasons') || edge.data('reasonLabel') || 'Connection';
        const confidence = edge.data('confidence');
        const confidencePct = typeof confidence === 'number' ? Math.round(confidence) : undefined;
        const details = edge.data('details');
        const isMulti = edge.data('isMultiReason');
        
        setTooltipData({
          x: containerRect.left + midpoint.x,
          y: containerRect.top + midpoint.y - 30,
          type: 'edge',
          content: {
            displayName: tooltipReasons,
            reason: details,
            confidencePct,
            isMultiReason: isMulti,
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

    // ========== ZOOM-BASED EDGE VISIBILITY ==========
    const ZOOM_THRESHOLD = 1.3;
    
    const updateZoomState = () => {
      const zoom = cy.zoom();
      const isZoomed = zoom >= ZOOM_THRESHOLD;
      setIsZoomedIn(isZoomed);
      
      // Add/remove zoomed-in class on edges for visibility boost
      // Don't apply if focus mode is active (focus mode has its own styling)
      if (!activeFocusedId) {
        if (isZoomed) {
          cy.edges().addClass('zoomed-in');
        } else {
          cy.edges().removeClass('zoomed-in');
        }
      }
    };
    
    cy.on('zoom', updateZoomState);
    updateZoomState();

    cyRef.current = cy;

    cy.one('layoutstop', () => {
      cy.fit(undefined, 30);
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [displayNodes, displayEdges, groupByPlatform, buildElements, onNodeClick, onNodeDoubleClick, onFocusNode]);

  // Handle focus mode - prioritize correlation edges with hop-based neighborhood
  // Creates a "spotlight" effect: focused node bright, neighbors visible, rest very dim
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Clear all focus-related classes
    cy.elements().removeClass('dimmed highlighted focused strong-correlation focus-neighbor');

    if (!activeFocusedId) return;

    const focusedNode = cy.getElementById(activeFocusedId);
    if (!focusedNode.length) return;

    const connectedEdges = focusedNode.connectedEdges();
    
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
    
    // Get neighbors via correlation edges (not identity) - 1-hop
    const correlationNeighbors = correlationEdges.connectedNodes().not(focusedNode);
    
    // Get second-degree via strong correlations (2-hop)
    let secondDegreeEdges = cy.collection();
    let secondDegreeNodes = cy.collection();
    
    if (focusHops === 2) {
      secondDegreeEdges = correlationNeighbors.connectedEdges().filter((edge: cytoscape.EdgeSingular) => 
        edge.data('source') !== 'identity-root' && edge.data('target') !== 'identity-root'
      );
      secondDegreeNodes = secondDegreeEdges.connectedNodes().not(focusedNode).not(correlationNeighbors);
    }

    // ========== SPOTLIGHT EFFECT ==========
    // 1. Dim everything first (opacity 0.08 for nodes, 0.02 for edges)
    cy.elements().addClass('dimmed');
    
    // 2. Spotlight the focused node (+40% size, strong border)
    focusedNode.removeClass('dimmed').addClass('focused');
    
    // 3. Neighbor nodes in focus mode - normal size but fully visible with labels
    correlationNeighbors.removeClass('dimmed').addClass('focus-neighbor');
    
    // 4. Neighborhood edges - strong visibility (opacity 0.9, thicker)
    correlationEdges.removeClass('dimmed').addClass('focus-neighbor');
    strongEdges.addClass('strong-correlation');
    
    // 5. Keep identity edges visible but subtle
    identityEdges.removeClass('dimmed');
    
    // 6. Show second-degree nodes if 2-hop mode (but less prominent)
    if (focusHops === 2) {
      secondDegreeNodes.removeClass('dimmed').addClass('highlighted');
      secondDegreeEdges.removeClass('dimmed').addClass('highlighted');
    }
    
    // Animate to focused node with smooth transition
    cy.animate({
      center: { eles: focusedNode },
      zoom: focusHops === 2 ? 1.2 : 1.5,
      duration: 350,
      easing: 'ease-out-cubic',
    });
  }, [activeFocusedId, focusHops]);

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
    
    // Re-run layout with randomized positions for fresh clustering (matching main layout params)
    cy.layout({
      name: 'cose',
      animate: true,
      animationDuration: 1200,
      fit: true,
      // High repulsion for visible islands
      nodeRepulsion: (node: any) => {
        return node.id() === 'identity-root' ? 350000 : 100000;
      },
      idealEdgeLength: (edge: any) => {
        const isIdentityEdge = edge.data('source') === 'identity-root';
        return isIdentityEdge ? 400 : 180;
      },
      gravity: 0.02,
      numIter: 4000,
      nodeOverlap: 200,
      edgeElasticity: (edge: any) => {
        const isIdentityEdge = edge.data('source') === 'identity-root';
        return isIdentityEdge ? 10 : 80;
      },
      padding: 80,
      randomize: true, // Fresh random positions for re-layout
      componentSpacing: 350,
      coolingFactor: 0.98,
      initialTemp: 600,
      minTemp: 0.3,
    } as any).run();
  }, []);
  // Determine if node list should be visible (always show by default since no labels)
  const isNodeListVisible = showNodeList ?? true;

  // Handle node selection from list
  const handleNodeListSelect = useCallback((node: GraphNode) => {
    setInternalFocusedId(node.id);
    onFocusNode?.(node.id);
    onNodeClick(node);
  }, [onFocusNode, onNodeClick]);

  return (
    <div className={cn('relative flex h-full', className)}>
      {/* Main Graph Area */}
      <div className="relative flex-1 flex flex-col">
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

        {/* Curated View Status Pill */}
        {!searchQuery && totalAccountCount > CURATED_SIZE && (
          <div className="flex items-center gap-1.5 pointer-events-auto bg-background/95 backdrop-blur-sm border border-border rounded-full px-3 py-1 shadow-sm">
            <span className="text-xs text-muted-foreground">
              {curatedView ? (
                <>Showing <span className="font-medium text-foreground">{curatedCount}</span> strongest connections ({curatedCount} of {totalAccountCount})</>
              ) : (
                <>Showing <span className="font-medium text-foreground">all {totalAccountCount}</span> connections</>
              )}
            </span>
            
            {curatedView ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-[10px] font-medium text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => setCuratedView(false)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Show all
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setCuratedView(true)}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        )}

        {/* Focus Mode Controls - Centered */}
        {activeFocusedId && (
          <div className="flex-1 flex justify-center pointer-events-auto">
            <div className="flex items-center gap-1.5 bg-primary text-primary-foreground px-2 py-1 rounded-full shadow-lg text-xs font-medium">
              <Focus className="h-3 w-3" />
              <span>Focus: {focusHops}-hop</span>
              
              {/* Hop expansion buttons */}
              {focusHops === 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] hover:bg-primary-foreground/20 rounded-full"
                  onClick={() => setFocusHops(2)}
                >
                  <Expand className="h-2.5 w-2.5 mr-0.5" />
                  2 hops
                </Button>
              )}
              {focusHops === 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] hover:bg-primary-foreground/20 rounded-full"
                  onClick={() => setFocusHops(1)}
                >
                  <Shrink className="h-2.5 w-2.5 mr-0.5" />
                  Collapse
                </Button>
              )}
              
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

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-8 w-8">
                <Switch
                  id="strongest-toggle"
                  checked={showStrongestOnly}
                  onCheckedChange={setShowStrongestOnly}
                  className="h-4 w-7 data-[state=checked]:bg-primary"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {showStrongestOnly ? 'Showing' : 'Show'} Strongest Edges Only
              </div>
            </TooltipContent>
          </Tooltip>

          <div className="w-full h-px bg-border my-0.5" />

          {/* Node List Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isNodeListVisible ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowNodeList(prev => prev === null ? true : !prev)}
              >
                <List className={cn("h-4 w-4", isNodeListVisible && "text-primary")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              <div className="space-y-0.5">
                <div>{isNodeListVisible ? 'Hide' : 'Show'} Node List</div>
                {showNodeList === null && (
                  <div className="text-[10px] text-muted-foreground">Auto-shown when labels off</div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Bottom-right Legend */}
      <div className="absolute bottom-3 right-3 z-10 bg-background/90 backdrop-blur-sm rounded-lg border border-border p-2 shadow-lg max-w-[140px]">
        {/* Edge Colors Legend */}
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
          Connection Type
        </div>
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-[10px]">Image Match</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
            <span className="text-[10px]">Username</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: '#f97316' }} />
            <span className="text-[10px]">Shared Link</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-[10px]">Bio Similarity</span>
          </div>
        </div>
        
        <div className="w-full h-px bg-border my-1.5" />
        
        {/* Node Confidence Legend */}
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
        
        {/* Hover hint */}
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Info className="h-2.5 w-2.5" />
            <span>Hover a node to reveal label</span>
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
              <div className="space-y-1.5">
                {/* Platform/Site name */}
                <div className="font-semibold text-foreground">{tooltipData.content.platform || 'Profile'}</div>
                
                {/* Username/Handle */}
                <div className="text-[10px]">
                  <span className="text-muted-foreground">Handle:</span>{' '}
                  <span className="font-medium">
                    {tooltipData.content.username || 'No username captured'}
                  </span>
                </div>
                
                {/* Domain */}
                {tooltipData.content.domain && (
                  <div className="text-[10px]">
                    <span className="text-muted-foreground">Domain:</span>{' '}
                    <span className="font-medium text-primary/80">{tooltipData.content.domain}</span>
                  </div>
                )}
                
                {/* Confidence */}
                {tooltipData.content.confidencePct !== undefined && (
                  <div className="text-[10px]">
                    <span className="text-muted-foreground">Confidence:</span>{' '}
                    <span className={cn(
                      "font-medium",
                      tooltipData.content.confidencePct >= 80 && "text-green-500",
                      tooltipData.content.confidencePct >= 60 && tooltipData.content.confidencePct < 80 && "text-amber-500",
                      tooltipData.content.confidencePct < 60 && "text-muted-foreground"
                    )}>
                      {tooltipData.content.confidencePct}%
                    </span>
                  </div>
                )}
                
                {/* Connection reasons */}
                {tooltipData.content.connectionReasons && tooltipData.content.connectionReasons.length > 0 && (
                  <div className="text-[10px] pt-1 border-t border-border/50">
                    <span className="text-muted-foreground">Linked by:</span>{' '}
                    <span className="font-medium">{tooltipData.content.connectionReasons.join(', ')}</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="font-semibold">{tooltipData.content.displayName}</div>
                {tooltipData.content.reason && (
                  <div className="text-muted-foreground mt-0.5">{tooltipData.content.reason}</div>
                )}
                {tooltipData.content.confidencePct !== undefined && (
                  <div className="mt-1 text-[10px]">
                    <span className="text-muted-foreground">Strength:</span>{' '}
                    <span className="font-medium">{tooltipData.content.confidencePct}%</span>
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

      {/* Node List Panel - shows when labels are off or manually toggled */}
      {isNodeListVisible && (
        <NodeListPanel
          nodes={displayNodes}
          edges={displayEdges.map(e => ({ source: e.source, target: e.target }))}
          focusedNodeId={activeFocusedId}
          onNodeSelect={handleNodeListSelect}
          className="w-64 shrink-0"
        />
      )}
    </div>
  );
}
