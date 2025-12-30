import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { analytics } from '@/lib/analytics';

const RESEND_COOLDOWN_MS = 60000; // 60 seconds

interface UseEmailVerificationReturn {
  isVerified: boolean;
  isLoading: boolean;
  isResending: boolean;
  canResend: boolean;
  cooldownSeconds: number;
  resendVerificationEmail: () => Promise<boolean>;
  refreshVerificationStatus: () => Promise<void>;
}

export function useEmailVerification(): UseEmailVerificationReturn {
  const [isVerified, setIsVerified] = useState(true); // Default to true to avoid flash
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Check verification status
  const refreshVerificationStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsVerified(!!session.user.email_confirmed_at);
      } else {
        setIsVerified(true); // No user = don't show verification banners
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial check and auth state listener
  useEffect(() => {
    refreshVerificationStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsVerified(!!session.user.email_confirmed_at);
      } else {
        setIsVerified(true);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refreshVerificationStatus]);

  // Cooldown timer
  useEffect(() => {
    if (!lastSentAt) {
      setCooldownSeconds(0);
      return;
    }

    const updateCooldown = () => {
      const elapsed = Date.now() - lastSentAt;
      const remaining = Math.max(0, Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000));
      setCooldownSeconds(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);

    return () => clearInterval(interval);
  }, [lastSentAt]);

  const canResend = cooldownSeconds === 0;

  // Send verification email
  const resendVerificationEmail = useCallback(async (): Promise<boolean> => {
    if (!canResend) {
      toast.error(`Please wait ${cooldownSeconds} seconds before requesting another email`);
      return false;
    }

    setIsResending(true);
    analytics.trackEvent('email_verification_resend_clicked');

    try {
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: {},
      });

      if (error) throw error;

      if (data?.alreadyVerified) {
        setIsVerified(true);
        toast.success('Your email is already verified!');
        analytics.trackEvent('email_verification_completed');
        return true;
      }

      setLastSentAt(Date.now());
      toast.success('Verification email sent! Check your inbox.');
      return true;
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      
      if (error.message?.includes('429') || error.message?.includes('wait')) {
        toast.error('Please wait before requesting another email');
      } else {
        toast.error('Failed to send verification email. Please try again.');
      }
      return false;
    } finally {
      setIsResending(false);
    }
  }, [canResend, cooldownSeconds]);

  return {
    isVerified,
    isLoading,
    isResending,
    canResend,
    cooldownSeconds,
    resendVerificationEmail,
    refreshVerificationStatus,
  };
}
