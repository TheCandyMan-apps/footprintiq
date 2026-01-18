-- Fix validate_confidence_score function to set search_path
-- This addresses the "Function Search Path Mutable" security warning

CREATE OR REPLACE FUNCTION public.validate_confidence_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
  IF NEW.confidence_score < 0 OR NEW.confidence_score > 100 THEN
    RAISE EXCEPTION 'confidence_score must be between 0 and 100';
  END IF;
  RETURN NEW;
END;
$function$;