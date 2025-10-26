-- AI Chunks table for RAG
CREATE TABLE IF NOT EXISTS public.ai_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  chunk_id TEXT NOT NULL UNIQUE,
  text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Monitor runs table
CREATE TABLE IF NOT EXISTS public.monitor_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES monitoring_schedules(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  new_findings_count INTEGER DEFAULT 0,
  diff_hash TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Analyst reports table
CREATE TABLE IF NOT EXISTS public.analyst_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  entity_ids TEXT[] NOT NULL,
  report_data JSONB NOT NULL,
  confidence NUMERIC DEFAULT 0.7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ai_chunks_user_entity ON public.ai_chunks(user_id, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_chunks_chunk_id ON public.ai_chunks(chunk_id);
CREATE INDEX IF NOT EXISTS idx_monitor_runs_schedule ON public.monitor_runs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_monitor_runs_status ON public.monitor_runs(status);
CREATE INDEX IF NOT EXISTS idx_analyst_reports_user ON public.analyst_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analyst_reports_case ON public.analyst_reports(case_id);

-- RLS policies
ALTER TABLE public.ai_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitor_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyst_reports ENABLE ROW LEVEL SECURITY;

-- AI Chunks policies
CREATE POLICY "Users can manage own AI chunks"
  ON public.ai_chunks
  FOR ALL
  USING (auth.uid() = user_id);

-- Monitor runs policies  
CREATE POLICY "Users can view own monitor runs"
  ON public.monitor_runs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM monitoring_schedules 
    WHERE monitoring_schedules.id = monitor_runs.schedule_id 
    AND monitoring_schedules.user_id = auth.uid()
  ));

-- Analyst reports policies
CREATE POLICY "Users can manage own analyst reports"
  ON public.analyst_reports
  FOR ALL
  USING (auth.uid() = user_id);