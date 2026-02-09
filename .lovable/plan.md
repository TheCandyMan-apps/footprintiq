

# Fix: AI Analyst Showing Other Users' Scans

## Problem
The "Select Entities to Analyze" dropdown on the AI Analyst page (`/ai-analyst`) loads scans from all users. This happens because:

1. The query in `loadEntities()` fetches from the `scans` table **without filtering by `user_id`**
2. Your account has an **admin** role, and the RLS policy "Admins can view all scans" lets admins see every scan in the database
3. So the unfiltered query returns all scans across the platform

## Fix
Add an explicit `user_id` filter to the query in `src/pages/AIAnalyst.tsx` so the entity picker only shows the logged-in user's own scans -- regardless of admin privileges.

## Technical Change

**File: `src/pages/AIAnalyst.tsx`** (line ~76-83)

Update `loadEntities` to get the current user's ID and filter by it:

```typescript
const loadEntities = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("scans")
      .select("id, email, phone, username, privacy_score, high_risk_count, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    // ... rest unchanged
  }
};
```

This is a one-line addition (`.eq("user_id", session.user.id)`) plus fetching the session. It ensures defence-in-depth: even if RLS changes in the future, the query itself is scoped to the current user.
