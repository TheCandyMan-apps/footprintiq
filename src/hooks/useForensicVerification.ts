import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LensVerificationResult {
  cached: boolean;
  confidenceScore: number;
  hashedContent: string;
  verificationHash: string;
  metadata: {
    sourceAge: string;
    sslStatus: string;
    platformConsistency: string;
  };
  verifiedAt: string;
}

export interface VerifyParams {
  url: string;
  platform: string;
  scanId: string;
  findingId: string;
}

export interface UseForensicVerificationReturn {
  verify: (params: VerifyParams) => Promise<LensVerificationResult | null>;
  isVerifying: boolean;
  verificationResult: LensVerificationResult | null;
  error: string | null;
  reset: () => void;
}

export function useForensicVerification(): UseForensicVerificationReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<LensVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const verify = useCallback(async (params: VerifyParams): Promise<LensVerificationResult | null> => {
    const { url, platform, scanId, findingId } = params;

    if (!url || !platform || !scanId || !findingId) {
      setError('Missing required verification parameters');
      toast({
        title: 'Verification Failed',
        description: 'Missing required parameters for forensic verification',
        variant: 'destructive',
      });
      return null;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('lens-verify', {
        body: { url, platform, scanId, findingId },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Verification request failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const result: LensVerificationResult = {
        cached: data.cached || false,
        confidenceScore: data.confidenceScore,
        hashedContent: data.hashedContent,
        verificationHash: data.verificationHash,
        metadata: data.metadata,
        verifiedAt: data.verifiedAt,
      };

      setVerificationResult(result);

      toast({
        title: result.cached ? 'Verification Retrieved' : 'Verification Complete',
        description: result.cached 
          ? 'Using previously verified evidence' 
          : `Confidence: ${result.confidenceScore}%`,
      });

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify evidence';
      setError(errorMessage);
      
      toast({
        title: 'Verification Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return null;
    } finally {
      setIsVerifying(false);
    }
  }, [toast]);

  const reset = useCallback(() => {
    setVerificationResult(null);
    setError(null);
    setIsVerifying(false);
  }, []);

  return {
    verify,
    isVerifying,
    verificationResult,
    error,
    reset,
  };
}
