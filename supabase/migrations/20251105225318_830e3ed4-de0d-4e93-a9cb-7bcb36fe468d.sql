-- Enable realtime for scans table
ALTER TABLE public.scans REPLICA IDENTITY FULL;

-- Add scans table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.scans;