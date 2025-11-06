import { supabase } from '@/integrations/supabase/client';

/**
 * Call this function whenever a user completes a scan to update their streak
 */
export const updateStreakOnScan = async (userId: string) => {
  try {
    const { error } = await supabase.rpc('update_user_streak', {
      _user_id: userId,
    });

    if (error) {
      console.error('Error updating streak:', error);
    }
  } catch (error) {
    console.error('Failed to update streak:', error);
  }
};
