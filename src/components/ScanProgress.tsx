import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { updateStreakOnScan } from "@/lib/updateStreakOnScan";
import { UnifiedScanProgress } from "@/components/scan/UnifiedScanProgress";
import { StepProgressUI } from "@/components/scan/StepProgressUI";
import { useStepProgress } from "@/hooks/useStepProgress";
import type { ScanFormData } from "./ScanForm";

interface ScanProgressProps {
  onComplete: (scanId: string) => void;
  scanData: ScanFormData;
  userId: string;
  subscriptionTier: string;
  isAdmin?: boolean;
}

// Determine if user is on Free tier (for step-based UI)
const isFreeTier = (tier: string): boolean => {
  return tier === 'free' || tier === '' || !tier;
};

// Terminal statuses that indicate scan completion
const TERMINAL_STATUSES = [
  'finished',
  'error',
  'cancelled',
  'partial',
  'completed',
  'completed_partial',
  'completed_empty',
  'failed',
  'failed_timeout',
  'not_configured',
];

export const ScanProgress = ({ onComplete, scanData, userId, subscriptionTier, isAdmin = false }: ScanProgressProps) => {
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Determine if Free tier for step-based UI
  const showStepProgress = isFreeTier(subscriptionTier) && !isAdmin;
  
  // Use step progress hook for Free tier
  const stepProgress = useStepProgress(showStepProgress ? scanId : null);
  
  // Guards
  const scanStartedRef = useRef(false);
  const completionHandledRef = useRef(false);

  // Utility to prevent indefinite hanging
  const withTimeout = async <T,>(promise: Promise<T>, ms: number, label = 'operation'): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const id = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
      promise
        .then((val) => { clearTimeout(id); resolve(val); })
        .catch((err) => { clearTimeout(id); reject(err); });
    });
  };

  // Handle scan completion
  const handleCompletion = useCallback((completedScanId: string, failed: boolean = false) => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;
    
    console.log('[ScanProgress] ✅ Scan completed:', completedScanId, failed ? '(FAILED)' : '');
    
    if (failed) {
      setIsFailed(true);
    } else {
      setIsComplete(true);
      
      // Update streak (non-blocking)
      updateStreakOnScan(userId).catch(err => 
        console.warn('[ScanProgress] updateStreakOnScan failed:', err)
      );
      
      setTimeout(() => {
        onComplete(completedScanId);
        try { navigate(`/results/${completedScanId}`); } catch {}
      }, 500);
    }
  }, [userId, onComplete, navigate]);

  // Start the scan
  useEffect(() => {
    if (scanStartedRef.current) {
      console.log('[ScanProgress] Scan already started, skipping duplicate invocation');
      return;
    }
    scanStartedRef.current = true;
    
    let isMounted = true;
    
    const performScan = async () => {
      try {
        if (!isMounted) return;

        // Fetch user's workspace
        let workspaceId: string | null = null;
        
        const { data: workspaceMember } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (workspaceMember?.workspace_id) {
          workspaceId = workspaceMember.workspace_id;
          console.log('[ScanProgress] Got workspaceId from membership:', workspaceId);
        } else {
          console.warn('[ScanProgress] No workspace membership found, checking owned workspaces...');
          
          const { data: ownedWorkspace } = await supabase
            .from('workspaces')
            .select('id')
            .eq('owner_id', userId)
            .limit(1)
            .maybeSingle();
            
          if (ownedWorkspace?.id) {
            workspaceId = ownedWorkspace.id;
            console.log('[ScanProgress] Got workspaceId from owned workspace:', workspaceId);
          } else {
            const storedId = sessionStorage.getItem('current_workspace_id');
            if (storedId) {
              workspaceId = storedId;
              console.log('[ScanProgress] Got workspaceId from sessionStorage:', workspaceId);
            }
          }
        }
        
        if (!workspaceId) {
          console.error('[ScanProgress] ❌ CRITICAL: No workspaceId found!');
        }

        // Determine scan type
        const hasPhone = !!(scanData.phone && scanData.phone.trim());
        const hasUsername = !!(scanData.username && scanData.username.trim());
        const hasFirstName = !!(scanData.firstName && scanData.firstName.trim());
        const hasLastName = !!(scanData.lastName && scanData.lastName.trim());
        const hasEmail = !!(scanData.email && scanData.email.trim());
        
        let scanType: 'phone' | 'username' | 'personal_details' | 'both' | 'email' | 'domain' = 'both';
        if (hasPhone && !hasUsername && !hasFirstName && !hasLastName && !hasEmail) {
          scanType = 'phone';
        } else if (hasUsername && !hasFirstName && !hasLastName && !hasEmail) {
          scanType = 'username';
        } else if (hasEmail && !hasUsername && !hasFirstName && !hasLastName && !hasPhone) {
          scanType = 'email';
        } else if (hasFirstName || hasLastName || (hasEmail && (hasUsername || hasFirstName || hasLastName))) {
          scanType = 'personal_details';
        }

        const preScanId = crypto.randomUUID();
        setScanId(preScanId);

        const normalizePhone = (phone: string): string => {
          const digits = phone.replace(/\D/g, '');
          if (digits.length === 10) return `+1${digits}`;
          if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
          return digits.startsWith('+') ? digits : `+${digits}`;
        };

        const requestBody: Record<string, any> = {
          scanId: preScanId,
          scanType,
          workspaceId,
          tier: subscriptionTier || 'free',  // Pass tier for routing to correct n8n workflow
        };
        
        if (scanData.username?.trim()) requestBody.username = scanData.username.trim();
        if (scanData.firstName?.trim()) requestBody.firstName = scanData.firstName.trim();
        if (scanData.lastName?.trim()) requestBody.lastName = scanData.lastName.trim();
        if (scanData.email?.trim()) requestBody.email = scanData.email.trim();
        if (scanData.phone?.trim()) {
          requestBody.phone = normalizePhone(scanData.phone.trim());
          if (scanData.phoneProviders?.length) {
            requestBody.phoneProviders = scanData.phoneProviders;
          }
        }
        if (scanData.turnstile_token) {
          requestBody.turnstile_token = scanData.turnstile_token;
        }

        console.log('[ScanProgress] Invoking n8n-scan-trigger', { scanType, scanId: preScanId, tier: subscriptionTier });

        try {
          const invokeResult = await withTimeout(
            supabase.functions.invoke('n8n-scan-trigger', { body: requestBody }),
            15000,
            'n8n-scan-trigger'
          );
          if (invokeResult?.error) {
            console.error('[ScanProgress] n8n-scan-trigger error:', invokeResult.error);
          } else {
            const actualScanId = invokeResult?.data?.scanId || preScanId;
            if (actualScanId !== preScanId) {
              setScanId(actualScanId);
            }
            console.log('[ScanProgress] Scan trigger acknowledged:', { actualScanId, status: invokeResult?.data?.status });
          }
        } catch (invokeErr) {
          console.warn('[ScanProgress] n8n-scan-trigger did not respond quickly; continuing with polling.', invokeErr);
        }

      } catch (error: any) {
        console.error("[ScanProgress] Scan error:", error);
        setIsFailed(true);
      }
    };

    performScan();

    return () => {
      isMounted = false;
    };
  }, [scanData, userId, subscriptionTier, isAdmin]);

  // Poll for completion + realtime subscription
  useEffect(() => {
    if (!scanId || completionHandledRef.current) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    // Polling function
    const checkStatus = async () => {
      if (!isMounted || completionHandledRef.current) return;

      try {
        const { data: scanStatus, error } = await supabase
          .from('scans')
          .select('status')
          .eq('id', scanId)
          .maybeSingle();

        if (error) {
          console.warn('[ScanProgress] Poll error:', error);
          return;
        }

        if (scanStatus && TERMINAL_STATUSES.includes(scanStatus.status)) {
          console.log('[ScanProgress] Poll detected terminal status:', scanStatus.status);
          const isFailed = scanStatus.status === 'failed' || scanStatus.status === 'error' || scanStatus.status === 'failed_timeout';
          handleCompletion(scanId, isFailed);
        }
      } catch (err) {
        console.warn('[ScanProgress] Poll exception:', err);
      }
    };

    // Start polling every 2 seconds
    checkStatus();
    pollInterval = setInterval(checkStatus, 2000);

    // Also subscribe to realtime broadcast for faster detection
    const channel = supabase
      .channel(`scan_progress:${scanId}`)
      .on('broadcast', { event: 'scan_complete' }, (payload: any) => {
        console.log('[ScanProgress] Realtime scan_complete received:', payload);
        if (!completionHandledRef.current) {
          const status = payload?.payload?.status;
          const isFailed = status === 'failed' || status === 'error';
          handleCompletion(scanId, isFailed);
        }
      })
      .on('broadcast', { event: 'scan_failed' }, () => {
        console.log('[ScanProgress] Realtime scan_failed received');
        if (!completionHandledRef.current) {
          handleCompletion(scanId, true);
        }
      })
      .subscribe();

    // Safety timeout: 3 minutes max
    const safetyTimeout = setTimeout(() => {
      if (isMounted && !completionHandledRef.current) {
        console.log('[ScanProgress] Safety timeout reached, navigating to results');
        handleCompletion(scanId, false);
      }
    }, 180000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      clearTimeout(safetyTimeout);
      supabase.removeChannel(channel);
    };
  }, [scanId, handleCompletion]);

  // Derive target username for display
  const targetUsername = scanData.username?.trim() || scanData.email?.trim() || 'target';
  
  // Check if step progress indicates completion (for Free tier)
  const stepComplete = stepProgress.isComplete || stepProgress.isFailed;
  const effectiveComplete = isComplete || (showStepProgress && stepProgress.isComplete);
  const effectiveFailed = isFailed || (showStepProgress && stepProgress.isFailed);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-xl">
        {showStepProgress && scanId ? (
          <StepProgressUI
            scanId={scanId}
            username={targetUsername}
            currentStep={stepProgress.currentStep}
            totalSteps={stepProgress.totalSteps}
            steps={stepProgress.steps}
            percentComplete={stepProgress.percentComplete}
            isComplete={effectiveComplete}
            isFailed={effectiveFailed}
          />
        ) : (
          <UnifiedScanProgress 
            isComplete={effectiveComplete} 
            isFailed={effectiveFailed} 
          />
        )}
        
        {effectiveFailed && (
          <div className="mt-4 text-center">
            <button
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={() => (window.location.href = '/scan')}
            >
              Return to form
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
