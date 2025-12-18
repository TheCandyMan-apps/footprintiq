-- First, ensure the rate_limits table has the required columns
ALTER TABLE public.rate_limits 
ADD COLUMN IF NOT EXISTS limit_per_window INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS current_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_requests BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_blocked BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_request_at TIMESTAMPTZ;

-- Add unique constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rate_limits_identifier_type_endpoint_key'
  ) THEN
    ALTER TABLE public.rate_limits 
    ADD CONSTRAINT rate_limits_identifier_type_endpoint_key 
    UNIQUE (identifier, identifier_type, endpoint);
  END IF;
EXCEPTION WHEN others THEN
  -- Constraint might already exist under different name, ignore
  NULL;
END $$;

-- Create the check_rate_limit RPC function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_seconds INTEGER DEFAULT 3600
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_current_count INTEGER;
  v_record_window_start TIMESTAMPTZ;
BEGIN
  -- Calculate window boundary
  v_window_start := NOW() - (p_window_seconds || ' seconds')::INTERVAL;
  
  -- Upsert rate limit record
  INSERT INTO public.rate_limits (
    identifier, 
    identifier_type, 
    endpoint, 
    limit_per_window, 
    window_seconds, 
    current_count, 
    window_start, 
    last_request_at,
    created_at,
    updated_at
  )
  VALUES (
    p_identifier, 
    p_identifier_type, 
    p_endpoint, 
    p_max_requests, 
    p_window_seconds, 
    0, 
    NOW(), 
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (identifier, identifier_type, endpoint) 
  DO UPDATE SET 
    -- Reset counter if window expired
    current_count = CASE 
      WHEN rate_limits.window_start < v_window_start THEN 0 
      ELSE rate_limits.current_count 
    END,
    window_start = CASE 
      WHEN rate_limits.window_start < v_window_start THEN NOW() 
      ELSE rate_limits.window_start 
    END,
    last_request_at = NOW(),
    updated_at = NOW();
  
  -- Get current state
  SELECT rl.current_count, rl.window_start 
  INTO v_current_count, v_record_window_start
  FROM public.rate_limits rl
  WHERE rl.identifier = p_identifier 
    AND rl.identifier_type = p_identifier_type 
    AND rl.endpoint = p_endpoint;
  
  -- Check if under limit
  IF v_current_count < p_max_requests THEN
    -- Increment counter
    UPDATE public.rate_limits rl
    SET current_count = rl.current_count + 1,
        total_requests = COALESCE(rl.total_requests, 0) + 1,
        updated_at = NOW()
    WHERE rl.identifier = p_identifier 
      AND rl.identifier_type = p_identifier_type 
      AND rl.endpoint = p_endpoint;
    
    RETURN QUERY SELECT 
      TRUE::BOOLEAN as allowed,
      (p_max_requests - v_current_count - 1)::INTEGER as remaining,
      (v_record_window_start + (p_window_seconds || ' seconds')::INTERVAL)::TIMESTAMPTZ as reset_at;
  ELSE
    -- Rate limited - increment blocked counter
    UPDATE public.rate_limits rl
    SET total_blocked = COALESCE(rl.total_blocked, 0) + 1,
        updated_at = NOW()
    WHERE rl.identifier = p_identifier 
      AND rl.identifier_type = p_identifier_type 
      AND rl.endpoint = p_endpoint;
    
    RETURN QUERY SELECT 
      FALSE::BOOLEAN as allowed,
      0::INTEGER as remaining,
      (v_record_window_start + (p_window_seconds || ' seconds')::INTERVAL)::TIMESTAMPTZ as reset_at;
  END IF;
END;
$$;