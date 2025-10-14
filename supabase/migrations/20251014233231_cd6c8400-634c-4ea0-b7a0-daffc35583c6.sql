-- Fix function search path security issue
DROP FUNCTION IF EXISTS public.generate_ticket_number();

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ticket_number TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.support_tickets WHERE ticket_number = new_ticket_number
    );
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique ticket number';
    END IF;
  END LOOP;
  
  RETURN new_ticket_number;
END;
$$;