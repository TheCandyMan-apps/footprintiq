import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ResultsDetail from '@/pages/ResultsDetail';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
    })),
  },
}));

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: 'test-scan-id' })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ResultsDetail - Zero Results Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display empty state when scan has zero findings', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock scan with zero findings
    (supabase.from as any).mockImplementation((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-scan-id',
          target: 'test@example.com',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      }),
      order: vi.fn().mockReturnThis(),
    }));

    render(<ResultsDetail />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByText(/no findings/i)).toBeTruthy();
    });
  });

  it('should handle failed scan gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-scan-id',
          target: 'test@example.com',
          status: 'failed',
          error_message: 'Scan timeout',
          created_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      }),
      order: vi.fn().mockReturnThis(),
    }));

    render(<ResultsDetail />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByText(/scan failed/i) || screen.queryByText(/timeout/i)).toBeTruthy();
    });
  });

  it('should handle network error when fetching scan', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Network error', code: 'NETWORK_ERROR' },
      }),
      order: vi.fn().mockReturnThis(),
    }));

    render(<ResultsDetail />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByText(/error/i) || screen.queryByText(/failed/i)).toBeTruthy();
    });
  });

  it('should handle cancelled scan status', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-scan-id',
          target: 'test@example.com',
          status: 'cancelled',
          created_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      }),
      order: vi.fn().mockReturnThis(),
    }));

    render(<ResultsDetail />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByText(/cancelled/i)).toBeTruthy();
    });
  });

  it('should handle partial results from incomplete scan', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-scan-id',
          target: 'test@example.com',
          status: 'partial',
          providers_completed: ['hibp'],
          providers_failed: ['hunter', 'apify'],
          created_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      }),
      order: vi.fn().mockReturnThis(),
    }));

    render(<ResultsDetail />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByText(/partial/i) || screen.queryByText(/incomplete/i)).toBeTruthy();
    });
  });
});
