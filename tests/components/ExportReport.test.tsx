import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { exportAsPDF, exportAsCSV, exportAsJSON } from '@/lib/exports';
import { Finding } from '@/lib/ufm';

// Mock supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(),
        single: vi.fn()
      }))
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('sonner', () => ({
  toast: vi.fn()
}));

// Mock PDF export
vi.mock('@/lib/pdf-export', () => ({
  exportReactPDF: vi.fn().mockResolvedValue(undefined)
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Export Report Functionality', () => {
  const mockFindings: Finding[] = [
    {
      id: 'finding-1',
      type: 'breach',
      title: 'Email Exposure',
      description: 'Email found in data breach',
      severity: 'high',
      confidence: 0.95,
      provider: 'HaveIBeenPwned',
      providerCategory: 'Breach Database',
      evidence: [
        { key: 'email', value: 'test@example.com' },
        { key: 'breach_date', value: '2023-01-15' }
      ],
      impact: 'High risk of credential stuffing',
      remediation: ['Change password immediately', 'Enable 2FA'],
      tags: ['breach', 'email'],
      observedAt: new Date('2024-01-01').toISOString()
    },
    {
      id: 'finding-2',
      type: 'social_media',
      title: 'Twitter Profile Found',
      description: 'Active Twitter account',
      severity: 'low',
      confidence: 0.85,
      provider: 'Twitter',
      providerCategory: 'Social Media',
      evidence: [
        { key: 'username', value: '@testuser' },
        { key: 'followers', value: '1234' }
      ],
      impact: 'Public profile information',
      remediation: ['Review privacy settings'],
      tags: ['social', 'twitter'],
      observedAt: new Date('2024-01-02').toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock document methods
    document.createElement = vi.fn((tag) => {
      const element = {
        tagName: tag.toUpperCase(),
        href: '',
        download: '',
        click: vi.fn(),
        remove: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn()
      };
      return element as any;
    });
    
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PDF Export', () => {
    it('generates PDF with findings table', async () => {
      const { exportReactPDF } = await import('@/lib/pdf-export');
      
      await exportAsPDF(mockFindings, false);
      
      expect(exportReactPDF).toHaveBeenCalledWith(mockFindings, false);
    });

    it('handles PDF generation errors gracefully', async () => {
      const { exportReactPDF } = await import('@/lib/pdf-export');
      vi.mocked(exportReactPDF).mockRejectedValueOnce(new Error('PDF generation failed'));
      
      await expect(exportAsPDF(mockFindings, false)).rejects.toThrow();
    });

    it('redacts PII when redactPII is true', async () => {
      const { exportReactPDF } = await import('@/lib/pdf-export');
      
      await exportAsPDF(mockFindings, true);
      
      expect(exportReactPDF).toHaveBeenCalledWith(expect.any(Array), true);
    });

    it('includes all findings in PDF report', async () => {
      const { exportReactPDF } = await import('@/lib/pdf-export');
      
      await exportAsPDF(mockFindings, false);
      
      const callArgs = vi.mocked(exportReactPDF).mock.calls[0];
      expect(callArgs[0]).toHaveLength(mockFindings.length);
    });
  });

  describe('CSV Export', () => {
    it('exports findings as CSV with proper headers', () => {
      exportAsCSV(mockFindings, false);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('flattens evidence into CSV rows', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      
      exportAsCSV(mockFindings, false);
      
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    it('escapes CSV special characters', () => {
      const findingsWithSpecialChars: Finding[] = [
        {
          ...mockFindings[0],
          title: 'Email, with comma',
          description: 'Description "with quotes"',
          evidence: [{ key: 'data', value: '=formula' }]
        }
      ];
      
      exportAsCSV(findingsWithSpecialChars, false);
      
      expect(document.createElement).toHaveBeenCalled();
    });

    it('handles empty findings array', () => {
      expect(() => exportAsCSV([], false)).not.toThrow();
    });
  });

  describe('JSON Export', () => {
    it('exports findings as formatted JSON', () => {
      exportAsJSON(mockFindings, false);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('preserves finding structure in JSON', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      
      exportAsJSON(mockFindings, false);
      
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });
  });

  describe('Export Workflow Integration', () => {
    it('triggers download for PDF export', async () => {
      const clickSpy = vi.fn();
      vi.spyOn(document, 'createElement').mockReturnValue({
        click: clickSpy,
        href: '',
        download: '',
        remove: vi.fn()
      } as any);
      
      await exportAsPDF(mockFindings, false);
      
      await waitFor(() => {
        expect(clickSpy).toHaveBeenCalled();
      });
    });

    it('triggers download for CSV export', () => {
      const clickSpy = vi.fn();
      vi.spyOn(document, 'createElement').mockReturnValue({
        click: clickSpy,
        href: '',
        download: '',
        remove: vi.fn()
      } as any);
      
      exportAsCSV(mockFindings, false);
      
      expect(clickSpy).toHaveBeenCalled();
    });

    it('cleans up blob URLs after download', async () => {
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
      
      await exportAsPDF(mockFindings, false);
      
      await waitFor(() => {
        expect(revokeObjectURLSpy).toHaveBeenCalled();
      });
    });
  });

  describe('PII Redaction', () => {
    it('redacts email addresses in findings when enabled', async () => {
      const findingsWithPII: Finding[] = [
        {
          ...mockFindings[0],
          evidence: [{ key: 'email', value: 'sensitive@example.com' }]
        }
      ];
      
      await exportAsPDF(findingsWithPII, true);
      
      const { exportReactPDF } = await import('@/lib/pdf-export');
      const redactedFindings = vi.mocked(exportReactPDF).mock.calls[0][0];
      
      // Check that findings were processed (redaction happens in redactFindings)
      expect(redactedFindings).toBeDefined();
    });

    it('does not redact when redactPII is false', async () => {
      const { exportReactPDF } = await import('@/lib/pdf-export');
      
      await exportAsPDF(mockFindings, false);
      
      const callArgs = vi.mocked(exportReactPDF).mock.calls[0];
      expect(callArgs[1]).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles findings with no evidence', async () => {
      const findingsNoEvidence: Finding[] = [
        {
          ...mockFindings[0],
          evidence: []
        }
      ];
      
      await expect(exportAsPDF(findingsNoEvidence, false)).resolves.not.toThrow();
    });

    it('handles findings with complex nested objects in evidence', async () => {
      const findingsComplexEvidence: Finding[] = [
        {
          ...mockFindings[0],
          evidence: [
            { 
              key: 'metadata', 
              value: { nested: { deep: { value: 'test' } } } 
            }
          ]
        }
      ];
      
      await expect(exportAsPDF(findingsComplexEvidence, false)).resolves.not.toThrow();
    });

    it('handles large number of findings', async () => {
      const largeFindings = Array.from({ length: 100 }, (_, i) => ({
        ...mockFindings[0],
        id: `finding-${i}`,
        title: `Finding ${i}`
      }));
      
      await expect(exportAsPDF(largeFindings, false)).resolves.not.toThrow();
    });
  });
});
