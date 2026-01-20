import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, DataSet } from 'vis-network/standalone';
import { 
  Download, ZoomIn, ZoomOut, Maximize2, 
  Link2, Image, FileText, Users, Info, PanelRightClose, PanelRightOpen, X, Crosshair,
  Bug, AlertCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { ScanResult } from '@/hooks/useScanResultsData';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { useInvestigation } from '@/contexts/InvestigationContext';
import { cn } from '@/lib/utils';
import { useCorrelationGraph, CATEGORY_CONFIG, EDGE_REASON_CONFIG, EdgeReason } from '@/hooks/useCorrelationGraph';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ConnectionsInspector } from './connections/ConnectionsInspector';

interface ConnectionsTabProps {
  results: ScanResult[];
  username: string;
  jobId?: string;
}

type ConnectionReason = 'username_reuse' | 'image_match' | 'bio_similarity' | 'email_link' | 'cross_reference';

const CONNECTION_EXPLANATIONS: Record<ConnectionReason, { label: string; description: string; icon: typeof Link2 }> = {
  username_reuse: { label: 'Username Reuse', description: 'Same or similar username', icon: Link2 },
  image_match: { label: 'Image Match', description: 'Similar profile image', icon: Image },
  bio_similarity: { label: 'Bio Similarity', description: 'Matching bio keywords', icon: FileText },
  email_link: { label: 'Email Link', description: 'Shared email address', icon: Users },
  cross_reference: { label: 'Cross-Reference', description: 'Profile references another', icon: Link2 },
};

const CONNECTION_SUMMARY: Record<ConnectionReason, string> = {
  username_reuse: 'username matches',
  image_match: 'image similarities',
  bio_similarity: 'bio keyword overlap',
  email_link: 'shared email addresses',
  cross_reference: 'profile cross-references',
};

