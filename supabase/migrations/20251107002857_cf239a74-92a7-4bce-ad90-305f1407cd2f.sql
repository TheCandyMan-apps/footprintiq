-- Drop the existing preferences table
DROP TABLE IF EXISTS public.user_ai_preferences;

-- Create user_preferences table matching your schema but with secure models
CREATE TABLE public.user_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  ai_preferred_model TEXT DEFAULT 'gemini' CHECK (ai_preferred_model IN ('gemini', 'gpt'))
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences"
ON public.user_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.user_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.user_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create ai_logs table for tracking usage
CREATE TABLE public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  prompt_length INTEGER NOT NULL,
  response_length INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on ai_logs
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_logs
CREATE POLICY "Users can view own logs"
ON public.ai_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert logs"
ON public.ai_logs
FOR INSERT
TO authenticated
WITH CHECK (true);