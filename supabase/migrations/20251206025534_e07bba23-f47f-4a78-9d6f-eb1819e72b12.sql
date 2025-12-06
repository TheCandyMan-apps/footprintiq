-- Add findings_count column to scan_events table
ALTER TABLE public.scan_events ADD COLUMN IF NOT EXISTS findings_count integer DEFAULT 0;