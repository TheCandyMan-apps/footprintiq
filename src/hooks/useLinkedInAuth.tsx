import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useLinkedInAuth() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('linkedin_auth');
    const errorMessage = params.get('message');

    if (authStatus === 'success') {
      toast.success('Successfully signed in with LinkedIn!');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (authStatus === 'error') {
      toast.error(`LinkedIn sign-in failed: ${errorMessage || 'Unknown error'}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const signInWithLinkedIn = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('linkedin-oauth-start');
      
      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No OAuth URL returned');
      }
    } catch (error) {
      console.error('Error starting LinkedIn OAuth:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start LinkedIn sign-in');
      setIsLoading(false);
    }
  };

  return {
    signInWithLinkedIn,
    isLoading,
  };
}
