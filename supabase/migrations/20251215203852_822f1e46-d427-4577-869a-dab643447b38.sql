-- Add missing scan_type enum values
ALTER TYPE scan_type ADD VALUE IF NOT EXISTS 'phone';
ALTER TYPE scan_type ADD VALUE IF NOT EXISTS 'domain';
ALTER TYPE scan_type ADD VALUE IF NOT EXISTS 'email';