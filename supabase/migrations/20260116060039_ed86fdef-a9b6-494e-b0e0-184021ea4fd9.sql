-- Drop the incorrect FK constraint (references scan_jobs)
ALTER TABLE evidence_ledger 
DROP CONSTRAINT IF EXISTS evidence_ledger_scan_id_fkey;

-- Add new FK constraint referencing the correct 'scans' table
ALTER TABLE evidence_ledger 
ADD CONSTRAINT evidence_ledger_scan_id_fkey 
FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE;