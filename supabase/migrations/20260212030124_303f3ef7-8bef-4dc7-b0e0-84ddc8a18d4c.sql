
-- Add new statuses needed for privacy center
ALTER TYPE removal_status ADD VALUE IF NOT EXISTS 'not_started';
ALTER TYPE removal_status ADD VALUE IF NOT EXISTS 'submitted';
ALTER TYPE removal_status ADD VALUE IF NOT EXISTS 'awaiting_confirmation';
ALTER TYPE removal_status ADD VALUE IF NOT EXISTS 'removed';
ALTER TYPE removal_status ADD VALUE IF NOT EXISTS 're_listed';
