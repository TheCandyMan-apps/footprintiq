-- Security Fix: Add search_path to trigger functions
-- Fix for: Function Search Path Mutable warning
-- Affects: update_pattern_last_seen, update_watchlist_timestamp, update_comment_timestamp

-- Add search_path protection to trigger functions
ALTER FUNCTION public.update_pattern_last_seen() SET search_path = public;
ALTER FUNCTION public.update_watchlist_timestamp() SET search_path = public;
ALTER FUNCTION public.update_comment_timestamp() SET search_path = public;

-- These functions are now protected against search_path manipulation
-- This is a defense-in-depth measure even though they're not SECURITY DEFINER