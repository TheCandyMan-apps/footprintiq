-- Update support_tickets priority constraint to include 'medium'
ALTER TABLE support_tickets 
DROP CONSTRAINT IF EXISTS support_tickets_priority_check;

ALTER TABLE support_tickets 
ADD CONSTRAINT support_tickets_priority_check 
CHECK (priority IN ('low', 'normal', 'medium', 'high', 'urgent'));