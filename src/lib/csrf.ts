/**
 * CSRF Token Management
 * Generates and validates CSRF tokens for sensitive operations
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

interface CSRFToken {
  token: string;
  expiresAt: number;
}

/**
 * Generate a new CSRF token and store it
 */
export function generateCSRFToken(): string {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  
  const csrfData: CSRFToken = { token, expiresAt };
  sessionStorage.setItem(CSRF_TOKEN_KEY, JSON.stringify(csrfData));
  
  return token;
}

/**
 * Get the current CSRF token (generate if missing or expired)
 */
export function getCSRFToken(): string {
  const stored = sessionStorage.getItem(CSRF_TOKEN_KEY);
  
  if (stored) {
    try {
      const csrfData: CSRFToken = JSON.parse(stored);
      
      // Check if token is still valid
      if (csrfData.expiresAt > Date.now()) {
        return csrfData.token;
      }
    } catch (error) {
      console.error('Failed to parse CSRF token:', error);
    }
  }
  
  // Generate new token if missing or expired
  return generateCSRFToken();
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(token: string): boolean {
  const stored = sessionStorage.getItem(CSRF_TOKEN_KEY);
  
  if (!stored) {
    return false;
  }
  
  try {
    const csrfData: CSRFToken = JSON.parse(stored);
    
    // Check token match and expiry
    return csrfData.token === token && csrfData.expiresAt > Date.now();
  } catch (error) {
    console.error('Failed to validate CSRF token:', error);
    return false;
  }
}

/**
 * Clear CSRF token (e.g., on logout)
 */
export function clearCSRFToken(): void {
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
}

/**
 * Add CSRF token to request headers
 */
export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
  return {
    ...headers,
    'X-CSRF-Token': getCSRFToken(),
  };
}
