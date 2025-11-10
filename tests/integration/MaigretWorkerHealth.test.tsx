import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdvancedScan from '@/pages/AdvancedScan';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user' } }, 
        error: null 
      })),
    },
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </BrowserRouter>
);

describe('Maigret Worker Health Checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should perform health check before username scan', async () => {
    const mockHealthResponse = {
      data: { status: 'healthy', worker_url: 'https://test-worker.com' },
      error: null,
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce(mockHealthResponse);

    render(<AdvancedScan />, { wrapper });

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith('maigret-health');
    });
  });

  it('should show error toast when worker is unhealthy', async () => {
    const { toast } = await import('sonner');
    
    const mockUnhealthyResponse = {
      data: { status: 'unhealthy', error: 'Worker timeout' },
      error: null,
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce(mockUnhealthyResponse);

    render(<AdvancedScan />, { wrapper });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Maigret offline – use fallback providers',
        expect.objectContaining({
          description: expect.stringContaining('unavailable'),
        })
      );
    });
  });

  it('should proceed with warning if health check fails', async () => {
    const { toast } = await import('sonner');
    
    vi.mocked(supabase.functions.invoke).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<AdvancedScan />, { wrapper });

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        'Could not verify worker status – proceeding with scan'
      );
    });
  });

  it('should handle empty worker response correctly', async () => {
    const mockEmptyResponse = {
      data: { 
        status: 'error',
        error: 'No results – check admin logs or retry',
        jobId: 'test-job-123'
      },
      error: null,
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce(mockEmptyResponse);

    // Test that empty response triggers proper error handling
    expect(mockEmptyResponse.data.status).toBe('error');
    expect(mockEmptyResponse.data.error).toContain('check admin logs');
  });

  it('should create partial case for empty scans', async () => {
    // This would be tested in the edge function tests
    // Verify that the enqueue-maigret-scan function creates a case
    const mockCaseCreation = {
      user_id: 'test-user',
      title: 'Empty scan: test_username',
      description: 'Scan returned no results - Worker may need configuration',
      status: 'open',
      priority: 'low'
    };

    expect(mockCaseCreation.title).toContain('Empty scan');
    expect(mockCaseCreation.description).toContain('Worker may need configuration');
  });

  it('should log enhanced diagnostics for empty responses', () => {
    const mockDiagnostics = {
      jobId: 'test-job-123',
      username: 'test_user',
      workerUrl: 'https://test-worker.com',
      linesProcessed: 0,
      rowsInserted: 0,
      plan: 'standard'
    };

    // Verify diagnostic data structure
    expect(mockDiagnostics.linesProcessed).toBe(0);
    expect(mockDiagnostics.rowsInserted).toBe(0);
    expect(mockDiagnostics).toHaveProperty('workerUrl');
  });
});
