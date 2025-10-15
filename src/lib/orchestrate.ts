import { deduplicateFindings, sortFindings, type Finding } from "./ufm";
import { normalizeHibp, type HibpBreach } from "./normalize/hibp";
import { normalizeShodan, type ShodanResult } from "./normalize/shodan";
import { normalizeVirusTotal, type VirusTotalResult } from "./normalize/virustotal";
import { normalizeBuiltWith, type BuiltWithResult } from "./normalize/builtwith";
import { normalizePeopleDataLabs, type PeopleDataLabsResult } from "./normalize/pdl";
import { normalizeIPQS, type IPQSPhoneResult } from "./normalize/ipqs";

/**
 * Orchestrator for OSINT scan results
 * Normalizes provider responses into unified findings and applies correlation
 */

export interface ScanInput {
  email?: string;
  username?: string;
  domain?: string;
  ip?: string;
  phone?: string;
}

export interface ProviderResults {
  hibp?: HibpBreach[];
  shodan?: ShodanResult[];
  virustotal?: VirusTotalResult;
  builtwith?: BuiltWithResult;
  peopleDataLabs?: PeopleDataLabsResult;
  ipqs?: IPQSPhoneResult;
}

export interface OrchestratedResults {
  findings: Finding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    providers: string[];
    riskScore: number;
  };
  correlations: Array<{
    findingId: string;
    relatedIds: string[];
    reason: string;
  }>;
}

export function orchestrateScan(input: ScanInput, results: ProviderResults): OrchestratedResults {
  let findings: Finding[] = [];

  // Normalize each provider's results
  if (results.hibp && input.email) {
    findings.push(...normalizeHibp(results.hibp, input.email));
  }

  if (results.shodan && input.ip) {
    findings.push(...normalizeShodan(results.shodan, input.ip));
  }

  if (results.virustotal && input.domain) {
    findings.push(...normalizeVirusTotal(results.virustotal, input.domain));
  }

  if (results.builtwith && input.domain) {
    findings.push(...normalizeBuiltWith(results.builtwith, input.domain));
  }

  if (results.peopleDataLabs && (input.email || input.username)) {
    findings.push(...normalizePeopleDataLabs(results.peopleDataLabs, input.email || input.username || ""));
  }

  if (results.ipqs && input.phone) {
    findings.push(...normalizeIPQS(results.ipqs, input.phone));
  }

  // Deduplicate and sort
  findings = sortFindings(deduplicateFindings(findings));

  // Apply correlations
  const correlations = correlateFindings(findings);

  // Update findings with correlation info
  findings = findings.map((f) => {
    const corr = correlations.find((c) => c.findingId === f.id);
    if (corr && corr.relatedIds.length > 0) {
      return { ...f, relatedTo: corr.relatedIds };
    }
    return f;
  });

  // Calculate summary
  const summary = {
    total: findings.length,
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    info: findings.filter((f) => f.severity === "info").length,
    providers: [...new Set(findings.map((f) => f.provider))],
    riskScore: calculateRiskScore(findings),
  };

  return { findings, summary, correlations };
}

function correlateFindings(findings: Finding[]): Array<{ findingId: string; relatedIds: string[]; reason: string }> {
  const correlations: Array<{ findingId: string; relatedIds: string[]; reason: string }> = [];

  // Correlate breaches with identity findings
  const breaches = findings.filter((f) => f.type === "breach");
  const identityFindings = findings.filter((f) => f.type === "identity");

  for (const breach of breaches) {
    const related = identityFindings.map((i) => i.id);
    if (related.length > 0) {
      correlations.push({
        findingId: breach.id,
        relatedIds: related,
        reason: "Breach may have exposed identity data",
      });
    }
  }

  // Correlate domain reputation with domain tech
  const domainRep = findings.filter((f) => f.type === "domain_reputation");
  const domainTech = findings.filter((f) => f.type === "domain_tech");

  for (const rep of domainRep) {
    const related = domainTech.map((t) => t.id);
    if (related.length > 0) {
      correlations.push({
        findingId: rep.id,
        relatedIds: related,
        reason: "Technology stack may contribute to security issues",
      });
    }
  }

  // Correlate IP exposure with domain findings
  const ipFindings = findings.filter((f) => f.type === "ip_exposure");
  const domainFindings = findings.filter((f) => f.type.startsWith("domain"));

  for (const ip of ipFindings) {
    const related = domainFindings.map((d) => d.id);
    if (related.length > 0) {
      correlations.push({
        findingId: ip.id,
        relatedIds: related,
        reason: "Domain and IP infrastructure linked",
      });
    }
  }

  return correlations;
}

function calculateRiskScore(findings: Finding[]): number {
  if (findings.length === 0) return 100;

  const weights = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3,
    info: 1,
  };

  const totalRisk = findings.reduce((acc, f) => {
    return acc + weights[f.severity] * f.confidence;
  }, 0);

  // Normalize to 0-100 scale (lower is better)
  const maxRisk = findings.length * 25; // If all were critical with 100% confidence
  const score = Math.max(0, 100 - (totalRisk / maxRisk) * 100);

  return Math.round(score);
}
