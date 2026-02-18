
## Add last_seen Badge to ChannelProfileCard

### What's Currently There

The `ChannelProfileCard` component (lines 255–317 in `TelegramTab.tsx`) renders:
- Channel title, username, description
- Subscriber count and message count stats
- Linked channels list

It does **not** extract or display `last_seen_bucket` — the field returned by the `handle_username_lookup` worker for personal accounts (e.g., `recently`, `within_week`, `within_month`, `long_ago`, `hidden`).

By contrast, the `PhonePresenceCard` (lines 223–253) reads `last_seen` from the evidence but renders it as raw text (`Last seen: {lastSeen}`) with no colour coding, icon, or structured badge.

---

### The Fix: One File, Two Improvements

**File:** `src/components/scan/results-tabs/TelegramTab.tsx`

#### Change 1 — `ChannelProfileCard`: Add a `LastSeenBadge` inline component

Extract `last_seen_bucket` (and fall back to `last_seen`) from the finding's evidence/meta, then render a colour-coded badge immediately after the title/username block.

**Bucket → Badge mapping:**

| Bucket value | Label | Colour | Icon |
|---|---|---|---|
| `recently` | Active Recently | Green | `Clock` |
| `within_week` | Active This Week | Lime/teal | `Clock` |
| `within_month` | Active This Month | Amber | `Clock` |
| `long_ago` | Last Seen Long Ago | Muted/slate | `Clock` |
| `hidden` / `unknown` | Last Seen Hidden | Muted | `EyeOff` |

#### Change 2 — `PhonePresenceCard`: Upgrade raw text to the same badge

The `PhonePresenceCard` currently renders `Last seen: {lastSeen}` as plain text. Swap this for the same `LastSeenBadge` so both cards are visually consistent.

#### Change 3 — Add `Clock` and `EyeOff` to the import list

These two icons from `lucide-react` are needed for the badge. `EyeOff` is already used elsewhere in the file (line 19 shows `Eye` is imported); `Clock` needs to be added.

---

### Technical Detail

#### Reusable `LastSeenBadge` component (inline, not exported)

```typescript
const LAST_SEEN_CONFIG: Record<string, {
  label: string;
  className: string;
  icon: 'clock' | 'eye-off';
}> = {
  recently:      { label: 'Active Recently',     className: 'bg-green-500/15 text-green-600 border-green-500/30 dark:text-green-400', icon: 'clock' },
  within_week:   { label: 'Active This Week',    className: 'bg-teal-500/15 text-teal-600 border-teal-500/30 dark:text-teal-400',   icon: 'clock' },
  within_month:  { label: 'Active This Month',   className: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400', icon: 'clock' },
  long_ago:      { label: 'Last Seen Long Ago',  className: 'bg-muted text-muted-foreground border-border',                           icon: 'clock' },
  hidden:        { label: 'Last Seen Hidden',    className: 'bg-muted text-muted-foreground border-border',                           icon: 'eye-off' },
  unknown:       { label: 'Last Seen Unknown',   className: 'bg-muted text-muted-foreground border-border',                           icon: 'eye-off' },
};

function LastSeenBadge({ bucket }: { bucket: string }) {
  const key = (bucket || '').toLowerCase().replace(/\s+/g, '_');
  const cfg = LAST_SEEN_CONFIG[key] ?? LAST_SEEN_CONFIG['unknown'];
  const Icon = cfg.icon === 'clock' ? Clock : EyeOff;

  return (
    <Badge variant="outline" className={`gap-1 h-5 px-1.5 text-[10px] font-medium ${cfg.className}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </Badge>
  );
}
```

#### `ChannelProfileCard` — where the badge is inserted

The badge renders inside the existing title block, right after the `@username` line:

```tsx
{/* existing */}
<p className="font-medium text-foreground">{title}</p>
{username && <p className="text-xs text-muted-foreground">@{username}</p>}

{/* NEW */}
{lastSeenBucket && (
  <div className="mt-1.5">
    <LastSeenBadge bucket={lastSeenBucket} />
  </div>
)}
```

The `lastSeenBucket` value is extracted as:

```typescript
const lastSeenBucket = ev('last_seen_bucket') || ev('last_seen') || f.meta?.last_seen_bucket || f.meta?.last_seen || '';
```

This ensures compatibility with both the new `handle_username_lookup` output (`last_seen_bucket`) and any older scan data that stored a plain `last_seen` value.

#### `PhonePresenceCard` — upgrade the raw text

Replace:
```tsx
{lastSeen && (
  <p className="text-xs text-muted-foreground">Last seen: {lastSeen}</p>
)}
```

With:
```tsx
{lastSeen && (
  <div className="flex items-center gap-2">
    <span className="text-muted-foreground">Last seen:</span>
    <LastSeenBadge bucket={lastSeen} />
  </div>
)}
```

---

### Summary of Changes

| File | Lines Changed | What |
|---|---|---|
| `src/components/scan/results-tabs/TelegramTab.tsx` | Line 19 | Add `Clock`, `EyeOff` to lucide imports |
| `src/components/scan/results-tabs/TelegramTab.tsx` | After line 222 | Add `LAST_SEEN_CONFIG` map + `LastSeenBadge` component |
| `src/components/scan/results-tabs/TelegramTab.tsx` | Lines 255–317 (`ChannelProfileCard`) | Extract `lastSeenBucket`, render `LastSeenBadge` |
| `src/components/scan/results-tabs/TelegramTab.tsx` | Lines 223–253 (`PhonePresenceCard`) | Replace raw text with `LastSeenBadge` |

No new files, no backend changes, no new dependencies. All changes are confined to one component file.
