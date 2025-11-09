-- Create system_audit_results table for comprehensive health tracking
CREATE TABLE IF NOT EXISTS public.system_audit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL, -- 'rls_check', 'provider_health', 'tier_sync', 'scan_flow', 'full_system'
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'warning')),
  component TEXT, -- e.g., 'maigret', 'spiderfoot', 'stripe', 'rls_policies'
  details JSONB DEFAULT '{}',
  failure_rate NUMERIC,
  ai_summary TEXT,
  ai_priority TEXT CHECK (ai_priority IN ('low', 'medium', 'high', 'critical')),
  recommendations TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX idx_system_audit_type_status ON public.system_audit_results(audit_type, status);
CREATE INDEX idx_system_audit_created_at ON public.system_audit_results(created_at DESC);
CREATE INDEX idx_system_audit_priority ON public.system_audit_results(ai_priority) WHERE status = 'failure';
CREATE INDEX idx_system_audit_unresolved ON public.system_audit_results(status, resolved_at) WHERE resolved_at IS NULL;

-- Enable RLS
ALTER TABLE public.system_audit_results ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admins can view all system audit results"
  ON public.system_audit_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update system audit results"
  ON public.system_audit_results
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit results"
  ON public.system_audit_results
  FOR INSERT
  WITH CHECK (true);

-- Function to get failure rate
CREATE OR REPLACE FUNCTION public.get_system_audit_failure_rate(
  _audit_type TEXT DEFAULT NULL,
  _hours_back INTEGER DEFAULT 24
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_failures INTEGER;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'failure')
  INTO v_total, v_failures
  FROM public.system_audit_results
  WHERE created_at > NOW() - (_hours_back || ' hours')::INTERVAL
    AND (_audit_type IS NULL OR audit_type = _audit_type);
  
  IF v_total = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((v_failures::NUMERIC / v_total::NUMERIC) * 100, 2);
END;
$$;