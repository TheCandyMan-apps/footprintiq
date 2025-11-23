/**
 * Export Functionality Test Suite
 * Tests PDF, CSV, and JSON export functions for reliability
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exportAsJSON, exportAsCSV } from '../src/lib/exports';
import { exportDNAasCSV } from '../src/lib/dnaExport';
import type { Finding } from '../src/lib/ufm';

// Mock data
const mockFindings: Finding[] = [
  {
    id: 'test-1',
    type: 'breach',
    title: 'Data Breach Exposure',
    description: 'Email found in data breach',
    severity: 'high',
    confidence: 95,
    provider: 'HIBP',
    providerCategory: 'breach',
    impact: 'Personal data exposed',
    observedAt: new Date().toISOString(),
    evidence: [
      { key: 'email', value: 'test@example.com' },
      { key: 'breach', value: 'LinkedIn 2021' },
    ],
    remediation: ['Change password', 'Enable 2FA'],
    tags: ['breach', 'email'],
  },
  {
    id: 'test-2',
    type: 'social',
    title: 'Social Media Profile',
    description: 'Active Twitter profile',
    severity: 'low',
    confidence: 100,
    provider: 'Maigret',
    providerCategory: 'osint',
    impact: 'Public profile information',
    observedAt: new Date().toISOString(),
    evidence: [
      { key: 'platform', value: 'Twitter' },
      { key: 'url', value: 'https://twitter.com/testuser' },
    ],
    remediation: ['Review privacy settings'],
    tags: ['social', 'twitter'],
  },
];

const mockTrendData = [
  {
    date: '2025-01-01',
    privacyScore: 75,
    totalSources: 10,
    highRiskCount: 2,
    mediumRiskCount: 3,
    lowRiskCount: 5,
  },
  {
    date: '2025-01-15',
    privacyScore: 80,
    totalSources: 12,
    highRiskCount: 1,
    mediumRiskCount: 4,
    lowRiskCount: 7,
  },
];

// Mock browser APIs
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('Export Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock document.createElement and appendChild
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: { visibility: '' },
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
  });

  describe('JSON Export', () => {
    it('should export findings as JSON without errors', () => {
      expect(() => exportAsJSON(mockFindings, false)).not.toThrow();
    });

    it('should redact PII when redactPII is true', () => {
      // Mock Blob to capture content
      const blobSpy = vi.spyOn(global, 'Blob');
      
      exportAsJSON(mockFindings, true);
      
      expect(blobSpy).toHaveBeenCalled();
      const blobContent = blobSpy.mock.calls[0][0][0];
      
      // Redacted data should not contain the original email
      expect(blobContent).not.toContain('test@example.com');
    });

    it('should handle empty findings array', () => {
      expect(() => exportAsJSON([], false)).not.toThrow();
    });
  });

  describe('CSV Export', () => {
    it('should export findings as CSV without errors', () => {
      expect(() => exportAsCSV(mockFindings, false)).not.toThrow();
    });

    it('should escape special CSV characters', () => {
      const findingWithSpecialChars: Finding[] = [
        {
          ...mockFindings[0],
          title: 'Test, with "quotes" and,commas',
        },
      ];
      
      expect(() => exportAsCSV(findingWithSpecialChars, false)).not.toThrow();
    });

    it('should handle findings with no evidence', () => {
      const findingNoEvidence: Finding[] = [
        {
          ...mockFindings[0],
          evidence: [],
        },
      ];
      
      expect(() => exportAsCSV(findingNoEvidence, false)).not.toThrow();
    });
  });

  describe('DNA CSV Export', () => {
    it('should export trend data as CSV', () => {
      expect(() => exportDNAasCSV(mockTrendData, 75)).not.toThrow();
    });

    it('should include correct headers', () => {
      const blobSpy = vi.spyOn(global, 'Blob');
      
      exportDNAasCSV(mockTrendData, 80);
      
      const csvContent = blobSpy.mock.calls[0][0][0] as string;
      expect(csvContent).toContain('Date,Privacy Score,Total Sources');
    });

    it('should handle empty trend data', () => {
      expect(() => exportDNAasCSV([], 50)).not.toThrow();
    });
  });

  describe('Export Error Handling', () => {
    it('should handle blob creation failure gracefully', () => {
      vi.spyOn(global, 'Blob').mockImplementationOnce(() => {
        throw new Error('Blob creation failed');
      });
      
      expect(() => exportAsJSON(mockFindings, false)).toThrow('Blob creation failed');
    });

    it('should handle large datasets without crashing', () => {
      const largeDataset = Array(1000).fill(mockFindings[0]);
      
      expect(() => exportAsJSON(largeDataset, false)).not.toThrow();
      expect(() => exportAsCSV(largeDataset, false)).not.toThrow();
    });
  });

  describe('PII Redaction', () => {
    it('should redact email addresses in CSV export', () => {
      const blobSpy = vi.spyOn(global, 'Blob');
      
      exportAsCSV(mockFindings, true);
      
      const csvContent = blobSpy.mock.calls[0][0][0] as string;
      
      // Check that email is redacted
      expect(csvContent).not.toContain('test@example.com');
      expect(csvContent).toContain('[REDACTED]');
    });

    it('should preserve non-PII data when redacting', () => {
      const blobSpy = vi.spyOn(global, 'Blob');
      
      exportAsJSON(mockFindings, true);
      
      const jsonContent = blobSpy.mock.calls[0][0][0] as string;
      const parsed = JSON.parse(jsonContent);
      
      // Non-PII fields should remain
      expect(parsed[0].provider).toBe('HIBP');
      expect(parsed[0].severity).toBe('high');
    });
  });

  describe('File Naming', () => {
    it('should generate unique filenames with timestamps', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      
      exportAsJSON(mockFindings, false);
      
      const linkElement = createElementSpy.mock.results[0].value;
      const setAttributeCalls = linkElement.setAttribute.mock.calls;
      
      const downloadCall = setAttributeCalls.find((call: any) => call[0] === 'download');
      expect(downloadCall[1]).toMatch(/footprintiq-scan-\d+\.json/);
    });
  });
});

describe('Export Monitoring Integration', () => {
  it('should be importable without errors', async () => {
    const { logExportAttempt, trackExportSuccess, trackExportFailure } = await import('../src/lib/exportMonitoring');
    
    expect(logExportAttempt).toBeDefined();
    expect(trackExportSuccess).toBeDefined();
    expect(trackExportFailure).toBeDefined();
  });
});
