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

        const { data: scan, error: scanError } = await supabase
          .from("scans")
          .insert([{
            user_id: userId,
            workspace_id: workspaceMember?.workspace_id || null,
            scan_type: scanType,
            username: toNullIfEmpty(scanData.username),
            first_name: toNullIfEmpty(scanData.firstName),
            last_name: toNullIfEmpty(scanData.lastName),
            email: toNullIfEmpty(scanData.email),
            phone: toNullIfEmpty(scanData.phone),
          }])
          .select()
          .single();

        if (scanError) throw scanError;
        createdScanId = scan.id;

        try {
          // Normalize phone to E.164 format before sending
          const normalizePhone = (phone: string): string => {
            const digits = phone.replace(/\D/g, '');
            if (digits.length === 10) return `+1${digits}`;
            if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
            return digits.startsWith('+') ? digits : `+${digits}`;
          };

          const body: Record<string, any> = {
            scanId: scan.id,
            scanType,
          };
          if (scanData.username && scanData.username.trim()) body.username = scanData.username.trim();
          if (scanData.firstName && scanData.firstName.trim()) body.firstName = scanData.firstName.trim();
          if (scanData.lastName && scanData.lastName.trim()) body.lastName = scanData.lastName.trim();
          if (scanData.email && scanData.email.trim()) body.email = scanData.email.trim();
          if (scanData.phone && scanData.phone.trim()) {
            body.phone = normalizePhone(scanData.phone.trim());
            if (scanData.phoneProviders && scanData.phoneProviders.length > 0) {
              body.phoneProviders = scanData.phoneProviders;
            }
          }

          // Actually wait for the scan to complete
          await withTimeout(
            supabase.functions.invoke('osint-scan', { body }),
            90000,
            'OSINT scan'
          );
        } catch (e: any) {
          console.warn('OSINT scan error:', e?.message || e);
        }

        if (!isMounted) return;

        // Poll for actual results
        let pollAttempts = 0;
        const maxPollAttempts = 10;
        let hasResults = false;
        
        while (pollAttempts < maxPollAttempts && isMounted && !hasResults) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          pollAttempts++;
          
          // Check if we have any results in either table
          const [sourcesResult, profilesResult] = await Promise.all([
            supabase.from('data_sources').select('id').eq('scan_id', scan.id).limit(1),
            supabase.from('social_profiles').select('id').eq('scan_id', scan.id).limit(1)
          ]);
          
          if ((sourcesResult.data && sourcesResult.data.length > 0) || 
              (profilesResult.data && profilesResult.data.length > 0)) {
            hasResults = true;
          }
        }

        // Update user streak
        await updateStreakOnScan(userId);

        // Mark complete and navigate
        if (isMounted) {
          setIsComplete(true);
          setTimeout(() => {
            if (isMounted) {
              onComplete(scan.id);
            }
          }, 500);
        }

      } catch (error: any) {
        if (!isMounted) return;
        
        console.error("Scan error:", error);
        
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

    // Safety net: never hang more than 35s
    const t = window.setTimeout(() => {
      if (isMounted && createdScanId) {
        setIsComplete(true);
        onComplete(createdScanId);
        try { navigate(`/results/${createdScanId}`); } catch {}
      }
    }, 35000);

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
