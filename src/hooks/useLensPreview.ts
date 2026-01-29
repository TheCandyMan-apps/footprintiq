import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type LensConfidenceLevel = 'likely' | 'unclear' | 'unlikely';

export interface LensPreviewResult {
  confidenceLevel: LensConfidenceLevel;
  explanation: string;
  profileId: string;
  platform: string;
  verifiedAt: string;
}

export interface UseLensPreviewReturn {
  hasUsedPreview: boolean;
  isLoading: boolean;
  isVerifying: boolean;
  previewResult: LensPreviewResult | null;
  /** The ID of the profile that was verified (to show result on correct row) */
  verifiedProfileId: string | null;
  verifyProfile: (profile: {
    id: string;
    platform: string;
    username?: string;
    url?: string | null;
    scanId: string;
  }) => Promise<LensPreviewResult | null>;
  checkPreviewStatus: () => Promise<void>;
}

/**
 * Hook to manage the one-time LENS verification preview for Free users.
 * Each account gets exactly ONE free LENS verification (lifetime limit).
 */
export function useLensPreview(): UseLensPreviewReturn {
  const [hasUsedPreview, setHasUsedPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [previewResult, setPreviewResult] = useState<LensPreviewResult | null>(null);
  const [verifiedProfileId, setVerifiedProfileId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user has already used their free preview
  const checkPreviewStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('lens_preview_used')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking LENS preview status:', error);
      }

      setHasUsedPreview(profile?.lens_preview_used ?? false);
    } catch (err) {
      console.error('Failed to check LENS preview status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPreviewStatus();
  }, [checkPreviewStatus]);

  // Verify a single profile using LENS
  const verifyProfile = useCallback(async (profile: {
    id: string;
    platform: string;
    username: string;
    url?: string;
    scanId: string;
  }): Promise<LensPreviewResult | null> => {
    if (hasUsedPreview) {
      toast({
        title: 'Preview already used',
        description: 'Upgrade to Pro for unlimited LENS verifications.',
        variant: 'default',
      });
      return null;
    }

    setIsVerifying(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to use LENS verification.',
          variant: 'destructive',
        });
        return null;
      }

      // Call the lens-verify-preview edge function
      const { data, error } = await supabase.functions.invoke('lens-verify-preview', {
        body: {
          profileId: profile.id,
          platform: profile.platform,
          username: profile.username,
          url: profile.url,
          scanId: profile.scanId,
        },
      });

      if (error) {
        throw new Error(error.message || 'Verification failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Mark the preview as used in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          lens_preview_used: true,
          lens_preview_used_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to mark preview as used:', updateError);
      }

      const result: LensPreviewResult = {
        confidenceLevel: data.confidenceLevel,
        explanation: data.explanation,
        profileId: profile.id,
        platform: profile.platform,
        verifiedAt: new Date().toISOString(),
      };

      setPreviewResult(result);
      setVerifiedProfileId(profile.id);
      setHasUsedPreview(true);

      toast({
        title: 'LENS Verification Complete',
        description: `Confidence: ${result.confidenceLevel.charAt(0).toUpperCase() + result.confidenceLevel.slice(1)}`,
      });

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify profile';
      toast({
        title: 'Verification Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, [hasUsedPreview, toast]);

  return {
    hasUsedPreview,
    isLoading,
    isVerifying,
    previewResult,
    verifiedProfileId,
    verifyProfile,
    checkPreviewStatus,
  };
}
