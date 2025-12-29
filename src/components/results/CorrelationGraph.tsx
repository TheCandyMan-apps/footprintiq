import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Maximize2, Link2, User, Globe, Mail, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileNode {
  id: string;
  type: "username" | "email" | "platform" | "data_broker";
  label: string;
  platform?: string;
  confidenceScore?: number;
}

interface ProfileEdge {
  id: string;
  source: string;
  target: string;
  relationship: "same_username" | "linked_profile" | "shared_email" | "data_match";
  confidence: number;
}

interface CorrelationGraphProps {
  /** Social profiles from scan results */
  profiles: Array<{
    id: string;
    platform: string;
    username: string;
    confidenceScore?: number;
  }>;
  /** Data sources from scan results */
  dataSources: Array<{
    id: string;
    name: string;
    category: string;
    confidenceScore?: number;
  }>;
  /** Search query (username/email) */
  searchQuery?: string;
  /** Compact mode for preview */
  compact?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Builds correlation graph from profiles and data sources.
 * Identifies connections based on shared usernames, platforms, and data patterns.
 */
function buildCorrelationData(
  profiles: CorrelationGraphProps["profiles"],
  dataSources: CorrelationGraphProps["dataSources"],
  searchQuery?: string
): { nodes: ProfileNode[]; edges: ProfileEdge[] } {
  const nodes: ProfileNode[] = [];
  const edges: ProfileEdge[] = [];
  const usernameMap = new Map<string, string[]>(); // username -> profile IDs

  // Add central search node if provided
  if (searchQuery) {
    nodes.push({
      id: "search-query",
      type: searchQuery.includes("@") ? "email" : "username",
      label: searchQuery,
    });
  }

  // Add profile nodes
  profiles.forEach((profile) => {
    const nodeId = `profile-${profile.id}`;
    nodes.push({
      id: nodeId,
      type: "platform",
      label: profile.platform,
      platform: profile.platform,
      confidenceScore: profile.confidenceScore,
    });

    // Track usernames for correlation
    const username = profile.username.toLowerCase();
    if (!usernameMap.has(username)) {
      usernameMap.set(username, []);
    }
    usernameMap.get(username)!.push(nodeId);

    // Connect to search query
    if (searchQuery) {
      edges.push({
        id: `edge-search-${profile.id}`,
        source: "search-query",
        target: nodeId,
        relationship: "linked_profile",
        confidence: profile.confidenceScore || 75,
      });
    }
  });

  // Add data source nodes
  dataSources.forEach((source) => {
    const nodeId = `source-${source.id}`;
    nodes.push({
      id: nodeId,
      type: "data_broker",
      label: source.name,
      confidenceScore: source.confidenceScore,
    });

    // Connect to search query
    if (searchQuery) {
      edges.push({
        id: `edge-search-source-${source.id}`,
        source: "search-query",
        target: nodeId,
        relationship: "data_match",
        confidence: source.confidenceScore || 70,
      });
    }
  });

  // Create edges between profiles with same username
  usernameMap.forEach((profileIds, _username) => {
    if (profileIds.length > 1) {
      for (let i = 0; i < profileIds.length - 1; i++) {
        for (let j = i + 1; j < profileIds.length; j++) {
          edges.push({
            id: `edge-username-${profileIds[i]}-${profileIds[j]}`,
            source: profileIds[i],
            target: profileIds[j],
            relationship: "same_username",
            confidence: 95,
          });
        }
      }
    }
  });

  return { nodes, edges };
}

/**
 * CorrelationGraph - Visualizes identity connections between profiles and data sources.
 * Shows how usernames, emails, and platforms link together.
 */
export function CorrelationGraph({
  profiles,
  dataSources,
  searchQuery,
  compact = false,
  className,
}: CorrelationGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<ProfileNode | null>(null);

  const { nodes, edges } = buildCorrelationData(profiles, dataSources, searchQuery);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...nodes.map((n) => ({
          data: {
            id: n.id,
            label: n.label,
            type: n.type,
            confidence: n.confidenceScore,
          },
        })),
        ...edges.map((e) => ({
          data: {
            id: e.id,
            source: e.source,
            target: e.target,
            relationship: e.relationship,
            confidence: e.confidence,
          },
        })),
      ],
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "bottom" as const,
            "text-halign": "center" as const,
            "font-size": compact ? 8 : 11,
            width: compact ? 30 : 50,
            height: compact ? 30 : 50,
            "background-color": "hsl(var(--muted))",
            "border-width": 2,
            "border-color": "hsl(var(--border))",
            color: "hsl(var(--foreground))",
            "text-margin-y": compact ? 4 : 6,
          },
        },
        {
          selector: 'node[type="username"], node[type="email"]',
          style: {
            "background-color": "hsl(var(--primary))",
            width: compact ? 40 : 60,
            height: compact ? 40 : 60,
          },
        },
        {
          selector: 'node[type="platform"]',
          style: {
            "background-color": "hsl(var(--accent))",
          },
        },
        {
          selector: 'node[type="data_broker"]',
          style: {
            "background-color": "hsl(var(--destructive) / 0.7)",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 4,
            "border-color": "hsl(var(--primary))",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "hsl(var(--muted-foreground) / 0.4)",
        "target-arrow-color": "hsl(var(--muted-foreground) / 0.4)",
        "target-arrow-shape": "triangle" as const,
        "curve-style": "bezier" as const,
        opacity: 0.7,
      },
    },
    {
      selector: 'edge[relationship="same_username"]',
          style: {
            "line-color": "hsl(var(--primary) / 0.6)",
            "target-arrow-color": "hsl(var(--primary) / 0.6)",
            width: 3,
          },
        },
        {
          selector: 'edge[relationship="linked_profile"]',
          style: {
            "line-style": "dashed",
          },
        },
      ],
      layout: {
        name: "cose",
        animate: !compact,
        animationDuration: 500,
        idealEdgeLength: compact ? 50 : 100,
        nodeOverlap: 20,
        fit: true,
        padding: compact ? 10 : 30,
        randomize: false,
        nodeRepulsion: compact ? 100000 : 400000,
        gravity: compact ? 100 : 80,
        numIter: 500,
      },
      userZoomingEnabled: !compact,
      userPanningEnabled: !compact,
      boxSelectionEnabled: false,
    });

    cy.on("tap", "node", (evt) => {
      const nodeData = evt.target.data();
      const node = nodes.find((n) => n.id === nodeData.id);
      if (node) {
        setSelectedNode(node);
      }
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, compact]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();

  const connectionCount = edges.length;
  const platformCount = profiles.length;
  const dataSourceCount = dataSources.length;

  if (compact) {
    return (
      <div className={cn("relative rounded-lg overflow-hidden", className)}>
        <div
          ref={containerRef}
          className="w-full h-32 bg-muted/20"
        />
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
          <Badge variant="secondary" className="text-xs">
            {connectionCount} connections
          </Badge>
          <Badge variant="outline" className="text-xs">
            {platformCount + dataSourceCount} nodes
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Identity Connections</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleFit}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Showing how your username and profiles connect across platforms
        </p>
      </CardHeader>
      <CardContent className="relative">
        <div
          ref={containerRef}
          className="w-full h-[350px] rounded-lg bg-muted/10 border border-border/50"
        />

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg border border-border/50 p-3">
          <div className="text-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Search Query</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span>Social Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/70" />
              <span>Data Broker</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Platforms:</span>
            <span className="font-medium">{platformCount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Data Sources:</span>
            <span className="font-medium">{dataSourceCount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Connections:</span>
            <span className="font-medium">{connectionCount}</span>
          </div>
        </div>

        {/* Selected node info */}
        {selectedNode && (
          <Card className="absolute bottom-20 left-4 w-64 bg-background/95 backdrop-blur-sm">
            <CardContent className="p-3 space-y-2">
              <div className="font-medium text-sm">{selectedNode.label}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedNode.type.replace("_", " ")}
                </Badge>
              </div>
              {selectedNode.confidenceScore && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Confidence</span>
                  <span>{selectedNode.confidenceScore}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Educational microcopy */}
        <p className="text-[10px] text-muted-foreground/60 text-center mt-3">
          Attackers rely on correlation, not hacking. Connected profiles reveal identity patterns.
        </p>
      </CardContent>
    </Card>
  );
}
