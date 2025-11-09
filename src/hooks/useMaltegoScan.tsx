import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MaltegoConsentModal } from '@/components/maltego/MaltegoConsentModal';

interface MaltegoScanRequest {
  entity: string;
  entityType: 'username' | 'email' | 'ip' | 'domain';
  transforms: string[];
  workspaceId: string;
  saveToCase?: boolean;
  caseTitle?: string;
}

interface MaltegoScanResult {
  success: boolean;
  scanId?: string;
  graph?: any;
  creditsUsed?: number;
  error?: string;
}

export function useMaltegoScan() {
  const [isScanning, setIsScanning] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<MaltegoScanRequest | null>(null);

  // Check premium status
  useState(() => {
    checkPremiumStatus();
  });

  const checkPremiumStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single();

    setIsPremium(['premium', 'enterprise'].includes(userRole?.subscription_tier || ''));
  };

  const startMaltegoScan = async (request: MaltegoScanRequest): Promise<MaltegoScanResult> => {
    // Show consent modal first
    setPendingRequest(request);
    setConsentOpen(true);
    
    return { success: false };
  };

  const executeScan = async (): Promise<MaltegoScanResult> => {
    if (!pendingRequest) return { success: false, error: 'No pending request' };

    setIsScanning(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('maltego-scan', {
        body: pendingRequest
      });

      if (error) throw error;

      if (!data.success) {
        if (data.error?.includes('Premium')) {
          toast.error('Premium subscription required', {
            description: 'Upgrade to unlock Maltego AI graph analysis',
            action: {
              label: 'Upgrade',
              onClick: () => window.location.href = '/pricing'
            }
          });
        } else if (data.error?.includes('Insufficient credits')) {
          toast.error('Insufficient credits', {
            description: `You need ${data.required} credits. Current balance: ${data.current}`,
            action: {
              label: 'Buy Credits',
              onClick: () => window.location.href = '/settings/workspace'
            }
          });
        } else {
          toast.error(data.error || 'Scan failed');
        }
        return { success: false, error: data.error };
      }

      toast.success('Maltego AI scan started', {
        description: `Found ${data.graph?.nodes?.length || 0} entities`
      });

      return {
        success: true,
        scanId: data.scanId,
        graph: data.graph,
        creditsUsed: data.creditsUsed
      };

    } catch (error: any) {
      console.error('[useMaltegoScan] Error:', error);
      toast.error('Scan failed', {
        description: error.message || 'An unexpected error occurred'
      });
      return { success: false, error: error.message };
    } finally {
      setIsScanning(false);
      setPendingRequest(null);
    }
  };

  return {
    startMaltegoScan,
    isScanning,
    isPremium,
    consentModal: (
      <MaltegoConsentModal
        open={consentOpen}
        onOpenChange={setConsentOpen}
        onConsent={executeScan}
      />
    )
  };
}
