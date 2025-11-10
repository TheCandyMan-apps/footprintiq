import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CatfishDetection } from '@/components/CatfishDetection';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

const mockIsPremium = vi.fn();
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({ isPremium: mockIsPremium() })
}));

const mockSupabase = {
  functions: {
    invoke: vi.fn()
  }
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
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

describe('CatfishDetection - AI Text Jazz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPremium.mockReturnValue(true);
  });

  it('displays analysis with accordion for expand/minimize', async () => {
    const mockAnalysis = {
      analysis: `**Identity Verification**
- Identity Consistency: 85% (Strong cross-platform match)
- Profile Age: 3 years (Established presence)

**Risk Assessment**
- Overall Risk: Low
- Authentication Score: 92% (High confidence)`,
      scores: {
        identityConsistency: 85,
        authenticityScore: 92,
        catfishRisk: 'LOW' as const
      },
      correlationData: {},
      scanData: {
        socialProfilesCount: 5,
        dataSourcesCount: 3,
        identityGraph: null
      }
    };

    mockSupabase.functions.invoke.mockResolvedValue({
      data: mockAnalysis,
      error: null
    });

    render(<CatfishDetection scanId="test-scan-123" />, {
      wrapper: createWrapper()
    });

    const runButton = screen.getByRole('button', { name: /run catfish detection/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText(/Identity Verification/i)).toBeInTheDocument();
    });

    // Check for accordion triggers
    const identitySection = screen.getByText('Identity Verification');
    const riskSection = screen.getByText('Risk Assessment');
    
    expect(identitySection).toBeInTheDocument();
    expect(riskSection).toBeInTheDocument();

    // Test accordion expand/collapse
    fireEvent.click(identitySection);
    await waitFor(() => {
      expect(screen.getByText(/Identity Consistency/i)).toBeVisible();
    });
  });

  it('displays risk level with emoji and bold styling', async () => {
    const mockAnalysis = {
      analysis: '**Overview**\n- Test analysis',
      scores: {
        identityConsistency: 50,
        authenticityScore: 45,
        catfishRisk: 'MEDIUM' as const
      },
      correlationData: {},
      scanData: {
        socialProfilesCount: 2,
        dataSourcesCount: 1,
        identityGraph: null
      }
    };

    mockSupabase.functions.invoke.mockResolvedValue({
      data: mockAnalysis,
      error: null
    });

    render(<CatfishDetection scanId="test-scan-456" />, {
      wrapper: createWrapper()
    });

    const runButton = screen.getByRole('button', { name: /run catfish detection/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      // Check for emoji presence (⚠️ for medium risk)
      expect(screen.getByText(/⚠️/)).toBeInTheDocument();
      
      // Check for bold risk level
      const riskText = screen.getByText('MEDIUM');
      expect(riskText).toHaveClass('text-primary');
    });
  });

  it('highlights percentage scores in bold', async () => {
    const mockAnalysis = {
      analysis: '**Scores**\n- Identity: 75% (Good match)\n- Authenticity: 80% (High confidence)',
      scores: {
        identityConsistency: 75,
        authenticityScore: 80,
        catfishRisk: 'LOW' as const
      },
      correlationData: {},
      scanData: {
        socialProfilesCount: 4,
        dataSourcesCount: 2,
        identityGraph: null
      }
    };

    mockSupabase.functions.invoke.mockResolvedValue({
      data: mockAnalysis,
      error: null
    });

    render(<CatfishDetection scanId="test-scan-789" />, {
      wrapper: createWrapper()
    });

    const runButton = screen.getByRole('button', { name: /run catfish detection/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      const scoresSection = screen.getByText('Scores');
      fireEvent.click(scoresSection);
    });

    await waitFor(() => {
      // Check that percentages are bolded
      const percentages = screen.getAllByText(/\d+%/);
      percentages.forEach(pct => {
        expect(pct).toHaveClass('font-bold');
      });
    });
  });

  it('supports multiple accordion sections open simultaneously', async () => {
    const mockAnalysis = {
      analysis: `**Section One**
- Point 1

**Section Two**
- Point 2

**Section Three**
- Point 3`,
      scores: {
        identityConsistency: 90,
        authenticityScore: 88,
        catfishRisk: 'LOW' as const
      },
      correlationData: {},
      scanData: {
        socialProfilesCount: 6,
        dataSourcesCount: 4,
        identityGraph: null
      }
    };

    mockSupabase.functions.invoke.mockResolvedValue({
      data: mockAnalysis,
      error: null
    });

    render(<CatfishDetection scanId="test-scan-multi" />, {
      wrapper: createWrapper()
    });

    const runButton = screen.getByRole('button', { name: /run catfish detection/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText('Section One')).toBeInTheDocument();
    });

    // Open all sections
    fireEvent.click(screen.getByText('Section One'));
    fireEvent.click(screen.getByText('Section Two'));
    fireEvent.click(screen.getByText('Section Three'));

    await waitFor(() => {
      // All sections should be visible simultaneously
      expect(screen.getByText('Point 1')).toBeVisible();
      expect(screen.getByText('Point 2')).toBeVisible();
      expect(screen.getByText('Point 3')).toBeVisible();
    });
  });
});
