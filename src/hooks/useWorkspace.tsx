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

      // Get workspace memberships without join to avoid RLS recursion
      const { data: memberships, error: membershipsError } = await supabase
        .from('workspace_members' as any)
        .select('workspace_id, role')
        .eq('user_id', user.id);

      if (membershipsError) throw membershipsError;

      const membershipRows = (memberships as any[]) || [];

      // Fetch workspaces where the user is a member
      const memberWorkspaceIds = membershipRows.map((m: any) => m.workspace_id);
      let memberWorkspaces: Workspace[] = [];
      if (memberWorkspaceIds.length > 0) {
        const { data: wsByMembership, error: memberWsError } = await supabase
          .from('workspaces' as any)
          .select('*')
          .in('id', memberWorkspaceIds);
        if (memberWsError) throw memberWsError;
        memberWorkspaces = (wsByMembership || []) as unknown as Workspace[];
      }

      // Also fetch workspaces owned by the user (owner access is allowed by RLS)
      const { data: ownedWorkspaces, error: ownedError } = await supabase
        .from('workspaces' as any)
        .select('*')
        .eq('owner_id', user.id);
      if (ownedError) {
        console.warn('Failed to fetch owned workspaces:', ownedError);
      }

      // Merge and deduplicate
      const combined = [...memberWorkspaces, ...((ownedWorkspaces || []) as any)];
      const deduped = Array.from(new Map(combined.map((w: any) => [w.id, w])).values()) as Workspace[];

      setWorkspaces(deduped || []);

      // Get current workspace from sessionStorage or use first
      const storedWorkspaceId = sessionStorage.getItem('current_workspace_id');
      let currentWorkspace = deduped.find(w => w.id === storedWorkspaceId) as Workspace | undefined;
      
      if (!currentWorkspace && deduped.length > 0) {
        currentWorkspace = deduped[0];
        sessionStorage.setItem('current_workspace_id', currentWorkspace.id);
      }

      if (currentWorkspace) {
        setWorkspace(currentWorkspace);
        
        // Determine role: owner if owned, otherwise from membership
        const membership = membershipRows.find((m: any) => m.workspace_id === currentWorkspace!.id);
        const role: WorkspaceRole | null = currentWorkspace.owner_id === user.id
          ? 'owner'
          : (membership?.role as WorkspaceRole) || null;
        setCurrentRole(role);
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
      sessionStorage.setItem('current_workspace_id', workspaceId);
      
      // Update role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: workspaceUser } = await supabase
          .from('workspace_members' as any)
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
