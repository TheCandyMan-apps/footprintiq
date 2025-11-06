-- Create user_achievements table to track streaks and badges
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_scan_date DATE,
  total_scans INTEGER DEFAULT 0,
  total_removals INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can view their own achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own achievements
CREATE POLICY "Users can update their own achievements"
ON public.user_achievements
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own achievements
CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_user_achievements_updated_at
BEFORE UPDATE ON public.user_achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- Function to update streak on new scan
CREATE OR REPLACE FUNCTION public.update_user_streak(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_scan DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_total_scans INTEGER;
BEGIN
  -- Get or create user achievements record
  INSERT INTO public.user_achievements (user_id, total_scans)
  VALUES (_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current values
  SELECT last_scan_date, current_streak, longest_streak, total_scans
  INTO v_last_scan, v_current_streak, v_longest_streak, v_total_scans
  FROM public.user_achievements
  WHERE user_id = _user_id;
  
  -- Update streak logic
  IF v_last_scan IS NULL THEN
    -- First scan ever
    v_current_streak := 1;
  ELSIF v_last_scan = CURRENT_DATE THEN
    -- Already scanned today, no change
    RETURN;
  ELSIF v_last_scan = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Scanned yesterday, increment streak
    v_current_streak := v_current_streak + 1;
  ELSE
    -- Streak broken, reset to 1
    v_current_streak := 1;
  END IF;
  
  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;
  
  -- Update record
  UPDATE public.user_achievements
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_scan_date = CURRENT_DATE,
    total_scans = v_total_scans + 1,
    updated_at = now()
  WHERE user_id = _user_id;
END;
$$;