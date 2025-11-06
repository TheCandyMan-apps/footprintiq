-- Enable realtime for scan results and findings
ALTER TABLE public.scan_results REPLICA IDENTITY FULL;
ALTER TABLE public.scan_findings REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_findings;