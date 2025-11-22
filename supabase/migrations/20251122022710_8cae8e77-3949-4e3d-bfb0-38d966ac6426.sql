-- Enable RLS on all tables that should have it
alter table public.scan_events enable row level security;
alter table public.credits_ledger enable row level security;
alter table public.api_keys enable row level security;
alter table public.audit_activity enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_stats enable row level security;
alter table public.system_errors enable row level security;
alter table public.workspace_rate_limits enable row level security;
alter table public.ip_rate_limits enable row level security;
alter table public.payment_errors enable row level security;
alter table public.stripe_events_processed enable row level security;

-- scan_events policies
create policy "service_role_all_scan_events" on public.scan_events for all to service_role using (true);
create policy "authenticated_read_scan_events" on public.scan_events for select to authenticated using (
  exists (
    select 1 from public.scans s
    join public.workspace_members wm on wm.workspace_id = s.workspace_id
    where s.id = scan_events.scan_id and wm.user_id = auth.uid()
  )
);

-- credits_ledger policies
create policy "service_role_all_credits_ledger" on public.credits_ledger for all to service_role using (true);
create policy "authenticated_read_credits_ledger" on public.credits_ledger for select to authenticated using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = credits_ledger.workspace_id and wm.user_id = auth.uid()
  )
);

-- api_keys policies
create policy "service_role_all_api_keys" on public.api_keys for all to service_role using (true);
create policy "authenticated_manage_api_keys" on public.api_keys for all to authenticated using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = api_keys.workspace_id and wm.user_id = auth.uid()
  )
);

-- audit_activity policies
create policy "service_role_all_audit_activity" on public.audit_activity for all to service_role using (true);
create policy "authenticated_read_audit_activity" on public.audit_activity for select to authenticated using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = audit_activity.workspace_id and wm.user_id = auth.uid()
  )
);

-- referral_codes policies
create policy "service_role_all_referral_codes" on public.referral_codes for all to service_role using (true);
create policy "authenticated_read_own_referral_codes" on public.referral_codes for select to authenticated using (user_id = auth.uid());
create policy "authenticated_insert_own_referral_codes" on public.referral_codes for insert to authenticated with check (user_id = auth.uid());

-- referrals policies
create policy "service_role_all_referrals" on public.referrals for all to service_role using (true);
create policy "authenticated_read_own_referrals" on public.referrals for select to authenticated using (
  referrer_id = auth.uid() or referee_id = auth.uid()
);

-- referral_stats policies
create policy "service_role_all_referral_stats" on public.referral_stats for all to service_role using (true);
create policy "authenticated_read_own_referral_stats" on public.referral_stats for select to authenticated using (user_id = auth.uid());

-- system_errors policies (admin only)
create policy "service_role_all_system_errors" on public.system_errors for all to service_role using (true);
create policy "admin_read_system_errors" on public.system_errors for select to authenticated using (
  exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
  )
);

-- workspace_rate_limits policies
create policy "service_role_all_workspace_rate_limits" on public.workspace_rate_limits for all to service_role using (true);
create policy "authenticated_read_workspace_rate_limits" on public.workspace_rate_limits for select to authenticated using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = workspace_rate_limits.workspace_id and wm.user_id = auth.uid()
  )
);

-- ip_rate_limits policies (service role only - no user access needed)
create policy "service_role_all_ip_rate_limits" on public.ip_rate_limits for all to service_role using (true);

-- payment_errors policies (admin only - Stripe payment errors)
create policy "service_role_all_payment_errors" on public.payment_errors for all to service_role using (true);
create policy "admin_read_payment_errors" on public.payment_errors for select to authenticated using (
  exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
  )
);

-- stripe_events_processed policies (service role only - internal tracking)
create policy "service_role_all_stripe_events_processed" on public.stripe_events_processed for all to service_role using (true);