-- Add id column to scan_findings if it doesn't exist
ALTER TABLE scan_findings 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- Drop old constraints on evidence_ledger
ALTER TABLE evidence_ledger 
DROP CONSTRAINT IF EXISTS evidence_ledger_finding_id_fkey;

ALTER TABLE evidence_ledger 
DROP CONSTRAINT IF EXISTS evidence_ledger_scan_id_fkey;

-- Make finding_id nullable since scan_findings FK is loose
ALTER TABLE evidence_ledger 
ALTER COLUMN finding_id DROP NOT NULL;

-- Add new constraint pointing scan_id to scan_jobs
ALTER TABLE evidence_ledger 
ADD CONSTRAINT evidence_ledger_scan_id_fkey 
FOREIGN KEY (scan_id) REFERENCES scan_jobs(id) ON DELETE CASCADE;