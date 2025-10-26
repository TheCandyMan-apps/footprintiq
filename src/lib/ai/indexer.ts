/**
 * AI Indexer - Builds RAG documents from findings and graph
 * Stores compact, redacted chunks for retrieval
 */

import { supabase } from "@/integrations/supabase/client";
import { Finding } from "@/lib/ufm";
import { redactValue } from "@/lib/redact";

export interface RAGChunk {
  entity_id: string;
  chunk_id: string;
  text: string;
  metadata: {
    entity_type: string;
    entity_value: string;
    providers: string[];
    severities: string[];
    finding_ids: string[];
    observed_at: string;
  };
}

/**
 * Build RAG chunks from entity node data
 */
export async function buildEntityChunks(
  entityId: string,
  entityType: string,
  entityValue: string
): Promise<RAGChunk[]> {
  const chunks: RAGChunk[] = [];

  // Get entity node metadata
  const { data: node } = await supabase
    .from("entity_nodes")
    .select("*")
    .eq("id", entityId)
    .single();

  if (!node) return chunks;

  // Build main entity summary chunk
  const metadata = node.metadata as any || {};
  const severityBreakdown = node.severity_breakdown as any || {};
  
  const summaryText = `
Entity: ${entityType} (${redactValue(entityValue, entityType)})
Risk Score: ${node.risk_score}/100
Confidence: ${node.confidence_score}/100
Provider Count: ${node.provider_count}
Finding Count: ${node.finding_count}
Severities: Critical=${severityBreakdown.critical || 0}, High=${severityBreakdown.high || 0}, Medium=${severityBreakdown.medium || 0}, Low=${severityBreakdown.low || 0}
First Seen: ${node.first_seen}
Last Updated: ${node.last_updated}
`.trim();

  chunks.push({
    entity_id: entityId,
    chunk_id: `${entityId}_summary`,
    text: summaryText,
    metadata: {
      entity_type: entityType,
      entity_value: redactValue(entityValue, entityType) as string,
      providers: [],
      severities: Object.keys(severityBreakdown).filter(k => severityBreakdown[k] > 0),
      finding_ids: [],
      observed_at: node.last_updated,
    },
  });

  // Get connected entities
  const { data: edges } = await supabase
    .from("entity_edges")
    .select("*, target:target_node_id(entity_type, entity_value)")
    .eq("source_node_id", entityId);

  if (edges && edges.length > 0) {
    const relationshipsText = edges.map(edge => {
      const target = edge.target as any;
      return `${edge.relationship_type} → ${target.entity_type}: ${redactValue(target.entity_value, target.entity_type)} (confidence: ${edge.confidence})`;
    }).join("\n");

    chunks.push({
      entity_id: entityId,
      chunk_id: `${entityId}_relationships`,
      text: `Relationships:\n${relationshipsText}`,
      metadata: {
        entity_type: entityType,
        entity_value: redactValue(entityValue, entityType) as string,
        providers: [],
        severities: [],
        finding_ids: edges.map(e => e.id),
        observed_at: node.last_updated,
      },
    });
  }

  return chunks;
}

/**
 * Build RAG chunks from findings
 */
export function buildFindingChunks(findings: Finding[], entityId: string): RAGChunk[] {
  const chunks: RAGChunk[] = [];
  
  // Group findings by provider
  const byProvider = new Map<string, Finding[]>();
  findings.forEach(f => {
    if (!byProvider.has(f.provider)) {
      byProvider.set(f.provider, []);
    }
    byProvider.get(f.provider)!.push(f);
  });

  // Create chunk per provider
  byProvider.forEach((providerFindings, provider) => {
    const highestSeverity = providerFindings.reduce((max, f) => {
      const order = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
      return (order[f.severity as keyof typeof order] || 0) > (order[max as keyof typeof order] || 0) ? f.severity : max;
    }, "info");

    const summaries = providerFindings.map(f => 
      `${f.title} (${f.severity}): ${f.description.substring(0, 200)}...`
    ).join("\n");

    chunks.push({
      entity_id: entityId,
      chunk_id: `${entityId}_${provider}_findings`,
      text: `Provider: ${provider}\nCategory: ${providerFindings[0].providerCategory}\n\nFindings:\n${summaries}`,
      metadata: {
        entity_type: "",
        entity_value: "",
        providers: [provider],
        severities: [highestSeverity],
        finding_ids: providerFindings.map(f => f.id),
        observed_at: providerFindings[0].observedAt,
      },
    });
  });

  return chunks;
}

/**
 * Store chunks in Supabase
 */
export async function storeChunks(chunks: RAGChunk[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const records = chunks.map(chunk => ({
    user_id: user.id,
    entity_id: chunk.entity_id,
    chunk_id: chunk.chunk_id,
    text: chunk.text,
    metadata: chunk.metadata,
    updated_at: new Date().toISOString(),
  }));

  // Upsert chunks
  const { error } = await supabase
    .from("ai_chunks")
    .upsert(records, { onConflict: "chunk_id" });

  if (error) throw error;
}

/**
 * Index entire user graph
 */
export async function indexUserGraph(): Promise<{ chunksCreated: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get all entity nodes for user
  const { data: nodes, error } = await supabase
    .from("entity_nodes")
    .select("*")
    .eq("user_id", user.id);

  if (error) throw error;

  let totalChunks = 0;

  for (const node of nodes || []) {
    const chunks = await buildEntityChunks(
      node.id,
      node.entity_type,
      node.entity_value
    );
    
    if (chunks.length > 0) {
      await storeChunks(chunks);
      totalChunks += chunks.length;
    }
  }

  return { chunksCreated: totalChunks };
}
