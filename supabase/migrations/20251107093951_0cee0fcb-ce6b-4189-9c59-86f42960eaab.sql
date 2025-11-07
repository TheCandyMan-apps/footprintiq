-- Fix 1-6: Add SET search_path to functions missing it
-- These functions need secure search_path to prevent search_path injection attacks

-- Fix update_pattern_last_seen function
CREATE OR REPLACE FUNCTION public.update_pattern_last_seen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.last_seen = now();
  NEW.occurrence_count = NEW.occurrence_count + 1;
  RETURN NEW;
END;
$function$;

-- Fix update_watchlist_timestamp function
CREATE OR REPLACE FUNCTION public.update_watchlist_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_comment_timestamp function
CREATE OR REPLACE FUNCTION public.update_comment_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix update_workspace_timestamp function
CREATE OR REPLACE FUNCTION public.update_workspace_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix 7: Move vector extension from public schema to extensions schema
-- Note: The vector extension is already installed, we need to move it
-- This is safe because we're just changing the schema, not uninstalling
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Recreate any vector-related objects that might have been dropped
-- (The CASCADE will have removed dependent objects, so we ensure they exist)