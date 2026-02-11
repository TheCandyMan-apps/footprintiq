-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a function that fires an HTTP call to the error-alert edge function
-- when a critical/error severity row is inserted into system_errors
CREATE OR REPLACE FUNCTION public.notify_critical_error()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only alert on error or critical severity
  IF NEW.severity IN ('error', 'critical') THEN
    PERFORM net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1) || '/functions/v1/error-alert',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_ANON_KEY' LIMIT 1)
      ),
      body := jsonb_build_object(
        'error_id', NEW.id,
        'error_code', NEW.error_code,
        'severity', NEW.severity,
        'function_name', NEW.function_name,
        'message', NEW.error_message
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on system_errors for real-time alerts
DROP TRIGGER IF EXISTS on_critical_error ON public.system_errors;
CREATE TRIGGER on_critical_error
  AFTER INSERT ON public.system_errors
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_critical_error();
