import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import AdvancedScan from '@/pages/AdvancedScan';
import { UsernameScanForm } from '@/components/scan/UsernameScanForm';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Supabase client
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
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ data: { id: 'test-scan-id' }, error: null })
    }))
  }
}));

// Mock hooks
vi.mock('@/hooks/useWorkspace', () => ({
  useWorkspace: vi.fn().mockReturnValue({
    workspace: { id: 'test-workspace', credits: 100 },
    loading: false,
    refreshWorkspace: vi.fn()
  })
}));

vi.mock('@/hooks/useUserPersona', () => ({
  useUserPersona: vi.fn().mockReturnValue({
    persona: 'investigator',
    isStandard: true
  })
}));

vi.mock('@/hooks/useAnonMode', () => ({
  useAnonMode: vi.fn().mockReturnValue({
    anonModeEnabled: false,
    toggleAnonMode: vi.fn(),
    isLoading: false
  })
}));

vi.mock('@/hooks/useTierGating', () => ({
  useTierGating: vi.fn().mockReturnValue({
    isFree: false,
    checkFeatureAccess: vi.fn().mockReturnValue({ allowed: true })
  })
}));

vi.mock('@/hooks/useWorkerStatus', () => ({
  useWorkerStatus: vi.fn().mockReturnValue({
    isWorkerOffline: vi.fn().mockReturnValue(false),
    getWorkerByName: vi.fn().mockReturnValue({ status: 'online' })
  })
}));

vi.mock('@/hooks/useGeocoding', () => ({
  useGeocoding: vi.fn().mockReturnValue({
    geocode: vi.fn(),
    isLoading: false,
    progress: 0
  })
}));

vi.mock('@/contexts/ActiveScanContext', () => ({
  useActiveScanContext: vi.fn().mockReturnValue({
    startTracking: vi.fn()
  })
}));

vi.mock('@/hooks/useScanTemplates', () => ({
  useScanTemplates: vi.fn().mockReturnValue({
    saveTemplate: vi.fn()
  })
}));

vi.mock('@/hooks/useLowCreditToast', () => ({
  useLowCreditToast: vi.fn()
}));

vi.mock('@/hooks/useMaigretEntitlement', () => ({
  useMaigretEntitlement: vi.fn().mockReturnValue({
    entitlement: { plan: 'pro', active: true },
    isPremium: true,
    loading: false
  })
}));

vi.mock('@/hooks/useUsernameScan', () => ({
  useUsernameScan: vi.fn().mockReturnValue({
    isScanning: false,
    debugLogs: [],
    debugMode: false,
    setDebugMode: vi.fn(),
    startScan: vi.fn().mockResolvedValue({ jobId: 'test-job-id' }),
    clearLogs: vi.fn()
  })
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn()
  }
}));

describe('Maigret Username Scan Redirection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to /scan/usernames when username scan type is selected and scan is clicked', async () => {
    const { container } = render(
      <BrowserRouter>
        <AdvancedScan />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(container.querySelector('select')).toBeInTheDocument();
    });

    // Select username scan type
    const scanTypeSelect = container.querySelector('select') as HTMLSelectElement;
    fireEvent.change(scanTypeSelect, { target: { value: 'username' } });

    // Enter a username in the target input
    const targetInput = screen.getByPlaceholderText(/enter.*target/i);
    fireEvent.change(targetInput, { target: { value: 'testuser123' } });

    // Click scan button
    const scanButton = screen.getByRole('button', { name: /scan/i });
    fireEvent.click(scanButton);

    // Verify navigation was called with correct params
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/scan/usernames', {
        state: {
          username: 'testuser123',
          fromAdvanced: true
        }
      });
    });
  });

  it('should auto-trigger scan when redirected from advanced scan', async () => {
    const mockStartScan = vi.fn().mockResolvedValue({ jobId: 'test-job-id' });
    const { useUsernameScan } = await import('@/hooks/useUsernameScan');
    (useUsernameScan as any).mockReturnValue({
      isScanning: false,
      debugLogs: [],
      debugMode: false,
      setDebugMode: vi.fn(),
      startScan: mockStartScan,
      clearLogs: vi.fn()
    });

    const locationState = {
      username: 'autouser456',
      fromAdvanced: true
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/scan/usernames', state: locationState }]}>
        <UsernameScanForm />
      </MemoryRouter>
    );

    // Wait for auto-trigger to happen
    await waitFor(() => {
      expect(mockStartScan).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'autouser456'
        })
      );
    }, { timeout: 1000 });
  });

  it('should open progress dialog after auto-trigger', async () => {
    const mockStartScan = vi.fn().mockResolvedValue({ jobId: 'test-job-id' });
    const { useUsernameScan } = await import('@/hooks/useUsernameScan');
    (useUsernameScan as any).mockReturnValue({
      isScanning: false,
      debugLogs: [],
      debugMode: false,
      setDebugMode: vi.fn(),
      startScan: mockStartScan,
      clearLogs: vi.fn()
    });

    const locationState = {
      username: 'progressuser789',
      fromAdvanced: true
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/scan/usernames', state: locationState }]}>
        <UsernameScanForm />
      </MemoryRouter>
    );

    // Wait for scan to start and progress dialog to appear
    await waitFor(() => {
      expect(screen.getByText(/scan progress/i)).toBeInTheDocument();
    }, { timeout: 1500 });
  });

  it('should not auto-trigger if not coming from advanced scan', async () => {
    const mockStartScan = vi.fn().mockResolvedValue({ jobId: 'test-job-id' });
    const { useUsernameScan } = await import('@/hooks/useUsernameScan');
    (useUsernameScan as any).mockReturnValue({
      isScanning: false,
      debugLogs: [],
      debugMode: false,
      setDebugMode: vi.fn(),
      startScan: mockStartScan,
      clearLogs: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/scan/usernames']}>
        <UsernameScanForm />
      </MemoryRouter>
    );

    // Wait a bit to ensure no auto-trigger happens
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(mockStartScan).not.toHaveBeenCalled();
  });

  it('should show worker offline error when Maigret is down', async () => {
    const { useWorkerStatus } = await import('@/hooks/useWorkerStatus');
    (useWorkerStatus as any).mockReturnValue({
      isWorkerOffline: vi.fn().mockReturnValue(true),
      getWorkerByName: vi.fn().mockReturnValue({ 
        status: 'offline',
        error_message: 'Service temporarily unavailable'
      })
    });

    const { toast } = await import('sonner');

    render(
      <BrowserRouter>
        <AdvancedScan />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/advanced osint scan/i)).toBeInTheDocument();
    });

    // Select username scan type
    const scanTypeSelect = screen.getByRole('combobox');
    fireEvent.click(scanTypeSelect);
    
    const usernameOption = screen.getByText(/username.*maigret/i);
    fireEvent.click(usernameOption);

    // Enter username
    const targetInput = screen.getByPlaceholderText(/enter.*target/i);
    fireEvent.change(targetInput, { target: { value: 'testuser' } });

    // Try to scan
    const scanButton = screen.getByRole('button', { name: /scan/i });
    fireEvent.click(scanButton);

    // Should show error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Maigret worker is offline',
        expect.any(Object)
      );
    });

    // Should NOT navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
