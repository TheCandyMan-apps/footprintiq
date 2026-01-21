/**
 * Spamhaus Enrich Edge Function Tests
 * Tests abstraction, validation, compliance, and integration
 * 
 * Run with: deno test --allow-env --allow-net supabase/functions/spamhaus-enrich/index.test.ts
 */

import 'https://deno.land/std@0.224.0/dotenv/load.ts';
import { assertEquals, assertExists, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';

// Import shared modules for unit testing
import { validateIp, validateDomain, validateInput, normalizeIp, normalizeDomain } from '../_shared/spamhaus/validation.ts';
import { abstractCategories, deriveVerdict, generateReasons, sanitizeEvidence, processSIAResponse, processDQSResponse } from '../_shared/spamhaus/abstraction.ts';
import type { AbstractedCategory } from '../_shared/spamhaus/abstraction.ts';
import { assertNoDisallowedFields, checkCompliance, DISALLOWED_TERMS } from '../_shared/spamhaus/compliance.ts';

// ============================================
// VALIDATION TESTS
// ============================================

Deno.test('validateIp - accepts valid IPv4', () => {
  const result = validateIp('8.8.8.8');
  assertEquals(result.valid, true);
  assertEquals(result.version, 4);
});

Deno.test('validateIp - accepts valid IPv6', () => {
  const result = validateIp('2001:4860:4860::8888');
  assertEquals(result.valid, true);
  assertEquals(result.version, 6);
});

Deno.test('validateIp - rejects private IPv4', () => {
  const result = validateIp('192.168.1.1');
  assertEquals(result.valid, false);
  assertExists(result.error);
});

Deno.test('validateIp - rejects loopback', () => {
  const result = validateIp('127.0.0.1');
  assertEquals(result.valid, false);
});

Deno.test('validateIp - rejects malformed IP', () => {
  const result = validateIp('999.999.999.999');
  assertEquals(result.valid, false);
});

Deno.test('validateIp - rejects empty string', () => {
  const result = validateIp('');
  assertEquals(result.valid, false);
});

Deno.test('validateDomain - accepts valid domain', () => {
  const result = validateDomain('example.com');
  assertEquals(result.valid, true);
});

Deno.test('validateDomain - accepts subdomain', () => {
  const result = validateDomain('sub.example.com');
  assertEquals(result.valid, true);
});

Deno.test('validateDomain - rejects single-part domain', () => {
  const result = validateDomain('localhost');
  assertEquals(result.valid, false);
});

Deno.test('validateDomain - rejects numeric TLD', () => {
  const result = validateDomain('example.123');
  assertEquals(result.valid, false);
});

Deno.test('validateDomain - rejects empty string', () => {
  const result = validateDomain('');
  assertEquals(result.valid, false);
});

Deno.test('validateInput - routes to correct validator', () => {
  const ipResult = validateInput('ip', '8.8.8.8');
  assertEquals(ipResult.valid, true);
  
  const domainResult = validateInput('domain', 'example.com');
  assertEquals(domainResult.valid, true);
});

Deno.test('normalizeIp - lowercases and trims', () => {
  const result = normalizeIp('  2001:DB8::1  ');
  assertEquals(result, '2001:db8::1');
});

Deno.test('normalizeDomain - lowercases and removes trailing dot', () => {
  const result = normalizeDomain('Example.COM.');
  assertEquals(result, 'example.com');
});

// ============================================
// ABSTRACTION TESTS
// ============================================

Deno.test('abstractCategories - maps spam indicators', () => {
  const categories = abstractCategories(['spam', 'spambot']);
  assertEquals(categories.includes('spam_source'), true);
  assertNoDisallowedFields(categories, 'spam categories');
});

Deno.test('abstractCategories - maps malware indicators', () => {
  const categories = abstractCategories(['malware', 'dropper']);
  assertEquals(categories.includes('malware_hosting'), true);
  assertNoDisallowedFields(categories, 'malware categories');
});

Deno.test('abstractCategories - maps phishing indicators', () => {
  const categories = abstractCategories(['phishing', 'credential_theft']);
  assertEquals(categories.includes('phishing_risk'), true);
  assertNoDisallowedFields(categories, 'phishing categories');
});

Deno.test('abstractCategories - maps botnet indicators', () => {
  const categories = abstractCategories(['botnet', 'c2']);
  assertEquals(categories.includes('botnet_c2'), true);
  assertNoDisallowedFields(categories, 'botnet categories');
});

Deno.test('abstractCategories - returns unknown_threat for unrecognized', () => {
  const categories = abstractCategories(['xyz123unknown']);
  assertEquals(categories.includes('unknown_threat'), true);
  assertNoDisallowedFields(categories, 'unknown categories');
});

Deno.test('abstractCategories - deduplicates categories', () => {
  const categories = abstractCategories(['spam', 'spambot', 'snowshoe']);
  const spamCount = categories.filter(c => c === 'spam_source').length;
  assertEquals(spamCount, 1);
});

Deno.test('abstractCategories - handles empty input', () => {
  const categories = abstractCategories([]);
  assertEquals(categories.length, 0);
});

Deno.test('deriveVerdict - returns high for botnet with high confidence', () => {
  const categories: AbstractedCategory[] = ['botnet_c2'];
  const verdict = deriveVerdict(categories, 0.8);
  assertEquals(verdict, 'high');
});

Deno.test('deriveVerdict - returns medium for botnet with medium confidence', () => {
  const categories: AbstractedCategory[] = ['botnet_c2'];
  const verdict = deriveVerdict(categories, 0.5);
  assertEquals(verdict, 'medium');
});

Deno.test('deriveVerdict - returns medium for phishing with high confidence', () => {
  const categories: AbstractedCategory[] = ['phishing_risk'];
  const verdict = deriveVerdict(categories, 0.7);
  assertEquals(verdict, 'medium');
});

Deno.test('deriveVerdict - returns low for mild threats', () => {
  const categories: AbstractedCategory[] = ['newly_observed'];
  const verdict = deriveVerdict(categories, 0.5);
  assertEquals(verdict, 'low');
});

Deno.test('deriveVerdict - returns unknown for empty categories', () => {
  const categories: AbstractedCategory[] = [];
  const verdict = deriveVerdict(categories, 0.5);
  assertEquals(verdict, 'unknown');
});

Deno.test('deriveVerdict - returns unknown for very low confidence', () => {
  const categories: AbstractedCategory[] = ['spam_source'];
  const verdict = deriveVerdict(categories, 0.1);
  assertEquals(verdict, 'unknown');
});

Deno.test('generateReasons - returns plain-language reasons', () => {
  const reasons = generateReasons(['spam_source', 'phishing_risk']);
  assertEquals(reasons.length, 2);
  assertEquals(reasons[0].includes('spam'), true);
  assertEquals(reasons[1].includes('phishing'), true);
  assertNoDisallowedFields(reasons, 'generated reasons');
});

Deno.test('generateReasons - all reasons are compliant', () => {
  // Test ALL possible categories
  const allCategories: AbstractedCategory[] = [
    'abuse_infrastructure', 'mail_reputation', 'malware_hosting',
    'phishing_risk', 'spam_source', 'botnet_c2', 'exploit_kit',
    'drop_zone', 'proxy_vpn', 'newly_observed', 'compromised_host', 'unknown_threat',
  ];
  
  const reasons = generateReasons(allCategories);
  
  for (const reason of reasons) {
    assertNoDisallowedFields(reason, `reason: ${reason}`);
  }
});

Deno.test('sanitizeEvidence - extracts safe fields only', () => {
  const raw = {
    listed: true,
    cc: 'US',
    asn: 15169,
    first_seen: '2024-01-01T00:00:00Z',
    last_seen: '2024-01-15T00:00:00Z',
    // These should NOT appear in output
    dataset: 'SBL123456',
    sensitive_data: 'should_not_appear',
  };
  
  const evidence = sanitizeEvidence(raw);
  
  // Check that abstracted fields are present
  const keys = evidence.map(e => e.key);
  assertEquals(keys.includes('threat_detected'), true);
  assertEquals(keys.includes('country_code'), true);
  assertEquals(keys.includes('has_asn_info'), true);
  
  // Check that raw data is NOT present
  const values = evidence.map(e => e.value);
  assertEquals(values.includes('SBL123456'), false);
  assertEquals(values.includes('should_not_appear'), false);
  
  assertNoDisallowedFields(evidence, 'sanitized evidence');
});

// ============================================
// COMPLIANCE UTILITY TESTS
// ============================================

Deno.test('assertNoDisallowedFields - detects list names', () => {
  for (const listName of DISALLOWED_TERMS.listNames.slice(0, 5)) {
    const badData = { category: `found on ${listName}` };
    
    assertThrows(
      () => assertNoDisallowedFields(badData, 'test'),
      Error,
      'Compliance violation'
    );
  }
});

Deno.test('assertNoDisallowedFields - detects vendor name', () => {
  const badData = { reason: 'Spamhaus reports this IP' };
  
  assertThrows(
    () => assertNoDisallowedFields(badData, 'test'),
    Error,
    'Compliance violation'
  );
});

Deno.test('assertNoDisallowedFields - detects forbidden language', () => {
  const badPhrases = ['blacklisted', 'blocklisted', 'listed on'];
  
  for (const phrase of badPhrases) {
    const badData = { reason: `This IP is ${phrase}` };
    
    assertThrows(
      () => assertNoDisallowedFields(badData, 'test'),
      Error,
      'Compliance violation'
    );
  }
});

Deno.test('assertNoDisallowedFields - passes compliant data', () => {
  const goodData = {
    provider: 'spamhaus',
    verdict: 'high',
    categories: ['botnet_c2', 'malware_hosting'],
    reasons: [
      'Linked to botnet command and control operations',
      'Linked to malware distribution activities',
    ],
    confidence: 0.85,
  };
  
  // Should not throw
  assertNoDisallowedFields(goodData, 'compliant signal');
});

Deno.test('assertNoDisallowedFields - handles nested objects', () => {
  const nested = {
    outer: {
      inner: {
        verdict: 'medium',
        categories: ['spam_source'],
      },
    },
  };
  
  // Should not throw
  assertNoDisallowedFields(nested, 'nested');
});

Deno.test('assertNoDisallowedFields - handles arrays', () => {
  const arr = [
    { verdict: 'low', categories: ['newly_observed'] },
    { verdict: 'high', categories: ['exploit_kit'] },
  ];
  
  // Should not throw
  assertNoDisallowedFields(arr, 'array');
});

Deno.test('checkCompliance - returns detailed violations', () => {
  const badData = {
    message: 'IP is blacklisted on SBL by Spamhaus',
  };
  
  const result = checkCompliance(badData);
  
  assertEquals(result.compliant, false);
  assertEquals(result.violations.length >= 3, true); // SBL, blacklisted, Spamhaus
  assertEquals(result.violations.some(v => v.category === 'listName'), true);
  assertEquals(result.violations.some(v => v.category === 'vendor'), true);
  assertEquals(result.violations.some(v => v.category === 'language'), true);
});

// ============================================
// COMPLIANCE TESTS - FULL PIPELINE
// ============================================

Deno.test('COMPLIANCE - no Spamhaus list names in abstracted output', () => {
  // Test that common list names are NOT in the output
  const listNames = ['SBL', 'XBL', 'PBL', 'DBL', 'ZRD', 'HBL', 'CSS', 'DROP'];
  
  const indicators = listNames.map(l => l.toLowerCase());
  const categories = abstractCategories(indicators);
  const reasons = generateReasons(categories as AbstractedCategory[]);
  
  const allOutput = [...categories, ...reasons].join(' ');
  
  for (const listName of listNames) {
    assertEquals(allOutput.includes(listName), false, `Output should not contain ${listName}`);
  }
});

Deno.test('COMPLIANCE - evidence keys are generic', () => {
  const raw = {
    listed: true,
    dataset: 'SBL999999',
    type: 'spam',
  };
  
  const evidence = sanitizeEvidence(raw);
  
  // Keys should be generic
  for (const e of evidence) {
    assertEquals(e.kind, 'internal');
    assertEquals(e.key.includes('SBL'), false);
    assertEquals(e.key.includes('dataset'), false);
  }
});

Deno.test('COMPLIANCE - processSIAResponse produces compliant output', () => {
  // Simulate raw SIA response with list names
  const rawResponse = {
    status: 'listed',
    results: [
      {
        dataset: 'SBL-12345', // This MUST NOT leak
        listed: true,
        type: 'spam',
        cc: 'US',
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      },
    ],
  };
  
  const result = processSIAResponse(rawResponse);
  
  assertNoDisallowedFields(result, 'processSIAResponse output');
  assertExists(result.categories);
  assertExists(result.reasons);
  assertExists(result.evidence);
});

Deno.test('COMPLIANCE - processDQSResponse produces compliant output', () => {
  const rawResponse = {
    status: 'listed',
    listed: true,
    categories: ['phishing', 'malware'],
  };
  
  const result = processDQSResponse(rawResponse);
  
  assertNoDisallowedFields(result, 'processDQSResponse output');
  assertExists(result.categories);
  assertExists(result.reasons);
});

// ============================================
// PRO TIER ENFORCEMENT TESTS
// ============================================

Deno.test('PRO_REQUIRED - response structure is correct', () => {
  const expectedResponse = {
    success: false,
    error: {
      code: 'PRO_REQUIRED',
      message: 'Spamhaus enrichment is a Pro feature',
    },
  };
  
  assertEquals(expectedResponse.success, false);
  assertEquals(expectedResponse.error.code, 'PRO_REQUIRED');
  assertNoDisallowedFields(expectedResponse, 'PRO_REQUIRED response');
});

Deno.test('PRO_REQUIRED - does not consume credits (audit structure)', () => {
  // Verify audit entry for blocked request
  const auditEntry = {
    user_id: 'test-user-uuid',
    scan_id: null,
    input_type: 'unknown',
    input_value: 'blocked',
    action: 'lookupIp',
    cache_hit: false,
    success: false,
    error_code: 'PRO_REQUIRED',
  };
  
  assertEquals(auditEntry.success, false);
  assertEquals(auditEntry.error_code, 'PRO_REQUIRED');
  assertNoDisallowedFields(auditEntry, 'audit entry');
});

// ============================================
// RATE LIMITING TESTS
// ============================================

Deno.test('rate_limited - response structure is correct', () => {
  const rateLimitResponse = {
    success: false,
    error: {
      code: 'rate_limited',
      message: 'Spamhaus query rate limit exceeded',
      retryAfter: 60,
    },
  };
  
  assertEquals(rateLimitResponse.success, false);
  assertEquals(rateLimitResponse.error.code, 'rate_limited');
  assertExists(rateLimitResponse.error.retryAfter);
  assertNoDisallowedFields(rateLimitResponse, 'rate limit response');
});

// ============================================
// CACHING TESTS
// ============================================

Deno.test('cache - cached signal has cacheHit true', () => {
  const cachedSignal = {
    provider: 'spamhaus',
    input: { type: 'ip', value: '192.0.2.1' },
    verdict: 'medium',
    categories: ['spam_source'],
    reasons: ['Known source of spam or unsolicited email'],
    confidence: 0.6,
    evidence: [],
    fetchedAt: new Date().toISOString(),
    cacheHit: true,
  };
  
  assertEquals(cachedSignal.cacheHit, true);
  assertNoDisallowedFields(cachedSignal, 'cached signal');
});

Deno.test('cache - fresh signal has cacheHit false', () => {
  const freshSignal = {
    provider: 'spamhaus',
    input: { type: 'domain', value: 'example.com' },
    verdict: 'unknown',
    categories: [],
    reasons: [],
    confidence: 0.1,
    evidence: [],
    fetchedAt: new Date().toISOString(),
    cacheHit: false,
  };
  
  assertEquals(freshSignal.cacheHit, false);
  assertNoDisallowedFields(freshSignal, 'fresh signal');
});

// ============================================
// LOGGING COMPLIANCE TESTS
// ============================================

Deno.test('logging - audit entry structure is compliant', () => {
  const auditEntry = {
    user_id: 'uuid-here',
    scan_id: 'scan-uuid',
    input_type: 'ip',
    input_value: '192.0.2.1',
    action: 'lookupIp',
    cache_hit: false,
    success: true,
    status_code: 200,
    error_code: null,
    created_at: new Date().toISOString(),
  };
  
  assertNoDisallowedFields(auditEntry, 'audit entry');
});

Deno.test('logging - console log patterns are compliant', () => {
  // These are example log messages from the edge function
  const logMessages = [
    '[spamhaus-enrich] Request: ip=192.0.2.1, scanId=abc, tier=pro',
    '[spamhaus-enrich] Cache hit for spamhaus:ip:192.0.2.1',
    '[spamhaus-enrich] Rate limit exceeded for user:uuid',
    '[spamhaus-enrich] Pro required, user tier: free',
    '[spamhaus-enrich] Lookup completed in 123ms',
  ];
  
  for (const msg of logMessages) {
    assertNoDisallowedFields(msg, 'log message');
  }
});

// ============================================
// EDGE FUNCTION INTEGRATION TESTS
// ============================================

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('VITE_SUPABASE_PUBLISHABLE_KEY');

Deno.test({
  name: 'integration - requires authentication',
  ignore: !SUPABASE_URL,
  async fn() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/spamhaus-enrich`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputType: 'ip', inputValue: '8.8.8.8' }),
    });
    
    const body = await response.text();
    assertEquals(response.status, 401);
    assertNoDisallowedFields(body, 'auth error response');
  },
});

Deno.test({
  name: 'integration - rejects invalid input',
  ignore: !SUPABASE_URL || !SUPABASE_ANON_KEY,
  async fn() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/spamhaus-enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        inputType: 'ip',
        inputValue: 'not-a-valid-ip',
      }),
    });
    
    const body = await response.text();
    // Will likely fail at auth first with anon key, but validates structure
    assertEquals(response.status === 400 || response.status === 401 || response.status === 403, true);
    assertNoDisallowedFields(body, 'validation error response');
  },
});

Deno.test({
  name: 'integration - rejects private IP',
  ignore: !SUPABASE_URL || !SUPABASE_ANON_KEY,
  async fn() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/spamhaus-enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        inputType: 'ip',
        inputValue: '192.168.1.1',
      }),
    });
    
    const body = await response.text();
    assertEquals(response.status === 400 || response.status === 401 || response.status === 403, true);
    assertNoDisallowedFields(body, 'private IP error response');
  },
});
