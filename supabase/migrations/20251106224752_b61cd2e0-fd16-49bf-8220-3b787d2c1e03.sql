-- Enable realtime for darkweb_findings table
ALTER TABLE public.darkweb_findings REPLICA IDENTITY FULL;

-- Add the table to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.darkweb_findings;