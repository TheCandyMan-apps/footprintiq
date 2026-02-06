
# Fix Growth Analytics Admin Dashboard Access

## Problem Summary

The Growth Analytics tab shows all zeros because the `workspaces` and `email_notifications` tables have RLS policies that **do not include an admin bypass**. The admin can only see their own workspaces, but the Trial Conversion Funnel needs to aggregate data across ALL workspaces.

**Evidence:**
- 227 workspaces exist with trial data (confirmed via service role query)
- Current RLS on `workspaces`: `owner_id = auth.uid() OR is_workspace_member(id, auth.uid())`
- Current RLS on `email_notifications`: `workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())`
- Neither policy includes `OR has_role(auth.uid(), 'admin'::text)` bypass

---

## Solution

Add admin bypass to the RLS SELECT policies on both tables, following the established pattern already used elsewhere (e.g., `plugins`, `integration_logs`, `sandbox_runs`, etc.).

---

## Database Changes

### 1. Update `workspaces` SELECT policy

```sql
DROP POLICY IF EXISTS "ws_select_owner_or_member" ON workspaces;

CREATE POLICY "ws_select_owner_or_member" ON workspaces
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR is_workspace_member(id, auth.uid())
    OR has_role(auth.uid(), 'admin'::text)
  );
```

### 2. Update `email_notifications` SELECT policy

```sql
DROP POLICY IF EXISTS "Users can view own workspace notifications" ON email_notifications;

CREATE POLICY "Users can view own workspace notifications" ON email_notifications
  FOR SELECT TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::text)
  );
```

---

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Add RLS policy updates for `workspaces` and `email_notifications` tables |

---

## No Frontend Changes Needed

The `useTrialEmailAnalytics` hook already handles the data correctly. Once the RLS policies are updated, the queries will return all workspace and email data for admin users, and the dashboard will populate correctly.

---

## Testing

After applying the migration:
1. Log in as admin (`admin@footprintiq.app`)
2. Navigate to Admin Dashboard → Growth tab
3. Verify Trial Conversion Funnel shows non-zero values
4. Verify Email Performance tab shows email metrics

---

## Security Considerations

- Admin bypass only applies to SELECT operations
- Regular users continue to see only their own workspaces/emails
- Pattern is consistent with 30+ other admin policies in the project
