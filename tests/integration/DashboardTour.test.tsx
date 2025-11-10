import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id', email: 'test@example.com' }
          }
        }
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      mockResolvedValue: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 })
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue(Promise.resolve())
    })),
    removeChannel: vi.fn()
  }
}));

// Mock the tour functions
vi.mock('@/lib/tour/firstTime', () => ({
  shouldAutoStartTour: vi.fn().mockReturnValue(true),
  getTourAutoStartDelay: vi.fn().mockReturnValue(100),
  markTourTriggered: vi.fn(),
  markOnboardingShown: vi.fn()
}));

// Mock the useTour hook
vi.mock('@/hooks/useTour', () => ({
  useTour: vi.fn().mockReturnValue({
    isActive: true,
    currentStep: {
      id: 'welcome',
      sel: "[data-tour='dashboard-hero']",
      title: 'Welcome to FootprintIQ',
      body: 'FootprintIQ helps you investigate digital footprints across the internet.',
      placement: 'bottom'
    },
    currentStepIndex: 0,
    totalSteps: 5,
    startTour: vi.fn(),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    endTour: vi.fn(),
    resetTour: vi.fn(),
    hasCompletedTour: vi.fn().mockReturnValue(false)
  })
}));

// Mock the subscription hook
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: vi.fn().mockReturnValue({
    isPremium: false,
    user: { id: 'test-user-id' }
  })
}));

// Mock workspace hook
vi.mock('@/hooks/useWorkspace', () => ({
  useWorkspace: vi.fn().mockReturnValue({
    workspace: { id: 'test-workspace' }
  })
}));

// Mock low credit toast hook
vi.mock('@/hooks/useLowCreditToast', () => ({
  useLowCreditToast: vi.fn()
}));

describe('Dashboard First-Time Tour', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should show tour on first login', async () => {
    const { shouldAutoStartTour } = await import('@/lib/tour/firstTime');
    (shouldAutoStartTour as any).mockReturnValue(true);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(shouldAutoStartTour).toHaveBeenCalled();
    });
  });

  it('should display tour highlight with correct step', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome to FootprintIQ')).toBeInTheDocument();
    });
  });

  it('should have tour data attributes on key elements', async () => {
    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(container.querySelector("[data-tour='dashboard-hero']")).toBeInTheDocument();
      expect(container.querySelector("[data-tour='stats-overview']")).toBeInTheDocument();
      expect(container.querySelector("[data-tour='advanced-scan-btn']")).toBeInTheDocument();
    });
  });

  it('should not show tour if already completed', async () => {
    const { shouldAutoStartTour } = await import('@/lib/tour/firstTime');
    (shouldAutoStartTour as any).mockReturnValue(false);

    const { useTour } = await import('@/hooks/useTour');
    (useTour as any).mockReturnValue({
      isActive: false,
      currentStep: null,
      currentStepIndex: 0,
      totalSteps: 5,
      startTour: vi.fn(),
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      endTour: vi.fn(),
      resetTour: vi.fn(),
      hasCompletedTour: vi.fn().mockReturnValue(true)
    });

    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(container.querySelector('.tour-highlight')).not.toBeInTheDocument();
    });
  });

  it('should mark tour as triggered on first login', async () => {
    const { markTourTriggered, markOnboardingShown } = await import('@/lib/tour/firstTime');

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(markTourTriggered).toHaveBeenCalled();
      expect(markOnboardingShown).toHaveBeenCalled();
    });
  });
});
