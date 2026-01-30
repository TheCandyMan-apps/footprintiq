-- Add step tracking columns to scan_progress for Free tier step-based UI
ALTER TABLE scan_progress 
ADD COLUMN IF NOT EXISTS current_step integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_steps integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS step_title text,
ADD COLUMN IF NOT EXISTS step_description text;