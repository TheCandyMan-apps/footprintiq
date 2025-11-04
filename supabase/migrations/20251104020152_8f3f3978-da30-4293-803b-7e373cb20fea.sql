-- Retry: fix dropping existing policies using correct column name policyname
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'workspace_members'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspace_members', r.policyname);
  END LOOP;
  FOR r IN (
    SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'workspaces'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspaces', r.policyname);
  END LOOP;
END $$;

-- Recreate policies
CREATE POLICY "workspaces_select_member_or_owner"
  ON public.workspaces
  FOR SELECT
  USING (
    public.is_workspace_owner(id, auth.uid())
    OR public.is_workspace_member(id, auth.uid())
  );

CREATE POLICY "workspaces_insert_self_owner"
  ON public.workspaces
  FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
  );

CREATE POLICY "workspaces_update_owner_only"
  ON public.workspaces
  FOR UPDATE
  USING (public.is_workspace_owner(id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(id, auth.uid()));

CREATE POLICY "workspaces_delete_owner_only"
  ON public.workspaces
  FOR DELETE
  USING (public.is_workspace_owner(id, auth.uid()));

CREATE POLICY "workspace_members_select_member_or_owner"
  ON public.workspace_members
  FOR SELECT
  USING (
    public.is_workspace_owner(workspace_id, auth.uid())
    OR public.is_workspace_member(workspace_id, auth.uid())
  );

CREATE POLICY "workspace_members_insert_owner_or_admin"
  ON public.workspace_members
  FOR INSERT
  WITH CHECK (
    public.is_workspace_owner(workspace_id, auth.uid())
    OR public.has_workspace_permission(auth.uid(), workspace_id, 'admin'::public.workspace_role)
  );

CREATE POLICY "workspace_members_update_owner_or_admin"
  ON public.workspace_members
  FOR UPDATE
  USING (
    public.is_workspace_owner(workspace_id, auth.uid())
    OR public.has_workspace_permission(auth.uid(), workspace_id, 'admin'::public.workspace_role)
  )
  WITH CHECK (
    public.is_workspace_owner(workspace_id, auth.uid())
    OR public.has_workspace_permission(auth.uid(), workspace_id, 'admin'::public.workspace_role)
  );

CREATE POLICY "workspace_members_delete_owner_or_admin"
  ON public.workspace_members
  FOR DELETE
  USING (
    public.is_workspace_owner(workspace_id, auth.uid())
    OR public.has_workspace_permission(auth.uid(), workspace_id, 'admin'::public.workspace_role)
  );
