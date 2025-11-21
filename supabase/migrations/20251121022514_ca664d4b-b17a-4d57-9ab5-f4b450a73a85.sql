-- Update support_tickets category constraint to include 'scan'
ALTER TABLE support_tickets 
DROP CONSTRAINT IF EXISTS support_tickets_category_check;

ALTER TABLE support_tickets 
ADD CONSTRAINT support_tickets_category_check 
CHECK (category IN ('technical', 'billing', 'feature_request', 'bug_report', 'scan', 'other'));