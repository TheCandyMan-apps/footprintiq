import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

export interface BinaryEdgeResult {
  ip: string;
  ports?: Array<{
    port: number;
    protocol: string;
    service?: string;
  }>;
  tags?: string[];
  risk_score?: number;
}

export function normalizeBinaryEdge(result: BinaryEdgeResult, ip: string): Finding[] {
  const findings: Finding[] = [];
  
  if (result.ports && result.ports.length > 0) {
    const criticalPorts = [21, 23, 3389, 5900];
    const hasCritical = result.ports.some((p) => criticalPorts.includes(p.port));
    
    findings.push({
      id: generateFindingId("binaryedge", "ip_exposure", ip),
      type: "ip_exposure" as const,
      title: `${result.ports.length} Open Service${result.ports.length > 1 ? "s" : ""}`,
      description: `BinaryEdge found ${result.ports.length} open port(s) on ${ip}${
        hasCritical ? " including critical services" : ""
      }.`,
      severity: (hasCritical ? "high" : result.ports.length > 5 ? "medium" : "low") as any,
      confidence: 0.9,
      provider: "BinaryEdge",
      providerCategory: "IP Intelligence",
      evidence: result.ports.map((p) => ({
        key: `${p.protocol}/${p.port}`,
        value: p.service || "Unknown",
      })),
      impact: "Exposed services increase attack surface",
      remediation: [
        "Close unnecessary ports",
        "Implement firewall rules",
        "Disable unused services",
        "Use VPN for remote access instead of direct exposure",
      ],
      tags: ["ip", "exposure", "ports", ...(result.tags || [])],
      observedAt: new Date().toISOString(),
      raw: result,
    });
  }
  
  return findings;
}
