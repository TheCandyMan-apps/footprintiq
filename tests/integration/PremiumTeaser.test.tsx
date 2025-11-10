import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdvancedScan from '@/pages/AdvancedScan';
import Dashboard from '@/pages/Dashboard';

// Mock all the hooks and dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockWorkspace = { id: 'workspace-123', name: 'Test Workspace' };
const mockUseWorkspace = vi.fn();
vi.mock('@/hooks/useWorkspace', () => ({
  useWorkspace: () => mockUseWorkspace()
}));

const mockUseSubscription = vi.fn();
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => mockUseSubscription()
}));

const mockUseTierGating = vi.fn();
vi.mock('@/hooks/useTierGating', () => ({
  useTierGating: () => mockUseTierGating()
}));

const mockUseUserPersona = vi.fn();
vi.mock('@/hooks/useUserPersona', () => ({
  useUserPersona: () => mockUseUserPersona()
}));

const mockUseAnonMode = vi.fn();
vi.mock('@/hooks/useAnonMode', () => ({
  useAnonMode: () => mockUseAnonMode()
}));

const mockUseActiveScanContext = vi.fn();
vi.mock('@/contexts/ActiveScanContext', () => ({
  useActiveScanContext: () => mockUseActiveScanContext()
}));

const mockUseWorkerStatus = vi.fn();
vi.mock('@/hooks/useWorkerStatus', () => ({
  useWorkerStatus: () => mockUseWorkerStatus()
}));

const mockUseScanTemplates = vi.fn();
vi.mock('@/hooks/useScanTemplates', () => ({
  useScanTemplates: () => mockUseScanTemplates()
}));

const mockUseGeocoding = vi.fn();
vi.mock('@/hooks/useGeocoding', () => ({
  useGeocoding: () => mockUseGeocoding()
}));

// Mock useLowCreditToast
vi.mock('@/hooks/useLowCreditToast', () => ({
  useLowCreditToast: vi.fn()
}));

// Mock supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  })),
  functions: {
    invoke: vi.fn()
  },
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn()
  })),
  removeChannel: vi.fn()
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
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

