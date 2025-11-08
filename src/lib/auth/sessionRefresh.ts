import { supabase } from '@/integrations/supabase/client';

export interface SessionCheckResult {
  valid: boolean;
  refreshed: boolean;
  error?: string;
}

/**
 * Checks if the current session is valid and attempts to refresh if needed
 */
export async function checkAndRefreshSession(): Promise<SessionCheckResult> {
  try {
    // Check current session
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (!error && user) {
      return { valid: true, refreshed: false };
    }
    
    // Attempt to refresh session
    const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !session) {
      return {
        valid: false,
        refreshed: false,
        error: refreshError?.message || 'Session refresh failed',
      };
    }
    
    return { valid: true, refreshed: true };
  } catch (error: any) {
    return {
      valid: false,
      refreshed: false,
      error: error.message || 'Unknown authentication error',
    };
  }
}

/**
 * Ensures the user is authenticated before proceeding
 * Throws an error if authentication fails
 */
export async function ensureAuthenticated(): Promise<void> {
  const result = await checkAndRefreshSession();
  
  if (!result.valid) {
    throw new Error(result.error || 'Authentication required');
  }
}
