import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ScanErrorBoundary } from '@/components/ScanErrorBoundary';
import { PaymentErrorBoundary } from '@/components/billing/PaymentErrorBoundary';
import * as Sentry from '@sentry/react';

// Mock Sentry
vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  init: vi.fn(),
  browserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error from component');
  }
  return <div>Success</div>;
};

describe('Error Boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Global ErrorBoundary', () => {
    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Refresh Page')).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });

    it('should report errors to Sentry', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          contexts: expect.objectContaining({
            react: expect.any(Object),
          }),
          tags: expect.objectContaining({
            errorBoundary: 'global',
          }),
        })
      );
    });

    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('should display custom fallback when provided', () => {
      const CustomFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });
  });

  describe('ScanErrorBoundary', () => {
    it('should catch scan errors and display appropriate message', () => {
      render(
        <ScanErrorBoundary context="scan">
          <ThrowError />
        </ScanErrorBoundary>
      );

      expect(screen.getByText('Scan Error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    it('should report scan errors to Sentry with context', () => {
      render(
        <ScanErrorBoundary context="results">
          <ThrowError />
        </ScanErrorBoundary>
      );

      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.objectContaining({
            errorBoundary: 'scan',
            scanContext: 'results',
          }),
        })
      );
    });

    it('should render children when no error occurs', () => {
      render(
        <ScanErrorBoundary context="scan">
          <ThrowError shouldThrow={false} />
        </ScanErrorBoundary>
      );

      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('should show context-specific error message for results', () => {
      render(
        <ScanErrorBoundary context="results">
          <ThrowError />
        </ScanErrorBoundary>
      );

      expect(screen.getByText(/Error Loading Results/i)).toBeInTheDocument();
    });
  });

  describe('PaymentErrorBoundary', () => {
    it('should catch payment errors and display appropriate message', () => {
      render(
        <PaymentErrorBoundary>
          <ThrowError />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Upgrade Failed')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });

    it('should include support email in fallback', () => {
      render(
        <PaymentErrorBoundary>
          <ThrowError />
        </PaymentErrorBoundary>
      );

      const supportLink = screen.getByText('Contact Support').closest('a');
      expect(supportLink).toHaveAttribute('href', 'mailto:support@footprintiq.app');
    });

    it('should render children when no error occurs', () => {
      render(
        <PaymentErrorBoundary>
          <ThrowError shouldThrow={false} />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle nested error boundaries correctly', () => {
      render(
        <ErrorBoundary>
          <ScanErrorBoundary context="scan">
            <ThrowError />
          </ScanErrorBoundary>
        </ErrorBoundary>
      );

      // Should catch in the inner boundary first
      expect(screen.getByText('Scan Error')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should track retry attempts', () => {
      const { rerender } = render(
        <ScanErrorBoundary context="scan">
          <ThrowError />
        </ScanErrorBoundary>
      );

      expect(screen.getByText('Scan Error')).toBeInTheDocument();

      // Simulate retry by rerendering
      rerender(
        <ScanErrorBoundary context="scan">
          <ThrowError shouldThrow={false} />
        </ScanErrorBoundary>
      );

      // After retry, should show success
      expect(screen.queryByText('Scan Error')).not.toBeInTheDocument();
    });
  });

  describe('Sentry Integration', () => {
    it('should capture exception with proper error context', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const captureCall = (Sentry.captureException as any).mock.calls[0];
      expect(captureCall[0]).toBeInstanceOf(Error);
      expect(captureCall[1]).toHaveProperty('contexts');
      expect(captureCall[1]).toHaveProperty('tags');
    });

    it('should include component stack in error context', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const captureCall = (Sentry.captureException as any).mock.calls[0];
      expect(captureCall[1].contexts.react).toBeDefined();
    });
  });
});

describe('Mock Error Scenarios', () => {
  it('should handle timeout errors in scan flow', () => {
    const TimeoutError = () => {
      throw new Error('Request timed out after 30s');
    };

    render(
      <ScanErrorBoundary context="scan">
        <TimeoutError />
      </ScanErrorBoundary>
    );

    expect(screen.getByText('Scan Error')).toBeInTheDocument();
  });

  it('should handle rate limit errors', () => {
    const RateLimitError = () => {
      throw new Error('Rate limit exceeded - 429');
    };

    render(
      <ScanErrorBoundary context="scan">
        <RateLimitError />
      </ScanErrorBoundary>
    );

    expect(screen.getByText('Scan Error')).toBeInTheDocument();
  });

  it('should handle network errors', () => {
    const NetworkError = () => {
      throw new Error('Network error: Failed to fetch');
    };

    render(
      <ScanErrorBoundary context="scan">
        <NetworkError />
      </ScanErrorBoundary>
    );

    expect(screen.getByText('Scan Error')).toBeInTheDocument();
  });

  it('should handle authentication errors', () => {
    const AuthError = () => {
      throw new Error('Unauthorized access - 401');
    };

    render(
      <ScanErrorBoundary context="scan">
        <AuthError />
      </ScanErrorBoundary>
    );

    expect(screen.getByText('Scan Error')).toBeInTheDocument();
  });
});
