import { z } from "zod";

/**
 * Unified Finding Model (UFM)
 * A standardized schema for all OSINT findings across providers
 */

export const SeveritySchema = z.enum(["critical", "high", "medium", "low", "info"]);
export type Severity = z.infer<typeof SeveritySchema>;

// New UFM compact format for edge functions
export const EvidenceKV = z.object({
  key: z.string(),
  value: z.string(),
});

export const CompactFindingSchema = z.object({
  provider: z.string(),
  kind: z.enum(["breach.hit", "breach.none", "darkweb.hit", "darkweb.none", "presence.hit", "presence.none"]).or(z.string()),
  severity: z.enum(["low", "medium", "high"]),
  confidence: z.number().min(0).max(1),
  observedAt: z.string(),
  latencyMs: z.number().optional(),
  reason: z.string().optional(),
  evidence: z.array(EvidenceKV).optional()
});

export const FindingsResponse = z.object({
  findings: z.array(CompactFindingSchema)
});

export type TCompactFinding = z.infer<typeof CompactFindingSchema>;
export type TFindingsResponse = z.infer<typeof FindingsResponse>;

// Legacy full-featured UFM types for backwards compatibility
export const EvidenceSchema = z.object({
  key: z.string(),
  value: z.unknown(),
  metadata: z.record(z.unknown()).optional(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const FindingSchema = z.object({
  id: z.string(),
  type: z.enum([
    "breach",
    "identity",
    "domain_reputation",
    "domain_tech",
    "dns_history",
    "ip_exposure",
    "phone_intelligence",
    "social_media",
  ]),
  title: z.string(),
  description: z.string(),
  severity: SeveritySchema,
  confidence: z.number().min(0).max(1),
  provider: z.string(),
  providerCategory: z.string(),
  evidence: z.array(EvidenceSchema),
  impact: z.string(),
  remediation: z.array(z.string()),
  tags: z.array(z.string()),
  relatedTo: z.array(z.string()).optional(),
  observedAt: z.string(),
  expiresAt: z.string().optional(),
  url: z.string().url().optional(),
  raw: z.any().optional(),
});
export type Finding = z.infer<typeof FindingSchema>;

export const severityOrder: Record<Severity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

export function compareSeverity(a: Severity, b: Severity): number {
  return severityOrder[b] - severityOrder[a];
}

export function generateFindingId(provider: string, type: string, unique: string): string {
  return `${provider}_${type}_${unique}`;
}

export function deduplicateFindings(findings: Finding[]): Finding[] {
  const seen = new Map<string, Finding>();
  
  for (const finding of findings) {
    const existing = seen.get(finding.id);
    if (!existing || finding.confidence > existing.confidence) {
      seen.set(finding.id, finding);
    }
  }
  
  return Array.from(seen.values());
}

export function sortFindings(findings: Finding[]): Finding[] {
  return findings.sort((a, b) => {
    const sevCmp = compareSeverity(a.severity, b.severity);
    if (sevCmp !== 0) return sevCmp;
    return b.confidence - a.confidence;
  });
}

export function filterByTags(findings: Finding[], tags: string[]): Finding[] {
  if (!tags.length) return findings;
  return findings.filter((f) => tags.some((tag) => f.tags.includes(tag)));
}

export function filterBySeverity(findings: Finding[], severities: Severity[]): Finding[] {
  if (!severities.length) return findings;
  return findings.filter((f) => severities.includes(f.severity));
}

export function filterByProvider(findings: Finding[], providers: string[]): Finding[] {
  if (!providers.length) return findings;
  return findings.filter((f) => providers.includes(f.provider));
}

export function groupByType(findings: Finding[]): Record<string, Finding[]> {
  return findings.reduce((acc, finding) => {
    if (!acc[finding.type]) acc[finding.type] = [];
    acc[finding.type].push(finding);
    return acc;
  }, {} as Record<string, Finding[]>);
}
