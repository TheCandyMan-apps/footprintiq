/**
 * AI Retriever - Fetches relevant RAG chunks for analysis
 */

import { supabase } from "@/integrations/supabase/client";
import { aiConfig } from "@/lib/config";

// Default max documents for RAG retrieval
const DEFAULT_RAG_MAX_DOCS = 40;

export interface RetrievedChunk {
  chunk_id: string;
  entity_id: string;
  text: string;
  metadata: any;
  relevance_score: number;
}

/**
 * Retrieve chunks for entity scope
 */
export async function retrieveChunksForEntities(
  entityIds: string[],
  maxDocs: number = DEFAULT_RAG_MAX_DOCS
): Promise<RetrievedChunk[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch chunks for specified entities
  const { data: chunks, error } = await supabase
    .from("ai_chunks")
    .select("*")
    .eq("user_id", user.id)
    .in("entity_id", entityIds)
    .order("updated_at", { ascending: false })
    .limit(maxDocs);

  if (error) throw error;

  // Add recency boost to scoring
  const now = new Date().getTime();
  const results: RetrievedChunk[] = (chunks || []).map(chunk => {
    const updatedAt = new Date(chunk.updated_at).getTime();
    const daysSinceUpdate = (now - updatedAt) / (1000 * 60 * 60 * 24);
    
    // Recency boost: 1.0 for today, decays to 0.5 after 30 days
    const recencyBoost = Math.max(0.5, 1 - (daysSinceUpdate / 60));
    
    return {
      chunk_id: chunk.chunk_id,
      entity_id: chunk.entity_id,
      text: chunk.text,
      metadata: chunk.metadata,
      relevance_score: recencyBoost,
    };
  });

  // Sort by relevance
  results.sort((a, b) => b.relevance_score - a.relevance_score);

  return results.slice(0, maxDocs);
}

/**
 * Build context string from chunks
 */
export function buildContextFromChunks(chunks: RetrievedChunk[]): string {
  const context = chunks.map((chunk, idx) => {
    return `[Context ${idx + 1}]\n${chunk.text}\n`;
  }).join("\n---\n\n");

  return context;
}

/**
 * Get provenance info from chunks
 */
export function getProvenanceInfo(chunks: RetrievedChunk[]): {
  providers: string[];
  findingIds: string[];
  entityTypes: Set<string>;
} {
  const providers = new Set<string>();
  const findingIds = new Set<string>();
  const entityTypes = new Set<string>();

  chunks.forEach(chunk => {
    const meta = chunk.metadata;
    
    if (meta.providers) {
      meta.providers.forEach((p: string) => providers.add(p));
    }
    
    if (meta.finding_ids) {
      meta.finding_ids.forEach((id: string) => findingIds.add(id));
    }
    
    if (meta.entity_type) {
      entityTypes.add(meta.entity_type);
    }
  });

  return {
    providers: Array.from(providers),
    findingIds: Array.from(findingIds),
    entityTypes,
  };
}
