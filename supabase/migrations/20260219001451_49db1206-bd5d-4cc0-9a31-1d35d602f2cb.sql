
-- Fix 1: Allow nullable workspace_id in findings for anonymous scans
ALTER TABLE public.findings ALTER COLUMN workspace_id DROP NOT NULL;

-- Fix 2: Allow anonymous users to read scans by ID (anonymous scans have null user_id)
DROP POLICY IF EXISTS "anon_read_own_scan" ON public.scans;
CREATE POLICY "anon_read_own_scan"
ON public.scans
FOR SELECT
USING (user_id IS NULL OR auth.uid() = user_id);

-- Fix 3: Allow anonymous users to read findings for a scan
DROP POLICY IF EXISTS "anon_read_scan_findings" ON public.findings;
CREATE POLICY "anon_read_scan_findings"
ON public.findings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.scans s
    WHERE s.id = findings.scan_id
    AND (s.user_id IS NULL OR s.user_id = auth.uid())
  )
);
