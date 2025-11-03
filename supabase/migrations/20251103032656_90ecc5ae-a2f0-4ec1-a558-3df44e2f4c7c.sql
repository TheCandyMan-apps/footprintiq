-- Fix RLS recursion and allow workspace usage
-- 1) Ensure helper exists (signature matches existing function)
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
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = _workspace_id
      AND user_id = _user_id
  );
$$;

-- 2) Reset policies on workspace_members to only reference its own columns
DO $$
DECLARE p record;
BEGIN
  FOR p IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'workspace_members'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspace_members;', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY wm_select_own
  ON public.workspace_members
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY wm_insert_self
  ON public.workspace_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY wm_update_self
  ON public.workspace_members
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY wm_delete_self
  ON public.workspace_members
  FOR DELETE
  USING (user_id = auth.uid());

-- 3) Reset policies on workspaces to avoid recursion and use helper
DO $$
DECLARE p record;
BEGIN
  FOR p IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'workspaces'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspaces;', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY ws_insert_owner
  ON public.workspaces
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY ws_select_owner_or_member
  ON public.workspaces
  FOR SELECT
  USING (
    owner_id = auth.uid() OR public.is_workspace_member(id, auth.uid())
  );

CREATE POLICY ws_update_owner
  ON public.workspaces
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY ws_delete_owner
  ON public.workspaces
  FOR DELETE
  USING (owner_id = auth.uid());