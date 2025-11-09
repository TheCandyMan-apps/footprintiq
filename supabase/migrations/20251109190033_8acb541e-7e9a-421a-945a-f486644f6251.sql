-- Create audit_suite_runs table
CREATE TABLE IF NOT EXISTS public.audit_suite_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by UUID REFERENCES auth.users(id),
  total_tests INTEGER NOT NULL DEFAULT 0,
  passed INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  warnings INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC(5,2),
  duration_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create audit_results table
CREATE TABLE IF NOT EXISTS public.audit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_suite_run_id UUID NOT NULL REFERENCES public.audit_suite_runs(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'warning')),
  duration_ms INTEGER,
  error_message TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_suite_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_suite_runs (admin only)
CREATE POLICY "Admins can view all audit runs"
  ON public.audit_suite_runs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert audit runs"
  ON public.audit_suite_runs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update audit runs"
  ON public.audit_suite_runs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for audit_results (admin only)
CREATE POLICY "Admins can view all audit results"
  ON public.audit_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert audit results"
  ON public.audit_results
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_audit_suite_runs_created_at ON public.audit_suite_runs(created_at DESC);
CREATE INDEX idx_audit_suite_runs_status ON public.audit_suite_runs(status);
CREATE INDEX idx_audit_results_suite_run_id ON public.audit_results(test_suite_run_id);
CREATE INDEX idx_audit_results_status ON public.audit_results(status);
CREATE INDEX idx_audit_results_category ON public.audit_results(test_category);