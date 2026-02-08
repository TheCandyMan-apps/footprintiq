
# Add Informational Block to Username Scan Page

## What Changes

A single, small informational `Alert` block will be added to the `/usernames` page, positioned between the page heading and the tab navigation. It will use the existing `Alert` + `AlertDescription` components (from `@/components/ui/alert`) with an `Info` icon, matching the pattern already used on pages like Maigret Monitoring.

## Content

The block will read:

> **AI Answers** explains accuracy limits, legality, and ethical use of username OSINT.  
> [Learn more](/ai-answers-hub) -- [Are username search tools accurate?](/ai-answers/are-username-search-tools-accurate)

Both links will use React Router's `Link` component. No marketing language, no CTAs.

## File: `src/pages/scan/UsernamesPage.tsx`

**What changes:**

1. Add imports for `Alert`, `AlertDescription` from `@/components/ui/alert`, `Info` from `lucide-react`, and `Link` from `react-router-dom`.
2. Insert the `Alert` block after the heading/description `div` (after line 33) and before the `Tabs` component (line 35), so it sits naturally in the existing `space-y-6` layout.

**New block (inserted between heading and tabs):**

```tsx
<Alert className="bg-muted/50">
  <Info className="h-4 w-4" />
  <AlertDescription>
    <Link to="/ai-answers-hub" className="font-medium underline underline-offset-4 hover:text-primary">
      AI Answers
    </Link>{" "}
    explains accuracy limits, legality, and ethical use of username OSINT.{" "}
    <Link to="/ai-answers/are-username-search-tools-accurate" className="underline underline-offset-4 hover:text-primary">
      Are username search tools accurate?
    </Link>
  </AlertDescription>
</Alert>
```

**No other files are modified.** The `Alert`, `AlertDescription`, `Info`, and `Link` components are all already available in the project. The `bg-muted/50` class gives a subtle background that matches the existing design system without drawing excessive attention.
