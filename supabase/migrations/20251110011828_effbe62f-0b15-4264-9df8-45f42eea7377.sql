-- Create worker_health_checks table for tracking Maigret worker health
CREATE TABLE IF NOT EXISTS public.worker_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'failed', 'degraded')),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.worker_health_checks ENABLE ROW LEVEL SECURITY;

-- Admin can view all health checks
CREATE POLICY "Admins can view all health checks"
  ON public.worker_health_checks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Allow service role to insert health checks
CREATE POLICY "Service role can insert health checks"
  ON public.worker_health_checks
  FOR INSERT
  WITH CHECK (true);

-- Create index for efficient queries
CREATE INDEX idx_worker_health_checks_worker_name ON public.worker_health_checks(worker_name);
CREATE INDEX idx_worker_health_checks_created_at ON public.worker_health_checks(created_at DESC);

-- Comment
COMMENT ON TABLE public.worker_health_checks IS 'Tracks health check results for external workers like Maigret API';
