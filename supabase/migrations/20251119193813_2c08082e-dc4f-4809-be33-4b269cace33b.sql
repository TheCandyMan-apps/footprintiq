-- ============================================
-- Clean up duplicate RLS policies
-- Keep the newer, simpler ws_* and wm_* policies
-- ============================================

-- Drop older duplicate workspace policies (if they exist)
DROP POLICY IF EXISTS "workspaces_insert_self_owner" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_update_owner_only" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_delete_owner_only" ON public.workspaces;

-- Drop older duplicate workspace_members policies (if they exist)
DROP POLICY IF EXISTS "workspace_members_insert_owner_or_admin" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_owner_or_admin" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete_owner_or_admin" ON public.workspace_members;

-- Verify and recreate is_workspace_member helper as SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER  -- Critical: bypasses RLS to prevent recursion
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace AND user_id = _user
  );
$$;

-- Add helpful comments to remaining policies for documentation
COMMENT ON POLICY "ws_select_owner_or_member" ON public.workspaces IS 
'Users can view workspaces they own OR are members of (via is_workspace_member helper which uses SECURITY DEFINER to bypass RLS)';

COMMENT ON POLICY "ws_insert_owner" ON public.workspaces IS
'Authenticated users can create workspaces and become the owner';

COMMENT ON POLICY "ws_update_owner" ON public.workspaces IS
'Only workspace owners can update workspace settings';

COMMENT ON POLICY "ws_delete_owner" ON public.workspaces IS
'Only workspace owners can delete workspaces';

-- Add comments for workspace_members policies
COMMENT ON POLICY "wm_select_own" ON public.workspace_members IS
'Users can view their own workspace memberships';

COMMENT ON POLICY "wm_insert_self" ON public.workspace_members IS
'Users can be added as members (typically by admins via service role)';

COMMENT ON POLICY "wm_update_self" ON public.workspace_members IS
'Users can update their own membership details';

COMMENT ON POLICY "wm_delete_self" ON public.workspace_members IS
'Users can remove themselves from workspaces';