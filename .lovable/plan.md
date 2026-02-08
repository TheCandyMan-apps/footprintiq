
# Add "AI Answers" Footer Link

## Finding

The footer already contains a link to `/ai-answers-hub` in the Resources column (line 67 of `src/components/Footer.tsx`), but it is currently labeled **"AI Answers Hub"**.

## Change

Rename the label from "AI Answers Hub" to "AI Answers" on that single line. The route (`/ai-answers-hub`), styling, and position all remain exactly as they are.

## File: `src/components/Footer.tsx`

**Line 67 — label change only:**

```
Before: AI Answers Hub
After:  AI Answers
```

No other files are affected. No new links, routes, or styling changes.
