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
import { useCorrelationGraph } from '@/hooks/useCorrelationGraph';
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

const PLATFORM_CATEGORIES: Record<string, { platforms: string[]; label: string; icon: string }> = {
  social: {
    platforms: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'snapchat', 'mastodon', 'threads', 'pinterest'],
    label: 'Social',
    icon: '👥'
  },
  professional: {
    platforms: ['linkedin', 'github', 'gitlab', 'behance', 'dribbble', 'stackoverflow', 'npm', 'pypi'],
    label: 'Professional',
    icon: '💼'
  },
  media: {
    platforms: ['youtube', 'vimeo', 'soundcloud', 'spotify', 'deviantart', 'flickr', 'medium', 'substack'],
    label: 'Media',
    icon: '🎬'
  },
  gaming: {
    platforms: ['steam', 'xbox', 'playstation', 'twitch', 'discord', 'roblox', 'epic', 'battlenet', 'minecraft'],
    label: 'Gaming',
    icon: '🎮'
  },
  forum: {
    platforms: ['reddit', 'quora', 'hackernews', 'lobsters', '4chan', 'discourse'],
    label: 'Forums',
    icon: '💬'
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  social: '#3b82f6',
  professional: '#8b5cf6',
  media: '#ec4899',
  gaming: '#10b981',
  forum: '#f59e0b',
  other: '#6b7280',
};

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
  
  const [selectedNodeIdx, setSelectedNodeIdx] = useState<number | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(() => window.innerWidth >= 768);
  const [localVerificationResults, setLocalVerificationResults] = useState<Map<string, LensVerificationResult>>(new Map());
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Use global investigation context for focus state
  const { focusedEntityId, setFocusedEntity, verifiedEntities } = useInvestigation();

  // Use the improved correlation graph hook
  const correlationData = useCorrelationGraph(results, username, verifiedEntities);
  
  // Calculate correlation stats (edges that are account↔account, not identity→account)
  const correlationStats = useMemo(() => {
    const accountToAccountEdges = correlationData.edges.filter(
      e => e.source !== 'identity-root' && e.target !== 'identity-root'
    );
    return {
      totalNodes: correlationData.stats.totalNodes,
      totalEdges: correlationData.stats.totalEdges,
      correlationEdges: accountToAccountEdges.length,
      hasCorrelations: accountToAccountEdges.length > 0,
      byReason: correlationData.stats.byReason,
    };
  }, [correlationData]);

  const categorizePlatform = (site: string): string => {
    const siteLower = site.toLowerCase();
    for (const [category, data] of Object.entries(PLATFORM_CATEGORIES)) {
      if (data.platforms.some(p => siteLower.includes(p))) {
        return category;
      }
    }
    return 'other';
  };

  const getConnectionReason = (result: ScanResult): ConnectionReason => {
    const meta = (result.meta || result.metadata || {}) as Record<string, unknown>;
    if (meta.avatar_url || meta.profile_image) return 'image_match';
    if (meta.bio || meta.description) return 'bio_similarity';
    if (meta.email) return 'email_link';
    if (meta.linked_accounts || meta.references) return 'cross_reference';
    return 'username_reuse';
  };

  const foundProfiles = useMemo(() => {
    return results.filter(r => 
      r.status?.toLowerCase() === 'found' || r.status?.toLowerCase() === 'claimed'
    );
  }, [results]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    foundProfiles.forEach(profile => {
      const category = categorizePlatform(profile.site || '');
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  }, [foundProfiles]);

  const connectionStats = useMemo(() => {
    const stats: Record<ConnectionReason, number> = {
      username_reuse: 0, image_match: 0, bio_similarity: 0, email_link: 0, cross_reference: 0
    };
    foundProfiles.forEach(profile => {
      stats[getConnectionReason(profile)]++;
    });
    return stats;
  }, [foundProfiles]);

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

  const selectedProfile = selectedNodeIdx !== null ? foundProfiles[selectedNodeIdx] : null;
  
  // Derive focused node index from global focusedEntityId
  const focusedNodeIdx = useMemo(() => {
    if (!focusedEntityId) return null;
    const idx = foundProfiles.findIndex(p => p.id === focusedEntityId);
    return idx >= 0 ? idx : null;
  }, [focusedEntityId, foundProfiles]);

  const focusedProfile = focusedNodeIdx !== null ? foundProfiles[focusedNodeIdx] : null;

  const handleFocusNode = useCallback((idx: number | null) => {
    if (idx === null) {
      setFocusedEntity(null);
    } else {
      const profile = foundProfiles[idx];
      if (profile) {
        // Toggle focus: if already focused, clear it
        setFocusedEntity(focusedEntityId === profile.id ? null : profile.id);
      }
    }
  }, [setFocusedEntity, foundProfiles, focusedEntityId]);

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

    if (focusedNodeIdx === null) {
      // Reset all nodes/edges to default
      nodes.forEach((node: any) => {
        if (node.id !== 'center') {
          const idx = parseInt(node.id.replace('node-', ''), 10);
          const profile = foundProfiles[idx];
          const category = categorizePlatform(profile?.site || '');
          nodes.update({
            id: node.id,
            opacity: 1,
            color: {
              background: CATEGORY_COLORS[category],
              border: CATEGORY_COLORS[category],
              highlight: { background: CATEGORY_COLORS[category], border: '#ffffff' }
            },
            size: 18,
          });
        }
      });
      edges.forEach((edge: any) => {
        const idx = parseInt(edge.id.replace('edge-', ''), 10);
        const profile = foundProfiles[idx];
        const category = categorizePlatform(profile?.site || '');
        edges.update({
          id: edge.id,
          color: { color: CATEGORY_COLORS[category], opacity: 0.5, highlight: CATEGORY_COLORS[category] },
          width: 2,
        });
      });
    } else {
      // Highlight focused node and dim others
      const focusedNodeId = `node-${focusedNodeIdx}`;
      const focusedEdgeId = `edge-${focusedNodeIdx}`;
      const focusedCategory = categorizePlatform(foundProfiles[focusedNodeIdx]?.site || '');

      nodes.forEach((node: any) => {
        if (node.id === 'center') return;
        
        const isFocused = node.id === focusedNodeId;
        const idx = parseInt(node.id.replace('node-', ''), 10);
        const profile = foundProfiles[idx];
        const category = categorizePlatform(profile?.site || '');
        
        nodes.update({
          id: node.id,
          opacity: isFocused ? 1 : 0.3,
          color: {
            background: isFocused ? CATEGORY_COLORS[category] : `${CATEGORY_COLORS[category]}40`,
            border: isFocused ? '#ffffff' : CATEGORY_COLORS[category],
            highlight: { background: CATEGORY_COLORS[category], border: '#ffffff' }
          },
          size: isFocused ? 24 : 14,
          borderWidth: isFocused ? 3 : 2,
        });
      });

      edges.forEach((edge: any) => {
        const isFocused = edge.id === focusedEdgeId;
        const idx = parseInt(edge.id.replace('edge-', ''), 10);
        const profile = foundProfiles[idx];
        const category = categorizePlatform(profile?.site || '');
        
        edges.update({
          id: edge.id,
          color: { 
            color: isFocused ? CATEGORY_COLORS[category] : `${CATEGORY_COLORS[category]}30`,
            opacity: isFocused ? 1 : 0.2,
            highlight: CATEGORY_COLORS[category]
          },
          width: isFocused ? 4 : 1,
        });
      });

      // Center on focused node
      networkInstance.current?.focus(focusedNodeId, {
        scale: 1.5,
        animation: { duration: 300, easingFunction: 'easeInOutQuad' }
      });
    }
  }, [focusedNodeIdx, foundProfiles]);

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

  useEffect(() => {
    if (!networkRef.current || foundProfiles.length === 0) return;

    const nodes = new DataSet<any>([]);
    const edges = new DataSet<any>([]);
    nodesDataset.current = nodes;
    edgesDataset.current = edges;

    const categoryGroups: Record<string, ScanResult[]> = {};
    foundProfiles.forEach(profile => {
      const category = categorizePlatform(profile.site || '');
      if (!categoryGroups[category]) categoryGroups[category] = [];
      categoryGroups[category].push(profile);
    });

    nodes.add({
      id: 'center',
      label: `🔍 ${username}`,
      shape: 'box',
      color: { background: 'hsl(var(--primary))', border: 'hsl(var(--primary))' },
      font: { size: 14, color: 'hsl(var(--primary-foreground))', bold: true },
      size: 30,
      mass: 5,
      fixed: { x: true, y: true },
      x: 0,
      y: 0,
    });

    const categoryAngles: Record<string, number> = {
      social: 0, professional: 72, media: 144, gaming: 216, forum: 288, other: 180
    };

    let nodeIdx = 0;
    Object.entries(categoryGroups).forEach(([category, profiles]) => {
      const baseAngle = (categoryAngles[category] || 0) * (Math.PI / 180);
      const baseRadius = 160;
      
      profiles.forEach((profile, i) => {
        const angleOffset = (i - profiles.length / 2) * 0.3;
        const angle = baseAngle + angleOffset;
        const radius = baseRadius + (i % 2) * 35;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        const connectionReason = getConnectionReason(profile);
        const reasonInfo = CONNECTION_EXPLANATIONS[connectionReason];
        const meta = (profile.meta || profile.metadata || {}) as Record<string, unknown>;
        
        const tooltipLines = [
          `📍 ${profile.site}`,
          `🔗 ${reasonInfo.label}`,
        ];
        if (meta.bio) tooltipLines.push(`Bio: "${String(meta.bio).substring(0, 40)}..."`);

        const nodeId = `node-${nodeIdx}`;
        nodes.add({
          id: nodeId,
          label: profile.site || 'Unknown',
          shape: 'dot',
          color: {
            background: CATEGORY_COLORS[category],
            border: CATEGORY_COLORS[category],
            highlight: { background: CATEGORY_COLORS[category], border: '#ffffff' }
          },
          size: 18,
          x, y,
          title: tooltipLines.join('\n'),
          font: { size: 10, color: '#ffffff', strokeWidth: 2, strokeColor: '#000000' }
        });

        const getEdgeStyle = (reason: ConnectionReason) => {
          switch (reason) {
            case 'username_reuse': return { dashes: false, width: 2 };
            case 'image_match': return { dashes: true, width: 2 };
            case 'bio_similarity': return { dashes: true, width: 1.5 };
            case 'email_link': return { dashes: false, width: 3 };
            case 'cross_reference': return { dashes: true, width: 2 };
            default: return { dashes: false, width: 2 };
          }
        };

        const edgeStyle = getEdgeStyle(connectionReason);

        edges.add({
          id: `edge-${nodeIdx}`,
          from: 'center',
          to: nodeId,
          color: { color: CATEGORY_COLORS[category], opacity: 0.5, highlight: CATEGORY_COLORS[category] },
          width: edgeStyle.width,
          dashes: edgeStyle.dashes,
          title: `${reasonInfo.label}: ${reasonInfo.description}`,
          smooth: { enabled: true, type: 'curvedCW', roundness: 0.2 }
        });

        nodeIdx++;
      });
    });

    const options = {
      nodes: { borderWidth: 2, shadow: { enabled: true, size: 5, x: 1, y: 1 } },
      edges: { smooth: { enabled: true, type: 'curvedCW', roundness: 0.2 }, shadow: true },
      physics: {
        enabled: true,
        stabilization: { iterations: 100, fit: true },
        barnesHut: { gravitationalConstant: -2000, centralGravity: 0.35, springLength: 140, springConstant: 0.02, damping: 0.3 },
      },
      interaction: { hover: true, tooltipDelay: 50, zoomView: true, dragView: true },
      layout: { improvedLayout: true }
    };

    if (networkInstance.current) networkInstance.current.destroy();
    networkInstance.current = new Network(networkRef.current, { nodes, edges }, options);

    networkInstance.current.once('stabilizationIterationsDone', () => {
      networkInstance.current?.moveTo({
        position: { x: 0, y: 0 },
        scale: 1.2,
        animation: { duration: 400, easingFunction: 'easeInOutQuad' }
      });
    });

    networkInstance.current.on('click', (params) => {
      if (params.nodes.length > 0 && params.nodes[0] !== 'center') {
        const idx = parseInt(params.nodes[0].replace('node-', ''), 10);
        setSelectedNodeIdx(idx);
        setInspectorOpen(true);
      } else {
        setSelectedNodeIdx(null);
      }
    });

    networkInstance.current.on('doubleClick', (params) => {
      if (params.nodes.length > 0 && params.nodes[0] !== 'center') {
        const idx = parseInt(params.nodes[0].replace('node-', ''), 10);
        const profile = foundProfiles[idx];
        if (profile?.url) window.open(profile.url, '_blank');
      }
    });

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [foundProfiles, username]);

  if (foundProfiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Users className="w-8 h-8 mr-2 opacity-50" />
        No profiles found to visualize.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
      {/* Debug Status Panel (toggle with bug icon) */}
      {showDebugPanel && (
        <div className="flex items-center gap-4 px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/30 text-xs font-mono">
          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
            <Bug className="w-3 h-3" />
            Debug
          </span>
          <span>Nodes: <strong>{correlationStats.totalNodes}</strong></span>
          <span>Edges: <strong>{correlationStats.totalEdges}</strong></span>
          <span className={cn(
            correlationStats.correlationEdges === 0 && 'text-amber-600'
          )}>
            Correlations: <strong>{correlationStats.correlationEdges}</strong>
            <span className="text-muted-foreground ml-1">(account↔account)</span>
          </span>
          {correlationStats.correlationEdges > 0 && (
            <span className="text-muted-foreground">
              Reasons: {Object.entries(correlationStats.byReason)
                .filter(([reason, count]) => count > 0 && reason !== 'identity_search')
                .map(([reason, count]) => `${reason}:${count}`)
                .join(', ') || 'none'}
            </span>
          )}
        </div>
      )}

      {/* Empty state for no correlations */}
      {correlationStats.totalEdges < 2 || correlationStats.correlationEdges === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/10">
          <AlertCircle className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <h3 className="text-sm font-medium text-foreground mb-1">
            No cross-account correlations detected
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            This view becomes more useful when shared signals exist between accounts — such as matching usernames, profile images, bio keywords, or shared links.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
            <span>Nodes: {correlationStats.totalNodes}</span>
            <span>·</span>
            <span>Edges: {correlationStats.totalEdges}</span>
            <span>·</span>
            <span>Correlations: {correlationStats.correlationEdges}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-xs gap-1"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
          >
            <Bug className="w-3 h-3" />
            {showDebugPanel ? 'Hide' : 'Show'} Debug Info
          </Button>
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
                        <strong className="text-foreground">{foundProfiles.length}</strong> profiles · 
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
              {focusedNodeIdx !== null && focusedProfile && (
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
                  .slice(0, 4)
                  .map(([category]) => (
                    <div
                      key={category}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[category] }}
                      title={PLATFORM_CATEGORIES[category]?.label || category}
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
              totalProfiles={foundProfiles.length}
              scanId={jobId}
              isFocused={selectedProfile ? focusedEntityId === selectedProfile.id : false}
              onFocus={() => selectedNodeIdx !== null && handleFocusNode(selectedNodeIdx)}
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