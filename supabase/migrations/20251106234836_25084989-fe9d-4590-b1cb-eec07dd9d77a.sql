-- Create ai_insights table to store AI-generated security insights
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.scan_jobs(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('risk', 'action', 'success')),
  message TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  actions JSONB DEFAULT '[]'::jsonb,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_job_id ON public.ai_insights(job_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON public.ai_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dismissed ON public.ai_insights(user_id, dismissed_at) WHERE dismissed_at IS NULL;

-- Enable Row Level Security
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own insights"
  ON public.ai_insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights"
  ON public.ai_insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON public.ai_insights
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert insights for users"
  ON public.ai_insights
  FOR INSERT
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.ai_insights IS 'Stores AI-generated security insights for user scans with dismissal tracking';