/**
 * Sanitize provider results before storing in database
 * - Prevents storing sensitive API keys or tokens
 * - Truncates oversized payloads
 * - Removes stack traces from errors
 */

const MAX_BODY_LENGTH = 50000; // 50kb limit

// Patterns to detect sensitive data
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /api[_-]?secret/i,
  /bearer\s+\S+/i,
  /authorization:\s*\S+/i,
  /password/i,
  /access[_-]?token/i,
  /client[_-]?secret/i,
];

/**
 * Check if a string contains potential sensitive data
 */
function hasSensitiveData(str: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(str));
}

/**
 * Recursively sanitize an object, removing sensitive keys and values
 */
function sanitizeObject(obj: any, depth = 0): any {
  if (depth > 10) return '[Max depth reached]';
  
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    // Redact if contains sensitive patterns
    if (hasSensitiveData(obj)) {
      return '[REDACTED]';
    }
    return obj;
  }
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove sensitive keys entirely
    if (hasSensitiveData(key)) {
      sanitized[key] = '[REDACTED]';
      continue;
    }
    
    // Remove stack traces
    if (key === 'stack' || key === 'stackTrace') {
      continue;
    }
    
    sanitized[key] = sanitizeObject(value, depth + 1);
  }
  
  return sanitized;
}

/**
 * Sanitize provider data before database storage
 * - Truncates large payloads
 * - Removes sensitive information
 * - Removes error stack traces
 */
export function sanitizeProviderData(data: any): any {
  // First, sanitize sensitive data
  const sanitized = sanitizeObject(data);
  
  // Then check size and truncate if needed
  const str = JSON.stringify(sanitized);
  
  if (str.length > MAX_BODY_LENGTH) {
    return {
      truncated: true,
      snippet: str.slice(0, MAX_BODY_LENGTH),
      originalSize: str.length,
      message: 'Result truncated due to size limit (50kb)'
    };
  }
  
  return sanitized;
}

/**
 * Sanitize error objects for safe storage
 */
export function sanitizeError(error: any): { message: string; code?: string } {
  if (!error) return { message: 'Unknown error' };
  
  return {
    message: error.message || String(error),
    code: error.code || error.name || undefined
  };
}
