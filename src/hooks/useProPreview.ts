import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useToast } from '@/hooks/use-toast';

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

const TRIAL_MAX_SCANS = 3;

export function useProPreview(): UseProPreviewReturn {
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { isVerified } = useEmailVerification();
  const { toast } = useToast();
  
  const [trialState, setTrialState] = useState<ProPreviewState>({
    isTrialActive: false,
    isTrialEligible: false,
    trialStartedAt: null,
    trialEndsAt: null,
    trialScansUsed: 0,
    trialScansRemaining: TRIAL_MAX_SCANS,
    trialStatus: null,
    timeRemaining: null,
    loading: true,
  });

  const calculateTimeRemaining = useCallback((endsAt: Date): string => {
    const now = new Date();
    const diff = endsAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''} remaining`;
    }
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    
    return `${minutes}m remaining`;
  }, []);

  const refreshTrialStatus = useCallback(async () => {
    if (!workspace?.id) {
      setTrialState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('trial_started_at, trial_ends_at, trial_scans_used, trial_status, subscription_tier, plan')
        .eq('id', workspace.id)
        .single();

      if (error) {
        console.error('[useProPreview] Error fetching trial status:', error);
        setTrialState(prev => ({ ...prev, loading: false }));
        return;
      }

      const now = new Date();
      const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
      const trialStartedAt = data.trial_started_at ? new Date(data.trial_started_at) : null;
      const isActive = data.trial_status === 'active' && trialEndsAt && trialEndsAt > now;
      const scansUsed = data.trial_scans_used || 0;
      
      // Check eligibility: verified email, no active trial, no prior trial, no Pro subscription
      const hasPriorTrial = ['active', 'converted', 'cancelled', 'expired'].includes(data.trial_status || '');
      const hasProSubscription = data.subscription_tier === 'premium' || 
                                  data.subscription_tier === 'enterprise' ||
                                  data.plan === 'pro' || 
                                  data.plan === 'business';
      
      const isEligible = isVerified && !hasPriorTrial && !hasProSubscription;

      setTrialState({
        isTrialActive: isActive,
        isTrialEligible: isEligible,
        trialStartedAt,
        trialEndsAt,
        trialScansUsed: scansUsed,
        trialScansRemaining: Math.max(0, TRIAL_MAX_SCANS - scansUsed),
        trialStatus: data.trial_status as ProPreviewState['trialStatus'],
        timeRemaining: isActive && trialEndsAt ? calculateTimeRemaining(trialEndsAt) : null,
        loading: false,
      });
    } catch (err) {
      console.error('[useProPreview] Unexpected error:', err);
      setTrialState(prev => ({ ...prev, loading: false }));
    }
  }, [workspace?.id, isVerified, calculateTimeRemaining]);

  // Initial load and refresh on workspace change
  useEffect(() => {
    if (!workspaceLoading) {
      refreshTrialStatus();
    }
  }, [workspaceLoading, refreshTrialStatus]);

  // Update time remaining every minute when trial is active
  useEffect(() => {
    if (!trialState.isTrialActive || !trialState.trialEndsAt) return;

    const interval = setInterval(() => {
      const timeRemaining = calculateTimeRemaining(trialState.trialEndsAt!);
      setTrialState(prev => ({ ...prev, timeRemaining }));
      
      // Check if trial has expired
      if (timeRemaining === 'Expired') {
        refreshTrialStatus();
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trialState.isTrialActive, trialState.trialEndsAt, calculateTimeRemaining, refreshTrialStatus]);

  const startTrialCheckout = useCallback(async () => {
    if (!workspace?.id) {
      toast({
        title: 'Error',
        description: 'No workspace selected',
        variant: 'destructive',
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to start your Pro Preview.',
        variant: 'destructive',
      });
      window.location.href = '/auth';
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('stripe-trial-checkout', {
        body: { workspaceId: workspace.id },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('[useProPreview] Checkout error:', err);
      
      // Handle specific error codes
      if (err?.message?.includes('EMAIL_NOT_VERIFIED')) {
        toast({
          title: 'Email verification required',
          description: 'Please verify your email before starting a Pro Preview.',
          variant: 'destructive',
        });
      } else if (err?.message?.includes('TRIAL_ALREADY_ACTIVE')) {
        toast({
          title: 'Trial already active',
          description: 'You already have an active Pro Preview.',
          variant: 'destructive',
        });
      } else if (err?.message?.includes('TRIAL_ALREADY_USED')) {
        toast({
          title: 'Trial already used',
          description: 'You have already used your Pro Preview. Please upgrade to continue.',
          variant: 'destructive',
        });
      } else if (err?.message?.includes('ALREADY_PRO')) {
        toast({
          title: 'Already subscribed',
          description: 'You already have a Pro subscription.',
        });
      } else {
        toast({
          title: 'Checkout error',
          description: err?.message || 'Failed to start Pro Preview checkout',
          variant: 'destructive',
        });
      }
    }
  }, [workspace?.id, toast]);

  return {
    ...trialState,
    startTrialCheckout,
    refreshTrialStatus,
  };
}
