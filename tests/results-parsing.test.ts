import { describe, it, expect } from 'vitest';
import { normalizeHibp } from '@/lib/normalize/hibp';
import { normalizeHunter } from '@/lib/normalize/hunter';
import { normalizeAbuseIPDB } from '@/lib/normalize/abuseipdb';

describe('Results Parsing and Normalization', () => {
  describe('HIBP Results Parsing', () => {
    it('should normalize HIBP breach data', () => {
      const mockHibpData = [
        {
          Name: 'LinkedIn',
          Title: 'LinkedIn',
          Domain: 'linkedin.com',
          BreachDate: '2012-05-05',
          AddedDate: '2016-05-21',
          ModifiedDate: '2016-05-21',
          PwnCount: 164611595,
          Description: 'In May 2012, LinkedIn had data breach...',
          DataClasses: ['Email addresses', 'Passwords'],
          IsVerified: true,
          IsFabricated: false,
          IsSensitive: false,
          IsRetired: false,
          IsSpamList: false,
        },
      ];

      const findings = normalizeHibp(mockHibpData, 'test@example.com');

      expect(findings).toHaveLength(1);
      expect(findings[0].provider).toBe('hibp');
      expect(findings[0].kind).toBe('breach');
      expect(findings[0].severity).toBe('high');
    });

    it('should handle empty HIBP results', () => {
      const findings = normalizeHibp([], 'clean@example.com');

      expect(findings).toEqual([]);
      expect(findings).toHaveLength(0);
    });

    it('should handle multiple breaches', () => {
      const mockData = [
        {
          Name: 'Adobe',
          BreachDate: '2013-10-04',
          PwnCount: 152445165,
          DataClasses: ['Email addresses', 'Passwords'],
          IsVerified: true,
        },
        {
          Name: 'Dropbox',
          BreachDate: '2012-07-01',
          PwnCount: 68648009,
          DataClasses: ['Email addresses', 'Passwords'],
          IsVerified: true,
        },
      ];

      const findings = normalizeHibp(mockData as any, 'user@example.com');

      expect(findings).toHaveLength(2);
      expect(findings.every((f) => f.provider === 'hibp')).toBe(true);
    });
  });

  describe('Hunter.io Results Parsing', () => {
    it('should normalize Hunter domain results', () => {
      const mockHunterData = {
        data: {
          domain: 'example.com',
          disposable: false,
          webmail: false,
          accept_all: false,
          pattern: '{first}.{last}',
          organization: 'Example Inc',
          emails: [
            {
              value: 'john.doe@example.com',
              type: 'personal',
              confidence: 95,
              sources: [{ domain: 'linkedin.com', uri: 'https://...' }],
            },
          ],
        },
      };

      const findings = normalizeHunter(mockHunterData, 'example.com');

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].provider).toBe('hunter');
    });

    it('should handle empty Hunter results', () => {
      const mockEmptyData = { data: { emails: [] } };

      const findings = normalizeHunter(mockEmptyData, 'unknown.com');

      expect(findings).toEqual([]);
    });
  });

  describe('AbuseIPDB Results Parsing', () => {
    it('should normalize IP reputation data', () => {
      const mockAbuseData = {
        data: {
          ipAddress: '192.168.1.1',
          isPublic: true,
          ipVersion: 4,
          isWhitelisted: false,
          abuseConfidenceScore: 85,
          countryCode: 'US',
          usageType: 'Data Center/Web Hosting/Transit',
          isp: 'Example ISP',
          domain: 'example.com',
          totalReports: 45,
          numDistinctUsers: 12,
          lastReportedAt: '2024-01-15T10:30:00+00:00',
        },
      };

      const findings = normalizeAbuseIPDB(mockAbuseData, '192.168.1.1');

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].provider).toBe('abuseipdb');
      expect(findings[0].severity).toBe('high');
    });

    it('should handle clean IP with no abuse reports', () => {
      const mockCleanData = {
        data: {
          ipAddress: '8.8.8.8',
          abuseConfidenceScore: 0,
          totalReports: 0,
          numDistinctUsers: 0,
        },
      };

      const findings = normalizeAbuseIPDB(mockCleanData, '8.8.8.8');

      expect(findings).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed JSON gracefully', () => {
      const invalidData = null;

      expect(() => normalizeHibp(invalidData as any, 'test@example.com')).not.toThrow();
    });

    it('should handle missing required fields', () => {
      const incompleteData = [{ Name: 'Test' }]; // Missing other required fields

      const findings = normalizeHibp(incompleteData as any, 'test@example.com');

      expect(findings).toBeDefined();
      expect(Array.isArray(findings)).toBe(true);
    });

    it('should sanitize special characters in data', () => {
      const dataWithSpecialChars = [
        {
          Name: 'Test<script>alert("xss")</script>',
          BreachDate: '2020-01-01',
          PwnCount: 1000,
          DataClasses: ['Emails'],
          IsVerified: true,
        },
      ];

      const findings = normalizeHibp(dataWithSpecialChars as any, 'test@example.com');

      expect(findings[0].evidence?.some((e) => e.value.includes('<script>'))).toBeFalsy();
    });
  });

  describe('Severity Calculation', () => {
    it('should assign critical severity to large breaches', () => {
      const largeBreachData = [
        {
          Name: 'MegaBreach',
          BreachDate: '2023-01-01',
          PwnCount: 500000000,
          DataClasses: ['Passwords', 'Email addresses', 'Credit cards'],
          IsVerified: true,
        },
      ];

      const findings = normalizeHibp(largeBreachData as any, 'test@example.com');

      expect(findings[0].severity).toBe('critical');
    });

    it('should assign lower severity to small incidents', () => {
      const smallBreachData = [
        {
          Name: 'SmallBreach',
          BreachDate: '2023-01-01',
          PwnCount: 1000,
          DataClasses: ['Email addresses'],
          IsVerified: true,
        },
      ];

      const findings = normalizeHibp(smallBreachData as any, 'test@example.com');

      expect(['low', 'medium']).toContain(findings[0].severity);
    });
  });
});
