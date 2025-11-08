-- Enable Realtime for credits_ledger table
ALTER TABLE public.credits_ledger REPLICA IDENTITY FULL;

-- Add credits_ledger to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.credits_ledger;