-- Enable required extensions for cron jobs
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- API Keys table (if not exists)
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid,
  name text not null,
  key_hash text not null, -- In production, this should be hashed
  key_prefix text not null, -- First 12 chars for display
  scopes text[] default array['scan:read', 'scan:write', 'monitoring:read', 'monitoring:write'],
  is_active boolean not null default true,
  last_used_at timestamptz,
  expires_at timestamptz,
  permissions jsonb default '{}',
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for api_keys
create index if not exists api_keys_user_id_idx on api_keys(user_id);
create index if not exists api_keys_workspace_id_idx on api_keys(workspace_id);
create index if not exists api_keys_key_prefix_idx on api_keys(key_prefix);
create index if not exists api_keys_is_active_idx on api_keys(is_active) where is_active = true;

-- RLS for api_keys
alter table api_keys enable row level security;

create policy "Users can view their own API keys"
  on api_keys for select
  using (auth.uid() = user_id);

create policy "Users can create their own API keys"
  on api_keys for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own API keys"
  on api_keys for update
  using (auth.uid() = user_id);

create policy "Users can delete their own API keys"
  on api_keys for delete
  using (auth.uid() = user_id);

-- Add indexes for performance on existing tables
create index if not exists credits_ledger_workspace_created_idx on credits_ledger(workspace_id, created_at desc);
create index if not exists darkweb_targets_workspace_active_idx on darkweb_targets(workspace_id, active) where active = true;
create index if not exists darkweb_findings_target_observed_idx on darkweb_findings(target_id, observed_at desc);

-- Function to update updated_at timestamp
create or replace function update_api_keys_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for api_keys updated_at
drop trigger if exists api_keys_updated_at on api_keys;
create trigger api_keys_updated_at
  before update on api_keys
  for each row
  execute function update_api_keys_updated_at();