
-- Enable realtime for findings table
ALTER TABLE public.findings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.findings;
