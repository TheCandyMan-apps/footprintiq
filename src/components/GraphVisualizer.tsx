import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface GraphNode {
  id: string;
  entity_type: string;
  value: string;
  risk_score: number;
  confidence_score: number;
}

interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: string;
  confidence: number;
}

interface GraphVisualizerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeSelect?: (node: GraphNode) => void;
}

export default function GraphVisualizer({ nodes, edges, onNodeSelect }: GraphVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [confidenceFilter, setConfidenceFilter] = useState([0]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const filteredEdges = edges.filter(e => e.confidence >= confidenceFilter[0] / 100);

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...nodes.map(n => ({
          data: { 
            id: n.id, 
            label: n.value,
            type: n.entity_type,
            risk: n.risk_score,
            confidence: n.confidence_score
          }
        })),
        ...filteredEdges.map(e => ({
          data: { 
            id: e.id, 
            source: e.source_id, 
            target: e.target_id,
            label: e.relationship_type,
            confidence: e.confidence
          }
        }))
      ],
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'width': '60px',
            'height': '60px'
          }
        },
        {
          selector: 'node[type="email"]',
          style: {
            'background-color': 'hsl(var(--primary))',
          }
        },
        {
          selector: 'node[type="domain"]',
          style: {
            'background-color': 'hsl(var(--accent))',
          }
        },
        {
          selector: 'node[type="ip"]',
          style: {
            'background-color': 'hsl(var(--destructive))',
          }
        },
        {
          selector: 'node[type="phone"]',
          style: {
            'background-color': 'hsl(var(--secondary))',
          }
        },
        {
          selector: 'node[risk > 70]',
          style: {
            'border-width': '4px',
            'border-color': 'hsl(var(--destructive))',
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': 'hsl(var(--muted))',
            'target-arrow-color': 'hsl(var(--muted))',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate',
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: true,
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
        minTemp: 1.0
      }
    });

    cy.on('tap', 'node', (evt: any) => {
      const nodeData = evt.target.data();
      const node = nodes.find(n => n.id === nodeData.id);
      if (node) {
        setSelectedNode(node);
        onNodeSelect?.(node);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, confidenceFilter, onNodeSelect]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Knowledge Graph</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleFit}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Min Confidence:</span>
          <Slider
            value={confidenceFilter}
            onValueChange={setConfidenceFilter}
            max={100}
            step={5}
            className="w-48"
          />
          <span className="text-sm font-medium">{confidenceFilter[0]}%</span>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-120px)] relative">
        <div ref={containerRef} className="w-full h-full rounded-lg bg-muted/20" />
        
        {selectedNode && (
          <Card className="absolute bottom-4 left-4 w-80">
            <CardHeader>
              <CardTitle className="text-sm">{selectedNode.value}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <Badge>{selectedNode.entity_type}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Risk</span>
                <Badge variant={selectedNode.risk_score > 70 ? "destructive" : "secondary"}>
                  {selectedNode.risk_score}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span>{selectedNode.confidence_score}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="absolute top-4 right-4">
          <CardContent className="p-3">
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span>Domain</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span>IP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span>Phone</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
