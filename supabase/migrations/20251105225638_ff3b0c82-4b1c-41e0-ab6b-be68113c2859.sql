-- Drop any recursive policies that might cause infinite recursion
DROP POLICY IF EXISTS wm_select_own ON public.workspace_members;
DROP POLICY IF EXISTS wm_insert_self ON public.workspace_members;
DROP POLICY IF EXISTS wm_update_self ON public.workspace_members;
DROP POLICY IF EXISTS wm_delete_self ON public.workspace_members;

DROP POLICY IF EXISTS ws_insert_owner ON public.workspaces;
DROP POLICY IF EXISTS ws_select_owner_or_member ON public.workspaces;
DROP POLICY IF EXISTS ws_update_owner ON public.workspaces;
DROP POLICY IF EXISTS ws_delete_owner ON public.workspaces;

-- Create helper function to check workspace membership without recursion
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id
  );
$$;

-- Enable RLS on tables
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- workspace_members: users can view/manage their own rows
CREATE POLICY wm_select_own ON public.workspace_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY wm_insert_self ON public.workspace_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY wm_update_self ON public.workspace_members
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY wm_delete_self ON public.workspace_members
  FOR DELETE USING (user_id = auth.uid());

-- workspaces: owner can write, members/owner can read
CREATE POLICY ws_insert_owner ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY ws_select_owner_or_member ON public.workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    public.is_workspace_member(id, auth.uid())
  );

CREATE POLICY ws_update_owner ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY ws_delete_owner ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());