/**
 * Evidence Parser Utility
 * Handles conversion of findings evidence data from array format to object format
 */

/**
 * Parses evidence from array format to object format
 * Evidence can be stored as either:
 * - Array: [{"key": "site", "value": "stackoverflow.com"}, ...]
 * - Object: {"site": "stackoverflow.com", ...}
 */
export function parseEvidence(evidence: any): Record<string, any> {
  if (!evidence) return {};
  
  // If already an object, return as-is
  if (!Array.isArray(evidence)) return evidence;
  
  // Convert array of {key, value} pairs to object
  return evidence.reduce((acc: any, item: any) => {
    if (item?.key && item?.value !== undefined) {
      acc[item.key] = item.value;
    }
    return acc;
  }, {});
}

/**
 * Extracts platform/site name from a finding
 * Tries multiple sources in priority order:
 * 1. evidence.site
 * 2. evidence.platform
 * 3. evidence.url
 * 4. meta.site
 * 5. meta.platform
 * 6. provider
 */
export function extractPlatform(finding: any): string {
  const evidenceObj = parseEvidence(finding.evidence);
  const metaObj = finding.meta || {};
  
  return (
    evidenceObj.site ||
    evidenceObj.platform ||
    evidenceObj.url ||
    metaObj.site ||
    metaObj.platform ||
    finding.provider ||
    ''
  );
}

/**
 * Extracts URL from a finding
 */
export function extractUrl(finding: any): string | null {
  const evidenceObj = parseEvidence(finding.evidence);
  return evidenceObj.url || finding.meta?.url || null;
}

/**
 * Checks if a finding is NSFW
 */
export function isNSFW(finding: any): boolean {
  const evidenceObj = parseEvidence(finding.evidence);
  const kind = (finding.kind || '').toLowerCase();
  const category = (evidenceObj.category || '').toLowerCase();
  
  return kind.includes('nsfw') || category.includes('nsfw') || category.includes('adult');
}
