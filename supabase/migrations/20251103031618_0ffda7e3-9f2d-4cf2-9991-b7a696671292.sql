-- Break recursive RLS between workspaces and workspace_members by simplifying workspace_members policies
-- to only reference its own columns and moving membership checks into a helper function used by workspaces.

-- 1) Helper: check if a user is a member of a workspace (SECURITY DEFINER to avoid recursion)
create or replace function public.is_workspace_member(
  _workspace_id uuid,
  _user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = _workspace_id
      and user_id = _user_id
  );
$$;

-- 2) Drop ALL existing policies on workspace_members and recreate safe ones
-- Use dynamic SQL to drop any existing policies regardless of name
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

-- Ensure RLS is enabled
alter table public.workspace_members enable row level security;

-- Only allow users to view and manage their own membership rows (no cross-table references)
create policy "wm_select_own"
  on public.workspace_members
  for select
  using (user_id = auth.uid());

create policy "wm_insert_self"
  on public.workspace_members
  for insert
  with check (user_id = auth.uid());

create policy "wm_update_self"
  on public.workspace_members
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "wm_delete_self"
  on public.workspace_members
  for delete
  using (user_id = auth.uid());

-- 3) Reset policies on workspaces to avoid referencing workspace_members directly in workspace_members policies
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

-- Ensure RLS is enabled on workspaces
alter table public.workspaces enable row level security;

-- Allow users to create workspaces they own
create policy "ws_insert_owner"
  on public.workspaces
  for insert
  with check (owner_id = auth.uid());

-- Allow users to view workspaces they own or are members of
create policy "ws_select_owner_or_member"
  on public.workspaces
  for select
  using (
    owner_id = auth.uid() OR public.is_workspace_member(id, auth.uid())
  );

-- Allow only owners to update/delete their workspaces
create policy "ws_update_owner"
  on public.workspaces
  for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "ws_delete_owner"
  on public.workspaces
  for delete
  using (owner_id = auth.uid());
