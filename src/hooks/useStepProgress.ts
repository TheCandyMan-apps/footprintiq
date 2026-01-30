import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FREE_SCAN_STEPS, TOTAL_FREE_SCAN_STEPS } from '@/lib/scan/freeScanSteps';

export interface StepStatus {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

export interface StepProgressState {
  steps: StepStatus[];
  currentStep: number;
  totalSteps: number;
  percentComplete: number;
  isComplete: boolean;
  isFailed: boolean;
  stepTitle: string | null;
  stepDescription: string | null;
}

const TERMINAL_STATUSES = [
  'finished',
  'completed',
  'completed_partial',
  'completed_empty',
  'failed',
  'failed_timeout',
  'error',
  'cancelled',
];

export function useStepProgress(scanId: string | null) {
  const [state, setState] = useState<StepProgressState>({
    steps: FREE_SCAN_STEPS.map(step => ({
      ...step,
      status: 'pending' as const,
    })),
    currentStep: 0,
    totalSteps: TOTAL_FREE_SCAN_STEPS,
    percentComplete: 0,
    isComplete: false,
    isFailed: false,
    stepTitle: null,
    stepDescription: null,
  });

  const completionHandledRef = useRef(false);

  // Update step statuses based on current step number
  const updateStepStatuses = useCallback((currentStep: number, stepTitle?: string, stepDescription?: string) => {
    setState(prev => {
      const newSteps = FREE_SCAN_STEPS.map((step, index) => {
        const stepNumber = index + 1;
        let status: 'pending' | 'active' | 'completed' = 'pending';
        
        if (stepNumber < currentStep) {
          status = 'completed';
        } else if (stepNumber === currentStep) {
          status = 'active';
        }
        
        return { ...step, status };
      });

      const percentComplete = Math.round((currentStep / TOTAL_FREE_SCAN_STEPS) * 100);

      return {
        ...prev,
        steps: newSteps,
        currentStep,
        percentComplete: Math.min(percentComplete, 100),
        stepTitle: stepTitle || prev.stepTitle,
        stepDescription: stepDescription || prev.stepDescription,
      };
    });
  }, []);

  // Handle completion
  const handleCompletion = useCallback((failed: boolean = false) => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;

    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step => ({ ...step, status: 'completed' as const })),
      currentStep: TOTAL_FREE_SCAN_STEPS,
      percentComplete: 100,
      isComplete: !failed,
      isFailed: failed,
    }));
  }, []);

  // Subscribe to realtime updates and poll for progress
  useEffect(() => {
    if (!scanId || completionHandledRef.current) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    // Poll scan_progress for step updates
    const pollProgress = async () => {
      if (!isMounted || completionHandledRef.current) return;

      try {
        const { data, error } = await supabase
          .from('scan_progress')
          .select('current_step, total_steps, step_title, step_description, status')
          .eq('scan_id', scanId)
          .maybeSingle();

        if (error) {
          console.warn('[useStepProgress] Poll error:', error);
          return;
        }

        if (data) {
          // Check for terminal status
          if (TERMINAL_STATUSES.includes(data.status)) {
            const isFailed = data.status === 'failed' || data.status === 'error' || data.status === 'failed_timeout';
            handleCompletion(isFailed);
            return;
          }

          // Update step progress if we have step data
          if (data.current_step && data.current_step > 0) {
            updateStepStatuses(data.current_step, data.step_title, data.step_description);
          }
        }
      } catch (err) {
        console.warn('[useStepProgress] Poll exception:', err);
      }
    };

    // Start polling
    pollProgress();
    pollInterval = setInterval(pollProgress, 1000);

    // Subscribe to realtime broadcast for immediate updates
    const channel = supabase
      .channel(`scan_progress:${scanId}`)
      .on('broadcast', { event: 'step_update' }, (payload: any) => {
        if (!isMounted || completionHandledRef.current) return;
        
        const { step, stepTitle, stepDescription } = payload?.payload || {};
        if (step && step > 0) {
          updateStepStatuses(step, stepTitle, stepDescription);
        }
      })
      .on('broadcast', { event: 'provider_update' }, (payload: any) => {
        if (!isMounted || completionHandledRef.current) return;
        
        // Handle provider updates from n8n (step data embedded)
        const { step, stepTitle, stepDescription } = payload?.payload || {};
        if (step && step > 0) {
          updateStepStatuses(step, stepTitle, stepDescription);
        }
      })
      .on('broadcast', { event: 'scan_complete' }, (payload: any) => {
        if (!isMounted || completionHandledRef.current) return;
        
        const status = payload?.payload?.status;
        const isFailed = status === 'failed' || status === 'error';
        handleCompletion(isFailed);
      })
      .on('broadcast', { event: 'scan_failed' }, () => {
        if (!isMounted || completionHandledRef.current) return;
        handleCompletion(true);
      })
      .subscribe();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [scanId, updateStepStatuses, handleCompletion]);

  return state;
}
