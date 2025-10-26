-- Create sandbox_runs audit table for plugin execution tracking
CREATE TABLE IF NOT EXISTS public.sandbox_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id TEXT NOT NULL,
  artifact_type TEXT,
  latency_ms INTEGER NOT NULL,
  status TEXT NOT NULL,
  bytes_returned INTEGER DEFAULT 0,
  findings_count INTEGER DEFAULT 0,
  error_message TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sandbox_runs ENABLE ROW LEVEL SECURITY;

-- Admin can view all sandbox runs
CREATE POLICY "Admins can view all sandbox runs"
  ON public.sandbox_runs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view their own sandbox runs
CREATE POLICY "Users can view own sandbox runs"
  ON public.sandbox_runs
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert sandbox runs (service role)
CREATE POLICY "Service role can insert sandbox runs"
  ON public.sandbox_runs
  FOR INSERT
  WITH CHECK (true);

-- Add index for performance
CREATE INDEX idx_sandbox_runs_plugin_id ON public.sandbox_runs(plugin_id);
CREATE INDEX idx_sandbox_runs_created_at ON public.sandbox_runs(created_at DESC);
CREATE INDEX idx_sandbox_runs_user_id ON public.sandbox_runs(user_id);