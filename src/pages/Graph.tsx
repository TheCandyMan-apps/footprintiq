import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  Network,
  FileJson,
  ScanSearch,
  Eye,
  EyeOff,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { EmptyState } from "@/components/ui/empty-state";
import { useAggregatedMindMapData } from "@/hooks/useAggregatedMindMapData";
import { MindMapGraph, MindMapViewMode, ConnectByMode, ProfileEntity, LegData } from "@/components/scan/results-tabs/connections/MindMapGraph";
import { MindMapInspector } from "@/components/scan/results-tabs/connections/MindMapInspector";

export default function Graph() {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch aggregated data from all user scans
  const { data, isLoading, error } = useAggregatedMindMapData();

  // Mind map state
  const [viewMode, setViewMode] = useState<MindMapViewMode>('category');
  const [connectBy, setConnectBy] = useState<ConnectByMode>('profile');
  const [showConnections, setShowConnections] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(() => window.innerWidth >= 768);

  // Selected entity/leg state
  const [selectedEntity, setSelectedEntity] = useState<ProfileEntity | null>(null);
  const [selectedLeg, setSelectedLeg] = useState<LegData | null>(null);
  const [legs, setLegs] = useState<LegData[]>([]);

  // Derived stats
  const stats = useMemo(() => {
    const profileCount = data?.results.length || 0;
    const categoryCount = legs.length;
    return { profileCount, categoryCount };
  }, [data?.results.length, legs.length]);

  // Category breakdown for inspector
  const categoryBreakdown = useMemo((): Array<[string, number]> => {
    const counts = new Map<string, number>();
    data?.results.forEach(r => {
      const meta = (r.meta || (r as any).metadata || {}) as Record<string, any>;
      const category = meta.category || 'Other';
      counts.set(category, (counts.get(category) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [data?.results]);

  // Handlers
  const handleNodeClick = useCallback((entity: ProfileEntity | null) => {
    setSelectedEntity(entity);
    setSelectedLeg(null);
    if (entity && !inspectorOpen) {
      setInspectorOpen(true);
    }
  }, [inspectorOpen]);

  const handleNodeDoubleClick = useCallback((entity: ProfileEntity) => {
    if (entity.url) {
      window.open(entity.url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleLegClick = useCallback((leg: LegData | null) => {
    setSelectedLeg(leg);
    setSelectedEntity(null);
    if (leg && !inspectorOpen) {
      setInspectorOpen(true);
    }
  }, [inspectorOpen]);

  const handleLegsComputed = useCallback((computedLegs: LegData[]) => {
    setLegs(computedLegs);
  }, []);

  const handleOpenProfile = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleExportJSON = useCallback(() => {
    if (!data?.results.length) return;
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      username: data.username,
      totalProfiles: data.results.length,
      totalScans: data.totalScans,
      profiles: data.results.map(r => ({
        platform: r.site || (r.meta as any)?.platform || 'Unknown',
        url: r.url,
        username: (r.meta as any)?.username || '',
        category: (r.meta as any)?.category || 'Other',
      })),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `footprintiq-entity-graph-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Graph Exported",
      description: "JSON export downloaded successfully",
    });
  }, [data, toast]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEO
          title="Entity Graph - FootprintIQ"
          description="Interactive OSINT correlation graph. Visualize entity relationships, explore connections, and analyze intelligence patterns."
        />
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground">Loading your digital footprint...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEO
          title="Entity Graph - FootprintIQ"
          description="Interactive OSINT correlation graph."
        />
        <Header />
        <main className="flex-1 flex items-center justify-center px-6">
          <EmptyState
            icon={Network}
            title="Error Loading Graph"
            description="We couldn't load your entity graph data. Please try again."
            action={{
              label: "Retry",
              onClick: () => window.location.reload(),
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Empty state
  if (!data?.results.length) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEO
          title="Entity Graph - FootprintIQ"
          description="Interactive OSINT correlation graph."
        />
        <Header />
        <main className="flex-1 flex items-center justify-center px-6">
          <EmptyState
            icon={ScanSearch}
            title="No Graph Data Yet"
            description="Run some scans to build your entity correlation graph. Each scan adds profiles and connections to your digital footprint map."
            action={{
              label: "Start First Scan",
              onClick: () => navigate("/scan"),
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Entity Graph - FootprintIQ"
        description="Interactive OSINT correlation graph. Visualize entity relationships, explore connections, and analyze intelligence patterns."
      />
      <Header />

      <main className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Entity Graph</h1>
            <p className="text-muted-foreground">
              Cross-scan mind map • {stats.profileCount} profiles • {stats.categoryCount} groups
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <FileJson className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button size="sm" onClick={() => navigate("/scan")}>
              New Scan
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <Card className="p-3 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* View Mode */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">View:</Label>
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as MindMapViewMode)}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="all">All Pivots</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Connect By (only for 'all' mode) */}
            {viewMode === 'all' && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Connect by:</Label>
                <Select value={connectBy} onValueChange={(v) => setConnectBy(v as ConnectByMode)}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="username">Username</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Show Connections Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="show-connections"
                checked={showConnections}
                onCheckedChange={setShowConnections}
              />
              <Label htmlFor="show-connections" className="text-xs cursor-pointer">
                {showConnections ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Label>
            </div>

            <div className="flex-1" />

            {/* Inspector Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInspectorOpen(!inspectorOpen)}
              className="gap-2"
            >
              {inspectorOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              <span className="hidden sm:inline text-xs">{inspectorOpen ? 'Hide' : 'Show'} Panel</span>
            </Button>
          </div>
        </Card>

        {/* Main Content */}
        <div className="flex-1 flex gap-0 min-h-[600px]">
          {/* Graph Area */}
          <Card 
            ref={graphContainerRef}
            className="flex-1 relative overflow-hidden"
            disableHover
          >
            <MindMapGraph
              results={data.results}
              username={data.username}
              viewMode={viewMode}
              connectBy={connectBy}
              showConnections={showConnections}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              onLegClick={handleLegClick}
              onLegsComputed={handleLegsComputed}
              className="h-full min-h-[600px]"
            />
          </Card>

          {/* Inspector Panel */}
          <MindMapInspector
            isOpen={inspectorOpen}
            onClose={() => setInspectorOpen(false)}
            selectedEntity={selectedEntity}
            selectedLeg={selectedLeg}
            totalProfiles={stats.profileCount}
            totalLegs={stats.categoryCount}
            categoryBreakdown={categoryBreakdown}
            onOpenProfile={handleOpenProfile}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Helper functions for risk/confidence levels (kept for backwards compatibility)
function getRiskLevel(score: number): string {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function getConfidenceLevel(score: number): string {
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}
