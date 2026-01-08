import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const WELCOME_EMAIL_SENT_KEY = 'footprintiq_welcome_email_sent';

/**
 * Hook that automatically triggers a welcome email when a user's email
 * becomes verified. Uses localStorage to prevent duplicate calls in the
 * same browser session and relies on the edge function to prevent
 * duplicate emails via database checks.
 */
export function useWelcomeEmail() {
  const hasSentRef = useRef(false);

  useEffect(() => {
    // Check if we already sent in this session
    const alreadySent = localStorage.getItem(WELCOME_EMAIL_SENT_KEY);
    if (alreadySent || hasSentRef.current) {
      return;
    }

    const checkAndSendWelcomeEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Only proceed if email is verified
        if (!user.email_confirmed_at) {
          return;
        }

        // Mark as sent immediately to prevent race conditions
        hasSentRef.current = true;
        localStorage.setItem(WELCOME_EMAIL_SENT_KEY, user.id);

        // Call the edge function
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const response = await supabase.functions.invoke('send-welcome-email', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.error) {
          console.error('[WelcomeEmail] Error sending welcome email:', response.error);
          // Don't clear localStorage - edge function has its own dedup logic
        } else {
          console.log('[WelcomeEmail] Welcome email triggered:', response.data);
        }
      } catch (error) {
        console.error('[WelcomeEmail] Failed to send welcome email:', error);
      }
    };

    // Check on mount
    checkAndSendWelcomeEmail();

    // Also listen for auth state changes (covers the case where user just verified)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_UPDATED' && session?.user?.email_confirmed_at) {
        checkAndSendWelcomeEmail();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
}
