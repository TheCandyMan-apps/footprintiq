
CREATE OR REPLACE FUNCTION public.finalize_scan_if_complete()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
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

  -- FIX: Use created_at (the actual column) instead of the non-existent started_at
  SELECT scan_type, created_at
    INTO v_scan_type, v_scan_started_at
  FROM public.scans
  WHERE id = NEW.scan_id;

  -- Determine expected provider count based on scan type
  v_expected_providers := CASE v_scan_type
    WHEN 'username' THEN 4
    WHEN 'email'    THEN 3
    WHEN 'phone'    THEN 2
    ELSE 2
  END;

  -- Count providers that have posted a 'start' event
  SELECT COUNT(DISTINCT provider)
    INTO v_started_count
  FROM public.scan_events
  WHERE scan_id = NEW.scan_id
    AND stage = 'start';

  -- Count providers that have posted a 'complete' event
  SELECT COUNT(DISTINCT provider)
    INTO v_completed_count
  FROM public.scan_events
  WHERE scan_id = NEW.scan_id
    AND stage = 'complete';

  -- Count total findings
  SELECT COUNT(*)
    INTO v_total_findings
  FROM public.findings
  WHERE scan_id = NEW.scan_id;

  -- Grace period: don't finalize within the first v_min_wait_seconds of scan creation
  IF v_scan_started_at IS NOT NULL
     AND EXTRACT(EPOCH FROM (NOW() - v_scan_started_at)) < v_min_wait_seconds THEN
    RETURN NEW;
  END IF;

  -- Only finalize if all started providers have completed
  IF v_completed_count >= v_started_count AND v_started_count > 0 THEN
    UPDATE public.scan_progress
    SET
      status = CASE WHEN v_total_findings > 0 THEN 'completed' ELSE 'completed_empty' END,
      updated_at = NOW()
    WHERE scan_id = NEW.scan_id
      AND status NOT IN ('completed', 'completed_empty', 'failed');

    UPDATE public.scans
    SET
      status = CASE WHEN v_total_findings > 0 THEN 'completed' ELSE 'completed_empty' END,
      updated_at = NOW()
    WHERE id = NEW.scan_id
      AND status NOT IN ('completed', 'completed_empty', 'failed');
  END IF;

  RETURN NEW;
END;
$$;
