import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AnomalyDetector } from '@/components/AnomalyDetector';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AnomalyDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock authenticated session
    (supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          user: { id: 'test-user-id' },
        },
      },
    });
  });

  describe('Empty Findings Detection', () => {
    it('should detect medium severity anomaly when no findings are present', async () => {
      // Mock edge function response for empty findings
      (supabase.functions.invoke as any).mockResolvedValue({
        data: {
          anomalies: [
            {
              anomaly_type: 'possible_bypass',
              severity: 'medium',
              description: 'Possible bypass detected: No findings returned despite scan execution. This could indicate evasion techniques, privacy tools, or incomplete data sources.',
              metadata: { findingsCount: 0 }
            }
          ],
        },
        error: null,
      });

      const { container } = render(
        <AnomalyDetector scanId="test-scan-1" findings={[]} />,
        { wrapper: createWrapper() }
      );

      // Click detect button
      const detectButton = screen.getByRole('button', { name: /Run Anomaly Detection/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalledWith('detect-anomalies', {
          body: { scanId: 'test-scan-1' },
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/possible bypass/i)).toBeInTheDocument();
        expect(screen.getByText(/medium/i)).toBeInTheDocument();
        expect(screen.getByText(/Possible bypass detected/i)).toBeInTheDocument();
      });
    });

    it('should show "Possible bypass" message for empty findings', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: {
          anomalies: [
            {
              anomaly_type: 'possible_bypass',
              severity: 'medium',
              description: 'Possible bypass detected: No findings returned despite scan execution.',
              metadata: { findingsCount: 0, expectedMinimum: 1 }
            }
          ],
        },
        error: null,
      });

      render(<AnomalyDetector scanId="test-scan-2" findings={[]} />, {
        wrapper: createWrapper(),
      });

      const detectButton = screen.getByRole('button', { name: /Run Anomaly Detection/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        const description = screen.getByText(/Possible bypass detected/i);
        expect(description).toBeInTheDocument();
        expect(description.textContent).toContain('No findings returned');
      });
    });
  });

  describe('Normal Findings Detection', () => {
    it('should detect low severity anomaly when findings are present', async () => {
      const mockFindings = [
        { id: '1', provider: 'HIBP', kind: 'breach', severity: 'high' },
        { id: '2', provider: 'Hunter', kind: 'email', severity: 'medium' },
      ];

      (supabase.functions.invoke as any).mockResolvedValue({
        data: {
          anomalies: [
            {
              anomaly_type: 'normal_operation',
              severity: 'low',
              description: 'Scan completed normally with 2 findings detected. No bypass indicators.',
              metadata: { findingsCount: 2 }
            }
          ],
        },
        error: null,
      });

      render(<AnomalyDetector scanId="test-scan-3" findings={mockFindings} />, {
        wrapper: createWrapper(),
      });

      const detectButton = screen.getByRole('button', { name: /Run Anomaly Detection/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/low/i)).toBeInTheDocument();
        expect(screen.getByText(/normal operation/i)).toBeInTheDocument();
        expect(screen.getByText(/Scan completed normally with 2 findings/i)).toBeInTheDocument();
      });
    });

    it('should show correct finding count in normal operation', async () => {
      const mockFindings = Array(5).fill(null).map((_, i) => ({
        id: `${i}`,
        provider: 'TestProvider',
        kind: 'test',
        severity: 'medium'
      }));

      (supabase.functions.invoke as any).mockResolvedValue({
        data: {
          anomalies: [
            {
              anomaly_type: 'normal_operation',
              severity: 'low',
              description: `Scan completed normally with ${mockFindings.length} findings detected.`,
              metadata: { findingsCount: mockFindings.length }
            }
          ],
        },
        error: null,
      });

      render(<AnomalyDetector scanId="test-scan-4" findings={mockFindings} />, {
        wrapper: createWrapper(),
      });

      const detectButton = screen.getByRole('button', { name: /Run Anomaly Detection/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/5 findings detected/i)).toBeInTheDocument();
      });
    });
  });

  describe('Grok Integration', () => {
    it('should include Grok analysis results when available', async () => {
      const mockFindings = [
        { id: '1', provider: 'HIBP', kind: 'breach', severity: 'critical', confidence: 0.95 }
      ];

      (supabase.functions.invoke as any).mockResolvedValue({
        data: {
          anomalies: [
            {
              anomaly_type: 'normal_operation',
              severity: 'low',
              description: 'Scan completed normally with 1 findings detected.',
              metadata: { findingsCount: 1 }
            },
            {
              anomaly_type: 'suspicious_pattern',
              severity: 'high',
              description: 'Grok detected unusual credential exposure pattern across multiple breaches.',
              metadata: { grokAnalysis: true, providers: ['HIBP'] }
            }
          ],
        },
        error: null,
      });

      render(<AnomalyDetector scanId="test-scan-5" findings={mockFindings} />, {
        wrapper: createWrapper(),
      });

      const detectButton = screen.getByRole('button', { name: /Run Anomaly Detection/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/suspicious pattern/i)).toBeInTheDocument();
        expect(screen.getByText(/Grok detected/i)).toBeInTheDocument();
      });
    });

    it('should handle multiple anomalies from Grok', async () => {
      const mockFindings = Array(10).fill(null).map((_, i) => ({
        id: `${i}`,
        provider: 'TestProvider',
        kind: 'test',
        severity: 'high'
      }));

      (supabase.functions.invoke as any).mockResolvedValue({
        data: {
          anomalies: [
            {
              anomaly_type: 'normal_operation',
              severity: 'low',
              description: 'Scan completed normally with 10 findings detected.',
            },
            {
              anomaly_type: 'data_spike',
              severity: 'medium',
              description: 'Unusual spike in findings detected.',
            },
            {
              anomaly_type: 'behavioral_anomaly',
              severity: 'high',
              description: 'Anomalous pattern in provider distribution.',
            }
          ],
        },
        error: null,
      });

      render(<AnomalyDetector scanId="test-scan-6" findings={mockFindings} />, {
        wrapper: createWrapper(),
      });

      const detectButton = screen.getByRole('button', { name: /Run Anomaly Detection/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/data spike/i)).toBeInTheDocument();
        expect(screen.getByText(/behavioral anomaly/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle authentication error', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
      });

      render(<AnomalyDetector scanId="test-scan-7" findings={[]} />, {
        wrapper: createWrapper(),
      });

      const detectButton = screen.getByRole('button', { name: /Run Anomaly Detection/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(supabase.functions.invoke).not.toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: { message: 'API Error' },
      });

      render(<AnomalyDetector scanId="test-scan-8" findings={[]} />, {
        wrapper: createWrapper(),
      });

      const detectButton = screen.getByRole('button', { name: /Run Anomaly Detection/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalled();
      });
    });
  });
});
