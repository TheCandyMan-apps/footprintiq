
-- Fix 1: Block direct SELECT on api_keys table for non-service-role users
-- Client code already uses api_keys_safe view; this prevents key_hash exposure
DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can view their own API keys" ON public.api_keys;

-- Also tighten INSERT/UPDATE/DELETE to authenticated role and deduplicate
DROP POLICY IF EXISTS "Users can create own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can create their own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can update own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can update their own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can delete own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can delete their own API keys" ON public.api_keys;

-- Recreate clean policies (no direct SELECT - use api_keys_safe view instead)
CREATE POLICY "Users can insert own API keys" ON public.api_keys
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON public.api_keys
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON public.api_keys
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Fix 2: Set search_path on finalize_scan_if_complete to prevent search path injection
CREATE OR REPLACE FUNCTION public.finalize_scan_if_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  v_scan_type text;
  v_scan_started_at timestamptz;
  v_expected_providers integer;
  v_started_count integer;
  v_completed_count integer;
  v_total_findings integer;
  v_min_wait_seconds integer := 120;
BEGIN
  IF NEW.stage IS DISTINCT FROM 'complete' THEN
    RETURN NEW;
  END IF;

  SELECT scan_type, started_at
    INTO v_scan_type, v_scan_started_at
  FROM public.scans
  WHERE id = NEW.scan_id;

  CASE v_scan_type
    WHEN 'username' THEN v_expected_providers := 4;
    WHEN 'email' THEN v_expected_providers := 2;
    WHEN 'phone' THEN v_expected_providers := 1;
    WHEN 'personal_details' THEN v_expected_providers := 3;
    ELSE v_expected_providers := 2;
  END CASE;

  SELECT count(DISTINCT provider)
    INTO v_started_count
  FROM public.scan_events
  WHERE scan_id = NEW.scan_id
    AND stage = 'start';

  IF v_started_count IS NULL OR v_started_count = 0 THEN
    RETURN NEW;
  END IF;

  SELECT count(DISTINCT provider)
    INTO v_completed_count
  FROM public.scan_events
  WHERE scan_id = NEW.scan_id
    AND stage = 'complete'
    AND status IN ('completed', 'failed', 'timeout', 'not_configured');

  IF v_completed_count < v_expected_providers THEN
    IF v_scan_started_at IS NOT NULL AND 
       (now() - v_scan_started_at) < (v_min_wait_seconds || ' seconds')::interval THEN
      RETURN NEW;
    END IF;
    
    IF v_completed_count < v_started_count THEN
      RETURN NEW;
    END IF;
  END IF;

  SELECT COALESCE(sum(COALESCE(se.findings_count, 0)), 0)
    INTO v_total_findings
  FROM (
    SELECT DISTINCT ON (provider)
      provider,
      findings_count,
      created_at
    FROM public.scan_events
    WHERE scan_id = NEW.scan_id
      AND stage = 'complete'
    ORDER BY provider, created_at DESC
  ) se;

  UPDATE public.scans
  SET
    status = CASE WHEN v_total_findings = 0 THEN 'completed_empty' ELSE 'completed' END,
    completed_at = COALESCE(completed_at, now()),
    provider_counts = COALESCE(provider_counts, '{}'::jsonb) || jsonb_build_object('findings_total', v_total_findings)
  WHERE id = NEW.scan_id
    AND status = 'running';

  RETURN NEW;
END;
$function$;
