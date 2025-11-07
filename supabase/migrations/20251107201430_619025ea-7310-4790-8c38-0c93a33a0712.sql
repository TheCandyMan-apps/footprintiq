-- Create feedback table for false positive reporting
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  finding_type TEXT NOT NULL, -- 'data_source' or 'social_profile'
  finding_id UUID NOT NULL,
  finding_name TEXT NOT NULL,
  confidence_score NUMERIC(5,2),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can only see and create their own feedback
CREATE POLICY "Users can view own feedback"
  ON public.feedback
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_feedback_scan_id ON public.feedback(scan_id);
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_feedback_finding_id ON public.feedback(finding_id);

-- Add confidence_score to data_sources table
ALTER TABLE public.data_sources
ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(5,2) DEFAULT 75.00;

-- Add confidence_score to social_profiles table
ALTER TABLE public.social_profiles
ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(5,2) DEFAULT 85.00;