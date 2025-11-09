-- Enable full replica identity for scans table to capture all row data in realtime updates
ALTER TABLE public.scans REPLICA IDENTITY FULL;