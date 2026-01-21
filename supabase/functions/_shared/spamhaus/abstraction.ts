/**
 * Spamhaus Abstraction Layer
 * Transforms raw Spamhaus data into compliant, non-reversible output
 * 
 * COMPLIANCE: This module ensures no Spamhaus list names (SBL/XBL/PBL/DBL/ZRD/HBL)
 * are ever returned to clients. All indicators are abstracted to generic categories.
 */

import type { 
  SpamhausVerdict, 
  SpamhausEvidence,
  RawSIAResponse,
  RawDQSResponse 
} from './types.ts';

/**
 * Abstracted category types
 * These are the ONLY categories exposed to clients
 */
export const ABSTRACTED_CATEGORIES = [
  'abuse_infrastructure',  // Known abuse infrastructure
  'mail_reputation',       // Email/SMTP reputation issues
  'malware_hosting',       // Malware distribution
  'phishing_risk',         // Phishing indicators
  'spam_source',           // Spam origination
  'botnet_c2',             // Botnet command & control
  'exploit_kit',           // Exploit kit hosting
  'drop_zone',             // Credential/data drop zones
  'proxy_vpn',             // Proxy/VPN/anonymizer
  'newly_observed',        // Recently observed/suspicious
  'compromised_host',      // Compromised infrastructure
  'unknown_threat',        // Unclassified threat indicator
] as const;

export type AbstractedCategory = typeof ABSTRACTED_CATEGORIES[number];

/**
 * Internal mapping from raw indicators to abstracted categories
 * The actual list names are NEVER exposed
 */
const INDICATOR_TO_CATEGORY: Record<string, AbstractedCategory> = {
  // Spam-related indicators
  'spam': 'spam_source',
  'spambot': 'spam_source',
  'snowshoe': 'spam_source',
  
  // Malware indicators
  'malware': 'malware_hosting',
  'malware_distribution': 'malware_hosting',
  'dropper': 'malware_hosting',
  
  // Phishing indicators
  'phishing': 'phishing_risk',
  'phish': 'phishing_risk',
  'credential_theft': 'phishing_risk',
  
  // Botnet indicators
  'botnet': 'botnet_c2',
  'c2': 'botnet_c2',
  'command_control': 'botnet_c2',
  
  // Exploit indicators
  'exploit': 'exploit_kit',
  'exploit_kit': 'exploit_kit',
  
  // Infrastructure abuse
  'abuse': 'abuse_infrastructure',
  'abused': 'abuse_infrastructure',
  'compromised': 'compromised_host',
  
  // Anonymous/proxy
  'proxy': 'proxy_vpn',
  'vpn': 'proxy_vpn',
  'tor': 'proxy_vpn',
  'anonymizer': 'proxy_vpn',
  
  // Drops
  'drop': 'drop_zone',
  'dropzone': 'drop_zone',
  
  // New/recently observed
  'new': 'newly_observed',
  'recent': 'newly_observed',
  'zero_rep': 'newly_observed',
  
  // Default
  'unknown': 'unknown_threat',
  'listed': 'unknown_threat',
};

/**
 * Abstract raw indicators to generic categories
 * Ensures no Spamhaus-specific data leaks
 */
export function abstractCategories(rawIndicators: string[]): AbstractedCategory[] {
  const categories = new Set<AbstractedCategory>();
  
  for (const indicator of rawIndicators) {
    const lower = indicator.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    
    // Check direct mapping
    if (INDICATOR_TO_CATEGORY[lower]) {
      categories.add(INDICATOR_TO_CATEGORY[lower]);
      continue;
    }
    
    // Check partial matches
    for (const [key, category] of Object.entries(INDICATOR_TO_CATEGORY)) {
      if (lower.includes(key)) {
        categories.add(category);
        break;
      }
    }
    
    // If no match found, mark as unknown threat
    if (categories.size === 0 || !Array.from(categories).some(c => lower.includes(c))) {
      categories.add('unknown_threat');
    }
  }
  
  return Array.from(categories);
}

/**
 * Derive verdict based on categories and confidence
 */
export function deriveVerdict(
  categories: AbstractedCategory[],
  confidence: number
): SpamhausVerdict {
  if (categories.length === 0) {
    return 'unknown';
  }
  
  // High severity categories
  const highSeverity: AbstractedCategory[] = [
    'botnet_c2',
    'exploit_kit',
    'malware_hosting',
    'drop_zone',
  ];
  
  // Medium severity categories
  const mediumSeverity: AbstractedCategory[] = [
    'phishing_risk',
    'spam_source',
    'abuse_infrastructure',
    'compromised_host',
  ];
  
  const hasHighSeverity = categories.some(c => highSeverity.includes(c));
  const hasMediumSeverity = categories.some(c => mediumSeverity.includes(c));
  
  if (hasHighSeverity && confidence >= 0.7) {
    return 'high';
  }
  
  if (hasHighSeverity && confidence >= 0.4) {
    return 'medium';
  }
  
  if (hasMediumSeverity && confidence >= 0.6) {
    return 'medium';
  }
  
  if (categories.length > 0 && confidence >= 0.3) {
    return 'low';
  }
  
  return 'unknown';
}

