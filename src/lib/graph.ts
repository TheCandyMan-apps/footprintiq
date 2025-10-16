import { Finding } from "./ufm";

export interface GraphNode {
  id: string;
  label: string;
  type: 'username' | 'email' | 'domain' | 'ip' | 'phone';
  findings: Finding[];
  color: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  sharedFindings: number;
}

export const buildGraph = (findings: Finding[]): { nodes: GraphNode[]; edges: GraphEdge[] } => {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  
  const nodeColors: Record<GraphNode['type'], string> = {
    username: 'hsl(var(--chart-1))',
    email: 'hsl(var(--chart-2))',
    domain: 'hsl(var(--chart-3))',
    ip: 'hsl(var(--chart-4))',
    phone: 'hsl(var(--chart-5))'
  };
  
  // Extract entities from findings
  for (const finding of findings) {
    for (const evidence of finding.evidence) {
      const value = String(evidence.value);
      const type = inferNodeType(evidence.key, value);
      
      if (!nodes.has(value)) {
        nodes.set(value, {
          id: value,
          label: value,
          type,
          findings: [],
          color: nodeColors[type]
        });
      }
      nodes.get(value)!.findings.push(finding);
    }
  }
  
  // Build edges based on shared findings
  const nodeArray = Array.from(nodes.values());
  for (let i = 0; i < nodeArray.length; i++) {
    for (let j = i + 1; j < nodeArray.length; j++) {
      const sharedFindings = nodeArray[i].findings.filter(f =>
        nodeArray[j].findings.some(f2 => f2.id === f.id)
      ).length;
      
      if (sharedFindings > 0) {
        edges.push({
          source: nodeArray[i].id,
          target: nodeArray[j].id,
          weight: sharedFindings,
          sharedFindings
        });
      }
    }
  }
  
  return { nodes: nodeArray, edges };
};

const inferNodeType = (key: string, value: string): GraphNode['type'] => {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('username')) return 'username';
  if (lowerKey.includes('email') || value.includes('@')) return 'email';
  if (lowerKey.includes('domain') || /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) return 'domain';
  if (lowerKey.includes('ip') || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) return 'ip';
  if (lowerKey.includes('phone')) return 'phone';
  return 'username';
};