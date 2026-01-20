import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useCorrelationGraph, CATEGORY_CONFIG, GraphNode } from '@/hooks/useCorrelationGraph';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ConnectionsInspector } from './connections/ConnectionsInspector';
import { CorrelationGraph } from './connections/CorrelationGraph';

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
  const graphContainerRef = useRef<HTMLDivElement>(null);
  
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

  // Find the focused node ID from the entity ID (for passing to CorrelationGraph)
  const focusedNodeId = useMemo(() => {
    if (!focusedEntityId) return null;
    const node = correlationData.nodes.find(n => n.result?.id === focusedEntityId);
    return node?.id || null;
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

  const handleClearFocus = useCallback(() => {
    setFocusedEntity(null);
  }, [setFocusedEntity]);

  const handleNodeClick = useCallback((node: GraphNode | null) => {
    if (node && node.type !== 'identity') {
      setSelectedNodeId(node.id);
      setInspectorOpen(true);
    } else {
      setSelectedNodeId(null);
    }
  }, []);

  const handleNodeDoubleClick = useCallback((node: GraphNode) => {
    if (node.url) {
      window.open(node.url, '_blank');
    }
  }, []);

  const handleFocusFromInspector = useCallback(() => {
    if (selectedNodeId) {
      const node = correlationData.nodes.find(n => n.id === selectedNodeId);
      const entityId = node?.result?.id;
      if (entityId) {
        setFocusedEntity(focusedEntityId === entityId ? null : entityId);
      }
    }
  }, [selectedNodeId, correlationData.nodes, setFocusedEntity, focusedEntityId]);

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
    if (graphContainerRef.current) {
      const canvas = await html2canvas(graphContainerRef.current);
      const link = document.createElement('a');
      link.download = `connections-${username}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

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
    <div ref={containerRef} className="flex flex-col h-[calc(100vh-320px)] min-h-[520px]">
      {/* Debug Strip - always visible in dev mode */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 border-b border-border/50 text-[11px] font-mono text-muted-foreground">
        {correlationData.nodes.length < 2 ? (
          <span className="text-amber-600">No nodes available for graph</span>
        ) : correlationData.edges.length === 0 ? (
          <span className="text-amber-600">No edges generated — correlations not detected yet</span>
        ) : (
          <>
            <span>Results: <strong className="text-foreground">{results.length}</strong></span>
            <span className="text-muted-foreground/50">•</span>
            <span>Nodes: <strong className="text-foreground">{correlationData.nodes.length}</strong></span>
            <span className="text-muted-foreground/50">•</span>
            <span>Edges: <strong className="text-foreground">{correlationData.edges.length}</strong></span>
            <span className="text-muted-foreground/50">•</span>
            <span className={cn(correlationStats.correlationEdges === 0 && 'text-amber-600')}>
              Correlations: <strong className={cn(correlationStats.correlationEdges > 0 ? 'text-foreground' : 'text-amber-600')}>
                {correlationStats.correlationEdges}
              </strong>
            </span>
            {showDebugPanel && correlationStats.correlationEdges > 0 && (
              <span className="ml-2 text-muted-foreground/60">
                ({Object.entries(correlationStats.byReason)
                  .filter(([reason, count]) => count > 0 && reason !== 'identity_search')
                  .map(([reason, count]) => `${reason}:${count}`)
                  .join(', ') || 'none'})
              </span>
            )}
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 ml-auto opacity-50 hover:opacity-100"
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
            <div ref={graphContainerRef} className="flex-1 w-full">
              <CorrelationGraph
                data={correlationData}
                focusedNodeId={focusedNodeId}
                onNodeClick={handleNodeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
                className="h-full w-full"
              />
            </div>
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
              onFocus={handleFocusFromInspector}
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
            <div ref={graphContainerRef} className="flex-1 w-full">
              <CorrelationGraph
                data={correlationData}
                focusedNodeId={focusedNodeId}
                onNodeClick={handleNodeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
                className="h-full w-full"
              />
            </div>

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
              onFocus={handleFocusFromInspector}
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
