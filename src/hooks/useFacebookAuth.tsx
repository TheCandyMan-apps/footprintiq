import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useFacebookAuth() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('facebook_auth');
    const errorMessage = params.get('message');

    if (authStatus === 'success') {
      toast.success('Successfully signed in with Facebook!');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (authStatus === 'error') {
      toast.error(`Facebook sign-in failed: ${errorMessage || 'Unknown error'}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const signInWithFacebook = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('facebook-oauth-start');
      
      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No OAuth URL returned');
      }
    } catch (error) {
      console.error('Error starting Facebook OAuth:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start Facebook sign-in');
      setIsLoading(false);
    }
  };

  return {
    signInWithFacebook,
    isLoading,
  };
}
