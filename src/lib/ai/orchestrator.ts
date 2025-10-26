/**
 * AI Orchestrator - LLM prompts and response generation
 * Server-side only via edge functions
 */

import { retrieveChunksForEntities, buildContextFromChunks, getProvenanceInfo } from "./retriever";
import { supabase } from "@/integrations/supabase/client";

export interface AnalystRequest {
  entityIds: string[];
  questions?: string[];
  objective?: string;
}

export interface AnalystResponse {
  overview: string;
  keySignals: string[];
  correlations: string[];
  risks: string[];
  gaps: string[];
  recommendations: string[];
  confidence: number;
  provenance: {
    providers: string[];
    findingIds: string[];
    entityTypes: string[];
  };
}

export interface ExplainLinkRequest {
  sourceEntityId: string;
  targetEntityId: string;
}

export interface ExplainLinkResponse {
  narrative: string;
  evidenceChain: string[];
  confidence: number;
  provenance: {
    providers: string[];
    findingIds: string[];
  };
}

/**
 * Generate investigation summary via AI
 */
export async function summarizeInvestigation(
  request: AnalystRequest
): Promise<AnalystResponse> {
  // Retrieve relevant chunks
  const chunks = await retrieveChunksForEntities(request.entityIds);
  const context = buildContextFromChunks(chunks);
  const provenance = getProvenanceInfo(chunks);

  // Build prompt
  const questionsText = request.questions?.length 
    ? `\n\nSpecific questions to address:\n${request.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
    : "";

  const objective = request.objective || "Provide a comprehensive OSINT analysis";

  const prompt = `${objective}

Context from investigation:
${context}

${questionsText}

Please analyze the above context and provide:
1. Executive overview (2-3 sentences)
2. Key signals and findings (bullet points)
3. Notable correlations between entities
4. Risk assessment
5. Gaps in intelligence
6. Recommendations for next steps

Remember: Cite finding IDs when referencing specific intelligence. Do not expose raw PII or credentials.`;

  // Call AI via edge function
  const { data, error } = await supabase.functions.invoke("ai-analyst", {
    body: { 
      action: "summarize",
      prompt,
      entityIds: request.entityIds,
    },
  });

  if (error) throw error;

  return {
    overview: data.overview || "",
    keySignals: data.keySignals || [],
    correlations: data.correlations || [],
    risks: data.risks || [],
    gaps: data.gaps || [],
    recommendations: data.recommendations || [],
    confidence: data.confidence || 0.7,
    provenance: {
      providers: provenance.providers,
      findingIds: provenance.findingIds,
      entityTypes: Array.from(provenance.entityTypes),
    },
  };
}

/**
 * Explain connection between two entities
 */
export async function explainLink(
  request: ExplainLinkRequest
): Promise<ExplainLinkResponse> {
  // Retrieve chunks for both entities
  const chunks = await retrieveChunksForEntities([
    request.sourceEntityId,
    request.targetEntityId,
  ]);
  
  const context = buildContextFromChunks(chunks);
  const provenance = getProvenanceInfo(chunks);

  const prompt = `Analyze the connection between these two entities:

${context}

Provide:
1. A clear narrative explaining how these entities are connected
2. Chain of evidence (step-by-step path)
3. Confidence level in this connection

Cite specific finding IDs as evidence. Do not speculate beyond available data.`;

  // Call AI via edge function
  const { data, error } = await supabase.functions.invoke("ai-analyst", {
    body: {
      action: "explain_link",
      prompt,
      sourceEntityId: request.sourceEntityId,
      targetEntityId: request.targetEntityId,
    },
  });

  if (error) throw error;

  return {
    narrative: data.narrative || "",
    evidenceChain: data.evidenceChain || [],
    confidence: data.confidence || 0.6,
    provenance: {
      providers: provenance.providers,
      findingIds: provenance.findingIds,
    },
  };
}
