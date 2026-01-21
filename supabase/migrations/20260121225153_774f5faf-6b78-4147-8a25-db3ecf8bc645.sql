
-- Update the validate_scan_input trigger to include domain as a valid target
CREATE OR REPLACE FUNCTION public.validate_scan_input()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;
  
  -- Validate phone format if provided (basic check)
  IF NEW.phone IS NOT NULL AND LENGTH(TRIM(NEW.phone)) < 7 THEN
    RAISE EXCEPTION 'Invalid phone number: too short';
  END IF;
  
  -- Validate username if provided
  IF NEW.username IS NOT NULL AND LENGTH(TRIM(NEW.username)) < 2 THEN
    RAISE EXCEPTION 'Invalid username: too short';
  END IF;
  
  -- Validate domain if provided (basic check for at least one dot and min length)
  IF NEW.domain IS NOT NULL AND (LENGTH(TRIM(NEW.domain)) < 4 OR NEW.domain !~ '\.') THEN
    RAISE EXCEPTION 'Invalid domain format: %', NEW.domain;
  END IF;
  
  -- Ensure at least one target is provided (now includes domain)
  IF NEW.email IS NULL AND NEW.phone IS NULL AND NEW.username IS NULL AND NEW.domain IS NULL THEN
    RAISE EXCEPTION 'At least one target (email, phone, username, or domain) must be provided';
  END IF;
  
  RETURN NEW;
END;
$function$;
