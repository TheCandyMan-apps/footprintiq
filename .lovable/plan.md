

# Add Subscription Filter to Admin User Management

## What changes

A new dropdown filter for **Subscription** tier will be added to the admin Users tab, placed between the existing "All Status" and "All Users" (flags) filters.

## Filter options

- All Subscriptions (default)
- Free
- Premium
- Enterprise
- Basic
- Family

## Technical details

**File: `src/components/admin/UserManagementTable.tsx`**

1. Add a new state variable `subscriptionFilter` (default: `'all'`).
2. Add a new `<Select>` dropdown between the Status and Flags filters with the subscription tier options listed above.
3. Update the `filteredUsers` logic to include a `matchesSubscription` check comparing `user.subscription_tier` against the selected filter value.
4. Wire it all together so the table filters in real time, matching the existing pattern used by the role and status filters.

No other files need to change -- the subscription tier data is already fetched and available on each user object from `useAdminUsers`.

