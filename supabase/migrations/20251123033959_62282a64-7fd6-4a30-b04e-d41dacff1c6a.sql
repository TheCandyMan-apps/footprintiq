
-- Add gosearch_pending flag to scans table for async GoSearch tracking
alter table public.scans
  add column if not exists gosearch_pending boolean not null default false;

-- Add comment for documentation
comment on column public.scans.gosearch_pending is 'True when GoSearch is running asynchronously and results are pending';
