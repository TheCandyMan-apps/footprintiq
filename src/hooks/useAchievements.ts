import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

interface Achievements {
  currentStreak: number;
  longestStreak: number;
  totalScans: number;
  totalRemovals: number;
  badges: Badge[];
  lastScanDate: string | null;
}

const BADGE_DEFINITIONS = [
  {
    id: 'first_scan',
    name: 'First Scan',
    description: 'Completed your first privacy scan',
    icon: '🎯',
    condition: (achievements: Achievements) => achievements.totalScans >= 1,
  },
  {
    id: 'scan_streak_7',
    name: '7 Day Streak',
    description: 'Scanned 7 days in a row',
    icon: '🔥',
    condition: (achievements: Achievements) => achievements.currentStreak >= 7,
  },
  {
    id: 'scan_streak_30',
    name: '30 Day Streak',
    description: 'Scanned 30 days in a row',
    icon: '🏆',
    condition: (achievements: Achievements) => achievements.currentStreak >= 30,
  },
  {
    id: 'removal_10',
    name: '10 Removals',
    description: 'Requested removal from 10 sources',
    icon: '🗑️',
    condition: (achievements: Achievements) => achievements.totalRemovals >= 10,
  },
  {
    id: 'removal_50',
    name: '50 Removals',
    description: 'Requested removal from 50 sources',
    icon: '🧹',
    condition: (achievements: Achievements) => achievements.totalRemovals >= 50,
  },
  {
    id: 'privacy_guardian',
    name: 'Privacy Guardian',
    description: 'Achieved zero dark web mentions',
    icon: '🛡️',
    condition: () => false, // Checked separately with dark web data
  },
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Completed 50 scans',
    icon: '⚡',
    condition: (achievements: Achievements) => achievements.totalScans >= 50,
  },
];

export const useAchievements = (userId: string | undefined) => {
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievements>({
    currentStreak: 0,
    longestStreak: 0,
    totalScans: 0,
    totalRemovals: 0,
    badges: [],
    lastScanDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setAchievements({
          currentStreak: data.current_streak || 0,
          longestStreak: data.longest_streak || 0,
          totalScans: data.total_scans || 0,
          totalRemovals: data.total_removals || 0,
          badges: (data.badges as unknown as Badge[]) || [],
          lastScanDate: data.last_scan_date,
        });
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    if (!userId) return;

    try {
      // Call the database function to update streak
      const { error } = await supabase.rpc('update_user_streak', {
        _user_id: userId,
      });

      if (error) throw error;

      // Fetch updated achievements
      await fetchAchievements();
      
      // Check for new badges
      await checkAndAwardBadges();
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const incrementRemovals = async () => {
    if (!userId) return;

    try {
      const { data: current, error: fetchError } = await supabase
        .from('user_achievements')
        .select('total_removals')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('user_achievements')
        .update({ total_removals: (current.total_removals || 0) + 1 })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      await fetchAchievements();
      await checkAndAwardBadges();
    } catch (error) {
      console.error('Error incrementing removals:', error);
    }
  };

  const checkAndAwardBadges = async () => {
    if (!userId) return;

    const earnedBadges: Badge[] = achievements.badges || [];
    const earnedBadgeIds = earnedBadges.map((b) => b.id);
    const newBadges: Badge[] = [];

    // Check each badge definition
    for (const badgeDef of BADGE_DEFINITIONS) {
      if (!earnedBadgeIds.includes(badgeDef.id) && badgeDef.condition(achievements)) {
        newBadges.push({
          id: badgeDef.id,
          name: badgeDef.name,
          description: badgeDef.description,
          icon: badgeDef.icon,
          earnedAt: new Date().toISOString(),
        });
      }
    }

    // Award new badges
    if (newBadges.length > 0) {
      const updatedBadges = [...earnedBadges, ...newBadges];

      const { error } = await supabase
        .from('user_achievements')
        .update({ badges: updatedBadges as any })
        .eq('user_id', userId);

      if (error) {
        console.error('Error awarding badges:', error);
      } else {
        // Show toast for each new badge
        newBadges.forEach((badge) => {
          toast({
            title: '🎉 New Badge Unlocked!',
            description: `${badge.icon} ${badge.name}: ${badge.description}`,
            duration: 5000,
          });
        });

        await fetchAchievements();
      }
    }
  };

  return {
    achievements,
    loading,
    updateStreak,
    incrementRemovals,
    refreshAchievements: fetchAchievements,
  };
};
