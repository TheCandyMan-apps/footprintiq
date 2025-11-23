-- Add cache columns to scans table for 7-day username scan caching
alter table public.scans
  add column if not exists cache_key text,
  add column if not exists cached_from_scan_id uuid references public.scans(id) on delete set null;

-- Index for fast cache lookups
create index if not exists scans_cache_key_created_at_idx
  on public.scans(cache_key, created_at desc);