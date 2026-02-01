import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getStepsForScanType, getTotalStepsForScanType, type ScanStepType } from '@/lib/scan/freeScanSteps';

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

export function useStepProgress(scanId: string | null, scanType: ScanStepType = 'username') {
  const stepsForType = getStepsForScanType(scanType);
  const totalSteps = getTotalStepsForScanType(scanType);

  const [state, setState] = useState<StepProgressState>({
    steps: stepsForType.map(step => ({
      ...step,
      status: 'pending' as const,
    })),
    currentStep: 0,
    totalSteps,
    percentComplete: 0,
    isComplete: false,
    isFailed: false,
    stepTitle: null,
    stepDescription: null,
  });

  const completionHandledRef = useRef(false);

  // Reset state when scan type changes
  useEffect(() => {
    const newSteps = getStepsForScanType(scanType);
    const newTotal = getTotalStepsForScanType(scanType);
    
    setState(prev => ({
      ...prev,
      steps: newSteps.map(step => ({
        ...step,
        status: 'pending' as const,
      })),
      totalSteps: newTotal,
    }));
  }, [scanType]);

  // Update step statuses based on current step number
  const updateStepStatuses = useCallback((currentStep: number, stepTitle?: string, stepDescription?: string) => {
    setState(prev => {
      const currentSteps = getStepsForScanType(scanType);
      const currentTotal = getTotalStepsForScanType(scanType);
      
      const newSteps = currentSteps.map((step, index) => {
        const stepNumber = index + 1;
        let status: 'pending' | 'active' | 'completed' = 'pending';
        
        if (stepNumber < currentStep) {
          status = 'completed';
        } else if (stepNumber === currentStep) {
          status = 'active';
        }
        
        return { ...step, status };
      });

      const percentComplete = Math.round((currentStep / currentTotal) * 100);

      return {
        ...prev,
        steps: newSteps,
        currentStep,
        totalSteps: currentTotal,
        percentComplete: Math.min(percentComplete, 100),
        stepTitle: stepTitle || prev.stepTitle,
        stepDescription: stepDescription || prev.stepDescription,
      };
    });
  }, [scanType]);

  // Handle completion
  const handleCompletion = useCallback((failed: boolean = false) => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;

    const currentTotal = getTotalStepsForScanType(scanType);

    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step => ({ ...step, status: 'completed' as const })),
      currentStep: currentTotal,
      percentComplete: 100,
      isComplete: !failed,
      isFailed: failed,
    }));
  }, [scanType]);

  // Subscribe to realtime updates and poll for progress
  // Also simulate step progress when n8n doesn't send step updates
  useEffect(() => {
    if (!scanId || completionHandledRef.current) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;
    let simulationInterval: NodeJS.Timeout | null = null;
    let hasReceivedRealSteps = false;
    let simulatedStep = 0;
    const simulationStartTime = Date.now();

    // Simulate step progress when n8n doesn't send step updates
    // This keeps the UI responsive during long-running scans
    const simulateProgress = () => {
      if (!isMounted || completionHandledRef.current || hasReceivedRealSteps) return;
      
      const elapsedSeconds = (Date.now() - simulationStartTime) / 1000;
      const currentTotal = getTotalStepsForScanType(scanType);
      
      // Progress through steps over ~3 minutes (180s), but never reach 100%
      // Step timing: 5s, 15s, 35s, 60s, 100s, 150s (cumulative)
      const stepThresholds = [5, 15, 35, 60, 100, 150];
      let newStep = 0;
      for (let i = 0; i < stepThresholds.length && i < currentTotal; i++) {
        if (elapsedSeconds >= stepThresholds[i]) {
          newStep = i + 1;
        }
      }
      
      // Don't simulate past step 5 (leave final step for actual completion)
      if (newStep > 0 && newStep < currentTotal && newStep !== simulatedStep) {
        simulatedStep = newStep;
        updateStepStatuses(newStep);
        console.log(`[useStepProgress] Simulated step: ${newStep} (elapsed: ${Math.round(elapsedSeconds)}s)`);
      }
    };

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

          // Update step progress if we have real step data from backend
          if (data.current_step && data.current_step > 0) {
            hasReceivedRealSteps = true;
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
    
    // Start simulation (runs alongside polling, stops if real steps arrive)
    simulationInterval = setInterval(simulateProgress, 2000);
    // Initial simulation after 5 seconds
    setTimeout(simulateProgress, 5000);

    // Subscribe to realtime broadcast for immediate updates
    const channel = supabase
      .channel(`scan_progress:${scanId}`)
      .on('broadcast', { event: 'step_update' }, (payload: any) => {
        if (!isMounted || completionHandledRef.current) return;
        
        const { step, stepTitle, stepDescription } = payload?.payload || {};
        if (step && step > 0) {
          hasReceivedRealSteps = true;
          updateStepStatuses(step, stepTitle, stepDescription);
        }
      })
      .on('broadcast', { event: 'provider_update' }, (payload: any) => {
        if (!isMounted || completionHandledRef.current) return;
        
        // Handle provider updates from n8n (step data embedded)
        const { step, stepTitle, stepDescription } = payload?.payload || {};
        if (step && step > 0) {
          hasReceivedRealSteps = true;
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
      if (simulationInterval) clearInterval(simulationInterval);
      supabase.removeChannel(channel);
    };
  }, [scanId, scanType, updateStepStatuses, handleCompletion]);

  return state;
}
