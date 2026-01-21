/**
 * Spamhaus Enrich Edge Function Tests
 * Tests abstraction, validation, and compliance
 */

import 'https://deno.land/std@0.224.0/dotenv/load.ts';
import { assertEquals, assertExists } from 'https://deno.land/std@0.224.0/assert/mod.ts';

// Import shared modules for unit testing
import { validateIp, validateDomain, validateInput, normalizeIp, normalizeDomain } from '../_shared/spamhaus/validation.ts';
import { abstractCategories, deriveVerdict, generateReasons, sanitizeEvidence } from '../_shared/spamhaus/abstraction.ts';
import type { AbstractedCategory } from '../_shared/spamhaus/abstraction.ts';

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
});

Deno.test('abstractCategories - maps malware indicators', () => {
  const categories = abstractCategories(['malware', 'dropper']);
  assertEquals(categories.includes('malware_hosting'), true);
});

Deno.test('abstractCategories - maps phishing indicators', () => {
  const categories = abstractCategories(['phishing', 'credential_theft']);
  assertEquals(categories.includes('phishing_risk'), true);
});

Deno.test('abstractCategories - maps botnet indicators', () => {
  const categories = abstractCategories(['botnet', 'c2']);
  assertEquals(categories.includes('botnet_c2'), true);
});

Deno.test('abstractCategories - returns unknown_threat for unrecognized', () => {
  const categories = abstractCategories(['xyz123unknown']);
  assertEquals(categories.includes('unknown_threat'), true);
});

Deno.test('abstractCategories - deduplicates categories', () => {
  const categories = abstractCategories(['spam', 'spambot', 'snowshoe']);
  const spamCount = categories.filter(c => c === 'spam_source').length;
  assertEquals(spamCount, 1);
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

Deno.test('generateReasons - returns plain-language reasons', () => {
  const reasons = generateReasons(['spam_source', 'phishing_risk']);
  assertEquals(reasons.length, 2);
  assertEquals(reasons[0].includes('spam'), true);
  assertEquals(reasons[1].includes('phishing'), true);
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
});

// ============================================
// COMPLIANCE TESTS
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

// ============================================
// EDGE FUNCTION INTEGRATION TEST (requires deployment)
// ============================================

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('VITE_SUPABASE_PUBLISHABLE_KEY');

Deno.test({
  name: 'spamhaus-enrich - rejects invalid input',
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
    
    await response.text(); // Consume body
    
    assertEquals(response.status, 400);
  },
});

Deno.test({
  name: 'spamhaus-enrich - rejects private IP',
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
    
    await response.text(); // Consume body
    
    assertEquals(response.status, 400);
  },
});
