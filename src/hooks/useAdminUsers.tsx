import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get all users from profiles and user_roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get user roles — paginate to avoid 1000-row default limit
      let allRoles: any[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data: batch, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .range(from, from + pageSize - 1);
        if (rolesError) throw rolesError;
        if (!batch || batch.length === 0) break;
        allRoles = allRoles.concat(batch);
        if (batch.length < pageSize) break;
        from += pageSize;
      }
      const roles = allRoles;

      // Combine the data
      const usersWithRoles = profiles.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role || 'free',
          subscription_tier: userRole?.subscription_tier || 'free',
          subscription_expires_at: userRole?.subscription_expires_at,
        };
      });

      return usersWithRoles;
    },
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase.rpc('admin_update_user_role', {
        _user_id: userId,
        _new_role: role,
      });

      if (error) throw error;

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action: 'user.role_updated',
          entity_type: 'user',
          entity_id: userId,
          metadata: { new_role: role }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update user role');
    },
  });

  const updateUserSubscription = useMutation({
    mutationFn: async ({ 
      userId, 
      tier, 
      expiresAt 
    }: { 
      userId: string; 
      tier: 'free' | 'pro' | 'enterprise'; 
      expiresAt?: string;
    }) => {
      // Use the SECURITY DEFINER RPC to bypass RLS
      const { data, error } = await supabase.rpc('update_user_subscription', {
        _user_id: userId,
        _new_tier: tier as any,
        ...(expiresAt ? { _expires_at: expiresAt } : {}),
      });

      if (error) throw error;

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action: 'user.subscription_updated',
          entity_type: 'user',
          entity_id: userId,
          metadata: { new_tier: tier, expires_at: expiresAt }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User subscription updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update subscription');
    },
  });

  return {
    users,
    isLoading,
    refetch,
    updateUserRole: updateUserRole.mutate,
    updateUserRoleAsync: updateUserRole.mutateAsync,
    updateUserSubscription: updateUserSubscription.mutate,
    updateUserSubscriptionAsync: updateUserSubscription.mutateAsync,
    isUpdating: updateUserRole.isPending || updateUserSubscription.isPending,
  };
}
