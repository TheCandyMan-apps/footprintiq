import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface DarkSearchResult {
  total_results?: number;
  results?: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
}

export function normalizeDarkSearch(result: DarkSearchResult, query: string): Finding[] {
  const findings: Finding[] = [];
  
  const total = result.total_results || 0;
  
  if (total > 0 && result.results && result.results.length > 0) {
    const severity = total > 10 ? "high" : total > 3 ? "medium" : "low";
    
    findings.push({
      id: generateFindingId("darksearch", "artifact_darkweb_index_hit", query),
      type: "identity" as const,
      title: `Dark Web: ${total} Index Hit${total > 1 ? "s" : ""}`,
      description: `DarkSearch indexed ${total} mention(s) of "${query}" on the dark web. (Metadata only; content not retrieved.)`,
      severity: severity as any,
      confidence: 0.7,
      provider: "DarkSearch",
      providerCategory: "Dark Web Intelligence",
      evidence: result.results.slice(0, 5).map((item) => ({
        key: item.title,
        value: item.snippet.slice(0, 100), // Truncate snippet
        metadata: { link_hash: item.link }, // Don't expose full .onion URL
      })),
      impact: "Presence on dark web may indicate data leaks, credential exposure, or malicious discussion",
      remediation: [
        "Investigate the nature of mentions",
        "Check for credential or data leaks",
        "Monitor for additional exposure",
      ],
      tags: ["darkweb", "osint", "leak"],
      observedAt: new Date().toISOString(),
      raw: { total_results: total },
    });
  }
  
  return findings;
}