export function ConnectionsTab({ results, username, jobId }: ConnectionsTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const nodesDataset = useRef<DataSet<any> | null>(null);
  const edgesDataset = useRef<DataSet<any> | null>(null);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(() => window.innerWidth >= 768);
  const [localVerificationResults, setLocalVerificationResults] = useState<Map<string, LensVerificationResult>>(new Map());
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Use global investigation context for focus state
  const { focusedEntityId, setFocusedEntity, verifiedEntities } = useInvestigation();

  // Use the correlation graph hook - THIS IS THE SOURCE OF TRUTH
  const correlationData = useCorrelationGraph(results, username, verifiedEntities);
  
  // Stats from correlation data
  const correlationStats = useMemo(() => ({
    totalNodes: correlationData.stats.totalNodes,
    totalEdges: correlationData.stats.totalEdges,
    identityEdges: correlationData.stats.identityEdges,
    correlationEdges: correlationData.stats.correlationEdges,
    hasCorrelations: correlationData.stats.correlationEdges > 0,
    byReason: correlationData.stats.byReason,
    byCategory: correlationData.stats.byCategory,
  }), [correlationData.stats]);

  // Get selected profile from correlation data nodes
  const selectedProfile = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = correlationData.nodes.find(n => n.id === selectedNodeId);
    return node?.result || null;
  }, [selectedNodeId, correlationData.nodes]);

  // Get focused profile
  const focusedProfile = useMemo(() => {
    if (!focusedEntityId) return null;
    const node = correlationData.nodes.find(n => n.result?.id === focusedEntityId);
    return node?.result || null;
  }, [focusedEntityId, correlationData.nodes]);

  // Category stats for the legend
  const categoryStats = useMemo(() => {
    return correlationData.stats.byCategory;
  }, [correlationData.stats.byCategory]);

  // Connection stats for inspector
  const connectionStats = useMemo(() => {
    const stats: Record<ConnectionReason, number> = {
      username_reuse: 0, image_match: 0, bio_similarity: 0, email_link: 0, cross_reference: 0
    };
    // Map from edge reasons to connection reasons
    const reasonMap: Record<string, ConnectionReason> = {
      username_reuse: 'username_reuse',
      same_username: 'username_reuse',
      similar_username: 'username_reuse',
      image_reuse: 'image_match',
      same_image: 'image_match',
      bio_similarity: 'bio_similarity',
      similar_bio: 'bio_similarity',
      shared_email: 'email_link',
      shared_link: 'cross_reference',
      shared_domain: 'cross_reference',
      cross_reference: 'cross_reference',
    };
    Object.entries(correlationData.stats.byReason).forEach(([reason, count]) => {
      const mapped = reasonMap[reason];
      if (mapped) stats[mapped] += count;
    });
    return stats;
  }, [correlationData.stats.byReason]);

  // Generate explanation summary
  const explanationSummary = useMemo(() => {
    const reasons = Object.entries(connectionStats)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([reason]) => CONNECTION_SUMMARY[reason as ConnectionReason]);
    
    if (reasons.length === 0) return 'Connected by identity signals';
    if (reasons.length === 1) return `Linked primarily by ${reasons[0]}`;
    return `Linked by ${reasons[0]} and ${reasons[1]}`;
  }, [connectionStats]);

  const handleFocusNode = useCallback((nodeId: string | null) => {
    if (nodeId === null || nodeId === 'identity-root') {
      setFocusedEntity(null);
    } else {
      const node = correlationData.nodes.find(n => n.id === nodeId);
      const entityId = node?.result?.id;
      if (entityId) {
        setFocusedEntity(focusedEntityId === entityId ? null : entityId);
      }
    }
  }, [setFocusedEntity, correlationData.nodes, focusedEntityId]);

  const handleClearFocus = useCallback(() => {
    setFocusedEntity(null);
  }, [setFocusedEntity]);

  const handleVerificationComplete = useCallback((result: LensVerificationResult) => {
    if (selectedProfile) {
      setLocalVerificationResults(prev => {
        const next = new Map(prev);
        next.set(selectedProfile.id, result);
        return next;
      });
    }
  }, [selectedProfile]);

  const exportAsImage = async () => {
    if (networkRef.current) {
      const canvas = await html2canvas(networkRef.current);
      const link = document.createElement('a');
      link.download = `connections-${username}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const zoomIn = () => {
    networkInstance.current?.moveTo({ scale: (networkInstance.current.getScale() || 1) * 1.2 });
  };

  const zoomOut = () => {
    networkInstance.current?.moveTo({ scale: (networkInstance.current.getScale() || 1) * 0.8 });
  };

  const fitNetwork = () => {
    networkInstance.current?.fit({ animation: true });
  };

  // Update node/edge styles when focus changes
  useEffect(() => {
    if (!nodesDataset.current || !edgesDataset.current) return;

    const nodes = nodesDataset.current;
    const edges = edgesDataset.current;

    // Find the focused node ID from the entity ID
    const focusedNode = correlationData.nodes.find(n => n.result?.id === focusedEntityId);
    const focusedNodeId = focusedNode?.id || null;

    if (!focusedNodeId) {
      // Reset all nodes/edges to default
      correlationData.nodes.forEach((graphNode) => {
        const categoryColor = CATEGORY_CONFIG[graphNode.category]?.color || '#6b7280';
        nodes.update({
          id: graphNode.id,
          opacity: 1,
          color: graphNode.type === 'identity' 
            ? { background: 'hsl(var(--primary))', border: 'hsl(var(--primary))' }
            : { background: categoryColor, border: categoryColor, highlight: { background: categoryColor, border: '#ffffff' } },
          size: graphNode.type === 'identity' ? 30 : 18,
          borderWidth: 2,
        });
      });
      correlationData.edges.forEach((graphEdge) => {
        const isIdentityEdge = graphEdge.source === 'identity-root' || graphEdge.target === 'identity-root';
        edges.update({
          id: graphEdge.id,
          color: { 
            color: isIdentityEdge ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
            opacity: isIdentityEdge ? 0.15 : 0.6,
          },
          width: isIdentityEdge ? 0.75 : 2 + graphEdge.weight * 2,
          dashes: isIdentityEdge,
        });
      });
    } else {
      // Find all edges connected to focused node
      const connectedEdgeIds = new Set<string>();
      const connectedNodeIds = new Set<string>([focusedNodeId]);
      
      // Find correlation edges (account↔account) connected to focused node first
      correlationData.edges.forEach(edge => {
        const isCorrelation = edge.source !== 'identity-root' && edge.target !== 'identity-root';
        if (isCorrelation && (edge.source === focusedNodeId || edge.target === focusedNodeId)) {
          connectedEdgeIds.add(edge.id);
          connectedNodeIds.add(edge.source);
          connectedNodeIds.add(edge.target);
        }
      });
      
      // Also include identity edge to focused node
      correlationData.edges.forEach(edge => {
        if ((edge.source === focusedNodeId && edge.target === 'identity-root') ||
            (edge.target === focusedNodeId && edge.source === 'identity-root')) {
          connectedEdgeIds.add(edge.id);
        }
      });
      connectedNodeIds.add('identity-root');

      // Update nodes
      correlationData.nodes.forEach((graphNode) => {
        const isConnected = connectedNodeIds.has(graphNode.id);
        const isFocused = graphNode.id === focusedNodeId;
        const categoryColor = CATEGORY_CONFIG[graphNode.category]?.color || '#6b7280';
        
        nodes.update({
          id: graphNode.id,
          opacity: isConnected ? 1 : 0.25,
          color: graphNode.type === 'identity' 
            ? { background: 'hsl(var(--primary))', border: 'hsl(var(--primary))' }
            : {
                background: isConnected ? categoryColor : `${categoryColor}40`,
                border: isFocused ? '#ffffff' : categoryColor,
                highlight: { background: categoryColor, border: '#ffffff' }
              },
          size: isFocused ? 26 : (graphNode.type === 'identity' ? 30 : (isConnected ? 18 : 12)),
          borderWidth: isFocused ? 3 : 2,
        });
      });

      // Update edges
      correlationData.edges.forEach((graphEdge) => {
        const isConnected = connectedEdgeIds.has(graphEdge.id);
        const isIdentityEdge = graphEdge.source === 'identity-root' || graphEdge.target === 'identity-root';
        
        edges.update({
          id: graphEdge.id,
          color: { 
            color: isConnected 
              ? (isIdentityEdge ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))')
              : 'hsl(var(--muted-foreground))',
            opacity: isConnected ? (isIdentityEdge ? 0.4 : 1) : 0.1,
          },
          width: isConnected ? (isIdentityEdge ? 1 : 3 + graphEdge.weight * 2) : 0.5,
          dashes: isIdentityEdge,
        });
      });

      // Center on focused node
      networkInstance.current?.focus(focusedNodeId, {
        scale: 1.5,
        animation: { duration: 300, easingFunction: 'easeInOutQuad' }
      });
    }
  }, [focusedEntityId, correlationData.nodes, correlationData.edges]);

  // Responsive inspector toggle
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setInspectorOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Build the network from correlationData
  useEffect(() => {
    if (!networkRef.current || correlationData.nodes.length === 0) return;

    const nodes = new DataSet<any>([]);
    const edges = new DataSet<any>([]);
    nodesDataset.current = nodes;
    edgesDataset.current = edges;

    // === MAP correlationData.nodes TO vis-network nodes ===
    correlationData.nodes.forEach((graphNode) => {
      const categoryColor = CATEGORY_CONFIG[graphNode.category]?.color || '#6b7280';
      
      if (graphNode.type === 'identity') {
        // Identity node: box shape, fixed at center, larger
        nodes.add({
          id: graphNode.id,
          label: `🔍 ${graphNode.label}`,
          shape: 'box',
          color: { background: 'hsl(var(--primary))', border: 'hsl(var(--primary))' },
          font: { size: 14, color: 'hsl(var(--primary-foreground))', bold: true },
          size: 30,
          mass: 5,
          fixed: { x: true, y: true },
          x: 0,
          y: 0,
        });
      } else {
        // Account node: dot shape, color by category, size by confidence
        const confidenceSize = 14 + (graphNode.confidence / 100) * 8; // 14-22 range
        
        const tooltipLines = [
          `📍 ${graphNode.platform || graphNode.label}`,
          graphNode.lensStatus ? `✓ ${graphNode.lensStatus}` : null,
          graphNode.meta?.username ? `@${graphNode.meta.username}` : null,
          graphNode.meta?.bio ? `Bio: "${String(graphNode.meta.bio).substring(0, 40)}..."` : null,
        ].filter(Boolean);

        nodes.add({
          id: graphNode.id,
          label: graphNode.platform || graphNode.label,
          shape: 'dot',
          color: {
            background: categoryColor,
            border: categoryColor,
            highlight: { background: categoryColor, border: '#ffffff' }
          },
          size: confidenceSize,
          title: tooltipLines.join('\n'),
          font: { size: 10, color: '#ffffff', strokeWidth: 2, strokeColor: '#000000' }
        });
      }
    });

    // === MAP correlationData.edges TO vis-network edges ===
    correlationData.edges.forEach((graphEdge) => {
      const isIdentityEdge = graphEdge.source === 'identity-root' || graphEdge.target === 'identity-root';
      
      // Edge styling based on type
      let edgeColor: string;
      let edgeOpacity: number;
      let edgeWidth: number;
      let dashes: boolean;
      
      if (isIdentityEdge) {
        // Identity edges: thinner, lower opacity, dashed
        edgeColor = 'hsl(var(--muted-foreground))';
        edgeOpacity = 0.15;
        edgeWidth = 0.75;
        dashes = true;
      } else {
        // Correlation edges: thicker, higher opacity, based on weight
        edgeColor = 'hsl(var(--foreground))';
        edgeOpacity = 0.5 + graphEdge.weight * 0.4; // 0.5-0.9 range
        edgeWidth = 1.5 + graphEdge.weight * 2.5; // 1.5-4 range
        dashes = graphEdge.reason === 'bio_similarity' || graphEdge.reason === 'similar_bio';
      }

      // Build tooltip with reason + confidence
      const reasonConfig = EDGE_REASON_CONFIG[graphEdge.reason as EdgeReason];
      const tooltipText = graphEdge.details || 
        `${reasonConfig?.label || graphEdge.reason} (${Math.round(graphEdge.confidence)}%)`;

      edges.add({
        id: graphEdge.id,
        from: graphEdge.source,
        to: graphEdge.target,
        color: { color: edgeColor, opacity: edgeOpacity, highlight: 'hsl(var(--primary))' },
        width: edgeWidth,
        dashes,
        title: tooltipText,
        smooth: { enabled: true, type: 'curvedCW', roundness: isIdentityEdge ? 0.1 : 0.25 },
        arrows: isIdentityEdge ? undefined : { to: { enabled: false } },
      });
    });

    const options = {
      nodes: { borderWidth: 2, shadow: { enabled: true, size: 5, x: 1, y: 1 } },
      edges: { smooth: { enabled: true, type: 'curvedCW', roundness: 0.2 }, shadow: true },
      physics: {
        enabled: true,
        stabilization: { iterations: 150, fit: true },
        barnesHut: { 
          gravitationalConstant: -3000, 
          centralGravity: 0.4, 
          springLength: 180, 
          springConstant: 0.03, 
          damping: 0.3 
        },
      },
      interaction: { hover: true, tooltipDelay: 50, zoomView: true, dragView: true },
      layout: { improvedLayout: true }
    };

    if (networkInstance.current) networkInstance.current.destroy();
    networkInstance.current = new Network(networkRef.current, { nodes, edges }, options);

    networkInstance.current.once('stabilizationIterationsDone', () => {
      networkInstance.current?.fit({
        animation: { duration: 400, easingFunction: 'easeInOutQuad' }
      });
    });

    // Click to select node and open inspector
    networkInstance.current.on('click', (params) => {
      if (params.nodes.length > 0 && params.nodes[0] !== 'identity-root') {
        setSelectedNodeId(params.nodes[0]);
        setInspectorOpen(true);
      } else {
        setSelectedNodeId(null);
      }
    });

    // Double-click to open profile URL
    networkInstance.current.on('doubleClick', (params) => {
      if (params.nodes.length > 0 && params.nodes[0] !== 'identity-root') {
        const node = correlationData.nodes.find(n => n.id === params.nodes[0]);
        if (node?.url) window.open(node.url, '_blank');
      }
    });

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [correlationData.nodes, correlationData.edges, username]);

  // Empty state
  if (correlationData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Users className="w-8 h-8 mr-2 opacity-50" />
        No profiles found to visualize.
      </div>
    );
  }

  const accountNodes = correlationData.nodes.filter(n => n.type === 'account');

  return (
    <div ref={containerRef} className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
      {/* Debug Status Line */}
      <div className="flex items-center gap-3 px-3 py-1 bg-muted/20 border-b border-border/50 text-[10px] font-mono text-muted-foreground">
        <span>Nodes: <strong className="text-foreground">{correlationStats.totalNodes}</strong></span>
        <span>•</span>
        <span>Identity edges: <strong className="text-foreground">{correlationStats.identityEdges}</strong></span>
        <span>•</span>
        <span className={cn(correlationStats.correlationEdges === 0 && 'text-amber-600')}>
          Correlations: <strong className={cn(correlationStats.correlationEdges > 0 ? 'text-foreground' : 'text-amber-600')}>
            {correlationStats.correlationEdges}
          </strong>
        </span>
        {showDebugPanel && correlationStats.correlationEdges > 0 && (
          <span className="ml-auto text-muted-foreground/60">
            {Object.entries(correlationStats.byReason)
              .filter(([reason, count]) => count > 0 && reason !== 'identity_search')
              .map(([reason, count]) => `${reason}:${count}`)
              .join(', ') || 'none'}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 ml-auto"
          onClick={() => setShowDebugPanel(!showDebugPanel)}
        >
          <Bug className={cn("w-2.5 h-2.5", showDebugPanel && "text-amber-500")} />
        </Button>
      </div>

      {/* Empty state for no correlations - still show graph but with message */}
      {correlationStats.correlationEdges === 0 ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Warning banner */}
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>No cross-account correlations detected. Graph shows identity→account links only.</span>
          </div>
          
          {/* Still show the graph */}
          <div className="flex flex-1 min-h-0">
            <div
              ref={networkRef}
              className="flex-1 bg-gradient-to-br from-background to-muted/20"
              style={{ cursor: 'grab' }}
            />
            <ConnectionsInspector
              isOpen={inspectorOpen}
              onClose={() => setInspectorOpen(false)}
              selectedProfile={selectedProfile}
              username={username}
              categoryStats={categoryStats}
              connectionStats={connectionStats}
              totalProfiles={accountNodes.length}
              scanId={jobId}
              isFocused={selectedProfile ? focusedEntityId === selectedProfile.id : false}
              onFocus={() => selectedNodeId && handleFocusNode(selectedNodeId)}
              verificationResult={selectedProfile ? (verifiedEntities.get(selectedProfile.id) || localVerificationResults.get(selectedProfile.id)) : null}
              onVerificationComplete={handleVerificationComplete}
              lensScore={75}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Compact Explanation Bar */}
          <div className="flex items-center justify-between gap-2 px-2 py-1 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help">
                      <Info className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="truncate">
                        <strong className="text-foreground">{accountNodes.length}</strong> profiles · 
                        <strong className="text-foreground ml-1">{correlationStats.correlationEdges}</strong> correlations · {explanationSummary}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs">
                      This graph shows identity connections across platforms based on username reuse, image matches, bio similarities, or cross-references.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Focus indicator */}
              {focusedEntityId && focusedProfile && (
                <Badge 
                  variant="default" 
                  className="h-5 gap-1 text-[10px] cursor-pointer hover:bg-primary/80"
                  onClick={handleClearFocus}
                >
                  <Crosshair className="w-2.5 h-2.5" />
                  Focused: {focusedProfile.site}
                  <X className="w-2.5 h-2.5" />
                </Badge>
              )}

              {/* Compact category dots */}
              <div className="hidden sm:flex items-center gap-1 ml-auto">
                {Object.entries(categoryStats)
                  .filter(([_, count]) => count > 0)
                  .slice(0, 5)
                  .map(([category]) => (
                    <div
                      key={category}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_CONFIG[category]?.color || '#6b7280' }}
                      title={CATEGORY_CONFIG[category]?.label || category}
                    />
                  ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-0.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setShowDebugPanel(!showDebugPanel)}
                      variant={showDebugPanel ? "secondary" : "ghost"}
                      size="icon"
                      className="h-6 w-6"
                    >
                      <Bug className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">{showDebugPanel ? 'Hide' : 'Show'} debug panel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button onClick={zoomIn} variant="ghost" size="icon" className="h-6 w-6" title="Zoom In">
                <ZoomIn className="w-3 h-3" />
              </Button>
              <Button onClick={zoomOut} variant="ghost" size="icon" className="h-6 w-6" title="Zoom Out">
                <ZoomOut className="w-3 h-3" />
              </Button>
              <Button onClick={fitNetwork} variant="ghost" size="icon" className="h-6 w-6" title="Fit">
                <Maximize2 className="w-3 h-3" />
              </Button>
              <Button onClick={exportAsImage} variant="ghost" size="icon" className="h-6 w-6" title="Export">
                <Download className="w-3 h-3" />
              </Button>
              <div className="w-px h-4 bg-border mx-0.5" />
              <Button
                onClick={() => setInspectorOpen(!inspectorOpen)}
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                title={inspectorOpen ? 'Hide Inspector' : 'Show Inspector'}
              >
                {inspectorOpen ? (
                  <PanelRightClose className="w-3 h-3" />
                ) : (
                  <PanelRightOpen className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Graph + Inspector */}
          <div className="flex flex-1 min-h-0">
            {/* Graph Area */}
            <div
              ref={networkRef}
              className="flex-1 bg-gradient-to-br from-background to-muted/20"
              style={{ cursor: 'grab' }}
            />

            {/* Right Inspector Panel */}
            <ConnectionsInspector
              isOpen={inspectorOpen}
              onClose={() => setInspectorOpen(false)}
              selectedProfile={selectedProfile}
              username={username}
              categoryStats={categoryStats}
              connectionStats={connectionStats}
              totalProfiles={accountNodes.length}
              scanId={jobId}
              isFocused={selectedProfile ? focusedEntityId === selectedProfile.id : false}
              onFocus={() => selectedNodeId && handleFocusNode(selectedNodeId)}
              verificationResult={selectedProfile ? (verifiedEntities.get(selectedProfile.id) || localVerificationResults.get(selectedProfile.id)) : null}
              onVerificationComplete={handleVerificationComplete}
              lensScore={75}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ConnectionsTab;
