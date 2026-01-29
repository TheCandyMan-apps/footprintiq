-- Auto-finalize scans when all started providers have completed

CREATE OR REPLACE FUNCTION public.finalize_scan_if_complete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_started_count integer;
  v_completed_count integer;
  v_total_findings integer;
BEGIN
  -- Only attempt finalization on provider completion events
  IF NEW.stage IS DISTINCT FROM 'complete' THEN
    RETURN NEW;
  END IF;

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

  IF v_completed_count IS NULL OR v_completed_count < v_started_count THEN
    RETURN NEW;
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

DROP TRIGGER IF EXISTS trg_finalize_scan_if_complete ON public.scan_events;

CREATE TRIGGER trg_finalize_scan_if_complete
AFTER INSERT ON public.scan_events
FOR EACH ROW
EXECUTE FUNCTION public.finalize_scan_if_complete();
