import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import cytoscape from "cytoscape";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadges } from "@/components/ScoreBadges";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  Network,
  FileJson,
  Trash2,
} from "lucide-react";
import { getUserGraph, getConnectedEntities, exportGraphSnapshot, type EntityNode, type EntityEdge } from "@/lib/graph";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

export default function Graph() {
  const cyRef = useRef<HTMLDivElement>(null);
  const cyInstance = useRef<cytoscape.Core | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<EntityNode | null>(null);
  const [nodes, setNodes] = useState<EntityNode[]>([]);
  const [edges, setEdges] = useState<EntityEdge[]>([]);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const focusNodeId = searchParams.get("focus");
      
      let graphData;
      if (focusNodeId) {
        graphData = await getConnectedEntities(focusNodeId);
      } else {
        graphData = await getUserGraph();
      }

      setNodes(graphData.nodes);
      setEdges(graphData.edges);

      if (graphData.nodes.length > 0) {
        initializeGraph(graphData.nodes, graphData.edges, focusNodeId);
      }
    } catch (error) {
      console.error("[Graph] Error loading graph:", error);
      toast({
        title: "Error",
        description: "Failed to load graph data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeGraph = (
    graphNodes: EntityNode[],
    graphEdges: EntityEdge[],
    focusNodeId?: string | null
  ) => {
    if (!cyRef.current) return;

    // Map nodes to Cytoscape format
    const cyNodes = graphNodes.map((node) => ({
      data: {
        id: node.id,
        label: node.entityValue,
        type: node.entityType,
        riskScore: node.riskScore,
        confidenceScore: node.confidenceScore,
        providerCount: node.providerCount,
        findingCount: node.findingCount,
        node,
      },
    }));

    // Map edges to Cytoscape format
    const cyEdges = graphEdges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        label: edge.relationshipType,
        confidence: edge.confidence,
        edge,
      },
    }));

    // Initialize Cytoscape
    const cy = cytoscape({
      container: cyRef.current,
      elements: [...cyNodes, ...cyEdges],
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "background-color": "#2563eb",
            color: "#fff",
            "font-size": "12px",
            width: "label",
            height: "label",
            shape: "roundrectangle",
            padding: "10px",
            "text-wrap": "wrap",
            "text-max-width": "120px",
          },
        },
        {
          selector: "node[type='email']",
          style: {
            "background-color": "hsl(var(--chart-1))",
          },
        },
        {
          selector: "node[type='username']",
          style: {
            "background-color": "hsl(var(--chart-2))",
          },
        },
        {
          selector: "node[type='domain']",
          style: {
            "background-color": "hsl(var(--chart-3))",
          },
        },
        {
          selector: "node[type='phone']",
          style: {
            "background-color": "hsl(var(--chart-4))",
          },
        },
        {
          selector: "node[type='ip']",
          style: {
            "background-color": "hsl(var(--chart-5))",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": "3px",
            "border-color": "#f59e0b",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#94a3b8",
            "target-arrow-color": "#94a3b8",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": "10px",
            color: "#64748b",
            "text-rotation": "autorotate",
            "text-margin-y": -10,
          },
        },
      ],
      layout: {
        name: "cose",
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      },
    });

    // Node click handler
    cy.on("tap", "node", (evt) => {
      const node = evt.target.data("node");
      setSelectedNode(node);
    });

    // Double-click to expand
    cy.on("dbltap", "node", async (evt) => {
      const nodeId = evt.target.id();
      const expandedData = await getConnectedEntities(nodeId);
      
      // Add new nodes and edges
      expandedData.nodes.forEach((node) => {
        if (!cy.$(`#${node.id}`).length) {
          cy.add({
            data: {
              id: node.id,
              label: node.entityValue,
              type: node.entityType,
              riskScore: node.riskScore,
              confidenceScore: node.confidenceScore,
              providerCount: node.providerCount,
              findingCount: node.findingCount,
              node,
            },
          });
        }
      });

      expandedData.edges.forEach((edge) => {
        if (!cy.$(`#${edge.id}`).length) {
          cy.add({
            data: {
              id: edge.id,
              source: edge.sourceNodeId,
              target: edge.targetNodeId,
              label: edge.relationshipType,
              confidence: edge.confidence,
              edge,
            },
          });
        }
      });

      // Re-layout
      cy.layout({
        name: "cose",
        animate: true,
        animationDuration: 500,
      }).run();
    });

    cyInstance.current = cy;

    // Focus on specific node if provided
    if (focusNodeId) {
      const node = cy.$(`#${focusNodeId}`);
      if (node.length) {
        cy.animate({
          center: { eles: node },
          zoom: 2,
        });
        node.select();
        setSelectedNode(node.data("node"));
      }
    }
  };

  const handleZoomIn = () => {
    cyInstance.current?.zoom(cyInstance.current.zoom() * 1.2);
  };

  const handleZoomOut = () => {
    cyInstance.current?.zoom(cyInstance.current.zoom() * 0.8);
  };

  const handleFit = () => {
    cyInstance.current?.fit();
  };

  const handleExportJSON = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `footprintiq-graph-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Graph Exported",
      description: "JSON export downloaded successfully",
    });
  };

  const handleSaveSnapshot = async () => {
    const snapshotId = await exportGraphSnapshot(
      `Snapshot ${new Date().toLocaleString()}`,
      `Graph snapshot with ${nodes.length} nodes and ${edges.length} edges`
    );

    if (snapshotId) {
      toast({
        title: "Snapshot Saved",
        description: "Graph snapshot saved successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save snapshot",
        variant: "destructive",
      });
    }
  };

  const handleClearGraph = () => {
    if (cyInstance.current) {
      cyInstance.current.elements().remove();
      cyInstance.current.destroy();
      cyInstance.current = null;
    }
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    
    toast({
      title: "Graph Cleared",
      description: "All nodes and edges have been removed",
    });
  };

  const score = selectedNode ? {
    riskScore: selectedNode.riskScore,
    confidenceScore: selectedNode.confidenceScore,
    providerCount: selectedNode.providerCount,
    findingCount: selectedNode.findingCount,
    severityBreakdown: selectedNode.severityBreakdown,
    topProviders: [],
    riskLevel: getRiskLevel(selectedNode.riskScore),
    confidenceLevel: getConfidenceLevel(selectedNode.confidenceScore),
  } : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Entity Graph - FootprintIQ"
        description="Interactive OSINT correlation graph. Visualize entity relationships, explore connections, and analyze intelligence patterns."
      />
      <Header />

      <main className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Entity Graph</h1>
            <p className="text-muted-foreground">
              Interactive correlation map • {nodes.length} nodes • {edges.length} edges
            </p>
          </div>
          <div className="flex gap-2">
            {nodes.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Graph
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Entity Graph?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all {nodes.length} nodes and {edges.length} edges from the current view. 
                      This action cannot be undone, but you can reload the graph from your scan data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearGraph}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear Graph
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="outline" size="sm" onClick={handleExportJSON} disabled={nodes.length === 0}>
              <FileJson className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveSnapshot} disabled={nodes.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Save Snapshot
            </Button>
            <Button size="sm" onClick={() => navigate("/search")}>
              Search Entities
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
          {/* Graph Visualization */}
          <Card className="lg:col-span-3 p-0 relative overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Loading graph...</p>
                </div>
              </div>
            ) : nodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                  <Network className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Graph Data</h3>
                  <p className="text-muted-foreground mb-6">
                    Run some scans to build your entity correlation graph. Each scan adds nodes and edges.
                  </p>
                  <Button onClick={() => navigate("/scan")}>Start First Scan</Button>
                </div>
              </div>
            ) : null}

            <div ref={cyRef} className="w-full h-full min-h-[600px]" />

            {/* Graph Controls */}
            {nodes.length > 0 && (
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <Button size="icon" variant="secondary" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" onClick={handleFit}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </Card>

          {/* Node Details Panel */}
          <Card className="p-6 overflow-y-auto max-h-[700px]">
            {selectedNode ? (
              <div>
                <div className="mb-4">
                  <Badge variant="outline" className="mb-2 capitalize">
                    {selectedNode.entityType}
                  </Badge>
                  <h3 className="text-lg font-semibold break-all">
                    {selectedNode.entityValue}
                  </h3>
                </div>

                {score && (
                  <div className="mb-6">
                    <ScoreBadges score={score} />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Severity Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Critical</span>
                        <span className="font-medium">{selectedNode.severityBreakdown.critical}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">High</span>
                        <span className="font-medium">{selectedNode.severityBreakdown.high}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Medium</span>
                        <span className="font-medium">{selectedNode.severityBreakdown.medium}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Low</span>
                        <span className="font-medium">{selectedNode.severityBreakdown.low}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Info</span>
                        <span className="font-medium">{selectedNode.severityBreakdown.info}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">First Seen</span>
                        <span className="font-medium">
                          {new Date(selectedNode.firstSeen).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="font-medium">
                          {new Date(selectedNode.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-3">
                      💡 Double-click nodes to expand connections
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      View Full Details
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Network className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Click a node to view details
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function getRiskLevel(score: number): "critical" | "high" | "medium" | "low" | "minimal" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  if (score >= 20) return "low";
  return "minimal";
}

function getConfidenceLevel(score: number): "very_high" | "high" | "medium" | "low" {
  if (score >= 85) return "very_high";
  if (score >= 70) return "high";
  if (score >= 50) return "medium";
  return "low";
}
