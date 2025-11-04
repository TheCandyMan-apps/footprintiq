-- Comprehensive cleanup and fix of RLS policies to prevent infinite recursion

-- Drop ALL existing policies on workspace_members
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can view their workspace memberships" ON public.workspace_members;

-- Drop ALL existing policies on workspaces
DROP POLICY IF EXISTS "Users can insert workspaces they own" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view workspaces they own" ON public.workspaces;
DROP POLICY IF EXISTS "Members can view their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Owners can update their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Owners can delete their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete their workspaces" ON public.workspaces;

-- Recreate helper functions with proper security definer
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

CREATE OR REPLACE FUNCTION public.is_workspace_owner(_workspace_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = _workspace_id AND owner_id = _user_id
  );
$$;

-- workspace_members policies: Simple auth.uid() checks only
CREATE POLICY "workspace_members_select_own"
ON public.workspace_members
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "workspace_members_insert_own"
ON public.workspace_members
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspace_members_update_own"
ON public.workspace_members
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "workspace_members_delete_own"
ON public.workspace_members
FOR DELETE
USING (user_id = auth.uid());

-- workspaces policies: Use owner_id check or security definer function
CREATE POLICY "workspaces_insert_owner"
ON public.workspaces
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_select_owner"
ON public.workspaces
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "workspaces_select_member"
ON public.workspaces
FOR SELECT
USING (public.is_workspace_member(id, auth.uid()));

CREATE POLICY "workspaces_update_owner"
ON public.workspaces
FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete_owner"
ON public.workspaces
FOR DELETE
USING (owner_id = auth.uid());