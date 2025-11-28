-- Add 'admin_grant' to the credits_ledger reason constraint
-- First drop the existing constraint, then add the updated one

ALTER TABLE credits_ledger DROP CONSTRAINT IF EXISTS credits_ledger_reason_check;

ALTER TABLE credits_ledger ADD CONSTRAINT credits_ledger_reason_check 
CHECK (reason IN ('darkweb_scan', 'purchase', 'reverse_image_search', 'export', 'scan', 'api_usage', 'admin_grant'));