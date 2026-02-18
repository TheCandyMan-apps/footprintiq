// Free Trial has been removed. This stub ensures zero-downtime for all
// existing consumers — all trial states evaluate to false/null.

export interface ProPreviewState {
  isTrialActive: boolean;
  isTrialEligible: boolean;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  trialScansUsed: number;
  trialScansRemaining: number;
  trialStatus: 'active' | 'converted' | 'cancelled' | 'expired' | null;
  timeRemaining: string | null;
  loading: boolean;
}

export interface UseProPreviewReturn extends ProPreviewState {
  startTrialCheckout: () => Promise<void>;
  refreshTrialStatus: () => Promise<void>;
}

export function useProPreview(): UseProPreviewReturn {
  return {
    isTrialActive: false,
    isTrialEligible: false,
    trialStartedAt: null,
    trialEndsAt: null,
    trialScansUsed: 0,
    trialScansRemaining: 0,
    trialStatus: null,
    timeRemaining: null,
    loading: false,
    startTrialCheckout: async () => {},
    refreshTrialStatus: async () => {},
  };
}
