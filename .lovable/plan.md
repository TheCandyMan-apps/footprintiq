

# Fix Whitespace + Enrich Row Content

## Changes to `src/components/scan/results-tabs/accounts/AccountRow.tsx`

### 1. Remove `max-w-sm` caps (lines 377, 381)
Remove the `max-w-sm` class from the bio and URL fallback `<p>` tags so text expands to fill available width on wide screens. Keep `truncate` for overflow.

### 2. Add inline signal chips row (after line 373, before current bio line)
Insert a new row of compact signal chips between the platform/username line and the bio line. Each chip pulls from existing `meta` fields when available:

- **Domain** -- extracted from `profileUrl` hostname (e.g., `github.com`)
- **Followers** -- from `meta.followers` (e.g., `1.2K followers`)
- **Location** -- from `meta.location` (e.g., `London, UK`)
- **Joined** -- from `meta.joined` (e.g., `Joined 2019`)
- **Website** -- from `meta.website`, rendered as a clickable link with `stopPropagation`

Chips will render as small inline `<span>` elements with:
- `text-[9px]` size, `text-muted-foreground/60` color
- Tiny dot separators between chips
- Max 3 chips shown to keep the row compact
- Clickable website chip uses `stopPropagation` + `e.preventDefault()` pattern to avoid toggling the collapsible

### 3. Ensure click isolation
The website signal chip (if rendered as a link) will use `onClick={(e) => e.stopPropagation()}` to prevent row expansion when clicked.

---

## Technical Details

### Signal chip rendering logic
```text
const signalChips = useMemo(() => {
  const chips: { label: string; href?: string }[] = [];
  // Domain from URL
  if (profileUrl) {
    try { chips.push({ label: new URL(profileUrl).hostname.replace('www.', '') }); } catch {}
  }
  // Followers
  if (meta.followers !== undefined) {
    const f = meta.followers >= 1000 ? `${(meta.followers/1000).toFixed(1)}K` : meta.followers;
    chips.push({ label: `${f} followers` });
  }
  // Location
  if (meta.location && meta.location !== 'Unknown') {
    chips.push({ label: meta.location });
  }
  // Joined
  if (meta.joined) chips.push({ label: `Joined ${meta.joined}` });
  // Website
  if (meta.website) {
    chips.push({ label: meta.website.replace(/^https?:\/\//, '').slice(0, 30), href: meta.website });
  }
  return chips.slice(0, 3); // cap at 3
}, [profileUrl, meta]);
```

### Chip markup (inline after username row)
```text
{signalChips.length > 0 && (
  <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60 leading-none">
    {signalChips.map((chip, i) => (
      <Fragment key={i}>
        {i > 0 && <span className="text-border">·</span>}
        {chip.href ? (
          <a href={chip.href} target="_blank" rel="noopener noreferrer"
             className="hover:text-primary truncate max-w-[120px]"
             onClick={e => e.stopPropagation()}>{chip.label}</a>
        ) : (
          <span className="truncate max-w-[120px]">{chip.label}</span>
        )}
      </Fragment>
    ))}
  </div>
)}
```

### Summary of line changes
| Line(s) | Change |
|---------|--------|
| 1 | Add `Fragment` to React import |
| 282 | Add `signalChips` useMemo |
| 373-384 | Add signal chips row, remove `max-w-sm` from bio/URL lines |

