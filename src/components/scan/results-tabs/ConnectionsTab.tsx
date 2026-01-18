import { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, DataSet } from 'vis-network/standalone';
import { Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ScanResult } from '@/hooks/useScanResultsData';

interface ConnectionsTabProps {
  results: ScanResult[];
  username: string;
}

const PLATFORM_CATEGORIES: Record<string, string[]> = {
  social: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'snapchat', 'reddit', 'mastodon', 'threads'],
  professional: ['linkedin', 'github', 'gitlab', 'behance', 'dribbble', 'stackoverflow'],
  media: ['youtube', 'vimeo', 'soundcloud', 'spotify', 'twitch', 'deviantart', 'flickr'],
  gaming: ['steam', 'xbox', 'playstation', 'twitch', 'discord', 'roblox'],
  forum: ['reddit', 'quora', 'medium', 'hackernews'],
};

const CATEGORY_COLORS: Record<string, string> = {
  social: '#3b82f6',
  professional: '#8b5cf6',
  media: '#ec4899',
  gaming: '#10b981',
  forum: '#6366f1',
  other: '#6b7280',
};

export function ConnectionsTab({ results, username }: ConnectionsTabProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);

  const categorizePlatform = (site: string): string => {
    const siteLower = site.toLowerCase();
    for (const [category, platforms] of Object.entries(PLATFORM_CATEGORIES)) {
      if (platforms.some(p => siteLower.includes(p))) {
        return category;
      }
    }
    return 'other';
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

    // Add center username node
    nodes.add({
      id: 'center',
      label: username,
      shape: 'box',
      color: {
        background: 'hsl(var(--primary))',
        border: 'hsl(var(--primary))',
      },
      font: { size: 16, color: 'hsl(var(--primary-foreground))' },
      size: 30,
      mass: 3,
    });

    // Add platform nodes
    foundProfiles.forEach((profile, idx) => {
      const category = categorizePlatform(profile.site || '');
      const nodeId = `node-${idx}`;

      nodes.add({
        id: nodeId,
        label: profile.site || 'Unknown',
        shape: 'dot',
        color: CATEGORY_COLORS[category],
        size: 15,
        title: `${profile.site}\nURL: ${profile.url || 'N/A'}`,
      });

      edges.add({
        id: `edge-${idx}`,
        from: 'center',
        to: nodeId,
        color: { color: CATEGORY_COLORS[category], opacity: 0.5 },
        width: 1,
      });
    });

    const data = { nodes, edges };
    const options = {
      nodes: {
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        smooth: {
          enabled: true,
          type: 'cubicBezier',
          forceDirection: 'none',
          roundness: 0.5,
        },
      },
      physics: {
        enabled: true,
        stabilization: { iterations: 100 },
        barnesHut: {
          gravitationalConstant: -8000,
          springLength: 150,
          springConstant: 0.04,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
      },
    };

    if (networkInstance.current) {
      networkInstance.current.destroy();
    }

    networkInstance.current = new Network(networkRef.current, data, options);

    // Handle node clicks
    networkInstance.current.on('click', (params) => {
      if (params.nodes.length > 0 && params.nodes[0] !== 'center') {
        const nodeIdx = parseInt(params.nodes[0].replace('node-', ''), 10);
        const profile = foundProfiles[nodeIdx];
        if (profile?.url) {
          window.open(profile.url, '_blank');
        }
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
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No profiles found to visualize connections.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <Badge
              key={category}
              variant="outline"
              className="flex items-center gap-2 capitalize"
              style={{ borderColor: color }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              {category}: {categoryStats[category] || 0}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={zoomIn} variant="outline" size="icon">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button onClick={zoomOut} variant="outline" size="icon">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button onClick={fitNetwork} variant="outline" size="icon">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button onClick={exportAsImage} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Network Graph */}
      <Card className="overflow-hidden">
        <div
          ref={networkRef}
          className="w-full h-[500px] bg-background"
          style={{ cursor: 'grab' }}
        />
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <p className="text-xs text-muted-foreground">
          💡 Click on platform nodes to open their profiles. The center node represents the scanned username.
        </p>
      </Card>
    </div>
  );
}

export default ConnectionsTab;
