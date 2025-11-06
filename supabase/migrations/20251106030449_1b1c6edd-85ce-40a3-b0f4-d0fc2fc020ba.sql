-- Enable realtime for scan_jobs table
ALTER TABLE public.scan_jobs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_jobs;