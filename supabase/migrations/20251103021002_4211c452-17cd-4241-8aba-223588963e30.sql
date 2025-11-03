-- Fix RLS recursion between workspaces and workspace_members by using SECURITY DEFINER helpers
-- and simplifying policies to avoid cross-table subqueries in policies

-- 1) Helper to check ownership without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_workspace_owner(_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = _workspace_id AND owner_id = auth.uid()
  );
$$;

-- 2) Clean up problematic policies (drop if they exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'workspaces' AND policyname = 'Users can view workspaces they belong to'
  ) THEN
    DROP POLICY "Users can view workspaces they belong to" ON public.workspaces;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'workspace_members' AND policyname = 'Owners can manage members'
  ) THEN
    DROP POLICY "Owners can manage members" ON public.workspace_members;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'workspace_members' AND policyname = 'Members can view workspace members'
  ) THEN
    DROP POLICY "Members can view workspace members" ON public.workspace_members;
  END IF;
END $$;

-- 3) Recreate safe policies that avoid recursion
-- Workspaces: allow owners or any member (via helper) to SELECT
CREATE POLICY "Members can view their workspaces"
  ON public.workspaces
  FOR SELECT
  USING (
    auth.uid() = owner_id
    OR public.has_workspace_permission(auth.uid(), id, 'viewer'::public.workspace_role)
  );

-- Workspace members: allow users to SELECT their own membership rows
CREATE POLICY "Users can view their membership rows"
  ON public.workspace_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Workspace members: allow admins (via helper) to manage members
CREATE POLICY "Admins can manage members (safe)"
  ON public.workspace_members
  FOR ALL
  USING (public.has_workspace_permission(auth.uid(), workspace_id, 'admin'::public.workspace_role))
  WITH CHECK (public.has_workspace_permission(auth.uid(), workspace_id, 'admin'::public.workspace_role));

-- Workspace members: allow owners (via helper) to manage members without referencing workspaces directly
CREATE POLICY "Owners can manage members (safe)"
  ON public.workspace_members
  FOR ALL
  USING (public.is_workspace_owner(workspace_id))
  WITH CHECK (public.is_workspace_owner(workspace_id));