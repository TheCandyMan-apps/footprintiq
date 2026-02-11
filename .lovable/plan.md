
# Fix: New User Signup Blocked by Invalid Enum Value

## Root Cause
The `handle_new_user` database trigger (fires on every new signup) tries to insert `'premium'` into the `subscription_tier` column for the admin email. However, a previous migration renamed that enum value from `'premium'` to `'pro'`. Since `'premium'` is no longer a valid enum value, **all signups fail with a 500 error** -- even non-admin signups -- because the trigger function fails to compile/execute.

Additionally, the `set_workspace_tier_from_owner` trigger also references `'premium'`, which would cause downstream failures.

## Fix

### 1. Update `handle_new_user` trigger function
Replace `'premium'` with `'pro'` in the admin user branch:
```sql
-- Change from:
VALUES (NEW.id, 'admin', 'premium')
-- To:
VALUES (NEW.id, 'admin', 'pro')
```

### 2. Update `set_workspace_tier_from_owner` trigger function
Replace all references to `'premium'` with `'pro'`:
```sql
-- Change from:
IF owner_tier = 'premium' THEN
    NEW.plan := 'premium';
    NEW.subscription_tier := 'premium';
-- To:
IF owner_tier = 'pro' THEN
    NEW.plan := 'pro';
    NEW.subscription_tier := 'pro';
```

Both changes will be applied in a single database migration. After this, new user signups (including admin) will work correctly.
