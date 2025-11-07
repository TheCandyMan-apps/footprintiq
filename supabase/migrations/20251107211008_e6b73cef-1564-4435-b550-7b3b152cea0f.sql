-- Add columns to feedback table for false positive tracking
ALTER TABLE public.feedback
ADD COLUMN IF NOT EXISTS item_type TEXT,
ADD COLUMN IF NOT EXISTS item_id UUID,
ADD COLUMN IF NOT EXISTS item_name TEXT,
ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_reviewed ON public.feedback(reviewed);
CREATE INDEX IF NOT EXISTS idx_feedback_item_type ON public.feedback(item_type);

-- Create ml_training_results table
CREATE TABLE IF NOT EXISTS public.ml_training_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_version TEXT NOT NULL,
  training_type TEXT NOT NULL,
  samples_processed INTEGER NOT NULL,
  accuracy DECIMAL(5,2),
  patterns JSONB,
  trained_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ml_training_results
ALTER TABLE public.ml_training_results ENABLE ROW LEVEL SECURITY;

-- Admin can view all training results
CREATE POLICY "Admins can view ML training results"
ON public.ml_training_results
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Service role can insert training results
CREATE POLICY "Service role can insert training results"
ON public.ml_training_results
FOR INSERT
TO service_role
WITH CHECK (true);

COMMENT ON TABLE public.ml_training_results IS 'Stores ML model training results and patterns detected from user feedback';