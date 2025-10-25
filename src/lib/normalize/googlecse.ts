import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface GoogleCSEResult {
  searchInformation?: {
    totalResults: string;
  };
  items?: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
}

export function normalizeGoogleCSE(result: GoogleCSEResult, query: string): Finding[] {
  const findings: Finding[] = [];
  
  const totalResults = parseInt(result.searchInformation?.totalResults || "0");
  
  if (totalResults > 0 && result.items && result.items.length > 0) {
    findings.push({
      id: generateFindingId("googlecse", "mention_search_hit", query),
      type: "social_media" as const,
      title: `${totalResults.toLocaleString()} Search Result${totalResults > 1 ? "s" : ""}`,
      description: `Google Custom Search found ${totalResults.toLocaleString()} mention(s) of "${query}".`,
      severity: "info" as any,
      confidence: 0.7,
      provider: "Google CSE",
      providerCategory: "Search Intelligence",
      evidence: result.items.slice(0, 5).map((item, i) => ({
        key: item.title,
        value: item.snippet,
        metadata: { url: item.link },
      })),
      impact: "Public mentions may reveal additional information or context",
      remediation: [
        "Review search results for sensitive information",
        "Consider requesting removal of unwanted content",
      ],
      tags: ["search", "osint", "mention"],
      observedAt: new Date().toISOString(),
      raw: { totalResults, items: result.items?.slice(0, 5) },
    });
  }
  
  return findings;
}
