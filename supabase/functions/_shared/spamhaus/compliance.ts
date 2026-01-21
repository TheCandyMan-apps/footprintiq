/**
 * Spamhaus Compliance Utilities
 * 
 * Ensures no Spamhaus-specific data is exposed to clients.
 * Used for validation in tests and runtime checks.
 * 
 * COMPLIANCE: ToS-compliant abstraction layer
 */

/**
 * List of disallowed terms that must NEVER appear in client-visible output
 */
export const DISALLOWED_TERMS = {
  // Spamhaus list names (case-insensitive)
  listNames: [
    'SBL', 'XBL', 'PBL', 'DBL', 'ZRD', 'HBL',
    'DROP', 'EDROP', 'ASN-DROP',
    'CSS', 'BCL', 'ROKSO',
    'exploits-bl', 'abused-networks',
  ],
  
  // Vendor identification (only flag in user-visible text, not internal provider field)
  vendorTerms: [
    'spamhaus.org',
    'spamhaus.com',
    'Spamhaus Intelligence',
    'Spamhaus Project',
  ],
  
  // Forbidden UI language
  forbiddenLanguage: [
    'blacklist',
    'blacklisted',
    'blocklist',
    'blocklisted',
    'listed on',
    'appears on',
    'found in list',
    'block list',
    'deny list',
  ],
} as const;

/**
 * Check if a string contains any disallowed terms
 * Returns details about violations if found
 */
export interface ComplianceViolation {
  term: string;
  category: 'listName' | 'vendor' | 'language';
  context: string;
}

export interface ComplianceCheckResult {
  compliant: boolean;
  violations: ComplianceViolation[];
}

/**
 * Assert that a signal or UI text contains no disallowed fields
 * Throws if violations found (for test assertions)
 * 
 * @param input - String, object, or array to check
 * @param context - Description of what's being checked (for error messages)
 */
export function assertNoDisallowedFields(
  input: unknown,
  context: string = 'input'
): void {
  const result = checkCompliance(input);
  
  if (!result.compliant) {
    const violationDetails = result.violations
      .map(v => `  - "${v.term}" (${v.category}) found in: ${v.context}`)
      .join('\n');
    
    throw new Error(
      `Compliance violation in ${context}:\n${violationDetails}\n\n` +
      `Spamhaus ToS prohibits exposing list names, vendor references, ` +
      `and "blacklist/blocklist" terminology to end users.`
    );
  }
}

/**
 * Check compliance without throwing
 * Returns detailed results for logging/testing
 */
export function checkCompliance(input: unknown): ComplianceCheckResult {
  const violations: ComplianceViolation[] = [];
  
  // Convert input to searchable string
  const searchableText = extractSearchableText(input);
  
  // Check list names (case-insensitive but preserve boundaries)
  for (const listName of DISALLOWED_TERMS.listNames) {
    const regex = new RegExp(`\\b${escapeRegex(listName)}\\b`, 'i');
    if (regex.test(searchableText)) {
      violations.push({
        term: listName,
        category: 'listName',
        context: findContext(searchableText, listName),
      });
    }
  }
  
  // Check vendor terms
  for (const vendorTerm of DISALLOWED_TERMS.vendorTerms) {
    const regex = new RegExp(escapeRegex(vendorTerm), 'i');
    if (regex.test(searchableText)) {
      violations.push({
        term: vendorTerm,
        category: 'vendor',
        context: findContext(searchableText, vendorTerm),
      });
    }
  }
  
  // Check forbidden language
  for (const phrase of DISALLOWED_TERMS.forbiddenLanguage) {
    const regex = new RegExp(escapeRegex(phrase), 'i');
    if (regex.test(searchableText)) {
      violations.push({
        term: phrase,
        category: 'language',
        context: findContext(searchableText, phrase),
      });
    }
  }
  
  return {
    compliant: violations.length === 0,
    violations,
  };
}

/**
 * Extract all searchable text from various input types
 */
function extractSearchableText(input: unknown): string {
  if (input === null || input === undefined) {
    return '';
  }
  
  if (typeof input === 'string') {
    return input;
  }
  
  if (typeof input === 'number' || typeof input === 'boolean') {
    return String(input);
  }
  
  if (Array.isArray(input)) {
    return input.map(extractSearchableText).join(' ');
  }
  
  if (typeof input === 'object') {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(input)) {
      // Include both keys and values in search
      parts.push(key);
      parts.push(extractSearchableText(value));
    }
    return parts.join(' ');
  }
  
  return '';
}

/**
 * Find surrounding context for a match (for error messages)
 */
function findContext(text: string, term: string): string {
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const index = lowerText.indexOf(lowerTerm);
  
  if (index === -1) {
    return '(position unknown)';
  }
  
  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + term.length + 20);
  let context = text.slice(start, end);
  
  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';
  
  return context;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Runtime compliance check for SpamhausSignal before returning to client
 * Logs violation attempts but does NOT block (to avoid breaking production)
 */
export function validateSignalCompliance(
  signal: unknown,
  scanId?: string
): { valid: boolean; sanitized: boolean } {
  const result = checkCompliance(signal);
  
  if (!result.compliant) {
    console.error(
      `[spamhaus-compliance] VIOLATION DETECTED (scanId: ${scanId || 'unknown'}):`,
      result.violations.map(v => `${v.category}:${v.term}`).join(', ')
    );
    
    // In production, we log but don't block - the abstraction layer should prevent this
    return { valid: false, sanitized: false };
  }
  
  return { valid: true, sanitized: true };
}
