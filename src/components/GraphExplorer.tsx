import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { GraphNode, GraphEdge } from "@/lib/graph";
import { useState, useEffect, useRef } from "react";

interface GraphExplorerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const GraphExplorer = ({ nodes, edges }: GraphExplorerProps) => {
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  // Resolve CSS HSL variables to actual color strings for canvas
  const cssHsl = (varName: string) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return v ? `hsl(${v})` : '#000';
  };
  const typeToVar: Record<GraphNode['type'], string> = {
    username: '--chart-1',
    email: '--chart-2',
    domain: '--chart-3',
    ip: '--chart-4',
    phone: '--chart-5',
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with proper device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 400;

    // Clear canvas with background color
    ctx.fillStyle = cssHsl('--background');
    ctx.fillRect(0, 0, width, height);

    // Show message if no nodes
    if (nodes.length === 0) {
      ctx.fillStyle = cssHsl('--muted-foreground');
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No relationship data available', width / 2, height / 2);
      ctx.fillText('Graph will appear when entities are detected in findings', width / 2, height / 2 + 20);
      return;
    }

    // Simple force-directed layout simulation
    const positions = new Map<string, { x: number; y: number }>();
    nodes.forEach((node, idx) => {
      const angle = (idx / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.35;
      positions.set(node.id, {
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle)
      });
    });
    setNodePositions(positions);

    // Draw edges
    ctx.strokeStyle = cssHsl('--border');
    edges.forEach(edge => {
      const source = positions.get(edge.source);
      const target = positions.get(edge.target);
      if (!source || !target) return;

      ctx.lineWidth = Math.min(edge.weight, 5);
      ctx.globalAlpha = Math.min(1, 0.3 + (edge.weight / 10));
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;

    // Draw nodes
    nodes.forEach(node => {
      const pos = positions.get(node.id);
      if (!pos) return;

      const avgConfidence = node.findings.reduce((sum, f) => sum + f.confidence, 0) / node.findings.length;
      if (avgConfidence * 100 < confidenceFilter) return;

      // Draw circle
      ctx.fillStyle = cssHsl(typeToVar[node.type]);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI);
      ctx.fill();

      // Draw white border
      ctx.strokeStyle = cssHsl('--background');
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = cssHsl('--foreground');
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      const label = node.label.length > 15 ? node.label.substring(0, 12) + '...' : node.label;
      ctx.fillText(label, pos.x, pos.y + 30);
    });

    // Highlight hovered node
    if (hoveredNode) {
      const pos = positions.get(hoveredNode.id);
      if (pos) {
        ctx.strokeStyle = cssHsl('--primary');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 18, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  }, [nodes, edges, confidenceFilter, hoveredNode]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is on a node
    for (const [nodeId, pos] of nodePositions) {
      const dx = x - pos.x;
      const dy = y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 15) {
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          setSelectedNode(node);
          return;
        }
      }
    }

    setSelectedNode(null);
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if hovering over a node
    for (const [nodeId, pos] of nodePositions) {
      const dx = x - pos.x;
      const dy = y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 15) {
        const node = nodes.find((n) => n.id === nodeId);
        if (node && node.id !== hoveredNode?.id) {
          setHoveredNode(node);
          canvas.style.cursor = 'pointer';
          return;
        }
      }
    }

    if (hoveredNode) {
      setHoveredNode(null);
      canvas.style.cursor = 'default';
    }
  };

  const filteredNodes = nodes.filter(node => {
    const avgConfidence = node.findings.reduce((sum, f) => sum + f.confidence, 0) / node.findings.length;
    return avgConfidence * 100 >= confidenceFilter;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relationship Graph</CardTitle>
        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm text-muted-foreground">Confidence Filter:</span>
          <Slider
            value={[confidenceFilter]}
            onValueChange={([val]) => setConfidenceFilter(val)}
            max={100}
            step={5}
            className="flex-1 max-w-xs"
          />
          <span className="text-sm font-medium">{confidenceFilter}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <canvas 
          ref={canvasRef} 
          className="w-full h-[400px] border border-border rounded-lg"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
        />
        
        {selectedNode && (
          <div className="mt-4 p-4 bg-muted rounded-lg border">
            <h4 className="font-semibold mb-2">{selectedNode.label}</h4>
            <p className="text-sm text-muted-foreground mb-2">Type: {selectedNode.type}</p>
            <p className="text-sm mb-2">
              <strong>Findings:</strong> {selectedNode.findings.length}
            </p>
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Why linked?</p>
              <p>
                This {selectedNode.type} appears in {selectedNode.findings.length} finding(s).
                Connections indicate shared evidence across multiple data sources.
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
            <span className="text-xs">Username</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
            <span className="text-xs">Email</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
            <span className="text-xs">Domain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-4))' }} />
            <span className="text-xs">IP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-5))' }} />
            <span className="text-xs">Phone</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="font-semibold">{filteredNodes.length}</span> nodes shown | 
            <span className="font-semibold ml-2">{edges.length}</span> connections
          </p>
        </div>
      </CardContent>
    </Card>
  );
};