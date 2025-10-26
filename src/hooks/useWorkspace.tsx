import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Workspace = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  subscription_tier: 'free' | 'pro' | 'analyst' | 'enterprise';
  subscription_expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  settings: any;
  created_at: string;
  updated_at: string;
};

type WorkspaceRole = 'owner' | 'admin' | 'analyst' | 'viewer';

interface WorkspaceContext {
  workspace: Workspace | null;
  workspaces: Workspace[];
  currentRole: WorkspaceRole | null;
  loading: boolean;
  error: string | null;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  can: (action: string) => boolean;
}

export function useWorkspace(): WorkspaceContext {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentRole, setCurrentRole] = useState<WorkspaceRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspaces = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get all workspaces user belongs to
      const { data: workspaceUsers, error: usersError } = await supabase
        .from('workspace_users' as any)
        .select('workspace_id, role, workspaces(*)')
        .eq('user_id', user.id);

      if (usersError) throw usersError;

      const userWorkspaces = workspaceUsers
        ?.map((wu: any) => wu.workspaces)
        .filter(Boolean) as Workspace[];

      setWorkspaces(userWorkspaces || []);

      // Get current workspace from localStorage or use first
      const storedWorkspaceId = localStorage.getItem('current_workspace_id');
      let currentWorkspace = userWorkspaces?.find(w => w.id === storedWorkspaceId);
      
      if (!currentWorkspace && userWorkspaces.length > 0) {
        currentWorkspace = userWorkspaces[0];
        localStorage.setItem('current_workspace_id', currentWorkspace.id);
      }

      if (currentWorkspace) {
        setWorkspace(currentWorkspace);
        
        // Get user's role in this workspace
        const workspaceUser = workspaceUsers?.find(
          (wu: any) => wu.workspace_id === currentWorkspace!.id
        ) as any;
        setCurrentRole(workspaceUser?.role ? workspaceUser.role as WorkspaceRole : null);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workspaces');
      setLoading(false);
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    const newWorkspace = workspaces.find(w => w.id === workspaceId);
    if (newWorkspace) {
      setWorkspace(newWorkspace);
      localStorage.setItem('current_workspace_id', workspaceId);
      
      // Update role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: workspaceUser } = await supabase
          .from('workspace_users' as any)
          .select('role')
          .eq('workspace_id', workspaceId)
          .eq('user_id', user.id)
          .single() as any;
        
        setCurrentRole(workspaceUser?.role ? workspaceUser.role as WorkspaceRole : null);
      }
    }
  };

  const refreshWorkspace = async () => {
    setLoading(true);
    await loadWorkspaces();
  };

  const can = (action: string): boolean => {
    if (!currentRole) return false;

    const permissions: Record<WorkspaceRole, string[]> = {
      owner: ['*'],
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_api_keys', 'view_audit'],
      analyst: ['read', 'write', 'create_scans', 'create_cases'],
      viewer: ['read'],
    };

    const rolePermissions = permissions[currentRole] || [];
    return rolePermissions.includes('*') || rolePermissions.includes(action);
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  return {
    workspace,
    workspaces,
    currentRole,
    loading,
    error,
    switchWorkspace,
    refreshWorkspace,
    can,
  };
}
