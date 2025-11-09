-- Create worker_status table for health monitoring
CREATE TABLE IF NOT EXISTS public.worker_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_name text UNIQUE NOT NULL,
  worker_type text NOT NULL, -- 'maigret', 'recon-ng', 'harvester', 'spiderfoot'
  status text NOT NULL DEFAULT 'unknown', -- 'online', 'offline', 'degraded', 'unknown'
  last_check_at timestamp with time zone DEFAULT now(),
  last_success_at timestamp with time zone,
  response_time_ms integer,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.worker_status ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read worker status
CREATE POLICY "Authenticated users can read worker status"
  ON public.worker_status
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only service role can write
CREATE POLICY "Service role can manage worker status"
  ON public.worker_status
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE TRIGGER update_worker_status_updated_at
  BEFORE UPDATE ON public.worker_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial worker entries
INSERT INTO public.worker_status (worker_name, worker_type, status)
VALUES 
  ('maigret', 'maigret', 'unknown'),
  ('recon-ng', 'recon-ng', 'unknown'),
  ('harvester', 'harvester', 'unknown'),
  ('spiderfoot', 'spiderfoot', 'unknown')
ON CONFLICT (worker_name) DO NOTHING;