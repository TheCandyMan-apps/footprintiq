-- Add meta column to credits_ledger table for storing additional metadata
ALTER TABLE credits_ledger ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;