-- Add default value to stage column in scan_events to prevent insert failures
ALTER TABLE public.scan_events ALTER COLUMN stage SET DEFAULT 'complete';