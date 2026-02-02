

# Plan: Add "Credits Only" Disclaimer to Credits Page

## Problem

The "Credits only. Does not unlock Pro features or additional providers" disclaimer was added to `src/components/CreditPackCard.tsx`, but the Settings > Credits page uses **its own inline card rendering** in `src/pages/Settings/Credits.tsx` instead of importing `CreditPackCard`.

This means the important clarification messaging is **not visible** on the page where users actually purchase credits.

---

## Solution

Add the same disclaimer box and tooltip to the credit package cards in `src/pages/Settings/Credits.tsx`, between the feature bullets and the Purchase button.

---

## Changes

### File: `src/pages/Settings/Credits.tsx`

**Add imports** (top of file):
- `Info` icon from lucide-react
- `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` from UI components

**Add disclaimer block** (after line 133, before the Purchase button):

```tsx
{/* Important clarification about credits vs Pro */}
<TooltipProvider>
  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 text-left w-full">
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0 cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[250px]">
        <p>Credits are for scan usage. To unlock additional OSINT providers (Sherlock, HIBP, phone tools) and premium features (AI insights, exports), you need a Pro subscription.</p>
      </TooltipContent>
    </Tooltip>
    <p className="text-xs text-muted-foreground">
      <strong className="text-foreground">Credits only.</strong> Does not unlock Pro features or additional providers.
    </p>
  </div>
</TooltipProvider>
```

---

## Visual Result

Each credit package card will show:

```
┌──────────────────────────────────────┐
│          [Package Icon]              │
│                                      │
│           Tiny Pack                  │
│             £5                       │
│          10 credits                  │
│                                      │
│  • Use credits with any provider     │
│  • Provider costs range 1-3 credits  │
│  • Select providers for cost control │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ⓘ Credits only. Does not      │  │
│  │    unlock Pro features or      │  │
│  │    additional providers.       │  │
│  └────────────────────────────────┘  │
│                                      │
│         [ Purchase ]                 │
└──────────────────────────────────────┘
```

---

## Technical Notes

- Matches the same styling as `CreditPackCard.tsx` for consistency
- Tooltip provides detailed explanation on hover/tap
- No new dependencies required
- Single file modification

