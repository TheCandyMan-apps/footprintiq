/**
 * Unit Tests for Spamhaus Abstraction Layer
 * 
 * Tests that raw Spamhaus data is properly abstracted
 * and never leaks to client-visible output
 */

import { assertEquals, assertExists, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { 
  abstractCategories, 
  deriveVerdict, 
  generateReasons,
  processSIAResponse,
  processDQSResponse,
  sanitizeEvidence,
} from './abstraction.ts';
import { assertNoDisallowedFields, checkCompliance } from './compliance.ts';
import {
  RAW_SIA_SPAM_RESPONSE,
  RAW_SIA_BOTNET_RESPONSE,
  RAW_SIA_CLEAN_RESPONSE,
  RAW_DQS_PHISHING_RESPONSE,
  RAW_DQS_MALWARE_RESPONSE,
  RAW_DQS_CLEAN_RESPONSE,
  VIOLATION_EXAMPLES,
  COMPLIANT_EXAMPLES,
} from './fixtures.ts';

// ============================================================================
// abstractCategories() Tests
// ============================================================================

Deno.test('abstractCategories - maps spam indicators correctly', () => {
  const result = abstractCategories(['spam', 'spambot']);
  assertEquals(result.includes('spam_source'), true);
  
  // Ensure no raw terms leak through
  assertNoDisallowedFields(result, 'abstractCategories output');
});

Deno.test('abstractCategories - maps botnet indicators correctly', () => {
  const result = abstractCategories(['botnet', 'c2', 'command_control']);
  assertEquals(result.includes('botnet_c2'), true);
  assertNoDisallowedFields(result, 'abstractCategories output');
});

Deno.test('abstractCategories - maps malware indicators correctly', () => {
  const result = abstractCategories(['malware', 'dropper', 'malware_distribution']);
  assertEquals(result.includes('malware_hosting'), true);
  assertNoDisallowedFields(result, 'abstractCategories output');
});

Deno.test('abstractCategories - maps phishing indicators correctly', () => {
  const result = abstractCategories(['phishing', 'phish', 'credential_theft']);
  assertEquals(result.includes('phishing_risk'), true);
  assertNoDisallowedFields(result, 'abstractCategories output');
});

Deno.test('abstractCategories - handles unknown indicators', () => {
  const result = abstractCategories(['some_random_indicator', 'another_unknown']);
  assertEquals(result.includes('unknown_threat'), true);
  assertNoDisallowedFields(result, 'abstractCategories output');
});

Deno.test('abstractCategories - handles empty input', () => {
  const result = abstractCategories([]);
  assertEquals(result.length, 0);
});

Deno.test('abstractCategories - deduplicates categories', () => {
  const result = abstractCategories(['spam', 'spam', 'spambot', 'spam']);
  const spamCount = result.filter(c => c === 'spam_source').length;
  assertEquals(spamCount, 1);
});

// ============================================================================
// deriveVerdict() Tests
// ============================================================================

Deno.test('deriveVerdict - returns high for high-severity with high confidence', () => {
  const verdict = deriveVerdict(['botnet_c2'], 0.8);
  assertEquals(verdict, 'high');
});

Deno.test('deriveVerdict - returns medium for high-severity with medium confidence', () => {
  const verdict = deriveVerdict(['exploit_kit'], 0.5);
  assertEquals(verdict, 'medium');
});

Deno.test('deriveVerdict - returns medium for medium-severity categories', () => {
  const verdict = deriveVerdict(['phishing_risk'], 0.7);
  assertEquals(verdict, 'medium');
});

Deno.test('deriveVerdict - returns low for low confidence', () => {
  const verdict = deriveVerdict(['newly_observed'], 0.35);
  assertEquals(verdict, 'low');
});

Deno.test('deriveVerdict - returns unknown for empty categories', () => {
  const verdict = deriveVerdict([], 0.9);
  assertEquals(verdict, 'unknown');
});

Deno.test('deriveVerdict - returns unknown for very low confidence', () => {
  const verdict = deriveVerdict(['spam_source'], 0.1);
  assertEquals(verdict, 'unknown');
});

// ============================================================================
// generateReasons() Tests
// ============================================================================

Deno.test('generateReasons - produces compliant reasons', () => {
  const reasons = generateReasons(['spam_source', 'botnet_c2']);
  
  assertEquals(reasons.length, 2);
  assertNoDisallowedFields(reasons, 'generateReasons output');
  
  // Check specific reason text
  assertEquals(reasons.some(r => r.includes('spam')), true);
  assertEquals(reasons.some(r => r.includes('botnet')), true);
});

Deno.test('generateReasons - no vendor references', () => {
  const allCategories = [
    'abuse_infrastructure', 'mail_reputation', 'malware_hosting',
    'phishing_risk', 'spam_source', 'botnet_c2', 'exploit_kit',
    'drop_zone', 'proxy_vpn', 'newly_observed', 'compromised_host', 'unknown_threat',
  ];
  
  const reasons = generateReasons(allCategories as any);
  
  for (const reason of reasons) {
    assertNoDisallowedFields(reason, 'reason text');
  }
});

// ============================================================================
// processSIAResponse() Tests
// ============================================================================

Deno.test('processSIAResponse - spam response is compliant', () => {
  const result = processSIAResponse(RAW_SIA_SPAM_RESPONSE);
  
  assertExists(result.categories);
  assertExists(result.reasons);
  assertExists(result.evidence);
  assertEquals(typeof result.confidence, 'number');
  
  // Critical: verify no raw data leaks
  assertNoDisallowedFields(result, 'processSIAResponse output');
});

Deno.test('processSIAResponse - botnet response is compliant', () => {
  const result = processSIAResponse(RAW_SIA_BOTNET_RESPONSE);
  
  assertEquals(result.categories.includes('botnet_c2'), true);
  assertNoDisallowedFields(result, 'processSIAResponse output');
});

Deno.test('processSIAResponse - clean response returns empty', () => {
  const result = processSIAResponse(RAW_SIA_CLEAN_RESPONSE);
  
  assertEquals(result.categories.length, 0);
  assertNoDisallowedFields(result, 'processSIAResponse output');
});

// ============================================================================
// processDQSResponse() Tests
// ============================================================================

Deno.test('processDQSResponse - phishing response is compliant', () => {
  const result = processDQSResponse(RAW_DQS_PHISHING_RESPONSE);
  
  assertEquals(result.categories.includes('phishing_risk'), true);
  assertNoDisallowedFields(result, 'processDQSResponse output');
});

Deno.test('processDQSResponse - malware response is compliant', () => {
  const result = processDQSResponse(RAW_DQS_MALWARE_RESPONSE);
  
  assertEquals(result.categories.includes('malware_hosting'), true);
  assertNoDisallowedFields(result, 'processDQSResponse output');
});

Deno.test('processDQSResponse - clean response is compliant', () => {
  const result = processDQSResponse(RAW_DQS_CLEAN_RESPONSE);
  
  assertEquals(result.categories.length, 0);
  assertNoDisallowedFields(result, 'processDQSResponse output');
});

// ============================================================================
// sanitizeEvidence() Tests
// ============================================================================

Deno.test('sanitizeEvidence - abstracts raw data correctly', () => {
  const raw = {
    dataset: 'SBL-12345', // Should NOT appear in output
    listed: true,
    cc: 'US',
    asn: 12345,
    first_seen: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  };
  
  const evidence = sanitizeEvidence(raw);
  
  // Verify abstraction
  assertNoDisallowedFields(evidence, 'sanitizeEvidence output');
  
  // Verify expected fields exist
  const keys = evidence.map(e => e.key);
  assertEquals(keys.includes('threat_detected'), true);
  assertEquals(keys.includes('country_code'), true);
});

// ============================================================================
// Compliance Check Tests
// ============================================================================

Deno.test('checkCompliance - detects list names', () => {
  const result = checkCompliance(VIOLATION_EXAMPLES.withListName);
  assertEquals(result.compliant, false);
  assertEquals(result.violations.some(v => v.category === 'listName'), true);
});

Deno.test('checkCompliance - detects vendor name', () => {
  const result = checkCompliance(VIOLATION_EXAMPLES.withVendorName);
  assertEquals(result.compliant, false);
  assertEquals(result.violations.some(v => v.category === 'vendor'), true);
});

Deno.test('checkCompliance - detects forbidden language', () => {
  const result = checkCompliance(VIOLATION_EXAMPLES.withForbiddenLanguage);
  assertEquals(result.compliant, false);
  assertEquals(result.violations.some(v => v.category === 'language'), true);
});

Deno.test('checkCompliance - detects multiple violations', () => {
  const result = checkCompliance(VIOLATION_EXAMPLES.withMultipleViolations);
  assertEquals(result.compliant, false);
  assertEquals(result.violations.length > 2, true);
});

Deno.test('checkCompliance - passes compliant threat signal', () => {
  const result = checkCompliance(COMPLIANT_EXAMPLES.threatSignal);
  assertEquals(result.compliant, true);
  assertEquals(result.violations.length, 0);
});

Deno.test('checkCompliance - passes compliant low risk signal', () => {
  const result = checkCompliance(COMPLIANT_EXAMPLES.lowRiskSignal);
  assertEquals(result.compliant, true);
});

Deno.test('checkCompliance - passes compliant clean signal', () => {
  const result = checkCompliance(COMPLIANT_EXAMPLES.cleanSignal);
  assertEquals(result.compliant, true);
});

Deno.test('checkCompliance - passes compliant signal with evidence', () => {
  const result = checkCompliance(COMPLIANT_EXAMPLES.withEvidence);
  assertEquals(result.compliant, true);
});

// ============================================================================
// assertNoDisallowedFields Tests
// ============================================================================

Deno.test('assertNoDisallowedFields - throws on violation', () => {
  assertThrows(
    () => assertNoDisallowedFields(VIOLATION_EXAMPLES.withListName, 'test'),
    Error,
    'Compliance violation'
  );
});

Deno.test('assertNoDisallowedFields - does not throw on compliant data', () => {
  // Should not throw
  assertNoDisallowedFields(COMPLIANT_EXAMPLES.threatSignal, 'test');
  assertNoDisallowedFields(COMPLIANT_EXAMPLES.cleanSignal, 'test');
});

Deno.test('assertNoDisallowedFields - handles nested objects', () => {
  const nested = {
    outer: {
      inner: {
        deep: COMPLIANT_EXAMPLES.threatSignal,
      },
    },
  };
  
  // Should not throw
  assertNoDisallowedFields(nested, 'nested');
});

Deno.test('assertNoDisallowedFields - handles arrays', () => {
  const arr = [
    COMPLIANT_EXAMPLES.threatSignal,
    COMPLIANT_EXAMPLES.lowRiskSignal,
    COMPLIANT_EXAMPLES.cleanSignal,
  ];
  
  // Should not throw
  assertNoDisallowedFields(arr, 'array');
});
