import { Finding } from "./ufm";
import { supabase } from "@/integrations/supabase/client";
import { calculateEntityScore, calculateEdgeConfidence } from "./score";

// Legacy interfaces for backward compatibility
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

// New database-backed entity interfaces
export interface EntityNode {
  id: string;
  userId: string;
  entityType: "email" | "username" | "domain" | "phone" | "ip" | "person";
  entityValue: string;
  metadata: Record<string, any>;
  riskScore: number;
  confidenceScore: number;
  providerCount: number;
  findingCount: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  firstSeen: string;
  lastUpdated: string;
  createdAt: string;
}

export interface EntityEdge {
  id: string;
  userId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: string;
  confidence: number;
  providers: string[];
  evidence: any[];
  metadata: Record<string, any>;
  createdAt: string;
}

export interface GraphData {
  nodes: EntityNode[];
  edges: EntityEdge[];
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

/**
 * Detect entity type from string value
 */
export function detectEntityType(
  value: string
): EntityNode["entityType"] | null {
  // Email pattern
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "email";
  }

  // Domain pattern (without protocol)
  if (/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(value)) {
    return "domain";
  }

  // IP pattern
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    return "ip";
  }

  // Phone pattern
  if (/^\+?[0-9\s()-]{10,15}$/.test(value)) {
    return "phone";
  }

  // Username pattern (alphanumeric, underscore, dash)
  if (/^[a-zA-Z0-9_-]{3,39}$/.test(value)) {
    return "username";
  }

  return null;
}

/**
 * Convert database format to EntityNode
 */
function dbToEntityNode(dbNode: any): EntityNode {
  return {
    id: dbNode.id,
    userId: dbNode.user_id,
    entityType: dbNode.entity_type,
    entityValue: dbNode.entity_value,
    metadata: dbNode.metadata || {},
    riskScore: dbNode.risk_score,
    confidenceScore: dbNode.confidence_score,
    providerCount: dbNode.provider_count,
    findingCount: dbNode.finding_count,
    severityBreakdown: dbNode.severity_breakdown || {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    },
    firstSeen: dbNode.first_seen,
    lastUpdated: dbNode.last_updated,
    createdAt: dbNode.created_at,
  };
}

/**
 * Convert database format to EntityEdge
 */
function dbToEntityEdge(dbEdge: any): EntityEdge {
  return {
    id: dbEdge.id,
    userId: dbEdge.user_id,
    sourceNodeId: dbEdge.source_node_id,
    targetNodeId: dbEdge.target_node_id,
    relationshipType: dbEdge.relationship_type,
    confidence: dbEdge.confidence,
    providers: dbEdge.providers || [],
    evidence: dbEdge.evidence || [],
    metadata: dbEdge.metadata || {},
    createdAt: dbEdge.created_at,
  };
}

/**
 * Create or update entity node
 */
export async function upsertEntityNode(
  entityType: EntityNode["entityType"],
  entityValue: string,
  findings: Finding[] = [],
  metadata: Record<string, any> = {}
): Promise<EntityNode | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const score = calculateEntityScore(findings);

    const { data, error } = await supabase
      .from("entity_nodes")
      .upsert(
        {
          user_id: user.id,
          entity_type: entityType,
          entity_value: entityValue,
          metadata,
          risk_score: score.riskScore,
          confidence_score: score.confidenceScore,
          provider_count: score.providerCount,
          finding_count: score.findingCount,
          severity_breakdown: score.severityBreakdown,
        },
        {
          onConflict: "user_id,entity_type,entity_value",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return dbToEntityNode(data);
  } catch (error) {
    console.error("[graph] Error upserting entity node:", error);
    return null;
  }
}

/**
 * Create or update entity edge
 */
export async function upsertEntityEdge(
  sourceNodeId: string,
  targetNodeId: string,
  relationshipType: string,
  providers: string[] = [],
  evidence: any[] = [],
  metadata: Record<string, any> = {}
): Promise<EntityEdge | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const confidence = calculateEdgeConfidence(providers, evidence.length);

    const { data, error } = await supabase
      .from("entity_edges")
      .upsert(
        {
          user_id: user.id,
          source_node_id: sourceNodeId,
          target_node_id: targetNodeId,
          relationship_type: relationshipType,
          confidence,
          providers,
          evidence,
          metadata,
        },
        {
          onConflict: "source_node_id,target_node_id,relationship_type",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return dbToEntityEdge(data);
  } catch (error) {
    console.error("[graph] Error upserting entity edge:", error);
    return null;
  }
}

