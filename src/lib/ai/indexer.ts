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
 * Index entire user graph including scan data
 */
export async function indexUserGraph(): Promise<{ chunksCreated: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get all scans for user
  const { data: scans, error: scansError } = await supabase
    .from("scans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20); // Index most recent 20 scans

  if (scansError) throw scansError;

  let totalChunks = 0;

  // Index each scan
  for (const scan of scans || []) {
    // Determine entity type and value from scan
    const entityType = scan.email ? "email" : scan.phone ? "phone" : scan.username ? "username" : "unknown";
    const entityValue = scan.email || scan.phone || scan.username || "unknown";
    
    // Create scan summary chunk
    const scanSummaryChunk: RAGChunk = {
      entity_id: scan.id,
      chunk_id: `${scan.id}_scan_summary`,
      text: `
Scan Analysis for ${entityType}: ${redactValue(entityValue, entityType)}
Privacy Score: ${scan.privacy_score || 0}/100
High Risk Findings: ${scan.high_risk_count || 0}
Medium Risk Findings: ${scan.medium_risk_count || 0}
Low Risk Findings: ${scan.low_risk_count || 0}
Total Sources Found: ${scan.total_sources_found || 0}
Scan Type: ${scan.scan_type}
Scan Date: ${scan.created_at}
User Name: ${scan.first_name || ''} ${scan.last_name || ''}

Risk Level: ${scan.high_risk_count > 5 ? 'HIGH' : scan.high_risk_count > 2 ? 'MEDIUM' : 'LOW'}
Privacy Status: ${scan.privacy_score < 50 ? 'Poor' : scan.privacy_score < 75 ? 'Fair' : 'Good'}
      `.trim(),
      metadata: {
        entity_type: entityType,
        entity_value: redactValue(entityValue, entityType) as string,
        providers: [],
        severities: scan.high_risk_count > 0 ? ['high'] : scan.medium_risk_count > 0 ? ['medium'] : ['low'],
        finding_ids: [scan.id],
        observed_at: scan.created_at,
      },
    };

    await storeChunks([scanSummaryChunk]);
    totalChunks += 1;
  }

  // Also index entity nodes for relationship data
  const { data: nodes, error } = await supabase
    .from("entity_nodes")
    .select("*")
    .eq("user_id", user.id);

  if (!error && nodes) {
    for (const node of nodes) {
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
  }

  return { chunksCreated: totalChunks };
}
