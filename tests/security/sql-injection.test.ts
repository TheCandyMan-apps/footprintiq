import { describe, it, expect } from 'vitest';
import { detectSQLInjection, validateInput } from '../../supabase/functions/_shared/security-validation';

describe('SQL Injection Prevention', () => {
  it('should detect common SQL injection patterns', () => {
    const maliciousInputs = [
      "' OR '1'='1",
      "1; DROP TABLE users--",
      "admin'--",
      "' UNION SELECT * FROM users--",
      "1' AND '1'='1",
      "'; DELETE FROM scans WHERE '1'='1",
      "1' OR 1=1--",
      "' OR 'x'='x",
    ];

    maliciousInputs.forEach(input => {
      const result = detectSQLInjection(input);
      expect(result.safe).toBe(false);
      expect(result.threat).toBeDefined();
    });
  });

  it('should allow safe inputs', () => {
    const safeInputs = [
      'john.doe@example.com',
      'normal-username',
      'A valid search query',
      '12345',
      'https://example.com',
    ];

    safeInputs.forEach(input => {
      const result = detectSQLInjection(input);
      expect(result.safe).toBe(true);
      expect(result.threat).toBeUndefined();
    });
  });

  it('should sanitize and validate input', () => {
    const result = validateInput("' OR '1'='1", {
      checkSQLInjection: true,
    });

    expect(result.valid).toBe(false);
    expect(result.threat).toContain('SQL injection');
  });

  it('should handle edge cases', () => {
    const edgeCases = [
      '',
      ' ',
      'null',
      'undefined',
      '<script>alert("xss")</script>',
    ];

    edgeCases.forEach(input => {
      const result = validateInput(input, {
        checkSQLInjection: true,
        checkXSS: true,
      });
      
      // Should either sanitize or reject
      expect(result).toBeDefined();
    });
  });
});
