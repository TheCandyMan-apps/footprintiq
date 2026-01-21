/**
 * Test Fixtures for Spamhaus Integration
 * 
 * PRIVATE: These fixtures are for server-side tests only
 * They simulate raw API responses for testing abstraction logic
 * 
 * DO NOT import this file in client-side code
 */

import type { RawSIAResponse, RawDQSResponse, SpamhausSignal } from './types.ts';

// ============================================================================
// RAW RESPONSE FIXTURES (never exposed to client)
// ============================================================================

/**
 * Simulated SIA response for a known spam source
 */
export const RAW_SIA_SPAM_RESPONSE: RawSIAResponse = {
  status: 'listed',
  results: [
    {
      dataset: 'SBL-DATA', // This MUST be abstracted
      listed: true,
      type: 'spam',
      asn: 12345,
      asn_name: 'Example ISP',
      cc: 'US',
      first_seen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      last_seen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

/**
 * Simulated SIA response for a botnet C2
 */
export const RAW_SIA_BOTNET_RESPONSE: RawSIAResponse = {
  status: 'listed',
  results: [
    {
      dataset: 'XBL-DATA', // This MUST be abstracted
      listed: true,
      type: 'botnet',
      asn: 67890,
      cc: 'RU',
      first_seen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_seen: new Date().toISOString(),
    },
    {
      dataset: 'CSS-DATA', // This MUST be abstracted
      listed: true,
      type: 'c2',
    },
  ],
};

/**
 * Simulated SIA response for a clean IP
 */
export const RAW_SIA_CLEAN_RESPONSE: RawSIAResponse = {
  status: 'ok',
  results: [],
};

/**
 * Simulated DQS response for a phishing domain
 */
export const RAW_DQS_PHISHING_RESPONSE: RawDQSResponse = {
  status: 'listed',
  listed: true,
  categories: ['phishing', 'credential_theft'],
};

/**
 * Simulated DQS response for a malware domain
 */
export const RAW_DQS_MALWARE_RESPONSE: RawDQSResponse = {
  status: 'listed',
  listed: true,
  categories: ['malware', 'exploit_kit'],
};

/**
 * Simulated DQS response for a clean domain
 */
export const RAW_DQS_CLEAN_RESPONSE: RawDQSResponse = {
  status: 'ok',
  listed: false,
};

// ============================================================================
// EXPECTED COMPLIANT OUTPUT FIXTURES
// ============================================================================

/**
 * Expected compliant output for spam source
 * Note: NO list names, NO "Spamhaus", NO "blacklist"
 */
export const EXPECTED_SPAM_SIGNAL: Partial<SpamhausSignal> = {
  provider: 'spamhaus',
  verdict: 'medium',
  categories: ['spam_source'],
  reasons: ['Known source of spam or unsolicited email'],
};

/**
 * Expected compliant output for botnet C2
 */
export const EXPECTED_BOTNET_SIGNAL: Partial<SpamhausSignal> = {
  provider: 'spamhaus',
  verdict: 'high',
  categories: ['botnet_c2'],
  reasons: ['Linked to botnet command and control operations'],
};

/**
 * Expected compliant output for clean IP
 */
export const EXPECTED_CLEAN_SIGNAL: Partial<SpamhausSignal> = {
  provider: 'spamhaus',
  verdict: 'unknown',
  categories: [],
  reasons: [],
};

/**
 * Expected compliant output for phishing domain
 */
export const EXPECTED_PHISHING_SIGNAL: Partial<SpamhausSignal> = {
  provider: 'spamhaus',
  verdict: 'medium',
  categories: ['phishing_risk'],
  reasons: ['Associated with phishing or credential theft'],
};

// ============================================================================
// VIOLATION TEST CASES
// ============================================================================

/**
 * Examples of NON-COMPLIANT outputs that should FAIL compliance checks
 */
export const VIOLATION_EXAMPLES = {
  // Contains list name
  withListName: {
    verdict: 'high',
    categories: ['SBL-listed'], // VIOLATION: contains SBL
    reasons: ['Found in SBL database'], // VIOLATION: contains SBL
  },
  
  // Contains vendor name
  withVendorName: {
    verdict: 'medium',
    categories: ['abuse_infrastructure'],
    reasons: ['Spamhaus reports this IP is malicious'], // VIOLATION: contains Spamhaus
  },
  
  // Contains forbidden language
  withForbiddenLanguage: {
    verdict: 'high',
    categories: ['spam_source'],
    reasons: ['IP is blacklisted for spam'], // VIOLATION: contains blacklisted
  },
  
  // Multiple violations
  withMultipleViolations: {
    verdict: 'high',
    categories: ['XBL-botnet', 'PBL-dynamic'], // VIOLATION: XBL, PBL
    reasons: [
      'Blacklisted by Spamhaus', // VIOLATION: blacklisted, Spamhaus
      'Appears on SBL blocklist', // VIOLATION: SBL, blocklist
    ],
  },
};

// ============================================================================
// COMPLIANT TEST CASES
// ============================================================================

/**
 * Examples of COMPLIANT outputs that should PASS compliance checks
 */
export const COMPLIANT_EXAMPLES = {
  // Standard threat signal
  threatSignal: {
    provider: 'spamhaus',
    verdict: 'high',
    categories: ['botnet_c2', 'malware_hosting'],
    reasons: [
      'Linked to botnet command and control operations',
      'Linked to malware distribution activities',
    ],
    confidence: 0.85,
  },
  
  // Low risk signal
  lowRiskSignal: {
    provider: 'spamhaus',
    verdict: 'low',
    categories: ['newly_observed'],
    reasons: ['Recently observed with limited reputation history'],
    confidence: 0.4,
  },
  
  // Clean signal
  cleanSignal: {
    provider: 'spamhaus',
    verdict: 'unknown',
    categories: [],
    reasons: [],
    confidence: 0.1,
  },
  
  // With evidence
  withEvidence: {
    provider: 'spamhaus',
    verdict: 'medium',
    categories: ['spam_source'],
    reasons: ['Known source of spam or unsolicited email'],
    evidence: [
      { kind: 'internal', key: 'threat_detected', value: 'true' },
      { kind: 'internal', key: 'country_code', value: 'US' },
      { kind: 'internal', key: 'observation_age', value: 'established' },
    ],
    confidence: 0.7,
  },
};
