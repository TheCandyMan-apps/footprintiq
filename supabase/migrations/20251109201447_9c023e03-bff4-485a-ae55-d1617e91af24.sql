-- Create referral codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  uses INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create referrals table to track who referred whom
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, rewarded
  referrer_reward_credits INTEGER DEFAULT 0,
  referee_reward_credits INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  rewarded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(referee_id) -- Each user can only be referred once
);

-- Create referral stats table for aggregated data
CREATE TABLE IF NOT EXISTS public.referral_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  pending_referrals INTEGER DEFAULT 0,
  total_credits_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON public.referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for referrals
CREATE POLICY "Users can view referrals they're involved in"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- RLS Policies for referral_stats
CREATE POLICY "Users can view their own stats"
  ON public.referral_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
  v_counter INTEGER := 0;
BEGIN
  LOOP
    -- Generate code: first 3 letters of email + 6 random chars
    v_code := UPPER(
      SUBSTRING(
        (SELECT email FROM auth.users WHERE id = _user_id),
        1, 3
      ) || 
      SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 6)
    );
    
    -- Check if code exists
    SELECT EXISTS (
      SELECT 1 FROM public.referral_codes WHERE code = v_code
    ) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
    
    v_counter := v_counter + 1;
    IF v_counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique referral code';
    END IF;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- Function to update referral stats
CREATE OR REPLACE FUNCTION public.update_referral_stats(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_successful INTEGER;
  v_pending INTEGER;
  v_credits INTEGER;
BEGIN
  -- Count referrals
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'rewarded'),
    COUNT(*) FILTER (WHERE status = 'pending')
  INTO v_total, v_successful, v_pending
  FROM public.referrals
  WHERE referrer_id = _user_id;
  
  -- Sum credits earned
  SELECT COALESCE(SUM(referrer_reward_credits), 0)
  INTO v_credits
  FROM public.referrals
  WHERE referrer_id = _user_id AND status = 'rewarded';
  
  -- Insert or update stats
  INSERT INTO public.referral_stats (
    user_id,
    total_referrals,
    successful_referrals,
    pending_referrals,
    total_credits_earned,
    updated_at
  )
  VALUES (
    _user_id,
    v_total,
    v_successful,
    v_pending,
    v_credits,
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_referrals = v_total,
    successful_referrals = v_successful,
    pending_referrals = v_pending,
    total_credits_earned = v_credits,
    updated_at = now();
END;
$$;

-- Function to process referral reward
CREATE OR REPLACE FUNCTION public.process_referral_reward(_referral_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral RECORD;
  v_referrer_workspace UUID;
  v_referee_workspace UUID;
BEGIN
  -- Get referral details
  SELECT * INTO v_referral
  FROM public.referrals
  WHERE id = _referral_id;
  
  IF NOT FOUND OR v_referral.status = 'rewarded' THEN
    RETURN FALSE;
  END IF;
  
  -- Get workspaces
  SELECT id INTO v_referrer_workspace
  FROM public.workspaces
  WHERE owner_id = v_referral.referrer_id
  LIMIT 1;
  
  SELECT id INTO v_referee_workspace
  FROM public.workspaces
  WHERE owner_id = v_referral.referee_id
  LIMIT 1;
  
  -- Award credits to referrer (100 credits)
  IF v_referrer_workspace IS NOT NULL THEN
    INSERT INTO public.credits_ledger (workspace_id, delta, reason, meta)
    VALUES (
      v_referrer_workspace,
      100,
      'Referral reward',
      jsonb_build_object(
        'referral_id', v_referral.id,
        'referee_id', v_referral.referee_id
      )
    );
  END IF;
  
  -- Award credits to referee (50 credits)
  IF v_referee_workspace IS NOT NULL THEN
    INSERT INTO public.credits_ledger (workspace_id, delta, reason, meta)
    VALUES (
      v_referee_workspace,
      50,
      'Referral signup bonus',
      jsonb_build_object(
        'referral_id', v_referral.id,
        'referrer_id', v_referral.referrer_id
      )
    );
  END IF;
  
  -- Update referral status
  UPDATE public.referrals
  SET 
    status = 'rewarded',
    referrer_reward_credits = 100,
    referee_reward_credits = 50,
    rewarded_at = now()
  WHERE id = _referral_id;
  
  -- Update stats
  PERFORM public.update_referral_stats(v_referral.referrer_id);
  
  RETURN TRUE;
END;
$$;

-- Trigger to auto-process referral when referee completes first scan
CREATE OR REPLACE FUNCTION public.check_referral_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_id UUID;
  v_referee_id UUID;
BEGIN
  -- Check if this is first completed scan for user
  SELECT owner_id INTO v_referee_id
  FROM public.workspaces
  WHERE id = NEW.workspace_id;
  
  IF v_referee_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if user was referred and hasn't been rewarded yet
  SELECT id INTO v_referral_id
  FROM public.referrals
  WHERE referee_id = v_referee_id
    AND status = 'pending'
  LIMIT 1;
  
  IF v_referral_id IS NOT NULL THEN
    -- Mark as completed
    UPDATE public.referrals
    SET 
      status = 'completed',
      completed_at = now()
    WHERE id = v_referral_id;
    
    -- Process reward
    PERFORM public.process_referral_reward(v_referral_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on scan_jobs table
CREATE TRIGGER referral_completion_check
  AFTER UPDATE ON public.scan_jobs
  FOR EACH ROW
  WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
  EXECUTE FUNCTION public.check_referral_completion();