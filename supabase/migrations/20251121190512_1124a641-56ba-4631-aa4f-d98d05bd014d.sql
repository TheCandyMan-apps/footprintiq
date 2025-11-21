-- Create audit_activity table for enterprise compliance logging
create table if not exists public.audit_activity (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.audit_activity enable row level security;

-- Service role full access
create policy "Service role full access"
on public.audit_activity for all to service_role
using (true) with check (true);

-- Workspace members can read audit logs
create policy "Workspace members read"
on public.audit_activity for select
to authenticated
using (
  workspace_id in (
    select workspace_id from public.workspace_members
    where user_id = auth.uid()
  )
);

-- Create index for performance
create index if not exists idx_audit_activity_workspace on public.audit_activity(workspace_id, created_at desc);
create index if not exists idx_audit_activity_action on public.audit_activity(action);