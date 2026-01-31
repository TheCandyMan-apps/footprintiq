-- Fix race condition: Only finalize after ALL expected providers have completed
-- The n8n workflow runs: sherlock -> gosearch -> maigret -> holehe (sequential)
-- We need to wait for all of them before finalizing

CREATE OR REPLACE FUNCTION public.finalize_scan_if_complete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_scan_type text;
  v_scan_started_at timestamptz;
  v_expected_providers integer;
  v_started_count integer;
  v_completed_count integer;
  v_total_findings integer;
  v_min_wait_seconds integer := 120; -- Wait at least 2 minutes before allowing early finalization
BEGIN
  -- Only attempt finalization on provider completion events
  IF NEW.stage IS DISTINCT FROM 'complete' THEN
    RETURN NEW;
  END IF;

  -- Get scan metadata
  SELECT scan_type, started_at
    INTO v_scan_type, v_scan_started_at
  FROM public.scans
  WHERE id = NEW.scan_id;

  -- Determine expected providers based on scan type
  -- username scans: sherlock, gosearch, maigret, holehe (4)
  -- email scans: holehe, hibp (2)
  -- phone scans: phoneinfoga (1)
  -- personal_details: depends on available data (2-4)
  CASE v_scan_type
    WHEN 'username' THEN v_expected_providers := 4;
    WHEN 'email' THEN v_expected_providers := 2;
    WHEN 'phone' THEN v_expected_providers := 1;
    WHEN 'personal_details' THEN v_expected_providers := 3;
    ELSE v_expected_providers := 2;
  END CASE;

  -- Count providers that have started
  SELECT count(DISTINCT provider)
    INTO v_started_count
  FROM public.scan_events
  WHERE scan_id = NEW.scan_id
    AND stage = 'start';

  -- If nothing has started yet, nothing to finalize
  IF v_started_count IS NULL OR v_started_count = 0 THEN
    RETURN NEW;
  END IF;

  -- Count providers that have reached a terminal state
  SELECT count(DISTINCT provider)
    INTO v_completed_count
  FROM public.scan_events
  WHERE scan_id = NEW.scan_id
    AND stage = 'complete'
    AND status IN ('completed', 'failed', 'timeout', 'not_configured');

  -- CRITICAL FIX: Don't finalize until we have at least the expected number of providers
  -- OR enough time has passed (grace period for slow/missing providers)
  IF v_completed_count < v_expected_providers THEN
    -- If we haven't waited long enough, don't finalize yet
    IF v_scan_started_at IS NOT NULL AND 
       (now() - v_scan_started_at) < (v_min_wait_seconds || ' seconds')::interval THEN
      RETURN NEW;
    END IF;
    
    -- If we've waited but still don't have enough completed, check if all started have completed
    IF v_completed_count < v_started_count THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Sum findings across providers (best-effort; defaults to 0)
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
$$;