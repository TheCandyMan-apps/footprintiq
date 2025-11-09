import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Maximize2, Download, Save } from 'lucide-react';
import { DataSet, Network } from 'vis-network/standalone';

interface MaltegoNode {
  id: string;
  label: string;
  type: string;
  properties?: Record<string, any>;
}

interface MaltegoEdge {
  from: string;
  to: string;
  label: string;
  weight?: number;
}

interface MaltegoGraphData {
  nodes: MaltegoNode[];
  edges: MaltegoEdge[];
  entity: string;
  transforms_executed: number;
}

interface MaltegoGraphViewerProps {
  data: MaltegoGraphData;
  onSaveToCase?: () => void;
}

export function MaltegoGraphViewer({ data, onSaveToCase }: MaltegoGraphViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [selectedNode, setSelectedNode] = useState<MaltegoNode | null>(null);
  const [stats, setStats] = useState({
    nodes: 0,
    edges: 0,
    types: new Set<string>()
  });

  useEffect(() => {
    if (!containerRef.current || !data) return;

    // Prepare nodes for vis.js
    const visNodes = new DataSet(
      data.nodes.map(node => ({
        id: node.id,
        label: node.label,
        title: `${node.type}: ${node.label}`,
        color: getNodeColor(node.type),
        shape: getNodeShape(node.type),
        font: { color: '#ffffff', size: 14 },
        data: node
      }))
    );

    // Prepare edges for vis.js
    const visEdges = new DataSet(
      data.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        label: edge.label,
        arrows: 'to',
        width: (edge.weight || 1) * 2,
        color: { color: 'rgba(100, 100, 100, 0.5)' }
      }))
    );

    // Create network
    const network = new Network(
      containerRef.current,
      { nodes: visNodes, edges: visEdges },
      {
        physics: {
          enabled: true,
          stabilization: { iterations: 100 },
          barnesHut: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 150
          }
        },
        interaction: {
          hover: true,
          tooltipDelay: 100,
          zoomView: true,
          dragView: true
        },
        layout: {
          improvedLayout: true,
          hierarchical: {
            enabled: false
          }
        }
      }
    );

    // Handle node selection
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = data.nodes.find(n => n.id === nodeId);
        setSelectedNode(node || null);
      } else {
        setSelectedNode(null);
      }
    });

    networkRef.current = network;

    // Calculate stats
    const types = new Set(data.nodes.map(n => n.type));
    setStats({
      nodes: data.nodes.length,
      edges: data.edges.length,
      types
    });

    return () => {
      network.destroy();
    };
  }, [data]);

  const getNodeColor = (type: string): string => {
    const colors: Record<string, string> = {
      root: '#8b5cf6',
      ip_address: '#3b82f6',
      email: '#10b981',
      social_media: '#f59e0b',
      phone: '#ef4444',
      domain: '#06b6d4',
      whois: '#6366f1'
    };
    return colors[type] || '#6b7280';
  };

  const getNodeShape = (type: string): string => {
    const shapes: Record<string, string> = {
      root: 'star',
      ip_address: 'box',
      email: 'ellipse',
      social_media: 'circle',
      phone: 'triangle',
      domain: 'diamond',
      whois: 'square'
    };
    return shapes[type] || 'dot';
  };

  const handleZoomIn = () => {
    networkRef.current?.moveTo({ scale: (networkRef.current.getScale() || 1) * 1.2 });
  };

  const handleZoomOut = () => {
    networkRef.current?.moveTo({ scale: (networkRef.current.getScale() || 1) * 0.8 });
  };

  const handleFit = () => {
    networkRef.current?.fit({ animation: { duration: 500 } });
  };

  const handleExport = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `maltego-graph-${data.entity}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🔍 Maltego AI Graph
              <Badge variant="secondary" className="ml-2">
                {data.transforms_executed} Transforms
              </Badge>
            </CardTitle>
            <CardDescription>
              AI-driven OSINT graph for <strong>{data.entity}</strong>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleFit}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            {onSaveToCase && (
              <Button onClick={onSaveToCase} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save to Case
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="flex gap-4 mb-4">
          <Badge variant="outline">
            {stats.nodes} Nodes
          </Badge>
          <Badge variant="outline">
            {stats.edges} Connections
          </Badge>
          <Badge variant="outline">
            {stats.types.size} Entity Types
          </Badge>
        </div>

        {/* Graph Container */}
        <div 
          ref={containerRef} 
          className="w-full h-[600px] border rounded-lg bg-slate-900"
        />

        {/* Selected Node Info */}
        {selectedNode && (
          <div className="mt-4 p-4 border rounded-lg bg-muted">
            <h4 className="font-semibold mb-2">{selectedNode.label}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Type: <Badge variant="secondary">{selectedNode.type}</Badge>
            </p>
            {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Properties:</p>
                <div className="text-sm space-y-1">
                  {Object.entries(selectedNode.properties).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-muted-foreground">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
              Root Entity
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
              IP Address
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
              Email
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
              Social Media
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
