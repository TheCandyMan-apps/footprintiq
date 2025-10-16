import { Finding } from "../ufm";
import JSZip from "jszip";

/**
 * Evidence Pack Generator
 * 
 * Creates a downloadable ZIP package containing:
 * - findings.json (full UFM data)
 * - findings.csv (tabular export)
 * - summary.txt (human-readable report)
 * - manifest.json (metadata + hash verification)
 * - DISCLAIMER.txt (legal notice)
 */

export interface EvidencePackMetadata {
  generated: string;
  scanId: string;
  findingCount: number;
  riskScore?: number;
  personaDNA?: string;
}

/**
 * Generate Evidence Pack as a Blob
 */
export async function generateEvidencePack(
  findings: Finding[],
  metadata: EvidencePackMetadata
): Promise<Blob> {
  const zip = new JSZip();

  // 1. findings.json
  const findingsJson = JSON.stringify(findings, null, 2);
  zip.file("findings.json", findingsJson);

  // 2. findings.csv
  const findingsCsv = generateCSV(findings);
  zip.file("findings.csv", findingsCsv);

  // 3. summary.txt
  const summaryTxt = generateSummary(findings, metadata);
  zip.file("summary.txt", summaryTxt);

  // 4. manifest.json
  const manifestHash = await hashString(findingsJson);
  const manifest = {
    ...metadata,
    files: {
      "findings.json": { size: findingsJson.length, hash: manifestHash },
      "findings.csv": { size: findingsCsv.length, hash: await hashString(findingsCsv) },
      "summary.txt": { size: summaryTxt.length, hash: await hashString(summaryTxt) },
    },
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // 5. DISCLAIMER.txt
  zip.file("DISCLAIMER.txt", DISCLAIMER_TEXT);

  // Generate the ZIP blob
  const blob = await zip.generateAsync({ type: "blob" });
  return blob;
}

/**
 * Generate CSV from findings
 */
function generateCSV(findings: Finding[]): string {
  const headers = ["ID", "Type", "Title", "Severity", "Confidence", "Provider", "Observed At", "URL"];
  const rows = findings.map((f) => [
    f.id,
    f.type,
    escapeCsv(f.title),
    f.severity,
    f.confidence,
    f.provider,
    f.observedAt,
    f.url || "",
  ]);

  return [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generate human-readable summary
 */
function generateSummary(findings: Finding[], metadata: EvidencePackMetadata): string {
  const severityCounts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    info: findings.filter((f) => f.severity === "info").length,
  };

  const typeCounts = findings.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return `
FootprintIQ Evidence Pack
===========================

Generated: ${metadata.generated}
Scan ID: ${metadata.scanId}
Total Findings: ${metadata.findingCount}
${metadata.riskScore !== undefined ? `Risk Score: ${metadata.riskScore}/100` : ""}
${metadata.personaDNA ? `Persona DNA: ${metadata.personaDNA}` : ""}

Severity Breakdown
------------------
Critical: ${severityCounts.critical}
High: ${severityCounts.high}
Medium: ${severityCounts.medium}
Low: ${severityCounts.low}
Info: ${severityCounts.info}

Finding Types
-------------
${Object.entries(typeCounts)
  .map(([type, count]) => `${type}: ${count}`)
  .join("\n")}

Top 10 Findings
---------------
${findings
  .slice(0, 10)
  .map(
    (f, i) =>
      `${i + 1}. [${f.severity.toUpperCase()}] ${f.title}\n   Provider: ${f.provider}\n   Observed: ${f.observedAt}`
  )
  .join("\n\n")}

---
For full details, see findings.json and findings.csv.
Verify integrity using manifest.json.
`.trim();
}

/**
 * SHA-256 hash of a string
 */
async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Legal disclaimer text
 */
const DISCLAIMER_TEXT = `
EVIDENCE PACK DISCLAIMER
========================

This Evidence Pack is provided for informational purposes only. FootprintIQ aggregates
publicly available data from legitimate OSINT sources and does not engage in unauthorized
access, hacking, or illegal data collection.

LIMITATIONS:
- Data accuracy is subject to source reliability
- Findings represent a point-in-time snapshot
- Not legal advice or professional security consultation
- Use responsibly and in compliance with applicable laws

PRIVACY:
- This pack may contain sensitive personal information
- Handle with appropriate security measures
- Do not redistribute without authorization
- Review applicable data protection regulations (GDPR, CCPA, etc.)

RESPONSIBLE USE:
By using this Evidence Pack, you agree to:
1. Use data only for lawful purposes
2. Respect privacy rights of individuals
3. Not engage in harassment, stalking, or illegal activities
4. Comply with all applicable laws and regulations

For questions, contact: support@footprintiq.app

Generated by FootprintIQ v1.0
© 2025 FootprintIQ. All rights reserved.
`.trim();
