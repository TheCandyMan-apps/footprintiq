-- Phase 1.1 & 1.3: Clean stuck scans and fix security warnings

-- 1. Clean up existing stuck scans (pending for > 15 minutes)
-- Mark as 'timeout' status
UPDATE scans
SET 
  status = 'timeout',
  completed_at = NOW()
WHERE 
  status = 'pending'
  AND created_at < NOW() - INTERVAL '15 minutes';

-- 2. Move extensions to dedicated schema (security warning fix)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_net extension (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    ALTER EXTENSION pg_net SET SCHEMA extensions;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not move pg_net extension: %', SQLERRM;
END $$;

-- Move http extension (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
    ALTER EXTENSION http SET SCHEMA extensions;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not move http extension: %', SQLERRM;
END $$;

-- Move pg_cron extension (if exists)  
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    ALTER EXTENSION pg_cron SET SCHEMA extensions;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not move pg_cron extension: %', SQLERRM;
END $$;

-- Log cleanup action
INSERT INTO system_errors (
  error_code,
  error_message,
  function_name,
  severity,
  metadata
) VALUES (
  'STUCK_SCANS_CLEANUP',
  'Phase 1: Cleaned up stuck scans and moved extensions to dedicated schema',
  'migration-phase1',
  'info',
  jsonb_build_object(
    'cleanup_count', (SELECT COUNT(*) FROM scans WHERE status = 'timeout'),
    'timestamp', NOW()
  )
);