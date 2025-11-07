-- Create ai_filter_logs table to track AI filtering improvements
CREATE TABLE IF NOT EXISTS public.ai_filter_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'grok' or 'openai'
  original_count INTEGER NOT NULL,
  filtered_count INTEGER NOT NULL,
  removed_count INTEGER NOT NULL,
  confidence_improvement NUMERIC(5,2),
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_filter_logs ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own logs
CREATE POLICY "Users can view own ai filter logs"
  ON public.ai_filter_logs
  FOR SELECT
  USING (
    scan_id IN (
      SELECT id FROM public.scans WHERE user_id = auth.uid()
    )
  );

-- Index for performance
CREATE INDEX idx_ai_filter_logs_scan_id ON public.ai_filter_logs(scan_id);
CREATE INDEX idx_ai_filter_logs_created_at ON public.ai_filter_logs(created_at DESC);