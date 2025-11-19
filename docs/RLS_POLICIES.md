# Row Level Security (RLS) Policies

This document outlines the RLS policies for FootprintIQ, their purpose, and debugging guidelines.

## Overview

Row Level Security (RLS) ensures that users can only access data they own or are authorized to see. All policies are implemented using PostgreSQL's RLS feature combined with Supabase's `auth.uid()` function.

---

## Workspaces Table

The `workspaces` table stores workspace information and subscription tiers.

### Policies

- **`ws_select_owner_or_member`** (SELECT)
  - **Purpose**: Users can view workspaces they own OR are members of
  - **Implementation**: Uses `is_workspace_member()` helper function
  - **Critical**: The helper is `SECURITY DEFINER` to bypass RLS on `workspace_members` and prevent infinite recursion

- **`ws_insert_owner`** (INSERT)
  - **Purpose**: Authenticated users can create new workspaces
  - **Implementation**: Sets `owner_id` to `auth.uid()`
  - **Auto-behavior**: Creating a workspace makes the user the owner

- **`ws_update_owner`** (UPDATE)
  - **Purpose**: Only workspace owners can modify workspace settings
  - **Implementation**: Checks `owner_id = auth.uid()`

- **`ws_delete_owner`** (DELETE)
  - **Purpose**: Only workspace owners can delete workspaces
  - **Implementation**: Checks `owner_id = auth.uid()`

---

## Workspace Members Table

The `workspace_members` table tracks user membership and roles within workspaces.

### Policies

- **`wm_select_own`** (SELECT)
  - **Purpose**: Users can see their own workspace memberships
  - **Implementation**: `user_id = auth.uid()`

- **`wm_insert_self`** (INSERT)
  - **Purpose**: Users can be added to workspaces (typically by admins via service role)
  - **Implementation**: Allows authenticated inserts with proper constraints

- **`wm_update_self`** (UPDATE)
  - **Purpose**: Users can update their own membership details
  - **Implementation**: `user_id = auth.uid()`

- **`wm_delete_self`** (DELETE)
  - **Purpose**: Users can leave workspaces
  - **Implementation**: `user_id = auth.uid()`

---

## Helper Functions

### `is_workspace_member(_workspace uuid, _user uuid)`

**Purpose**: Check if a user is a member of a specific workspace.

**Key Attributes**:
- `LANGUAGE sql` - Pure SQL function
- `STABLE` - Returns consistent results for same inputs within a transaction
- **`SECURITY DEFINER`** - **Critical**: Executes with function owner's privileges, bypassing RLS
- `SET search_path = public` - Security measure to prevent search path attacks

**Why SECURITY DEFINER?**
Without it, checking membership would trigger RLS on `workspace_members` itself, causing infinite recursion when the workspace policy tries to verify membership.

**Usage Example**:
```sql
CREATE POLICY "ws_select_owner_or_member" ON public.workspaces
FOR SELECT
USING (
  owner_id = auth.uid() OR
  is_workspace_member(id, auth.uid())
);
```

---

## Common RLS Error Patterns

### 406 Not Acceptable

**Symptom**: `GET /rest/v1/workspaces?...` returns 406 in browser console

**Causes**:
1. User is not authenticated (`auth.uid()` is null)
2. User lacks workspace membership or ownership
3. Duplicate/conflicting RLS policies
4. Helper function missing `SECURITY DEFINER`

**Solution**:
1. Verify user is logged in: Check `supabase.auth.getUser()`
2. Check workspace membership: Query `workspace_members` table
3. Review policies: `SELECT * FROM pg_policies WHERE tablename = 'workspaces'`
4. Verify helper: `\df is_workspace_member` (should show `SECURITY DEFINER`)

### Infinite Recursion

**Symptom**: "Infinite recursion detected in policy" error

**Cause**: Policy references the same table it's protecting without `SECURITY DEFINER`

**Example of WRONG approach**:
```sql
-- ❌ BAD: Causes infinite recursion
CREATE POLICY "admins_can_view" ON public.profiles
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
```

**Correct approach**:
```sql
-- ✅ GOOD: Use SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "admins_can_view" ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
```

---

## Debugging Checklist

When encountering RLS issues:

1. **Check Authentication**
   ```javascript
   const { data: { user } } = await supabase.auth.getUser();
   console.log('Authenticated user:', user?.id);
   ```

2. **Verify Workspace Membership**
   ```sql
   SELECT * FROM workspace_members
   WHERE user_id = '<user-id>' AND workspace_id = '<workspace-id>';
   ```

3. **Review Policies**
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE tablename IN ('workspaces', 'workspace_members')
   ORDER BY tablename, policyname;
   ```

4. **Check Helper Functions**
   ```sql
   \df+ is_workspace_member
   -- Should show: security_type = 'DEFINER'
   ```

5. **Test Policy Directly**
   ```sql
   -- Run as authenticated user in SQL editor
   SELECT id, name, owner_id
   FROM workspaces
   WHERE id = '<workspace-id>';
   -- Should return workspace if you have access, empty if not
   ```

6. **Check for Duplicate Policies**
   ```sql
   SELECT tablename, policyname, COUNT(*)
   FROM pg_policies
   WHERE tablename IN ('workspaces', 'workspace_members')
   GROUP BY tablename, policyname
   HAVING COUNT(*) > 1;
   ```

---

## Best Practices

1. **Use `useWorkspace()` Hook**
   - Always use `useWorkspace()` hook in frontend components
   - Avoid direct `supabase.from('workspaces')` queries
   - Hook handles RLS errors gracefully

2. **Service Role for Admin Operations**
   - Use service role key for admin operations in Edge Functions
   - Never expose service role key to client
   - Service role bypasses RLS entirely

3. **Helper Functions for Complex Checks**
   - Create `SECURITY DEFINER` functions for membership checks
   - Keep functions simple and focused
   - Always use `SET search_path = public` for security

4. **Error Handling**
   - Wrap workspace queries in try-catch
   - Detect 406 errors specifically
   - Provide user-friendly error messages

5. **Testing**
   - Test as workspace owner, member, and non-member
   - Verify policies don't leak data
   - Test edge cases (deleted members, expired subscriptions)

---

## Migration History

- **20251119193700**: Cleaned up duplicate RLS policies, verified `SECURITY DEFINER` on `is_workspace_member()`

---

## Contact

For RLS-related questions or issues:
1. Check this documentation first
2. Review recent migration files in `supabase/migrations/`
3. Contact the development team with specific error messages and user context