/**
 * Get entity node by value
 */
export async function getEntityNode(
  entityType: EntityNode["entityType"],
  entityValue: string
): Promise<EntityNode | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("entity_nodes")
      .select("*")
      .eq("user_id", user.id)
      .eq("entity_type", entityType)
      .eq("entity_value", entityValue)
      .maybeSingle();

    if (error) throw error;
    return data ? dbToEntityNode(data) : null;
  } catch (error) {
    console.error("[graph] Error getting entity node:", error);
    return null;
  }
}

/**
 * Get connected entities (graph traversal)
 */
export async function getConnectedEntities(
  nodeId: string
): Promise<GraphData> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { nodes: [], edges: [] };

    // Get direct edges
    const { data: edges, error: edgesError } = await supabase
      .from("entity_edges")
      .select("*")
      .eq("user_id", user.id)
      .or(`source_node_id.eq.${nodeId},target_node_id.eq.${nodeId}`);

    if (edgesError) throw edgesError;

    if (!edges || edges.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Get connected node IDs
    const nodeIds = new Set([nodeId]);
    edges.forEach((edge: any) => {
      nodeIds.add(edge.source_node_id);
      nodeIds.add(edge.target_node_id);
    });

    // Get nodes
    const { data: nodes, error: nodesError } = await supabase
      .from("entity_nodes")
      .select("*")
      .eq("user_id", user.id)
      .in("id", Array.from(nodeIds));

    if (nodesError) throw nodesError;

    return {
      nodes: (nodes || []).map(dbToEntityNode),
      edges: (edges || []).map(dbToEntityEdge),
    };
  } catch (error) {
    console.error("[graph] Error getting connected entities:", error);
    return { nodes: [], edges: [] };
  }
}

/**
 * Search entities by value pattern
 */
export async function searchEntities(
  searchTerm: string,
  limit: number = 20
): Promise<EntityNode[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("entity_nodes")
      .select("*")
      .eq("user_id", user.id)
      .ilike("entity_value", `%${searchTerm}%`)
      .order("risk_score", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(dbToEntityNode);
  } catch (error) {
    console.error("[graph] Error searching entities:", error);
    return [];
  }
}

/**
 * Get full graph for user
 */
export async function getUserGraph(): Promise<GraphData> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { nodes: [], edges: [] };

    const [nodesResult, edgesResult] = await Promise.all([
      supabase
        .from("entity_nodes")
        .select("*")
        .eq("user_id", user.id)
        .order("risk_score", { ascending: false }),
      supabase
        .from("entity_edges")
        .select("*")
        .eq("user_id", user.id),
    ]);

    return {
      nodes: (nodesResult.data || []).map(dbToEntityNode),
      edges: (edgesResult.data || []).map(dbToEntityEdge),
    };
  } catch (error) {
    console.error("[graph] Error getting user graph:", error);
    return { nodes: [], edges: [] };
  }
}

/**
 * Export graph snapshot
 */
export async function exportGraphSnapshot(
  name: string,
  description?: string
): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const graphData = await getUserGraph();

    const { data, error } = await supabase
      .from("graph_snapshots")
      .insert([{
        user_id: user.id,
        name,
        description: description || null,
        graph_data: graphData as any,
        node_count: graphData.nodes.length,
        edge_count: graphData.edges.length,
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("[graph] Error exporting graph snapshot:", error);
    return null;
  }
}

/**
 * Build graph from scan findings
 */
export async function buildGraphFromFindings(
  findings: Finding[],
  sourceEntity: { type: EntityNode["entityType"]; value: string }
): Promise<void> {
  try {
    // Create source node
    const sourceNode = await upsertEntityNode(
      sourceEntity.type,
      sourceEntity.value,
      findings
    );

    if (!sourceNode) return;

    // Extract related entities from findings and create edges
    for (const finding of findings) {
      // Extract emails, domains, IPs, etc. from evidence
      const evidence = finding.evidence || [];
      
      for (const ev of evidence) {
        if (typeof ev.value === "string") {
          const entityType = detectEntityType(ev.value);
          if (entityType && entityType !== sourceEntity.type) {
            // Create target node
            const targetNode = await upsertEntityNode(
              entityType,
              ev.value,
              [finding]
            );

            if (targetNode) {
              // Create edge
              await upsertEntityEdge(
                sourceNode.id,
                targetNode.id,
                ev.key || "related_to",
                [finding.provider],
                [finding],
                { findingType: finding.type }
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("[graph] Error building graph from findings:", error);
  }
}