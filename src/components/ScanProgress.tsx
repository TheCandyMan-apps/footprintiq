import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { updateStreakOnScan } from "@/lib/updateStreakOnScan";
import { UnifiedScanProgress } from "@/components/scan/UnifiedScanProgress";
import { StepProgressUI } from "@/components/scan/StepProgressUI";
import { useStepProgress } from "@/hooks/useStepProgress";
import { classifyErrorAsync, isTierBlockError, getUserFriendlyMessage } from "@/lib/supabaseRetry";
import { toast } from "sonner";
import { ActivityLogger } from "@/lib/activityLogger";
import type { ScanFormData } from "./ScanForm";
import type { ScanStepType } from "@/lib/scan/freeScanSteps";
import type { ScanMode, EnhancerKey } from "@/lib/scan/unifiedScanTypes";

interface ScanProgressProps {
  onComplete: (scanId: string) => void;
  scanData: ScanFormData & { scanMode?: ScanMode; enhancers?: EnhancerKey[] };
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

// Blocked error codes from backend
const BLOCKED_CODES = [
  'email_verification_required',
  'free_any_scan_exhausted',
  'scan_blocked_by_tier',
  'no_providers_available_for_tier',
  'tier_restricted',
];

export const ScanProgress = ({ onComplete, scanData, userId, subscriptionTier, isAdmin = false }: ScanProgressProps) => {
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);  // New: tier/verification block
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [triggerFailed, setTriggerFailed] = useState(false);  // New: track if trigger failed
  const navigate = useNavigate();
  
  // Determine if Free tier for step-based UI
  const showStepProgress = isFreeTier(subscriptionTier) && !isAdmin;
  
  // Derive scan type for step progress labels
  const derivedScanType = useMemo((): ScanStepType => {
    if (scanData.email?.trim() && !scanData.username?.trim() && !scanData.phone?.trim()) {
      return 'email';
    }
    if (scanData.phone?.trim() && !scanData.username?.trim() && !scanData.email?.trim()) {
      return 'phone';
    }
    return 'username';
  }, [scanData.email, scanData.phone, scanData.username]);
  
  // Use step progress hook for Free tier with correct scan type
  const stepProgress = useStepProgress(showStepProgress && !triggerFailed ? scanId : null, derivedScanType);
  
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
          scanMode: scanData.scanMode || 'standard',  // Pass scan mode from unified form
          enhancers: scanData.enhancers || [],  // Pass selected enhancers
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

        console.log('[ScanProgress] Invoking n8n-scan-trigger', { 
          scanType, 
          scanId: preScanId, 
          tier: subscriptionTier,
          scanMode: scanData.scanMode,
          enhancers: scanData.enhancers
        });

        try {
          const invokeResult = await withTimeout(
            supabase.functions.invoke('n8n-scan-trigger', { body: requestBody }),
            15000,
            'n8n-scan-trigger'
          );
          
          if (invokeResult?.error) {
            console.error('[ScanProgress] n8n-scan-trigger error:', invokeResult.error);
            
            // Classify the error async to properly read FunctionsHttpError response body
            const classified = await classifyErrorAsync(invokeResult.error);
            const isBlock = isTierBlockError(classified);
            
            if (isBlock) {
              // This is a tier/verification block - show appropriate message
              console.log('[ScanProgress] Scan blocked:', classified.type, classified.blockReason);
              setIsBlocked(true);
              setBlockedMessage(classified.message);
              setTriggerFailed(true);
              
              // Show appropriate toast based on block type
              if (classified.type === 'email_verification_required') {
                toast.error('Email verification required', {
                  description: 'Please verify your email to continue scanning.',
                  action: {
                    label: 'Resend',
                    onClick: async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user?.email) {
                        await supabase.auth.resend({ type: 'signup', email: user.email });
                        toast.success('Verification email sent!');
                      }
                    }
                  },
                  duration: 10000
                });
              } else {
                toast.warning('Upgrade required', {
                  description: classified.message || 'This scan type requires a Pro subscription.',
                  action: {
                    label: 'Upgrade',
                    onClick: () => navigate('/settings')
                  },
                  duration: 8000
                });
              }
              
              // Do NOT log scan.failed for blocks - backend logs scan.blocked
              return;
            }
            
            // Real failure - log it
            setIsFailed(true);
            setTriggerFailed(true);
            
            await ActivityLogger.scanFailed(preScanId, {
              scan_type: scanType,
              error: invokeResult.error?.message || 'Trigger failed',
              error_type: classified.type,
            });
            
            toast.error('Scan failed to start', {
              description: getUserFriendlyMessage(classified),
            });
            return;
          }
          
          // Success - update scanId if different
          const actualScanId = invokeResult?.data?.scanId || preScanId;
          if (actualScanId !== preScanId) {
            setScanId(actualScanId);
          }
          console.log('[ScanProgress] Scan trigger acknowledged:', { actualScanId, status: invokeResult?.data?.status });
          
        } catch (invokeErr) {
          console.warn('[ScanProgress] n8n-scan-trigger did not respond quickly; continuing with polling.', invokeErr);
          // Don't set failed - the scan may still be running
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

  // Poll for completion + realtime subscription (only if trigger didn't fail)
  useEffect(() => {
    if (!scanId || completionHandledRef.current || triggerFailed) return;

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
  }, [scanId, handleCompletion, triggerFailed]);

  // Derive target username for display
  const targetUsername = scanData.username?.trim() || scanData.email?.trim() || 'target';
  
  // Check if step progress indicates completion (for Free tier)
  const stepComplete = stepProgress.isComplete || stepProgress.isFailed;
  const effectiveComplete = isComplete || (showStepProgress && stepProgress.isComplete);
  const effectiveFailed = isFailed || (showStepProgress && stepProgress.isFailed);

  // Handle blocked state - show message and actions
  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl text-center space-y-6">
          <div className="p-6 rounded-lg border border-amber-500/30 bg-amber-500/10">
            <div className="text-amber-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Scan Blocked</h3>
            <p className="text-muted-foreground mb-4">{blockedMessage || 'This scan requires an upgrade.'}</p>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <button
              className="px-4 py-2 rounded-md border border-input hover:bg-accent transition-colors"
              onClick={() => navigate('/scan')}
            >
              Return to scanner
            </button>
            <button
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={() => navigate('/settings')}
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-xl">
        {showStepProgress && scanId && !triggerFailed ? (
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
            isFailed={effectiveFailed || triggerFailed}
            scanType={derivedScanType}
          />
        )}
        
        {(effectiveFailed || triggerFailed) && (
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
