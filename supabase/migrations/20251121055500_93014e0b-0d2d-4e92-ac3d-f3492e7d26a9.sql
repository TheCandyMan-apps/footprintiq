-- Phase 1.3 Completion: Move remaining extensions out of public schema

-- Move vector extension to extensions schema
ALTER EXTENSION vector SET SCHEMA extensions;

-- Update schema search path for better security
-- This ensures functions look in extensions schema for extension objects
ALTER DATABASE postgres SET search_path TO public, extensions;