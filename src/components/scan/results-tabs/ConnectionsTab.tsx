import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, DataSet } from 'vis-network/standalone';
import { 
  Download, ZoomIn, ZoomOut, Maximize2, 
  Link2, Image, FileText, Users, Info, Sparkles
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { ScanResult } from '@/hooks/useScanResultsData';
import { cn } from '@/lib/utils';

interface ConnectionsTabProps {
  results: ScanResult[];
  username: string;
}

// Platform categories with display names
const PLATFORM_CATEGORIES: Record<string, { platforms: string[]; label: string; icon: string }> = {
  social: {
    platforms: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'snapchat', 'mastodon', 'threads', 'pinterest'],
    label: 'Social Media',
    icon: '👥'
  },
  professional: {
    platforms: ['linkedin', 'github', 'gitlab', 'behance', 'dribbble', 'stackoverflow', 'npm', 'pypi'],
    label: 'Professional',
    icon: '💼'
  },
  media: {
    platforms: ['youtube', 'vimeo', 'soundcloud', 'spotify', 'deviantart', 'flickr', 'medium', 'substack'],
    label: 'Media & Content',
    icon: '🎬'
  },
  gaming: {
    platforms: ['steam', 'xbox', 'playstation', 'twitch', 'discord', 'roblox', 'epic', 'battlenet', 'minecraft'],
    label: 'Gaming',
    icon: '🎮'
  },
  forum: {
    platforms: ['reddit', 'quora', 'hackernews', 'lobsters', '4chan', 'discourse'],
    label: 'Forums & Communities',
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

// Connection reasons based on data
type ConnectionReason = 'username_reuse' | 'image_match' | 'bio_similarity' | 'email_link' | 'cross_reference';

const CONNECTION_EXPLANATIONS: Record<ConnectionReason, { label: string; description: string; icon: typeof Link2 }> = {
  username_reuse: {
    label: 'Username Reuse',
    description: 'Same or similar username found on this platform',
    icon: Link2
  },
  image_match: {
    label: 'Profile Image Match',
    description: 'Similar or identical profile image detected',
    icon: Image
  },
  bio_similarity: {
    label: 'Bio Similarity',
    description: 'Matching keywords or phrases in profile bio',
    icon: FileText
  },
  email_link: {
    label: 'Email Association',
    description: 'Linked through shared email address',
    icon: Users
  },
  cross_reference: {
    label: 'Cross-Reference',
    description: 'Profile references this identity on another platform',
    icon: Sparkles
  }
};

export function ConnectionsTab({ results, username }: ConnectionsTabProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const categorizePlatform = (site: string): string => {
    const siteLower = site.toLowerCase();
    for (const [category, data] of Object.entries(PLATFORM_CATEGORIES)) {
      if (data.platforms.some(p => siteLower.includes(p))) {
        return category;
      }
    }
    return 'other';
  };

  // Determine connection reason based on available data
  const getConnectionReason = (result: ScanResult): ConnectionReason => {
    const meta = (result.meta || result.metadata || {}) as Record<string, any>;
    
    // Check for image matches
    if (meta.avatar_url || meta.profile_image) {
      return 'image_match';
    }
    // Check for bio content
    if (meta.bio || meta.description) {
      return 'bio_similarity';
    }
    // Check for email links
    if (meta.email) {
      return 'email_link';
    }
    // Check for cross-references
    if (meta.linked_accounts || meta.references) {
      return 'cross_reference';
    }
    // Default to username reuse
    return 'username_reuse';
  };

  // Only show found/claimed profiles for connections
  const foundProfiles = useMemo(() => {
    return results.filter(r => 
      r.status?.toLowerCase() === 'found' || r.status?.toLowerCase() === 'claimed'
    );
  }, [results]);

  // Calculate category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    foundProfiles.forEach(profile => {
      const category = categorizePlatform(profile.site || '');
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  }, [foundProfiles]);

  // Calculate connection type stats
  const connectionStats = useMemo(() => {
    const stats: Record<ConnectionReason, number> = {
      username_reuse: 0,
      image_match: 0,
      bio_similarity: 0,
      email_link: 0,
      cross_reference: 0
    };
    foundProfiles.forEach(profile => {
      const reason = getConnectionReason(profile);
      stats[reason]++;
    });
    return stats;
  }, [foundProfiles]);

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

  useEffect(() => {
    if (!networkRef.current || foundProfiles.length === 0) return;

    const nodes = new DataSet<any>([]);
    const edges = new DataSet<any>([]);

    // Group profiles by category for positioning
    const categoryGroups: Record<string, ScanResult[]> = {};
    foundProfiles.forEach(profile => {
      const category = categorizePlatform(profile.site || '');
      if (!categoryGroups[category]) categoryGroups[category] = [];
      categoryGroups[category].push(profile);
    });

    // Add center username node (larger, prominent)
    nodes.add({
      id: 'center',
      label: `🔍 ${username}`,
      shape: 'box',
      color: {
        background: 'hsl(var(--primary))',
        border: 'hsl(var(--primary))',
      },
      font: { 
        size: 18, 
        color: 'hsl(var(--primary-foreground))',
        bold: true
      },
      size: 40,
      mass: 5,
      fixed: { x: true, y: true },
      x: 0,
      y: 0,
    });

    // Position nodes in clusters by category
    const categoryAngles: Record<string, number> = {
      social: 0,
      professional: 72,
      media: 144,
      gaming: 216,
      forum: 288,
      other: 180
    };

    let nodeIdx = 0;
    Object.entries(categoryGroups).forEach(([category, profiles]) => {
      const baseAngle = (categoryAngles[category] || 0) * (Math.PI / 180);
      const baseRadius = 200;
      
      profiles.forEach((profile, i) => {
        const angleOffset = (i - profiles.length / 2) * 0.3;
        const angle = baseAngle + angleOffset;
        const radius = baseRadius + (i % 2) * 50;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        const connectionReason = getConnectionReason(profile);
        const reasonInfo = CONNECTION_EXPLANATIONS[connectionReason];
        const meta = (profile.meta || profile.metadata || {}) as Record<string, any>;
        
        // Build rich tooltip
        const tooltipLines = [
          `📍 ${profile.site || 'Unknown Platform'}`,
          ``,
          `🔗 Connection: ${reasonInfo.label}`,
          `   ${reasonInfo.description}`,
          ``,
          `Status: ${profile.status}`,
        ];
        
        if (meta.bio) tooltipLines.push(`Bio: "${meta.bio.substring(0, 50)}..."`);
        if (meta.followers) tooltipLines.push(`Followers: ${meta.followers}`);
        if (profile.url) tooltipLines.push(``, `Click to visit profile`);

        const nodeId = `node-${nodeIdx}`;
        nodes.add({
          id: nodeId,
          label: profile.site || 'Unknown',
          shape: 'dot',
          color: {
            background: CATEGORY_COLORS[category],
            border: CATEGORY_COLORS[category],
            highlight: {
              background: CATEGORY_COLORS[category],
              border: '#ffffff'
            }
          },
          size: profile.status === 'found' ? 20 : 15,
          x, y,
          title: tooltipLines.join('\n'),
          font: {
            size: 12,
            color: '#ffffff',
            strokeWidth: 3,
            strokeColor: '#000000'
          }
        });

        // Edge style based on connection reason
        const getEdgeStyle = (reason: ConnectionReason) => {
          switch (reason) {
            case 'username_reuse':
              return { dashes: false, width: 2 };
            case 'image_match':
              return { dashes: true, width: 2 };
            case 'bio_similarity':
              return { dashes: true, width: 1.5 };
            case 'email_link':
              return { dashes: false, width: 3 };
            case 'cross_reference':
              return { dashes: true, width: 2 };
            default:
              return { dashes: false, width: 2 };
          }
        };

        const edgeStyle = getEdgeStyle(connectionReason);

        edges.add({
          id: `edge-${nodeIdx}`,
          from: 'center',
          to: nodeId,
          color: { 
            color: CATEGORY_COLORS[category], 
            opacity: 0.6,
            highlight: CATEGORY_COLORS[category]
          },
          width: edgeStyle.width,
          dashes: edgeStyle.dashes,
          title: `${reasonInfo.label}: ${reasonInfo.description}`,
          smooth: {
            enabled: true,
            type: 'curvedCW',
            roundness: 0.2
          }
        });

        nodeIdx++;
      });
    });

    const data = { nodes, edges };
    const options = {
      nodes: {
        borderWidth: 3,
        shadow: {
          enabled: true,
          size: 10,
          x: 2,
          y: 2
        },
      },
      edges: {
        smooth: {
          enabled: true,
          type: 'curvedCW',
          forceDirection: 'none',
          roundness: 0.2,
        },
        shadow: true
      },
      physics: {
        enabled: true,
        stabilization: { 
          iterations: 150,
          fit: true
        },
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.5,
          springLength: 180,
          springConstant: 0.02,
          damping: 0.3
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 50,
        zoomView: true,
        dragView: true,
      },
      layout: {
        improvedLayout: true
      }
    };

    if (networkInstance.current) {
      networkInstance.current.destroy();
    }

    networkInstance.current = new Network(networkRef.current, data, options);

    // After stabilization, zoom to a readable level centered on the username
    networkInstance.current.once('stabilizationIterationsDone', () => {
      networkInstance.current?.moveTo({
        position: { x: 0, y: 0 },
        scale: 1.2,
        animation: {
          duration: 500,
          easingFunction: 'easeInOutQuad'
        }
      });
    });

    // Handle node clicks
    networkInstance.current.on('click', (params) => {
      if (params.nodes.length > 0 && params.nodes[0] !== 'center') {
        const nodeId = params.nodes[0];
        const nodeIdx = parseInt(nodeId.replace('node-', ''), 10);
        const profile = foundProfiles[nodeIdx];
        if (profile?.url) {
          window.open(profile.url, '_blank');
        }
      }
    });

    // Handle hover for selection state
    networkInstance.current.on('hoverNode', (params) => {
      setSelectedNode(params.node);
    });

    networkInstance.current.on('blurNode', () => {
      setSelectedNode(null);
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
      <Card className="p-8 text-center">
        <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">
          No profiles found to visualize connections.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contextual Framing */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Understanding This Graph
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This visualization shows how the identity "<strong>{username}</strong>" connects across 
            {foundProfiles.length} platform{foundProfiles.length !== 1 ? 's' : ''}. Each node represents 
            a discovered profile, and connections indicate why we believe they belong to the same person.
          </p>
          
          {/* Connection Types Legend */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(CONNECTION_EXPLANATIONS).map(([key, info]) => {
              const count = connectionStats[key as ConnectionReason];
              if (count === 0) return null;
              const Icon = info.icon;
              return (
                <Badge key={key} variant="outline" className="gap-1.5 text-xs">
                  <Icon className="w-3 h-3" />
                  {info.label} ({count})
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(PLATFORM_CATEGORIES).map(([category, data]) => {
            const count = categoryStats[category] || 0;
            if (count === 0) return null;
            return (
              <Badge
                key={category}
                variant="outline"
                className="flex items-center gap-2"
                style={{ borderColor: CATEGORY_COLORS[category] }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                <span>{data.icon}</span>
                <span>{data.label}</span>
                <span className="text-muted-foreground">({count})</span>
              </Badge>
            );
          })}
          {categoryStats.other > 0 && (
            <Badge variant="outline" className="flex items-center gap-2" style={{ borderColor: CATEGORY_COLORS.other }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS.other }} />
              <span>🌐</span>
              <span>Other</span>
              <span className="text-muted-foreground">({categoryStats.other})</span>
            </Badge>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex gap-2">
          <Button onClick={zoomIn} variant="outline" size="icon" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button onClick={zoomOut} variant="outline" size="icon" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button onClick={fitNetwork} variant="outline" size="icon" title="Fit to View">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button onClick={exportAsImage} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Network Graph */}
      <Card className="overflow-hidden border-2">
        <div
          ref={networkRef}
          className="w-full h-[550px] bg-gradient-to-br from-background to-muted/30"
          style={{ cursor: 'grab' }}
        />
      </Card>

      {/* Interactive Hint */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-start gap-3 text-sm">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-muted-foreground">
              <strong>Tip:</strong> Hover over nodes and edges to see why connections were made. 
              Click any platform node to visit the discovered profile. Drag to pan, scroll to zoom.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Line styles indicate connection type: solid = username match, dashed = image/bio similarity, thick = email link
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ConnectionsTab;
