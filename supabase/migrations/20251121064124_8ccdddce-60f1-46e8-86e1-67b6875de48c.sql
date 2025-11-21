-- Create scan_events table for detailed provider-level observability
create table if not exists public.scan_events (
  id uuid default uuid_generate_v4() primary key,
  scan_id uuid not null,
  provider text not null,
  stage text not null,
  status text,
  duration_ms integer,
  error_message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_scan_events_scan_id on public.scan_events(scan_id);
create index if not exists idx_scan_events_provider on public.scan_events(provider);
create index if not exists idx_scan_events_stage on public.scan_events(stage);
create index if not exists idx_scan_events_created_at on public.scan_events(created_at desc);

alter table public.scan_events enable row level security;

create policy "Service role can manage scan events"
  on public.scan_events for all to service_role
  using (true) with check (true);

create policy "Users can view their workspace scan events"
  on public.scan_events for select
  using (
    exists (
      select 1 from public.scans s
      inner join public.workspace_members wm on wm.workspace_id = s.workspace_id
      where s.id = scan_events.scan_id
        and wm.user_id = auth.uid()
    )
  );

comment on table public.scan_events is 'Detailed event log for scan provider execution, enabling observability and debugging';
comment on column public.scan_events.stage is 'Event stage: requested, started, completed, failed, timeout, skipped, disabled';
comment on column public.scan_events.status is 'Final status: success, failed, timeout, skipped, disabled';
comment on column public.scan_events.duration_ms is 'Provider execution duration in milliseconds';