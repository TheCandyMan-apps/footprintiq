import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTwitterAuth() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('twitter_auth');
    const errorMessage = params.get('message');

    if (authStatus === 'success') {
      toast.success('Successfully signed in with Twitter!');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (authStatus === 'error') {
      toast.error(`Twitter sign-in failed: ${errorMessage || 'Unknown error'}`);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const signInWithTwitter = async () => {
    try {
      setIsLoading(true);
      
      // Call the start OAuth function
      const { data, error } = await supabase.functions.invoke('twitter-oauth-start');
      
      if (error) {
        throw error;
      }

      if (data?.url) {
        // Redirect to Twitter OAuth page
        window.location.href = data.url;
      } else {
        throw new Error('No OAuth URL returned');
      }
    } catch (error) {
      console.error('Error starting Twitter OAuth:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start Twitter sign-in');
      setIsLoading(false);
    }
  };

  return {
    signInWithTwitter,
    isLoading,
  };
}
