import { describe, it, expect, beforeEach } from 'vitest';
import { generateCSRFToken, validateCSRFToken, getCSRFToken, clearCSRFToken } from '../../src/lib/csrf';

describe('CSRF Protection', () => {
  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();
  });

  it('should generate valid UUID tokens', () => {
    const token = generateCSRFToken();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    expect(token).toBeDefined();
    expect(uuidRegex.test(token)).toBe(true);
  });

  it('should store token in session storage', () => {
    const token = generateCSRFToken();
    const stored = sessionStorage.getItem('csrf_token');
    
    expect(stored).toBeDefined();
    expect(stored).toContain(token);
  });

  it('should validate matching tokens', () => {
    const token = generateCSRFToken();
    const isValid = validateCSRFToken(token);
    
    expect(isValid).toBe(true);
  });

  it('should reject non-matching tokens', () => {
    generateCSRFToken();
    const fakeToken = 'fake-token-123';
    const isValid = validateCSRFToken(fakeToken);
    
    expect(isValid).toBe(false);
  });

  it('should return same token if not expired', () => {
    const token1 = getCSRFToken();
    const token2 = getCSRFToken();
    
    expect(token1).toBe(token2);
  });

  it('should clear token on logout', () => {
    generateCSRFToken();
    expect(sessionStorage.getItem('csrf_token')).toBeDefined();
    
    clearCSRFToken();
    expect(sessionStorage.getItem('csrf_token')).toBeNull();
  });

  it('should reject expired tokens', () => {
    // Generate token
    const token = generateCSRFToken();
    
    // Manually set expiry to past
    const csrfData = JSON.parse(sessionStorage.getItem('csrf_token')!);
    csrfData.expiresAt = Date.now() - 1000; // 1 second ago
    sessionStorage.setItem('csrf_token', JSON.stringify(csrfData));
    
    // Should generate new token since old one expired
    const newToken = getCSRFToken();
    expect(newToken).not.toBe(token);
  });
});
