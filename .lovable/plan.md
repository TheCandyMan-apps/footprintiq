
# Fix Predicta Search Findings Insertion (Schema Mismatch)

## Problem

Predicta Search returns profile data (including photos) successfully, but the findings fail to save to the database. The error:

```
Could not find the 'label' column of 'findings' in the schema cache
```

The insertion code uses columns (`label`, `value`) that don't exist in the `findings` table. The actual schema is: `id`, `scan_id`, `workspace_id`, `provider`, `kind`, `severity`, `confidence`, `observed_at`, `evidence`, `meta`, `created_at`.

Credits are deducted but results are lost.

## Fix

Update the Predicta findings normalization in `supabase/functions/n8n-scan-trigger/index.ts` (lines 694-761) to map fields to the correct `findings` table schema:

- Move `label` and `value` into the `meta` JSONB column
- Add `evidence` as a JSONB array (key/value pairs)
- Add `observed_at` timestamp
- Ensure `workspace_id` is included (currently missing)

### Before (broken)

```text
{
  scan_id, provider, kind, severity,
  label,       <-- does NOT exist
  value,       <-- does NOT exist
  confidence,
  meta: { ... }
}
```

### After (correct)

```text
{
  scan_id, workspace_id, provider, kind, severity,
  confidence,
  observed_at,
  evidence: [ { key, value } ],
  meta: { label, value, avatar, platform, ... }
}
```

## Changes

### 1. Fix profile findings mapping (n8n-scan-trigger)

Update the profile normalization block to use the correct schema:

- `label` moves into `meta.label`
- `value` (the URL) moves into `meta.url` and also into `evidence` array
- Add `workspace_id: workspaceId`
- Add `observed_at: new Date().toISOString()`
- `confidence` changes from integer (70/90) to decimal (0.70/0.90)

### 2. Fix breach findings mapping (n8n-scan-trigger)

Same schema fix for breach/leak normalization:

- `label` moves into `meta.label`
- `value` moves into `meta.url`
- Add `workspace_id`, `observed_at`, `evidence`
- Normalize confidence to decimal

### 3. Fix leak findings mapping (n8n-scan-trigger)

Same pattern for leak findings.

## Technical Details

### File modified
- `supabase/functions/n8n-scan-trigger/index.ts` -- Predicta findings normalization (lines ~694-761)

### What this fixes
- Profile photos (stored in `meta.avatar`) will now persist and display in the UI
- Social profiles from Predicta will appear in scan results
- Breach/leak data from Predicta will be saved correctly
- Credits will no longer be wasted on failed insertions

### Providers already working correctly
- `abstract_phone`, `numverify`, `ipqs_phone` -- handled by `phone-intel` edge function (correct schema)
- `abstract_email`, `abstract_email_reputation`, `ipqs_email` -- handled by `email-intel` edge function (correct schema)
- Only the Predicta code inside `n8n-scan-trigger` has the wrong mapping
