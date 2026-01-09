-- Create table for worker health check logs
CREATE TABLE public.worker_health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_name TEXT NOT NULL,
  worker_url TEXT,
  status TEXT NOT NULL,
  healthy BOOLEAN NOT NULL DEFAULT false,
  response_time_ms INTEGER,
  tools_status JSONB,
  error_message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_worker_health_logs_worker_name ON public.worker_health_logs(worker_name);
CREATE INDEX idx_worker_health_logs_checked_at ON public.worker_health_logs(checked_at DESC);
CREATE INDEX idx_worker_health_logs_healthy ON public.worker_health_logs(healthy);

-- Enable RLS
ALTER TABLE public.worker_health_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view health logs
CREATE POLICY "Authenticated users can view health logs"
ON public.worker_health_logs
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow service role to insert (for edge function with callback token)
CREATE POLICY "Service role can insert health logs"
ON public.worker_health_logs
FOR INSERT
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.worker_health_logs IS 'Stores health check results from n8n monitoring workflow';