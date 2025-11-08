-- Add 'reverse_image_search' as a valid reason for credit deductions
-- Drop the existing check constraint
ALTER TABLE credits_ledger DROP CONSTRAINT IF EXISTS credits_ledger_reason_check;

-- Add new check constraint with reverse_image_search included
ALTER TABLE credits_ledger ADD CONSTRAINT credits_ledger_reason_check 
  CHECK (reason IN ('darkweb_scan', 'purchase', 'reverse_image_search'));