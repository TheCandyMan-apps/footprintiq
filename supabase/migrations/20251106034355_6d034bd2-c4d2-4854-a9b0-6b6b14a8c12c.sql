-- Add RLS policies for scan results and findings
-- These allow users to read their own scan data while service-role can write

-- Drop existing policies if they exist, then recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "scan_results readable by job owner" ON scan_results;
  DROP POLICY IF EXISTS "scan_findings readable by job owner" ON scan_findings;
END $$;

-- Policy for scan_results: users can read their own results
CREATE POLICY "scan_results readable by job owner"
ON scan_results FOR SELECT
USING (EXISTS (
  SELECT 1 FROM scan_jobs j 
  WHERE j.id = scan_results.job_id 
  AND j.requested_by = auth.uid()
));

-- Policy for scan_findings: users can read their own findings
CREATE POLICY "scan_findings readable by job owner"
ON scan_findings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM scan_jobs j 
  WHERE j.id = scan_findings.job_id 
  AND j.requested_by = auth.uid()
));