/**
 * Generate plain-language reasons without exposing list names
 */
export function generateReasons(categories: AbstractedCategory[]): string[] {
  const reasonMap: Record<AbstractedCategory, string> = {
    'abuse_infrastructure': 'Associated with known abuse infrastructure',
    'mail_reputation': 'Poor email/SMTP reputation detected',
    'malware_hosting': 'Linked to malware distribution activities',
    'phishing_risk': 'Associated with phishing or credential theft',
    'spam_source': 'Known source of spam or unsolicited email',
    'botnet_c2': 'Linked to botnet command and control operations',
    'exploit_kit': 'Associated with exploit kit hosting',
    'drop_zone': 'Linked to credential or data drop zones',
    'proxy_vpn': 'Associated with anonymization services',
    'newly_observed': 'Recently observed with limited reputation history',
    'compromised_host': 'Potentially compromised infrastructure',
    'unknown_threat': 'Unclassified threat indicator detected',
  };
  
  return categories.map(c => reasonMap[c] || 'Threat indicator detected');
}

/**
 * Sanitize raw response data into non-reversible evidence
 * COMPLIANCE: Evidence keys are generic, values are abstracted
 */
export function sanitizeEvidence(
  raw: Record<string, unknown>
): SpamhausEvidence[] {
  const evidence: SpamhausEvidence[] = [];
  
  // Extract only safe, non-identifying fields
  if (typeof raw.listed === 'boolean') {
    evidence.push({
      kind: 'internal',
      key: 'threat_detected',
      value: raw.listed ? 'true' : 'false',
    });
  }
  
  if (typeof raw.cc === 'string' && raw.cc.length === 2) {
    evidence.push({
      kind: 'internal',
      key: 'country_code',
      value: raw.cc.toUpperCase(),
    });
  }
  
  // Abstract ASN info
  if (typeof raw.asn === 'number') {
    evidence.push({
      kind: 'internal',
      key: 'has_asn_info',
      value: 'true',
    });
  }
  
  // Time-based indicators (abstracted)
  if (raw.first_seen && raw.last_seen) {
    const firstSeen = new Date(raw.first_seen as string).getTime();
    const lastSeen = new Date(raw.last_seen as string).getTime();
    const daysSinceFirst = Math.floor((Date.now() - firstSeen) / (1000 * 60 * 60 * 24));
    const daysSinceLast = Math.floor((Date.now() - lastSeen) / (1000 * 60 * 60 * 24));
    
    evidence.push({
      kind: 'internal',
      key: 'observation_age',
      value: daysSinceFirst <= 7 ? 'recent' : daysSinceFirst <= 30 ? 'moderate' : 'established',
    });
    
    evidence.push({
      kind: 'internal',
      key: 'activity_recency',
      value: daysSinceLast <= 1 ? 'active' : daysSinceLast <= 7 ? 'recent' : 'stale',
    });
  }
  
  return evidence;
}

/**
 * Process raw SIA response into abstracted signal components
 */
export function processSIAResponse(response: RawSIAResponse): {
  categories: AbstractedCategory[];
  reasons: string[];
  confidence: number;
  evidence: SpamhausEvidence[];
} {
  const rawIndicators: string[] = [];
  const evidence: SpamhausEvidence[] = [];
  let listedCount = 0;
  
  if (response.results && Array.isArray(response.results)) {
    for (const result of response.results) {
      if (result.listed) {
        listedCount++;
        if (result.type) {
          rawIndicators.push(result.type);
        }
      }
      
      // Collect evidence from each result
      const resultEvidence = sanitizeEvidence(result as Record<string, unknown>);
      evidence.push(...resultEvidence);
    }
  }
  
  // If listed but no specific type, add generic indicator
  if (listedCount > 0 && rawIndicators.length === 0) {
    rawIndicators.push('listed');
  }
  
  const categories = abstractCategories(rawIndicators);
  const reasons = generateReasons(categories);
  
  // Confidence based on number of list hits and data completeness
  const confidence = Math.min(0.95, 0.3 + (listedCount * 0.15) + (evidence.length * 0.05));
  
  return { categories, reasons, confidence, evidence };
}

/**
 * Process raw DQS response into abstracted signal components
 */
export function processDQSResponse(response: RawDQSResponse): {
  categories: AbstractedCategory[];
  reasons: string[];
  confidence: number;
  evidence: SpamhausEvidence[];
} {
  const rawIndicators: string[] = [];
  const evidence: SpamhausEvidence[] = [];
  
  if (response.listed) {
    evidence.push({
      kind: 'internal',
      key: 'threat_detected',
      value: 'true',
    });
    
    if (response.categories && Array.isArray(response.categories)) {
      rawIndicators.push(...response.categories);
    } else {
      rawIndicators.push('listed');
    }
  }
  
  const categories = abstractCategories(rawIndicators);
  const reasons = generateReasons(categories);
  const confidence = response.listed ? 0.75 : 0.1;
  
  return { categories, reasons, confidence, evidence };
}
