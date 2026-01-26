
# Replace Scan Entry UI with Single Input

## Overview
Refactor the `/scan` page's `ScanForm` component to replace the current multi-field form with a streamlined single-input interface. The input will accept any identifier type (username, email, phone, or full name), with advanced fields available through a collapsible "Refine" section.

---

## Architecture

```text
ScanForm (refactored)
├── Header: "Start Your Digital Footprint Scan"
├── Single Input Field
│   └── Placeholder: "Username, email, phone number, or full name"
├── TurnstileWidget (de-emphasized, only when required)
├── Primary CTA: "Run free scan →"
├── Helper Text: "We only use public sources..."
├── Refine Link → Collapsible section
│   └── Advanced Fields (firstName, lastName, email, phone)
└── Related Tools Links (unchanged)
```

---

## Detailed Changes

### 1. Update `src/components/ScanForm.tsx`

**State Changes:**
- Add `identifier: string` - the single input value
- Add `showRefine: boolean` - controls collapsible visibility
- Keep existing `formData` state for advanced fields (used when refined)

**Type Detection Logic (new function):**
Create `detectIdentifierType(input: string)`:
- Contains `@` and `.` after `@` → `email`
- Starts with `+` or contains 7+ consecutive digits → `phone`
- Contains a space → `fullname` (split into firstName + lastName)
- Default → `username`

**Form Structure:**
```tsx
<form onSubmit={handleSubmit}>
  {/* Single Input */}
  <div className="space-y-2">
    <Label htmlFor="identifier" className="sr-only">Search identifier</Label>
    <Input
      id="identifier"
      placeholder="Username, email, phone number, or full name"
      value={identifier}
      onChange={(e) => setIdentifier(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
      className="h-12 text-lg bg-secondary border-border"
      maxLength={255}
      autoFocus
    />
  </div>

  {/* Turnstile (de-emphasized) */}
  {requiresTurnstile && (
    <div className="opacity-80">
      <TurnstileWidget ... />
    </div>
  )}

  {/* Primary CTA */}
  <Button type="submit" size="lg" className="w-full">
    Run free scan
    <ArrowRight className="w-5 h-5 ml-2" />
  </Button>

  {/* Helper Text */}
  <p className="text-xs text-muted-foreground text-center">
    We only use public sources. Queries are discarded after processing.
  </p>

  {/* Refine Section */}
  <Collapsible open={showRefine} onOpenChange={handleRefineToggle}>
    <CollapsibleTrigger asChild>
      <Button variant="link" size="sm" className="text-muted-foreground">
        {showRefine ? 'Hide' : 'Refine search options'}
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-4 space-y-4">
      {/* Existing advanced fields: firstName, lastName, email, phone */}
    </CollapsibleContent>
  </Collapsible>
</form>
```

**Submit Logic (`handleSubmit`):**
1. Fire `scan_start_click` analytics event
2. Validate Turnstile token if required
3. Detect identifier type using `detectIdentifierType(identifier)`
4. Build `ScanFormData`:
   - If `email` detected → set `formData.email`
   - If `phone` detected → validate and set `formData.phone`
   - If `fullname` detected → split and set `firstName` + `lastName`
   - If `username` detected → set `formData.username`
5. Merge with any advanced field overrides if "Refine" was used
6. Call `onSubmit(submitData)`

**Analytics Events:**
- `scan_start_click` - fired when CTA clicked
- `scan_refine_open` - fired when Refine collapsible opened
- `scan_submit` - fired on successful form validation before `onSubmit`

---

### 2. Create `src/lib/scan/identifierDetection.ts`

New utility for auto-detecting input type:

