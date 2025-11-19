-- Fix search_path security warnings
ALTER FUNCTION public.generate_support_ticket_number() SET search_path = public;
ALTER FUNCTION public.set_support_ticket_number() SET search_path = public;
ALTER FUNCTION public.update_support_ticket_timestamp() SET search_path = public;
ALTER FUNCTION public.log_system_error(TEXT, TEXT, TEXT, UUID, UUID, UUID, TEXT, TEXT, JSONB) SET search_path = public;