-- Create table to track processed Stripe events for idempotency
create table if not exists public.stripe_events_processed (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

-- Create index for faster lookups
create index if not exists idx_stripe_events_processed_at on public.stripe_events_processed(processed_at);

-- Add comment
comment on table public.stripe_events_processed is 'Tracks processed Stripe webhook events to prevent duplicate processing';