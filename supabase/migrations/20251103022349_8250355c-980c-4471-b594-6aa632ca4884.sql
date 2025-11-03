-- Fix workspace_members RLS policies to avoid recursion and allow proper access

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can manage workspace members" ON public.workspace_members;

-- Allow workspace owners to insert members (for workspace creation)
CREATE POLICY "Workspace owners can insert members"
ON public.workspace_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_members.workspace_id
    AND owner_id = auth.uid()
  )
);

-- Allow users to view members of workspaces they belong to (non-recursive)
-- Use a security definer function to break recursion
CREATE OR REPLACE FUNCTION public.user_is_workspace_member(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id AND workspace_id = _workspace_id
  );
$$;

CREATE POLICY "Users can view workspace members"
ON public.workspace_members FOR SELECT
USING (
  public.user_is_workspace_member(auth.uid(), workspace_id)
);

-- Allow admins to manage members in their workspace
CREATE POLICY "Workspace admins can manage members"
ON public.workspace_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role = 'admin'
  )
);