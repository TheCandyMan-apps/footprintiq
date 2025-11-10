import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network, DataSet } from "vis-network/standalone";
import { Download, Filter, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import html2canvas from "html2canvas";

interface MaigretNetworkVisualizationProps {
  workspaceId: string;
}

const PLATFORM_CATEGORIES = {
  social: ["Facebook", "Twitter", "Instagram", "LinkedIn", "TikTok", "Snapchat", "Reddit"],
  professional: ["LinkedIn", "GitHub", "GitLab", "Behance", "Dribbble", "AngelList"],
  media: ["YouTube", "Vimeo", "SoundCloud", "Spotify", "Twitch", "DeviantArt"],
  gaming: ["Steam", "Xbox", "PlayStation", "Twitch", "Discord"],
  dating: ["Tinder", "Match", "OkCupid", "Badoo"],
  forum: ["Reddit", "Quora", "Stack Overflow", "Medium"],
  other: [] as string[],
};

const CATEGORY_COLORS = {
  social: "#3b82f6",      // blue
  professional: "#8b5cf6", // purple
  media: "#ec4899",       // pink
  gaming: "#10b981",      // green
  dating: "#f59e0b",      // amber
  forum: "#6366f1",       // indigo
  other: "#6b7280",       // gray
};

export function MaigretNetworkVisualization({ workspaceId }: MaigretNetworkVisualizationProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());

  // Fetch monitored usernames
  const { data: monitoredUsernames } = useQuery({
    queryKey: ["monitored-usernames", workspaceId],
    queryFn: async () => {
      // @ts-ignore - Supabase type inference can be overly complex
      const response = await supabase
        .from("maigret_monitored_usernames")
        .select("username")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true);
      
      if (response.error) throw response.error;
      return (response.data || []) as Array<{ username: string }>;
    },
  });

  // Fetch profile snapshots for visualization
  const { data: snapshots } = useQuery({
    queryKey: ["maigret-snapshots", workspaceId, selectedUsername],
    queryFn: async () => {
      let query = supabase
        .from("maigret_profile_snapshots")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("status", "found")
        .order("created_at", { ascending: false });

      if (selectedUsername) {
        query = query.eq("username", selectedUsername);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Get most recent snapshot per username/site combination
      const latestSnapshots = new Map();
      data?.forEach((snapshot: any) => {
        const key = `${snapshot.username}-${snapshot.site}`;
        if (!latestSnapshots.has(key)) {
          latestSnapshots.set(key, snapshot);
        }
      });
      
      return Array.from(latestSnapshots.values());
    },
    enabled: !!workspaceId,
  });

  const categorizePlatform = (site: string): keyof typeof PLATFORM_CATEGORIES => {
    for (const [category, platforms] of Object.entries(PLATFORM_CATEGORIES)) {
      if (category === "other") continue;
      if (platforms.some(p => site.toLowerCase().includes(p.toLowerCase()))) {
        return category as keyof typeof PLATFORM_CATEGORIES;
      }
    }
    return "other";
  };

  const exportAsImage = async () => {
    if (networkRef.current) {
      const canvas = await html2canvas(networkRef.current);
      const link = document.createElement("a");
      link.download = `maigret-network-${Date.now()}.png`;
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
    if (!networkRef.current || !snapshots) return;

    // Create nodes and edges
    const nodes = new DataSet<any>([]);
    const edges = new DataSet<any>([]);
    const usernames = new Set<string>();

    // Add username nodes (center nodes)
    snapshots.forEach((snapshot: any) => {
      usernames.add(snapshot.username);
    });

    usernames.forEach((username) => {
      nodes.add({
        id: `user-${username}`,
        label: username,
        shape: "box",
        color: {
          background: "#ffffff",
          border: "#3b82f6",
        },
        font: { size: 16, bold: true },
        size: 30,
        mass: 3,
      });
    });

    // Add platform nodes
    const categoryStats = new Map<string, number>();
    
    snapshots.forEach((snapshot: any) => {
      const category = categorizePlatform(snapshot.site);
      const nodeId = `site-${snapshot.username}-${snapshot.site}`;
      
      categoryStats.set(category, (categoryStats.get(category) || 0) + 1);

      // Filter by category
      if (selectedCategory !== "all" && category !== selectedCategory) {
        return;
      }

      nodes.add({
        id: nodeId,
        label: snapshot.site,
        shape: "dot",
        color: CATEGORY_COLORS[category],
        size: 15 + (snapshot.confidence || 0) * 5,
        title: `${snapshot.site}\nConfidence: ${snapshot.confidence || 0}%\nURL: ${snapshot.url || 'N/A'}`,
        category,
      });

      edges.add({
        id: `edge-${snapshot.username}-${snapshot.site}`,
        from: `user-${snapshot.username}`,
        to: nodeId,
        color: { color: CATEGORY_COLORS[category], opacity: 0.5 },
        width: 1,
      });

      visibleNodes.add(nodeId);
    });

    // Create network
    const data = { nodes, edges };
    const options = {
      nodes: {
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        smooth: {
          enabled: true,
          type: "cubicBezier",
          forceDirection: "none",
          roundness: 0.5,
        },
      },
      physics: {
        enabled: true,
        stabilization: {
          iterations: 100,
        },
        barnesHut: {
          gravitationalConstant: -8000,
          springLength: 150,
          springConstant: 0.04,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        navigationButtons: false,
      },
      layout: {
        improvedLayout: true,
      },
    };

    if (networkInstance.current) {
      networkInstance.current.destroy();
    }

    networkInstance.current = new Network(networkRef.current, data, options);

    // Handle node clicks
    networkInstance.current.on("click", (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.get(nodeId);
        
        if (nodeId.toString().startsWith("site-")) {
          const snapshot = snapshots.find((s: any) => 
            `site-${s.username}-${s.site}` === nodeId
          );
          if (snapshot?.url) {
            window.open(snapshot.url, "_blank");
          }
        }
      }
    });

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [snapshots, selectedCategory]);

  const stats = snapshots?.reduce((acc: any, s: any) => {
    const cat = categorizePlatform(s.site);
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Username</label>
            <Select value={selectedUsername} onValueChange={setSelectedUsername}>
              <SelectTrigger>
                <SelectValue placeholder="All usernames" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All usernames</SelectItem>
                {monitoredUsernames?.map((m) => (
                  <SelectItem key={m.username} value={m.username}>
                    {m.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">
              <Filter className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="dating">Dating</SelectItem>
                <SelectItem value="forum">Forum</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 items-end">
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

        {/* Category stats */}
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <Badge
              key={category}
              variant="outline"
              className="flex items-center gap-2"
              style={{ borderColor: color }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              {category}: {stats?.[category] || 0}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Network Graph */}
      <Card className="p-0 overflow-hidden">
        <div
          ref={networkRef}
          className="w-full h-[600px] bg-background"
          style={{ cursor: "grab" }}
        />
        
        {(!snapshots || snapshots.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium mb-2">No profiles found</p>
              <p className="text-sm">Run a Maigret scan to visualize profile networks</p>
            </div>
          </div>
        )}
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 border-2 border-primary bg-background rounded" />
            <span>Username</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500" />
            <span>Social Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500" />
            <span>Professional</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-pink-500" />
            <span>Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500" />
            <span>Gaming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500" />
            <span>Dating</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500" />
            <span>Forum</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-500" />
            <span>Other</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          💡 Click on platform nodes to open their profiles. Larger nodes indicate higher confidence scores.
        </p>
      </Card>
    </div>
  );
}