```typescript
export type IdentifierType = 'email' | 'phone' | 'username' | 'fullname';

export interface DetectionResult {
  type: IdentifierType;
  normalized: {
    email?: string;
    phone?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
}

export function detectIdentifierType(input: string): DetectionResult {
  const trimmed = input.trim();
  
  // Email detection: contains @ with domain
  if (/@.+\..+/.test(trimmed)) {
    return {
      type: 'email',
      normalized: { email: trimmed.toLowerCase() }
    };
  }
  
  // Phone detection: starts with + or has 7+ digits
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+') || digits.length >= 7) {
    return {
      type: 'phone',
      normalized: { phone: trimmed }
    };
  }
  
  // Full name detection: contains space
  if (/\s/.test(trimmed)) {
    const parts = trimmed.split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return {
      type: 'fullname',
      normalized: { firstName, lastName }
    };
  }
  
  // Default: username
  return {
    type: 'username',
    normalized: { username: trimmed }
  };
}
```

---

### 3. Update `src/lib/analytics.ts`

Add new analytics methods:

```typescript
scanStartClick: () => {
  trackEvent("scan_start_click");
},

scanRefineOpen: () => {
  trackEvent("scan_refine_open");
},

scanSubmit: (identifierType: string) => {
  trackEvent("scan_submit", { identifier_type: identifierType });
},
```

---

## Visual Layout

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│          Start Your Digital Footprint Scan                  │
│    Search by username or personal details to find your      │
│                    online presence                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Username, email, phone number, or full name           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Turnstile widget (subtle, only for Free users) ─────┐  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Run free scan →                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│   We only use public sources. Queries are discarded after   │
│                      processing.                            │
│                                                             │
│                   ▸ Refine search options                   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Or try our focused search tools:                           │
│  [Username Search]  [Email Breach Check]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**When "Refine" is expanded:**
```text
│                   ▾ Hide refine options                     │
│                                                             │
│   ┌─────────────────┐  ┌─────────────────┐                  │
│   │ First Name      │  │ Last Name       │                  │
│   └─────────────────┘  └─────────────────┘                  │
│                                                             │
│   ┌───────────────────────────────────────┐                 │
│   │ Email Address                         │                 │
│   └───────────────────────────────────────┘                 │
│                                                             │
│   ┌───────────────────────────────────────┐                 │
│   │ Phone Number                          │                 │
│   └───────────────────────────────────────┘                 │
```

---

## Validation Flow

1. **Empty input** → Toast: "Please enter an identifier to search"
2. **Phone detected but invalid** → Validate using existing `validatePhone`, show error
3. **Email detected but invalid** → Validate using existing zod schema, show error
4. **Turnstile required but missing** → Show Turnstile error message
5. **Valid input** → Fire `scan_submit` event, call `onSubmit`

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/ScanForm.tsx` | Complete refactor with single input + Collapsible refine section |
| `src/lib/scan/identifierDetection.ts` | New file: identifier type detection utility |
| `src/lib/analytics.ts` | Add `scanStartClick`, `scanRefineOpen`, `scanSubmit` events |

---

## Technical Notes

### Keyboard Submit
The input field has `onKeyDown` handler to trigger submit on Enter key press.

### Backward Compatibility
The `ScanFormData` interface remains unchanged. The single input is mapped to the appropriate field(s) before calling `onSubmit`, so `ScanProgress` and downstream components work without modification.

### Turnstile De-emphasis
Wrapped in a container with `opacity-80` and moved below the input but above the CTA, making it less visually prominent while remaining accessible.

### Collapsible Import
Using existing `@/components/ui/collapsible` (Radix-based) for the Refine section.

---

## Acceptance Criteria

- [ ] Single input field accepts username, email, phone, or full name
- [ ] Auto-detects identifier type and maps to correct `ScanFormData` fields
- [ ] "Run free scan →" button triggers scan
- [ ] Enter key submits the form
- [ ] "Refine" link opens collapsible with advanced fields
- [ ] Turnstile appears below input (only for Free users), visually de-emphasized
- [ ] Helper text displayed: "We only use public sources..."
- [ ] Analytics events fire: `scan_start_click`, `scan_refine_open`, `scan_submit`
- [ ] Existing focused search tool links remain at bottom