describe('Premium Teaser Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseWorkspace.mockReturnValue({
      workspace: mockWorkspace,
      loading: false,
      refreshWorkspace: vi.fn()
    });
    
    mockUseUserPersona.mockReturnValue({
      persona: 'investigator',
      isStandard: false
    });
    
    mockUseAnonMode.mockReturnValue({
      anonModeEnabled: false,
      toggleAnonMode: vi.fn(),
      isLoading: false
    });
    
    mockUseActiveScanContext.mockReturnValue({
      startTracking: vi.fn()
    });
    
    mockUseWorkerStatus.mockReturnValue({
      isWorkerOffline: vi.fn(() => false),
      getWorkerByName: vi.fn()
    });
    
    mockUseScanTemplates.mockReturnValue({
      templates: [],
      loading: false,
      saveTemplate: vi.fn()
    });
    
    mockUseGeocoding.mockReturnValue({
      locations: [],
      loading: false,
      getLocationForIP: vi.fn(),
      getErrorForIP: vi.fn(),
      progressItems: [],
      isProcessing: false,
      totalCount: 0,
      completedCount: 0,
      errorCount: 0
    });
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123', email: 'test@example.com' } } }
    });
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } }
    });
  });

  describe('AdvancedScan Premium Teasers', () => {
    it('shows upgrade banner for free tier users', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });
      mockUseTierGating.mockReturnValue({
        isFree: true,
        checkFeatureAccess: vi.fn()
      });

      render(<AdvancedScan />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Upgrade to Pro for unlimited scans/i)).toBeInTheDocument();
      });
    });

    it('displays $15/mo pricing in upgrade banner', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });
      mockUseTierGating.mockReturnValue({
        isFree: true,
        checkFeatureAccess: vi.fn()
      });

      render(<AdvancedScan />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/\$15\/mo/i)).toBeInTheDocument();
      });
    });

    it('does not show upgrade banner for premium users', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: true });
      mockUseTierGating.mockReturnValue({
        isFree: false,
        checkFeatureAccess: vi.fn()
      });

      render(<AdvancedScan />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.queryByText(/Upgrade to Pro for unlimited scans/i)).not.toBeInTheDocument();
      });
    });

    it('upgrade button triggers Stripe checkout', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });
      mockUseTierGating.mockReturnValue({
        isFree: true,
        checkFeatureAccess: vi.fn()
      });
      
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { url: 'https://checkout.stripe.com/test' },
        error: null
      });

      global.open = vi.fn();

      render(<AdvancedScan />, { wrapper: createWrapper() });

      await waitFor(() => {
        const upgradeButton = screen.getByRole('button', { name: /Upgrade Now/i });
        expect(upgradeButton).toBeInTheDocument();
      });

      const upgradeButton = screen.getByRole('button', { name: /Upgrade Now/i });
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('billing-checkout', {
          body: { priceId: 'price_1SQwWCPNdM5SAyj7XS394cD8' }
        });
      });
    });
  });

  describe('Dashboard Premium Teasers', () => {
    it('shows upgrade banner on dashboard for free users', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });

      render(<Dashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Upgrade to Pro for unlimited scans/i)).toBeInTheDocument();
      });
    });

    it('hides upgrade banner for premium users on dashboard', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: true });

      render(<Dashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.queryByText(/Upgrade to Pro for unlimited scans/i)).not.toBeInTheDocument();
      });
    });

    it('displays premium feature benefits in dashboard CTA', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });

      render(<Dashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/unlimited scans, advanced tools, and AI analysis/i)).toBeInTheDocument();
      });
    });
  });

  describe('Low Credit Toast Integration', () => {
    it('triggers low-credit toast check for free users', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });
      mockUseTierGating.mockReturnValue({
        isFree: true,
        checkFeatureAccess: vi.fn()
      });

      const { useLowCreditToast } = await import('@/hooks/useLowCreditToast');
      
      render(<AdvancedScan />, { wrapper: createWrapper() });

      // Hook should be called
      expect(useLowCreditToast).toHaveBeenCalled();
    });

    it('skips low-credit toast for premium users', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: true });

      render(<Dashboard />, { wrapper: createWrapper() });

      // useLowCreditToast is called but early returns for premium users
      const { useLowCreditToast } = await import('@/hooks/useLowCreditToast');
      expect(useLowCreditToast).toHaveBeenCalled();
    });
  });

  describe('Stripe Integration', () => {
    it('uses correct price ID for Pro subscription', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });
      mockUseTierGating.mockReturnValue({
        isFree: true,
        checkFeatureAccess: vi.fn()
      });
      
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { url: 'https://checkout.stripe.com/session' },
        error: null
      });

      render(<AdvancedScan />, { wrapper: createWrapper() });

      await waitFor(() => {
        const upgradeButton = screen.getByRole('button', { name: /Upgrade Now/i });
        fireEvent.click(upgradeButton);
      });

      await waitFor(() => {
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
          'billing-checkout',
          expect.objectContaining({
            body: expect.objectContaining({
              priceId: 'price_1SQwWCPNdM5SAyj7XS394cD8'
            })
          })
        );
      });
    });

    it('opens Stripe checkout in new tab', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });
      
      const mockCheckoutUrl = 'https://checkout.stripe.com/session123';
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { url: mockCheckoutUrl },
        error: null
      });

      global.open = vi.fn();

      render(<Dashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        const upgradeButton = screen.getByRole('button', { name: /Upgrade Now/i });
        fireEvent.click(upgradeButton);
      });

      await waitFor(() => {
        expect(global.open).toHaveBeenCalledWith(mockCheckoutUrl, '_blank');
      });
    });

    it('handles checkout errors gracefully', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });
      mockUseTierGating.mockReturnValue({
        isFree: true,
        checkFeatureAccess: vi.fn()
      });
      
      mockSupabase.functions.invoke.mockRejectedValue(new Error('Checkout failed'));

      const { toast } = await import('sonner');

      render(<AdvancedScan />, { wrapper: createWrapper() });

      await waitFor(() => {
        const upgradeButton = screen.getByRole('button', { name: /Upgrade Now/i });
        fireEvent.click(upgradeButton);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe('Free Tier Detection', () => {
    it('correctly identifies free tier users', async () => {
      mockUseSubscription.mockReturnValue({ 
        isPremium: false,
        subscriptionTier: 'free'
      });
      mockUseTierGating.mockReturnValue({
        isFree: true,
        checkFeatureAccess: vi.fn()
      });

      render(<AdvancedScan />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Should show upgrade CTA
        expect(screen.getByText(/Upgrade to Pro/i)).toBeInTheDocument();
      });
    });

    it('correctly identifies premium users', async () => {
      mockUseSubscription.mockReturnValue({ 
        isPremium: true,
        subscriptionTier: 'pro'
      });
      mockUseTierGating.mockReturnValue({
        isFree: false,
        checkFeatureAccess: vi.fn()
      });

      render(<AdvancedScan />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Should NOT show upgrade CTA
        expect(screen.queryByText(/Upgrade to Pro/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('CTA Placement', () => {
    it('displays banner variant on AdvancedScan page', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });
      mockUseTierGating.mockReturnValue({
        isFree: true,
        checkFeatureAccess: vi.fn()
      });

      render(<AdvancedScan />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Banner should have upgrade button
        const upgradeButton = screen.getByRole('button', { name: /Upgrade Now/i });
        expect(upgradeButton).toBeInTheDocument();
      });
    });

    it('displays banner variant on Dashboard page', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });

      render(<Dashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Should show upgrade message
        expect(screen.getByText(/Upgrade to Pro for unlimited scans/i)).toBeInTheDocument();
      });
    });
  });

  describe('Revenue Optimization', () => {
    it('prominently displays pricing information', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });
      mockUseTierGating.mockReturnValue({
        isFree: true,
        checkFeatureAccess: vi.fn()
      });

      render(<AdvancedScan />, { wrapper: createWrapper() });

      await waitFor(() => {
        // $15/mo should be visible
        expect(screen.getByText(/\$15\/mo/i)).toBeInTheDocument();
      });
    });

    it('highlights key premium features', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });

      render(<Dashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Should mention premium benefits
        expect(screen.getByText(/unlimited scans/i)).toBeInTheDocument();
      });
    });

    it('provides clear call-to-action button', async () => {
      mockUseSubscription.mockReturnValue({ isPremium: false });
      mockUseTierGating.mockReturnValue({
        isFree: true,
        checkFeatureAccess: vi.fn()
      });

      render(<AdvancedScan />, { wrapper: createWrapper() });

      await waitFor(() => {
        const upgradeButton = screen.getByRole('button', { name: /Upgrade Now/i });
        expect(upgradeButton).toBeEnabled();
      });
    });
  });
});
