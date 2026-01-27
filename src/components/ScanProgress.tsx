import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { updateStreakOnScan } from "@/lib/updateStreakOnScan";
import { UnifiedScanProgress } from "@/components/scan/UnifiedScanProgress";
import type { ScanFormData } from "./ScanForm";

interface ScanProgressProps {
  onComplete: (scanId: string) => void;
  scanData: ScanFormData;
  userId: string;
  subscriptionTier: string;
  isAdmin?: boolean;
}

export const ScanProgress = ({ onComplete, scanData, userId, subscriptionTier, isAdmin = false }: ScanProgressProps) => {
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const navigate = useNavigate();

  // Utility to prevent indefinite hanging
  const withTimeout = async <T,>(promise: Promise<T>, ms: number, label = 'operation'): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const id = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
      promise
        .then((val) => { clearTimeout(id); resolve(val); })
        .catch((err) => { clearTimeout(id); reject(err); });
    });
  };

  useEffect(() => {
    let isMounted = true;
    let createdScanId: string | null = null;
    
    const performScan = async () => {
      try {
        if (!isMounted) return;

        // Fetch user's workspace
        const { data: workspaceMember } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', userId)
          .single();

        // Determine scan type based on what data is provided
        const hasPhone = !!(scanData.phone && scanData.phone.trim());
        const hasUsername = !!(scanData.username && scanData.username.trim());
        const hasFirstName = !!(scanData.firstName && scanData.firstName.trim());
        const hasLastName = !!(scanData.lastName && scanData.lastName.trim());
        const hasEmail = !!(scanData.email && scanData.email.trim());
        
        let scanType: 'phone' | 'username' | 'personal_details' | 'both' | 'email' | 'domain' = 'both';
        if (hasPhone && !hasUsername && !hasFirstName && !hasLastName && !hasEmail) {
          scanType = 'phone';
        } else if (hasUsername && !hasFirstName && !hasLastName) {
          scanType = 'username';
        } else if (hasFirstName || hasLastName || hasEmail) {
          scanType = 'personal_details';
        }

        // Convert empty strings to null to avoid database validation errors
        const toNullIfEmpty = (val: string | undefined | null): string | null => 
          val && val.trim() ? val.trim() : null;

        // Generate a scan ID upfront so we can track it
        const preScanId = crypto.randomUUID();
        createdScanId = preScanId;

        // Normalize phone to E.164 format before sending
        const normalizePhone = (phone: string): string => {
          const digits = phone.replace(/\D/g, '');
          if (digits.length === 10) return `+1${digits}`;
          if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
          return digits.startsWith('+') ? digits : `+${digits}`;
        };

        // Build request body for n8n-scan-trigger
        const requestBody: Record<string, any> = {
          scanId: preScanId,
          scanType,
          workspaceId: workspaceMember?.workspace_id || null,
        };
        
        if (scanData.username && scanData.username.trim()) requestBody.username = scanData.username.trim();
        if (scanData.firstName && scanData.firstName.trim()) requestBody.firstName = scanData.firstName.trim();
        if (scanData.lastName && scanData.lastName.trim()) requestBody.lastName = scanData.lastName.trim();
        if (scanData.email && scanData.email.trim()) requestBody.email = scanData.email.trim();
        if (scanData.phone && scanData.phone.trim()) {
          requestBody.phone = normalizePhone(scanData.phone.trim());
          if (scanData.phoneProviders && scanData.phoneProviders.length > 0) {
            requestBody.phoneProviders = scanData.phoneProviders;
          }
        }

        console.log('[ScanProgress] Invoking n8n-scan-trigger', { scanType, scanId: preScanId });

        // Route ALL scans through n8n-scan-trigger for reliable async processing
        const { data, error } = await supabase.functions.invoke('n8n-scan-trigger', {
          body: requestBody,
        });

        if (error) {
          console.error('[ScanProgress] n8n-scan-trigger error:', error);
          throw error;
        }

        // Use the scan ID from the response if available
        const actualScanId = data?.scanId || data?.id || preScanId;
        createdScanId = actualScanId;
        
        console.log('[ScanProgress] Scan triggered successfully:', { actualScanId, status: data?.status });

        if (!isMounted) return;

        // Poll for scan completion via scans table status
        let pollAttempts = 0;
        const maxPollAttempts = 60; // 2 minutes max polling
        let scanComplete = false;
        
        const terminalStatuses = ['completed', 'completed_partial', 'failed', 'failed_timeout'];
        
        while (pollAttempts < maxPollAttempts && isMounted && !scanComplete) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          pollAttempts++;
          
          // Check scan status
          const { data: scanStatus } = await supabase
            .from('scans')
            .select('status')
            .eq('id', actualScanId)
            .single();
          
          if (scanStatus && terminalStatuses.includes(scanStatus.status)) {
            scanComplete = true;
            console.log('[ScanProgress] Scan completed with status:', scanStatus.status);
          }
          
          // Also check for results as a fallback
          if (!scanComplete && pollAttempts % 5 === 0) {
            const [sourcesResult, profilesResult] = await Promise.all([
              supabase.from('data_sources').select('id').eq('scan_id', actualScanId).limit(1),
              supabase.from('social_profiles').select('id').eq('scan_id', actualScanId).limit(1)
            ]);
            
            if ((sourcesResult.data && sourcesResult.data.length > 0) || 
                (profilesResult.data && profilesResult.data.length > 0)) {
              scanComplete = true;
              console.log('[ScanProgress] Scan has results, marking complete');
            }
          }
        }

        // Update user streak
        await updateStreakOnScan(userId);

        // Mark complete and navigate
        if (isMounted) {
          setIsComplete(true);
          setTimeout(() => {
            if (isMounted) {
              onComplete(actualScanId);
            }
          }, 500);
        }

      } catch (error: any) {
        if (!isMounted) return;
        
        console.error("[ScanProgress] Scan error:", error);
        
        // If scan record exists, proceed to results anyway
        if (createdScanId) {
          setIsComplete(true);
          setTimeout(() => {
            if (isMounted) {
              onComplete(createdScanId as string);
            }
          }, 500);
        } else {
          setIsFailed(true);
        }
      }
    };

    // Safety net: allow up to 3 minutes for n8n workflow to complete
    const t = window.setTimeout(() => {
      if (isMounted && createdScanId) {
        console.log('[ScanProgress] Safety timeout reached, navigating to results');
        setIsComplete(true);
        onComplete(createdScanId);
        try { navigate(`/results/${createdScanId}`); } catch {}
      }
    }, 180000); // 3 minutes

    performScan();

    return () => {
      isMounted = false;
      clearTimeout(t);
    };
  }, [onComplete, scanData, userId, subscriptionTier, isAdmin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-xl">
        <UnifiedScanProgress 
          isComplete={isComplete} 
          isFailed={isFailed} 
        />
        
        {isFailed && (
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
