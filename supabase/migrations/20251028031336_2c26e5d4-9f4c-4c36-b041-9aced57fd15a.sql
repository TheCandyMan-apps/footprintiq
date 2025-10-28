-- Update user role to admin for full access
UPDATE user_roles 
SET role = 'admin', 
    subscription_tier = 'premium',
    subscription_expires_at = NULL
WHERE user_id = '9f6d6742-56ba-43a9-93be-0beae4450882';