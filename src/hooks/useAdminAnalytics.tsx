import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get users by role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, subscription_tier');

      if (rolesError) throw rolesError;

      const adminCount = roles?.filter(r => r.role === 'admin').length || 0;
      const freeUsers = roles?.filter(r => r.subscription_tier === 'free').length || 0;
      const premiumUsers = roles?.filter(r => r.subscription_tier === 'pro').length || 0;

      // Get recent signups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentSignups, error: signupsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (signupsError) throw signupsError;

      // Get total scans
      const { count: totalScans, error: scansError } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true });

      if (scansError) throw scansError;

      // Get active workspaces (with graceful RLS error handling for admin queries)
      const { count: activeWorkspaces, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*', { count: 'exact', head: true });

      if (workspacesError) {
        // Gracefully handle RLS 406 errors - continue with null/0 instead of throwing
        console.warn('Admin analytics workspace count failed (RLS 406?):', workspacesError);
      }

      // AI-referred scans (chatgpt.com, openai.com, bing.com)
      const aiReferrerPatterns = ['chatgpt.com', 'openai.com', 'bing.com'];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [aiReferred7d, aiReferred30d] = await Promise.all(
        [sevenDaysAgo, thirtyDaysAgo].map(async (since) => {
          let total = 0;
          for (const pattern of aiReferrerPatterns) {
            const { count, error } = await supabase
              .from('scans')
              .select('*', { count: 'exact', head: true })
              .ilike('referrer', `%${pattern}%`)
              .gte('created_at', since.toISOString());
            if (!error) total += count || 0;
          }
          return total;
        })
      );

      return {
        totalUsers: totalUsers || 0,
        adminCount,
        freeUsers,
        premiumUsers,
        recentSignups: recentSignups || 0,
        totalScans: totalScans || 0,
        activeWorkspaces: activeWorkspaces || 0,
        aiReferred7d,
        aiReferred30d,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    analytics,
    isLoading,
  };
}
