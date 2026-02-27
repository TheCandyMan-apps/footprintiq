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

      // Get users by role — fetch ALL rows (default limit is 1000)
      let allRoles: { role: string; subscription_tier: string }[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data: batch, error: batchError } = await supabase
          .from('user_roles')
          .select('role, subscription_tier')
          .range(from, from + pageSize - 1);
        if (batchError) throw batchError;
        if (!batch || batch.length === 0) break;
        allRoles = allRoles.concat(batch);
        if (batch.length < pageSize) break;
        from += pageSize;
      }

      const adminCount = allRoles.filter(r => r.role === 'admin').length;
      const freeUsers = allRoles.filter(r => r.subscription_tier === 'free').length;
      const premiumUsers = allRoles.filter(r => r.subscription_tier === 'pro' || r.subscription_tier === 'basic').length;

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
