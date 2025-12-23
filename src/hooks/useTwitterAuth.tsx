import { useState, useEffect, useCallback } from 'react';
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
      toast.success('Successfully connected Twitter/X account!');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (authStatus === 'error') {
      const displayMessage = errorMessage 
        ? decodeURIComponent(errorMessage) 
        : 'Unknown error occurred';
      toast.error(`Twitter sign-in failed: ${displayMessage}`);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const signInWithTwitter = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in first before connecting Twitter');
        setIsLoading(false);
        return;
      }

      console.log('Starting Twitter OAuth flow...');
      
      // Call the start OAuth function
      const { data, error } = await supabase.functions.invoke('twitter-oauth-start');
      
      if (error) {
        console.error('Twitter OAuth start error:', error);
        throw new Error(error.message || 'Failed to start Twitter authentication');
      }

      if (!data?.url) {
        console.error('No OAuth URL returned:', data);
        throw new Error('No OAuth URL returned from server');
      }

      console.log('Redirecting to Twitter OAuth...');
      // Redirect to Twitter OAuth page
      window.location.href = data.url;
    } catch (error) {
      console.error('Error starting Twitter OAuth:', error);
      const message = error instanceof Error ? error.message : 'Failed to start Twitter sign-in';
      toast.error(message);
      setIsLoading(false);
    }
  }, []);

  return {
    signInWithTwitter,
    isLoading,
  };
}
