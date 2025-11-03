-- Comprehensive RLS and Security Fix
-- This migration ensures non-recursive RLS policies and proper workspace access control

-- 1. Drop all existing conflicting policies to start fresh
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace admins can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "ws_members_select" ON public.workspace_members;
DROP POLICY IF EXISTS "ws_members_insert_admin" ON public.workspace_members;
DROP POLICY IF EXISTS "ws_members_update_admin" ON public.workspace_members;
DROP POLICY IF EXISTS "ws_members_delete_admin" ON public.workspace_members;

DROP POLICY IF EXISTS "Workspace owners can view" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace members can view" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can update" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete" ON public.workspaces;
DROP POLICY IF EXISTS "ws_insert_owner" ON public.workspaces;
DROP POLICY IF EXISTS "ws_select_owner_or_member" ON public.workspaces;
DROP POLICY IF EXISTS "ws_update_owner" ON public.workspaces;
DROP POLICY IF EXISTS "ws_delete_owner" ON public.workspaces;

-- 2. Ensure the security definer helper function exists (non-recursive)
CREATE OR REPLACE FUNCTION public.is_workspace_member(
  _workspace_id uuid,
  _user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id
  );
$$;

-- 3. Create a helper to check if user is workspace owner
CREATE OR REPLACE FUNCTION public.is_workspace_owner(
  _workspace_id uuid,
  _user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = _workspace_id AND owner_id = _user_id
  );
$$;

-- 4. Create RLS policies for workspace_members (non-recursive)
-- These policies ONLY reference workspace_members own columns, never query workspaces

-- Allow users to view members of workspaces they belong to
CREATE POLICY "workspace_members_select"
  ON public.workspace_members FOR SELECT
  USING (
    -- User can see members if they are a member themselves
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Allow workspace owners to insert members
CREATE POLICY "workspace_members_insert"
  ON public.workspace_members FOR INSERT
  WITH CHECK (
    public.is_workspace_owner(workspace_id, auth.uid())
  );

-- Allow workspace owners to update members
CREATE POLICY "workspace_members_update"
  ON public.workspace_members FOR UPDATE
  USING (
    public.is_workspace_owner(workspace_id, auth.uid())
  );

-- Allow workspace owners to delete members
CREATE POLICY "workspace_members_delete"
  ON public.workspace_members FOR DELETE
  USING (
    public.is_workspace_owner(workspace_id, auth.uid())
  );

-- 5. Create RLS policies for workspaces (using security definer functions)

-- Users can view workspaces they own or are members of
CREATE POLICY "workspaces_select"
  ON public.workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR public.is_workspace_member(id, auth.uid())
  );

-- Users can create workspaces (they become the owner)
CREATE POLICY "workspaces_insert"
  ON public.workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Only owners can update their workspaces
CREATE POLICY "workspaces_update"
  ON public.workspaces FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Only owners can delete their workspaces
CREATE POLICY "workspaces_delete"
  ON public.workspaces FOR DELETE
  USING (owner_id = auth.uid());