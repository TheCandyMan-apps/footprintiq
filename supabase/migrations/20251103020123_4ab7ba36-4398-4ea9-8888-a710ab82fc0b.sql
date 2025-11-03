-- Add policies so owners can view their workspaces and manage members
DO $$
BEGIN
  -- Allow owners to view their own workspaces
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'workspaces' AND policyname = 'Owners can view their workspaces'
  ) THEN
    CREATE POLICY "Owners can view their workspaces"
      ON public.workspaces FOR SELECT
      USING (auth.uid() = owner_id);
  END IF;

  -- Allow owners to manage workspace members (insert/update/delete/select)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'workspace_members' AND policyname = 'Owners can manage members'
  ) THEN
    CREATE POLICY "Owners can manage members"
      ON public.workspace_members FOR ALL
      USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()))
      WITH CHECK (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));
  END IF;
END$$;