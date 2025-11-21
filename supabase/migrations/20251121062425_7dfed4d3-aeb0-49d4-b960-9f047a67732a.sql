-- Enable RLS on stripe_events_processed table
alter table public.stripe_events_processed enable row level security;

-- Create policy to allow service role to manage events (webhooks run with service role)
create policy "Service role can manage stripe events"
  on public.stripe_events_processed
  for all
  to service_role
  using (true)
  with check (true);