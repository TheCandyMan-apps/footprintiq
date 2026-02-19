
-- Allow anonymous scans by making user_id nullable in scans table
ALTER TABLE public.scans ALTER COLUMN user_id DROP NOT NULL;
