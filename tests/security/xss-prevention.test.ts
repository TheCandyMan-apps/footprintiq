import { describe, it, expect } from 'vitest';
import { detectXSS, validateInput } from '../../supabase/functions/_shared/security-validation';

describe('XSS Prevention', () => {
  it('should detect common XSS patterns', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert(1)>',
      '<svg/onload=alert(1)>',
      'javascript:alert(1)',
      '<iframe src="javascript:alert(1)">',
      '<body onload=alert(1)>',
      '<input onfocus=alert(1) autofocus>',
      '<select onfocus=alert(1) autofocus>',
    ];

    xssPayloads.forEach(payload => {
      const result = detectXSS(payload);
      expect(result.safe).toBe(false);
      expect(result.threat).toBeDefined();
    });
  });

  it('should allow safe HTML-like content', () => {
    const safeInputs = [
      'Check out my website at https://example.com',
      'Email me at user@example.com',
      'Price: $19.99',
      'Math: 2 < 5 and 10 > 3',
    ];

    safeInputs.forEach(input => {
      const result = detectXSS(input);
      expect(result.safe).toBe(true);
    });
  });

  it('should sanitize user input', () => {
    const result = validateInput('<script>alert(1)</script>', {
      checkXSS: true,
    });

    expect(result.valid).toBe(false);
    expect(result.threat).toContain('XSS');
  });

  it('should escape HTML entities', () => {
    const result = validateInput('<div>Hello & goodbye</div>', {
      checkXSS: false, // Allow HTML but sanitize
    });

    expect(result.valid).toBe(true);
    expect(result.sanitized).toBeDefined();
    // Should escape < and >
    expect(result.sanitized).not.toContain('<div>');
  });
});
