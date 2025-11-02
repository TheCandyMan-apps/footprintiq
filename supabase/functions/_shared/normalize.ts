/**
 * Provider response normalization to UFM (Unified Finding Model)
 */

export interface UFMFinding {
  provider: string;
  kind: string; // presence.hit, leak.hit, breach.hit, darkweb.hit, etc.
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  observedAt: string; // ISO 8601
  evidence: Array<{ key: string; value: string }>;
  meta?: Record<string, any>;
}

/**
 * Normalize Apify social-media-finder-pro results
 */
export function normalizeApifySocial(items: any[]): UFMFinding[] {
  return items
    .filter(item => item.found)
    .map(item => ({
      provider: 'apify-social',
      kind: 'presence.hit',
      severity: 'info' as const,
      confidence: 0.75,
      observedAt: new Date().toISOString(),
      evidence: [
        { key: 'site', value: item.site || item.platform || 'unknown' },
        { key: 'url', value: item.url || '' },
        { key: 'username', value: item.username || '' },
      ],
      meta: { platform: item.platform, verified: item.verified },
    }));
}

/**
 * Normalize Apify OSINT scraper results
 */
export function normalizeApifyOsint(items: any[]): UFMFinding[] {
  return items
    .filter(item => item.found || item.matches)
    .map(item => ({
      provider: 'apify-osint',
      kind: 'leak.hit',
      severity: 'medium' as const,
      confidence: 0.65,
      observedAt: item.timestamp || new Date().toISOString(),
      evidence: [
        { key: 'source', value: item.source || 'paste' },
        { key: 'url', value: item.url || '' },
        { key: 'keyword', value: item.keyword || '' },
        { key: 'snippet', value: item.snippet || '' },
      ],
      meta: { matches: item.matches, fullText: item.fullText },
    }));
}

/**
 * Normalize Apify dark web scraper results
 */
export function normalizeApifyDarkweb(items: any[]): UFMFinding[] {
  return items
    .filter(item => item.url || item.onionUrl)
    .map(item => ({
      provider: 'apify-darkweb',
      kind: 'darkweb.hit',
      severity: 'high' as const,
      confidence: 0.8,
      observedAt: item.scrapedAt || new Date().toISOString(),
      evidence: [
        { key: 'url', value: item.url || item.onionUrl || '' },
        { key: 'title', value: item.title || '' },
        { key: 'linkCount', value: String(item.linkCount || 0) },
      ],
      meta: { content: item.content, links: item.links },
    }));
}

/**
 * Deduplicate UFM findings by (provider + evidence keys)
 */
export function deduplicateFindings(findings: UFMFinding[]): UFMFinding[] {
  const seen = new Set<string>();
  const unique: UFMFinding[] = [];

  for (const finding of findings) {
    const key = `${finding.provider}:${finding.evidence.map(e => `${e.key}=${e.value}`).join('|')}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(finding);
    }
  }

  return unique;
}

/**
 * Sort findings by severity then confidence
 */
export function sortFindings(findings: UFMFinding[]): UFMFinding[] {
  const severityOrder: Record<string, number> = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    info: 1,
  };

  return [...findings].sort((a, b) => {
    const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    if (severityDiff !== 0) return severityDiff;
    
    return (b.confidence || 0) - (a.confidence || 0);
  });
}

/**
 * Normalize FullContact results
 */
export function normalizeFullContact(result: any, target: string, type: string): UFMFinding[] {
  if (!result || Object.keys(result).length === 0) return [];
  
  return [{
    provider: 'fullcontact',
    kind: 'presence.hit',
    severity: 'info' as const,
    confidence: 0.85,
    observedAt: new Date().toISOString(),
    evidence: [
      { key: 'name', value: result.fullName || '' },
      { key: 'location', value: result.location || '' },
      { key: 'title', value: result.title || '' },
    ].filter(e => e.value),
    meta: result,
  }];
}

/**
 * Normalize Pipl results
 */
export function normalizePipl(result: any, target: string): UFMFinding[] {
  if (!result?.person) return [];
  
  return [{
    provider: 'pipl',
    kind: 'presence.hit',
    severity: 'medium' as const,
    confidence: 0.9,
    observedAt: new Date().toISOString(),
    evidence: [
      { key: 'names', value: result.person.names?.map((n: any) => n.display).join(', ') || '' },
      { key: 'addresses', value: result.person.addresses?.length || '0' },
    ].filter(e => e.value),
    meta: result.person,
  }];
}

/**
 * Normalize Clearbit results
 */
export function normalizeClearbit(result: any, target: string, type: string): UFMFinding[] {
  if (!result || Object.keys(result).length === 0) return [];
  
  return [{
    provider: 'clearbit',
    kind: 'presence.hit',
    severity: 'info' as const,
    confidence: 0.9,
    observedAt: new Date().toISOString(),
    evidence: [
      { key: 'name', value: result.name || result.person?.name?.fullName || '' },
      { key: 'domain', value: result.domain || '' },
      { key: 'industry', value: result.category?.industry || '' },
    ].filter(e => e.value),
    meta: result,
  }];
}

/**
 * Normalize Shodan results
 */
export function normalizeShodan(result: any, target: string, type: string): UFMFinding[] {
  if (!result || Object.keys(result).length === 0) return [];
  
  return [{
    provider: 'shodan',
    kind: 'presence.hit',
    severity: result.ports?.length > 10 ? 'medium' : 'low' as const,
    confidence: 0.95,
    observedAt: new Date().toISOString(),
    evidence: [
      { key: 'ip', value: result.ip_str || '' },
      { key: 'org', value: result.org || '' },
      { key: 'ports', value: result.ports?.slice(0, 20).join(', ') || '' },
    ].filter(e => e.value),
    meta: result,
  }];
}
