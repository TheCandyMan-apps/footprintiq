import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, RefreshCw, ZoomIn, ZoomOut, Maximize2, GitBranch } from "lucide-react";
import cytoscape from "cytoscape";

interface DependencyGraphProps {
  modules: string[];
  onInstallWithDeps?: (module: string) => void;
}

export function ReconNgDependencyGraph({ modules, onInstallWithDeps }: DependencyGraphProps) {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dependencies, setDependencies] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (modules.length > 0) {
      loadDependencies();
    }
  }, [modules]);

  useEffect(() => {
    if (graphData && containerRef.current) {
      renderGraph();
    }
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [graphData]);

  const loadDependencies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('recon-ng-modules', {
        body: { action: 'dependencies', modules }
      });

      if (error) throw error;

      if (data.success) {
        setGraphData(data.graph);
        setDependencies(data.dependencies);
      } else {
        toast.error("Failed to load dependencies");
      }
    } catch (error: any) {
      console.error("Error loading dependencies:", error);
      toast.error("Failed to load dependency graph");
    } finally {
      setLoading(false);
    }
  };

  const renderGraph = () => {
    if (!containerRef.current || !graphData) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...graphData.nodes.map((node: any) => ({
          data: { id: node.id, label: node.label, category: node.category }
        })),
        ...graphData.edges.map((edge: any) => ({
          data: { source: edge.source, target: edge.target }
        }))
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#3b82f6',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#fff',
            'text-outline-color': '#000',
            'text-outline-width': 2,
            'font-size': '12px',
            'width': 60,
            'height': 60,
          }
        },
        {
          selector: 'node[category="recon"]',
          style: {
            'background-color': '#10b981'
          }
        },
        {
          selector: 'node[category="discovery"]',
          style: {
            'background-color': '#f59e0b'
          }
        },
        {
          selector: 'node[category="exploitation"]',
          style: {
            'background-color': '#ef4444'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#8b5cf6',
            'border-width': 3,
            'border-color': '#fff'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.5
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        spacingFactor: 1.5,
        animate: true,
        animationDuration: 500
      }
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.id());
    });

    cyRef.current = cy;
  };

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit();
    }
  };

  const handleExport = () => {
    if (cyRef.current) {
      const png = cyRef.current.png({ scale: 2 });
      const link = document.createElement('a');
      link.download = 'recon-ng-dependencies.png';
      link.href = png;
      link.click();
      toast.success("Graph exported successfully");
    }
  };

  if (modules.length === 0) {
    return (
      <Card className="p-8 text-center">
        <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Modules Selected</h3>
        <p className="text-sm text-muted-foreground">
          Select modules from the marketplace to visualize their dependencies
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Dependency Graph
            </h3>
            <p className="text-sm text-muted-foreground">
              {modules.length} module{modules.length !== 1 ? 's' : ''} • {Object.keys(dependencies).length} total with dependencies
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={loading}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={loading}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFit}
              disabled={loading}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={loading || !graphData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDependencies}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <div
              ref={containerRef}
              className="border rounded-lg bg-muted/20"
              style={{ height: '500px', width: '100%' }}
            >
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#10b981]" />
                  <span>Recon Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#f59e0b]" />
                  <span>Discovery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#ef4444]" />
                  <span>Exploitation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#3b82f6]" />
                  <span>Other</span>
                </div>
              </div>
            </Card>

            {selectedNode && (
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Selected Module</h4>
                <code className="text-xs block mb-3 bg-muted p-2 rounded">
                  {selectedNode}
                </code>
                {dependencies[selectedNode] && dependencies[selectedNode].length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Dependencies:</p>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {dependencies[selectedNode].map((dep) => (
                          <Badge key={dep} variant="secondary" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
                {onInstallWithDeps && (
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => onInstallWithDeps(selectedNode)}
                  >
                    Install with Dependencies
                  </Button>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
