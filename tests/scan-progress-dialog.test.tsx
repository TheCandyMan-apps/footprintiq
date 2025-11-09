import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ScanProgressDialog } from '@/components/scan/ScanProgressDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('ScanProgressDialog - Premium Reliability', () => {
  let mockChannel: any;
  let broadcastHandlers: Map<string, Function>;

  beforeEach(() => {
    vi.clearAllMocks();
    broadcastHandlers = new Map();

    // Mock channel setup
    mockChannel = {
      on: vi.fn((type: string, config: any, handler: Function) => {
        if (config.event) {
          broadcastHandlers.set(config.event, handler);
        }
        return mockChannel;
      }),
      subscribe: vi.fn(() => Promise.resolve()),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Provider List with Realtime Status', () => {
    it('should display providers with loading status initially', async () => {
      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByText('Scan Progress')).toBeInTheDocument();
      });

      // Simulate provider updates via broadcast
      const providerUpdateHandler = broadcastHandlers.get('provider_update');
      expect(providerUpdateHandler).toBeDefined();

      // Provider 1: Loading
      providerUpdateHandler?.({
        payload: {
          provider: 'Provider 1',
          status: 'loading',
          message: 'Querying...',
        },
      });

      await waitFor(() => {
        expect(screen.getByText('Provider 1')).toBeInTheDocument();
        expect(screen.getByText('Querying...')).toBeInTheDocument();
      });
    });

    it('should show 5 providers with different statuses', async () => {
      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const providerUpdateHandler = broadcastHandlers.get('provider_update');
      const orchestratorHandler = broadcastHandlers.get('progress');

      // Simulate 5 providers with different statuses
      const providers = [
        { name: 'HIBP', status: 'success' as const, message: 'Completed (5 findings)' },
        { name: 'DeHashed', status: 'loading' as const, message: 'Querying...' },
        { name: 'Shodan', status: 'failed' as const, message: 'API rate limit exceeded' },
        { name: 'Hunter.io', status: 'pending' as const, message: 'Waiting...' },
        { name: 'VirusTotal', status: 'success' as const, message: 'Completed (12 findings)' },
      ];

      for (const provider of providers) {
        if (providerUpdateHandler) {
          providerUpdateHandler({ payload: provider });
        } else if (orchestratorHandler) {
          // For orchestrator pattern
          orchestratorHandler({
            payload: {
              message: `Querying ${provider.name}...`,
            },
          });
          if (provider.status === 'success') {
            orchestratorHandler({
              payload: {
                message: `Completed ${provider.name}...`,
                findingsCount: 5,
              },
            });
          }
        }
      }

      await waitFor(() => {
        // Check success provider with ✅
        expect(screen.getByText('HIBP')).toBeInTheDocument();
        expect(screen.getByText('Completed (5 findings)')).toBeInTheDocument();

        // Check loading provider with ⏳ (spinner)
        expect(screen.getByText('DeHashed')).toBeInTheDocument();
        expect(screen.getByText('Querying...')).toBeInTheDocument();

        // Check failed provider with ❌
        expect(screen.getByText('Shodan')).toBeInTheDocument();
        expect(screen.getByText('API rate limit exceeded')).toBeInTheDocument();

        // Check pending provider
        expect(screen.getByText('Hunter.io')).toBeInTheDocument();

        // Check second success provider
        expect(screen.getByText('VirusTotal')).toBeInTheDocument();
      });
    });

    it('should update provider status in realtime', async () => {
      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const providerUpdateHandler = broadcastHandlers.get('provider_update');

      // Initial: loading
      providerUpdateHandler?.({
        payload: {
          provider: 'Test Provider',
          status: 'loading',
          message: 'Querying...',
        },
      });

      await waitFor(() => {
        expect(screen.getByText('Test Provider')).toBeInTheDocument();
        expect(screen.getByText('Querying...')).toBeInTheDocument();
      });

      // Update: success
      providerUpdateHandler?.({
        payload: {
          provider: 'Test Provider',
          status: 'success',
          message: 'Completed (10 findings)',
        },
      });

      await waitFor(() => {
        expect(screen.getByText('Completed (10 findings)')).toBeInTheDocument();
        expect(screen.getByText('Done')).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should show cancel button during scan', async () => {
      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel Scan');
        expect(cancelButton).toBeInTheDocument();
      });
    });

    it('should call cancel-scan edge function on click', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ error: null });
      (supabase.functions.invoke as any).mockImplementation(mockInvoke);

      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const cancelButton = await screen.findByText('Cancel Scan');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('cancel-scan', {
          body: { scanId: 'test-scan-123' },
        });
      });
    });

    it('should show cancelling state and disable button', async () => {
      const mockInvoke = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      (supabase.functions.invoke as any).mockImplementation(mockInvoke);

      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const cancelButton = await screen.findByText('Cancel Scan');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Cancelling...')).toBeInTheDocument();
      });
    });

    it('should handle cancel error gracefully', async () => {
      const mockInvoke = vi.fn().mockRejectedValue(new Error('Network error'));
      (supabase.functions.invoke as any).mockImplementation(mockInvoke);

      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const cancelButton = await screen.findByText('Cancel Scan');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });
  });

  describe('Zero Results Handling', () => {
    beforeEach(() => {
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'test-scan-123',
                scan_type: 'email',
                email: 'test@example.com',
              },
            })),
          })),
        })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
      }));
      (supabase.from as any).mockImplementation(mockFrom);
    });

    it('should show toast on zero results', async () => {
      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const completeHandler = broadcastHandlers.get('scan_complete');
      
      // Simulate scan completion with zero results
      completeHandler?.({
        payload: {
          resultsCount: 0,
        },
      });

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith(
          'No results found',
          expect.objectContaining({
            description: expect.stringContaining('broader query'),
          })
        );
      });
    });

    it('should save partial case on zero results', async () => {
      const mockInsert = vi.fn(() => Promise.resolve({ error: null }));
      const mockFrom = vi.fn((table: string) => {
        if (table === 'scans') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({
                  data: {
                    id: 'test-scan-123',
                    scan_type: 'username',
                    username: 'johndoe',
                  },
                })),
              })),
            })),
          };
        }
        if (table === 'cases') {
          return { insert: mockInsert };
        }
        return {};
      });
      (supabase.from as any).mockImplementation(mockFrom);

      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const completeHandler = broadcastHandlers.get('scan_complete');
      
      completeHandler?.({
        payload: {
          resultsCount: 0,
        },
      });

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringContaining('No Results Scan'),
            status: 'closed',
            priority: 'low',
            results: [],
          })
        );
      }, { timeout: 3000 });
    });

    it('should display zero results message in dialog', async () => {
      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const completeHandler = broadcastHandlers.get('scan_complete');
      
      completeHandler?.({
        payload: {
          resultsCount: 0,
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/No results found - partial case saved/i)).toBeInTheDocument();
      });
    });

    it('should NOT trigger confetti on zero results', async () => {
      const confetti = await import('canvas-confetti');
      
      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const completeHandler = broadcastHandlers.get('scan_complete');
      
      completeHandler?.({
        payload: {
          resultsCount: 0,
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/No results found/i)).toBeInTheDocument();
      });

      // Confetti should not be called
      expect(confetti.default).not.toHaveBeenCalled();
    });
  });

  describe('Success Scenarios', () => {
    it('should show success message with result count', async () => {
      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const completeHandler = broadcastHandlers.get('scan_complete');
      
      completeHandler?.({
        payload: {
          resultsCount: 42,
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/Found 42 results!/i)).toBeInTheDocument();
      });
    });

    it('should trigger confetti on successful scan with results', async () => {
      const confetti = await import('canvas-confetti');
      
      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const completeHandler = broadcastHandlers.get('scan_complete');
      
      completeHandler?.({
        payload: {
          resultsCount: 15,
        },
      });

      await waitFor(() => {
        expect(confetti.default).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Progress Updates', () => {
    it('should show provider completion count during scan', async () => {
      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const providerUpdateHandler = broadcastHandlers.get('provider_update');

      // Add 3 providers, 2 complete
      providerUpdateHandler?.({ payload: { provider: 'P1', status: 'success' } });
      providerUpdateHandler?.({ payload: { provider: 'P2', status: 'success' } });
      providerUpdateHandler?.({ payload: { provider: 'P3', status: 'loading' } });

      await waitFor(() => {
        expect(screen.getByText(/2\/3 providers complete/i)).toBeInTheDocument();
      });
    });

    it('should update progress bar as providers complete', async () => {
      render(
        <ScanProgressDialog
          open={true}
          onOpenChange={() => {}}
          scanId="test-scan-123"
          onComplete={() => {}}
        />
      );

      const orchestratorHandler = broadcastHandlers.get('progress');

      orchestratorHandler?.({
        payload: {
          completedProviders: 3,
          totalProviders: 5,
        },
      });

      await waitFor(() => {
        // Progress should be 60% (3/5)
        expect(screen.getByText('60%')).toBeInTheDocument();
      });
    });
  });
});
