import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLowCreditToast } from '@/hooks/useLowCreditToast';

const mockWorkspace = { id: 'workspace-123' };
const mockRpc = vi.fn();
const mockInvoke = vi.fn();

const mockSupabase = {
  rpc: mockRpc,
  functions: {
    invoke: mockInvoke
  }
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

const mockUseWorkspace = vi.fn();
vi.mock('@/hooks/useWorkspace', () => ({
  useWorkspace: () => mockUseWorkspace()
}));

const mockUseSubscription = vi.fn();
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => mockUseSubscription()
}));

const mockToast = {
  error: vi.fn(),
  warning: vi.fn()
};

vi.mock('sonner', () => ({
  toast: mockToast
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useLowCreditToast Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockUseWorkspace.mockReturnValue({ workspace: mockWorkspace });
    mockUseSubscription.mockReturnValue({ isPremium: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows toast when credits are below 50', async () => {
    mockRpc.mockResolvedValue({ data: 30, error: null });

    renderHook(() => useLowCreditToast(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('get_credits_balance', {
        _workspace_id: 'workspace-123'
      });
    });

    await waitFor(() => {
      expect(mockToast.warning).toHaveBeenCalledWith('Low Credits', {
        description: expect.stringContaining('30 credits left'),
        duration: 8000,
        action: expect.objectContaining({
          label: 'Upgrade'
        })
      });
    });
  });

  it('shows error toast when credits are 0', async () => {
    mockRpc.mockResolvedValue({ data: 0, error: null });

    renderHook(() => useLowCreditToast(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Out of Credits!', {
        description: expect.stringContaining('Unlock premium'),
        duration: 10000,
        action: expect.objectContaining({
          label: 'Upgrade Now'
        })
      });
    });
  });

  it('does not show toast when credits are above 50', async () => {
    mockRpc.mockResolvedValue({ data: 100, error: null });

    renderHook(() => useLowCreditToast(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalled();
    });

    expect(mockToast.warning).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('does not show toast for premium users', async () => {
    mockUseSubscription.mockReturnValue({ isPremium: true });
    mockRpc.mockResolvedValue({ data: 10, error: null });

    renderHook(() => useLowCreditToast(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockRpc).not.toHaveBeenCalled();
    });

    expect(mockToast.warning).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('does not show toast when no workspace', async () => {
    mockUseWorkspace.mockReturnValue({ workspace: null });

    renderHook(() => useLowCreditToast(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockRpc).not.toHaveBeenCalled();
    });
  });

  it('respects toast cooldown period', async () => {
    mockRpc.mockResolvedValue({ data: 20, error: null });

    const { rerender } = renderHook(() => useLowCreditToast(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockToast.warning).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 4 minutes (less than 5 minute cooldown)
    vi.advanceTimersByTime(4 * 60 * 1000);
    
    rerender();

    // Should not show another toast yet
    expect(mockToast.warning).toHaveBeenCalledTimes(1);
  });

  it('shows toast again after cooldown expires', async () => {
    mockRpc.mockResolvedValue({ data: 20, error: null });

    renderHook(() => useLowCreditToast(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockToast.warning).toHaveBeenCalledTimes(1);
    });

    // Fast-forward past 5 minute cooldown
    vi.advanceTimersByTime(6 * 60 * 1000);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledTimes(2);
    });
  });

  it('calls Stripe checkout when upgrade action is clicked', async () => {
    mockRpc.mockResolvedValue({ data: 0, error: null });
    mockInvoke.mockResolvedValue({
      data: { url: 'https://checkout.stripe.com/test' },
      error: null
    });

    renderHook(() => useLowCreditToast(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled();
    });

    // Get the action callback
    const toastCall = mockToast.error.mock.calls[0];
    const actionCallback = toastCall[1].action.onClick;

    // Execute the upgrade action
    await actionCallback();

    expect(mockInvoke).toHaveBeenCalledWith('billing-checkout', {
      body: { priceId: 'price_1SQwWCPNdM5SAyj7XS394cD8' }
    });
  });

  it('opens checkout URL in new tab', async () => {
    global.open = vi.fn();
    
    mockRpc.mockResolvedValue({ data: 0, error: null });
    mockInvoke.mockResolvedValue({
      data: { url: 'https://checkout.stripe.com/session123' },
      error: null
    });

    renderHook(() => useLowCreditToast(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled();
    });

    const toastCall = mockToast.error.mock.calls[0];
    const actionCallback = toastCall[1].action.onClick;
    await actionCallback();

    expect(global.open).toHaveBeenCalledWith('https://checkout.stripe.com/session123', '_blank');
  });

  it('handles errors during upgrade action', async () => {
    mockRpc.mockResolvedValue({ data: 0, error: null });
    mockInvoke.mockRejectedValue(new Error('Checkout failed'));

    renderHook(() => useLowCreditToast(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Out of Credits!', expect.any(Object));
    });

    const toastCall = mockToast.error.mock.calls[0];
    const actionCallback = toastCall[1].action.onClick;
    
    await actionCallback();

    // Should show error toast for failed checkout
    expect(mockToast.error).toHaveBeenCalledWith('Could not open checkout');
  });

  it('checks credits periodically', async () => {
    mockRpc.mockResolvedValue({ data: 100, error: null });

    renderHook(() => useLowCreditToast(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 2 minutes
    vi.advanceTimersByTime(2 * 60 * 1000);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledTimes(2);
    });
  });

  it('cleans up interval on unmount', async () => {
    mockRpc.mockResolvedValue({ data: 100, error: null });

    const { unmount } = renderHook(() => useLowCreditToast(), { wrapper: createWrapper() });

    unmount();

    const callCountBefore = mockRpc.mock.calls.length;
    
    // Fast-forward time after unmount
    vi.advanceTimersByTime(10 * 60 * 1000);

    // Should not have made additional calls after unmount
    expect(mockRpc.mock.calls.length).toBe(callCountBefore);
  });
});
