import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get all users from profiles and user_roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

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
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;
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
      tier: string; 
      expiresAt?: string;
    }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          subscription_tier: tier,
          subscription_expires_at: expiresAt 
        })
        .eq('user_id', userId);

      if (error) throw error;
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
    updateUserRole: updateUserRole.mutate,
    updateUserSubscription: updateUserSubscription.mutate,
    isUpdating: updateUserRole.isPending || updateUserSubscription.isPending,
  };
}
