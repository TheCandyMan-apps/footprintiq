-- Update support_tickets status constraint to include 'new'
ALTER TABLE support_tickets 
DROP CONSTRAINT IF EXISTS support_tickets_status_check;

ALTER TABLE support_tickets 
ADD CONSTRAINT support_tickets_status_check 
CHECK (status IN ('new', 'open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'));