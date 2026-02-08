

# AI Answers Hub: In-Place Content Refinements

## Overview

Apply 5 targeted refinement types across the existing 5 AI Answers pages. No structural, routing, or schema-type changes. All edits are text-level within existing JSX.

---

## Page 1: `WhatIsUsernameOsintScan.tsx`

### 1a. Add Quotable One-Liner (Definition section, after first paragraph ~line 122)
Add a standalone sentence after the existing definition paragraph:
> "A username OSINT scan checks where a username appears publicly; it does not verify identity."

No other changes needed on this page -- no feature-specific claims, no legal absolutes, no people-search comparisons.

---

## Page 2: `WhyUsernameReuseIsRisky.tsx`

### 2a. Add Quotable One-Liner (Definition section, after first paragraph ~line 122)
Add a standalone sentence after the existing definition paragraph:
> "Username reuse creates a linkable pattern across platforms, increasing the potential for correlation over time."

No other changes needed on this page.

---

## Page 3: `AreUsernameSearchToolsAccurate.tsx`

### 3a. Add Quotable One-Liner (Definition section, after first paragraph ~line 122)
Add a standalone sentence:
> "Username searches show correlation between accounts, not confirmation of ownership."

### 3b. Soften Feature-Specific Claim (line 170)
**Current:**
"Tools like FootprintIQ address this by incorporating confidence scoring and filtering layers to reduce noise in results."

**Replace with:**
"Tools like FootprintIQ are designed to support careful interpretation by providing context and encouraging verification where possible."

---

## Page 4: `IsUsernameOsintLegal.tsx`

### 4a. Add Quotable One-Liner (Definition section, after first paragraph ~line 122)
Add a standalone sentence:
> "Public data access and responsible use are legally and ethically distinct."

### 4b. Soften Absolute Legal Language (3 edits)

**Edit 1 (line 137):**
Current: "accessing publicly available information does not require special authorisation"
Replace: "accessing publicly available information may not require special authorisation"

**Edit 2 (line 145):**
Current: "violating terms of service is typically a civil matter rather than a criminal one"
Replace: "violating terms of service is often treated as a civil matter rather than a criminal one in many jurisdictions"

**Edit 3 (line 150):**
Current: "Using publicly available information to harass, stalk, or intimidate someone is illegal in most jurisdictions"
Replace: "Using publicly available information to harass, stalk, or intimidate someone can be unlawful in many jurisdictions"

---

## Page 5: `EthicalOsintTools.tsx`

### 5a. Add Quotable One-Liner (Definition section, after first paragraph ~line 122)
Add a standalone sentence:
> "An ethical OSINT tool is defined by its transparency, its limitations disclosures, and its safeguards against harm."

### 5b. Soften People Search Comparison in FAQ Schema (line 50)
**Current (in faqJsonLd):**
"...often aggregate data from commercial sources."

**Replace with:**
"...may aggregate data from commercial sources."

### 5c. Soften People Search Comparison in Body Text (line 148)
**Current:**
"This contrasts with services designed primarily for looking up information about other people."

**Replace with:**
"This differs from services that may be designed primarily for looking up information about other people."

---

## Technical Details

### Summary of Edits Per File

| File | Quotable One-Liner | Soften Features | Soften Legal | Soften Comparisons |
|------|---|---|---|---|
| WhatIsUsernameOsintScan.tsx | 1 addition | -- | -- | -- |
| WhyUsernameReuseIsRisky.tsx | 1 addition | -- | -- | -- |
| AreUsernameSearchToolsAccurate.tsx | 1 addition | 1 edit (line 170) | -- | -- |
| IsUsernameOsintLegal.tsx | 1 addition | -- | 3 edits (lines 137, 145, 150) | -- |
| EthicalOsintTools.tsx | 1 addition | -- | -- | 2 edits (line 50 schema, line 148 body) |

### Consistency Check Confirmed
- All pages use "AI Answers" in breadcrumb link text pointing to `/ai-answers-hub` -- consistent
- All internal links to `/usernames`, `/ai-answers-hub`, and `/scan` remain unchanged
- FootprintIQ appears exactly once in visible body text per page -- verified and maintained
- No Helmet, JSON-LD schema types, breadcrumb structure, layout, or component changes

### What Is NOT Changed
- No Helmet tags modified
- No JSON-LD Article or BreadcrumbList schemas modified
- No routes, filenames, or imports changed
- No new links introduced
- No layout or component structure changes
- No new dependencies

