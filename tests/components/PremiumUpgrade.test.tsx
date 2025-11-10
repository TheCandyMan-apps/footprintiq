import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PremiumUpgradeCTA } from '@/components/upsell/PremiumUpgradeCTA';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock supabase
const mockInvoke = vi.fn();
const mockSupabase = {
  functions: {
    invoke: mockInvoke
  }
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('PremiumUpgradeCTA Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.open = vi.fn();
  });

  describe('Card Variant', () => {
    it('renders premium upgrade card with Pro plan badge', () => {
      render(<PremiumUpgradeCTA variant="card" />, { wrapper: createWrapper() });

      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('Upgrade to Pro for unlimited scans')).toBeInTheDocument();
      expect(screen.getByText('$15/month')).toBeInTheDocument();
    });

    it('displays key features of Pro plan', () => {
      render(<PremiumUpgradeCTA variant="card" />, { wrapper: createWrapper() });

      expect(screen.getByText('Unlimited Scans')).toBeInTheDocument();
      expect(screen.getByText('Advanced Tools')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Analysis')).toBeInTheDocument();
    });

    it('shows security notice about cancellation', () => {
      render(<PremiumUpgradeCTA variant="card" />, { wrapper: createWrapper() });

      expect(screen.getByText(/Cancel anytime/)).toBeInTheDocument();
      expect(screen.getByText(/Secure payment via Stripe/)).toBeInTheDocument();
    });

    it('calls Stripe checkout when upgrade button is clicked', async () => {
      mockInvoke.mockResolvedValue({
        data: { url: 'https://checkout.stripe.com/test' },
        error: null
      });

      render(<PremiumUpgradeCTA variant="card" />, { wrapper: createWrapper() });

      const upgradeButton = screen.getByRole('button', { name: /Upgrade to Pro Now/i });
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('billing-checkout', {
          body: { priceId: 'price_1SQwWCPNdM5SAyj7XS394cD8' }
        });
      });
    });

    it('opens Stripe checkout in new window', async () => {
      const mockCheckoutUrl = 'https://checkout.stripe.com/session123';
      mockInvoke.mockResolvedValue({
        data: { url: mockCheckoutUrl },
        error: null
      });

      render(<PremiumUpgradeCTA variant="card" />, { wrapper: createWrapper() });

      const upgradeButton = screen.getByRole('button', { name: /Upgrade to Pro Now/i });
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(global.open).toHaveBeenCalledWith(mockCheckoutUrl, '_blank');
      });
    });

    it('handles checkout errors gracefully', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: new Error('Checkout failed')
      });

      const { toast } = await import('sonner');
      
      render(<PremiumUpgradeCTA variant="card" />, { wrapper: createWrapper() });

      const upgradeButton = screen.getByRole('button', { name: /Upgrade to Pro Now/i });
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Could not open checkout. Please try again.');
      });
    });

    it('disables button during loading', async () => {
      mockInvoke.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<PremiumUpgradeCTA variant="card" />, { wrapper: createWrapper() });

      const upgradeButton = screen.getByRole('button', { name: /Upgrade to Pro Now/i });
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(upgradeButton).toBeDisabled();
        expect(screen.getByText('Opening Checkout...')).toBeInTheDocument();
      });
    });
  });

  describe('Banner Variant', () => {
    it('renders compact banner with upgrade CTA', () => {
      render(<PremiumUpgradeCTA variant="banner" />, { wrapper: createWrapper() });

      expect(screen.getByText('Upgrade to Pro for unlimited scans')).toBeInTheDocument();
      expect(screen.getByText(/\$15\/mo/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Upgrade Now/i })).toBeInTheDocument();
    });

    it('shows custom message in banner', () => {
      render(
        <PremiumUpgradeCTA 
          variant="banner" 
          message="Unlock Advanced Features" 
          feature="dark web scanning"
        />, 
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Unlock Advanced Features')).toBeInTheDocument();
      expect(screen.getByText(/dark web scanning/i)).toBeInTheDocument();
    });

    it('triggers checkout from banner button', async () => {
      mockInvoke.mockResolvedValue({
        data: { url: 'https://checkout.stripe.com/test' },
        error: null
      });

      render(<PremiumUpgradeCTA variant="banner" />, { wrapper: createWrapper() });

      const upgradeButton = screen.getByRole('button', { name: /Upgrade Now/i });
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalled();
      });
    });
  });

  describe('Inline Variant', () => {
    it('renders compact inline upgrade prompt', () => {
      render(<PremiumUpgradeCTA variant="inline" />, { wrapper: createWrapper() });

      expect(screen.getByText(/Upgrade to Pro for unlimited scans/)).toBeInTheDocument();
      expect(screen.getByText(/\$15\/mo/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Upgrade/i })).toBeInTheDocument();
    });

    it('shows custom inline message', () => {
      render(
        <PremiumUpgradeCTA 
          variant="inline" 
          message="Get premium access"
        />, 
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Get premium access/)).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('accepts custom message prop', () => {
      render(
        <PremiumUpgradeCTA 
          variant="card" 
          message="Unlock Pro Features Today"
        />, 
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Unlock Pro Features Today')).toBeInTheDocument();
    });

    it('accepts custom feature prop', () => {
      render(
        <PremiumUpgradeCTA 
          variant="card" 
          feature="AI-powered insights"
        />, 
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/AI-powered insights/)).toBeInTheDocument();
    });
  });

  describe('Free Tier Integration', () => {
    it('displays when user is on free tier', () => {
      render(<PremiumUpgradeCTA variant="banner" />, { wrapper: createWrapper() });

      // Component should be visible
      expect(screen.getByText(/Upgrade to Pro/i)).toBeInTheDocument();
    });

    it('includes pricing information', () => {
      render(<PremiumUpgradeCTA variant="card" />, { wrapper: createWrapper() });

      // Should show $15/month pricing
      expect(screen.getByText('$15/month')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing checkout URL', async () => {
      mockInvoke.mockResolvedValue({
        data: { url: null },
        error: null
      });

      const { toast } = await import('sonner');
      
      render(<PremiumUpgradeCTA variant="card" />, { wrapper: createWrapper() });

      const upgradeButton = screen.getByRole('button', { name: /Upgrade to Pro Now/i });
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('handles network errors', async () => {
      mockInvoke.mockRejectedValue(new Error('Network error'));

      const { toast } = await import('sonner');
      
      render(<PremiumUpgradeCTA variant="card" />, { wrapper: createWrapper() });

      const upgradeButton = screen.getByRole('button', { name: /Upgrade to Pro Now/i });
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Could not open checkout. Please try again.');
      });
    });
  });
});
