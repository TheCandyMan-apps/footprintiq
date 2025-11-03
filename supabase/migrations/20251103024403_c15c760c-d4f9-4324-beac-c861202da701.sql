-- Resolve infinite recursion in workspace_members policies by removing any policy that references
-- workspace_members (directly or via helper functions) and consolidating to owner-based checks.

-- 1) Drop problematic or duplicate policies
DROP POLICY IF EXISTS "Workspace owners can insert members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can manage members (safe)" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can view their membership rows" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners can view membership rows" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners can manage members" ON public.workspace_members;

-- 2) Ensure helper exists and is SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_workspace_owner(_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = _workspace_id AND owner_id = auth.uid()
  );
$$;

-- 3) Recreate safe policies that DO NOT reference workspace_members from within its own policy
-- Allow each user to read their own rows
CREATE POLICY "Users can view their membership rows"
ON public.workspace_members
FOR SELECT
USING (user_id = auth.uid());

-- Allow workspace owners to read all members of their workspace
CREATE POLICY "Owners can view membership rows"
ON public.workspace_members
FOR SELECT
USING (public.is_workspace_owner(workspace_id));

-- Allow workspace owners to manage (insert/update/delete) members of their workspace
CREATE POLICY "Owners can manage members"
ON public.workspace_members
FOR ALL
USING (public.is_workspace_owner(workspace_id))
WITH CHECK (public.is_workspace_owner(workspace_id));