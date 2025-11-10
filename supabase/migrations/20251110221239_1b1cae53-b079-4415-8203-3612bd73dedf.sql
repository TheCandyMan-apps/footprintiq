-- ============================================================
-- Simple Maigret Pipeline: Results Storage Table
-- ============================================================

-- Create maigret_results table for the simplified pipeline
CREATE TABLE IF NOT EXISTS public.maigret_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL UNIQUE,
  batch_id TEXT,
  username TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed')) DEFAULT 'queued',
  summary JSONB DEFAULT '{}'::jsonb,
  raw JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_maigret_results_job_id ON public.maigret_results(job_id);
CREATE INDEX idx_maigret_results_username ON public.maigret_results(username);
CREATE INDEX idx_maigret_results_batch_id ON public.maigret_results(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_maigret_results_user_id ON public.maigret_results(user_id);
CREATE INDEX idx_maigret_results_workspace_id ON public.maigret_results(workspace_id);
CREATE INDEX idx_maigret_results_status ON public.maigret_results(status);
CREATE INDEX idx_maigret_results_created_at ON public.maigret_results(created_at DESC);

-- Enable RLS
ALTER TABLE public.maigret_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own results OR results with no user_id (anonymous)
CREATE POLICY "Users can view own results"
  ON public.maigret_results
  FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

-- RLS Policy: Service role can insert (webhook endpoint)
CREATE POLICY "Service role can insert"
  ON public.maigret_results
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policy: Service role can update
CREATE POLICY "Service role can update"
  ON public.maigret_results
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger to maintain updated_at timestamp
CREATE OR REPLACE FUNCTION update_maigret_results_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_maigret_results_updated_at
  BEFORE UPDATE ON public.maigret_results
  FOR EACH ROW
  EXECUTE FUNCTION update_maigret_results_updated_at();

-- Comment for documentation
COMMENT ON TABLE public.maigret_results IS 'Simplified Maigret pipeline results storage. Webhook writes, user reads via RLS.';