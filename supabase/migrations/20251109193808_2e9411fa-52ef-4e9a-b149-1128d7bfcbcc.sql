-- Create system_audit_logs table for full codebase audits (different from workspace audit_logs)
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL,
  issues_found INTEGER NOT NULL DEFAULT 0,
  issues_fixed INTEGER NOT NULL DEFAULT 0,
  severity_breakdown JSONB NOT NULL DEFAULT '{"critical": 0, "high": 0, "medium": 0, "low": 0}'::jsonb,
  ai_summary TEXT,
  prioritized_issues JSONB DEFAULT '[]'::jsonb,
  details JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_created_at ON public.system_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_type ON public.system_audit_logs(audit_type);

-- Enable RLS
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view system audit logs
CREATE POLICY "Admins can view system audit logs"
  ON public.system_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can insert system audit logs
CREATE POLICY "Service role can insert system audit logs"
  ON public.system_audit_logs
  FOR INSERT
  WITH CHECK (true);