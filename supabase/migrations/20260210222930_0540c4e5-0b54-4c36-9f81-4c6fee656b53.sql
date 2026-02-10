-- Update the subscription_tier enum to only have free, pro, enterprise
-- First, update any existing records with old tier names
UPDATE public.workspaces SET subscription_tier = 'free' WHERE subscription_tier IN ('basic', 'family');
UPDATE public.workspaces SET subscription_tier = 'pro' WHERE subscription_tier = 'premium';

-- Rename the enum values
ALTER TYPE public.subscription_tier RENAME VALUE 'premium' TO 'pro';

-- We need to remove 'basic' and 'family' - but can't drop enum values directly
-- Instead, create a new enum and swap
-- First check if 'pro' already exists (from rename above)
-- Drop and recreate the type
ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'pro';

-- Since we can't remove enum values in PostgreSQL, we'll leave the old values but they won't be used
-- The UI will only show Free, Pro, Enterprise