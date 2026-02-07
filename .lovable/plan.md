
# Fix Incorrect "Premium" Role Values in Admin Dashboard

## Problem

The "Role" column in the admin user table is showing "premium" for some users. This is incorrect — "premium" is a **subscription tier**, not a **role**.

In the database, 7 users currently have `role = 'premium'`, which was likely set by a previous webhook or sync bug. The valid roles should be `admin`, `user`, or `free` (access control), while subscription information belongs exclusively in the `subscription_tier` column (which is already shown separately).

## What Will Change

### 1. Fix Existing Data (Database Migration)

Update the 7 users who currently have `role = 'premium'` to `role = 'user'` (the standard authenticated user role). Their `subscription_tier` column already correctly reflects their subscription status, so no subscription data is lost.

### 2. Fix the Edit User Dialog

Remove "Premium User" from the Role dropdown in the user editor. The corrected options will be:
- **Free** (default, no special access)
- **User** (standard authenticated user)
- **Admin** (full admin access)

Subscription tier is already managed in its own separate dropdown on the same form.

### 3. Fix the Role Filter

Update the role filter dropdown in the user table to match the valid role values (`admin`, `user`, `free`) instead of listing "Premium" as a filterable role.

### 4. Update Role Display Styling

Add a colour/icon mapping for the `user` role so it renders cleanly alongside `admin` and `free` in the table.

---

## Technical Details

### Database Migration

```sql
UPDATE user_roles
SET role = 'user'
WHERE role = 'premium';
```

### Files Modified

| File | Change |
|------|--------|
| `src/components/admin/EditUserDialog.tsx` | Replace "Premium User" role option with "User" |
| `src/components/admin/UserManagementTable.tsx` | Update roleColors, roleIcons, and filter dropdown to use `user` instead of `premium` |

### Before vs After

**Role dropdown (Edit User):**
- Before: Free User / Premium User / Admin
- After: Free User / User / Admin

**Role filter (User Table):**
- Before: All Roles / Admin / Free / Premium
- After: All Roles / Admin / User / Free

**Role badge colours:**
- `admin` = red (unchanged)
- `free` = grey (unchanged)
- `user` = blue (new, replaces purple "premium")
