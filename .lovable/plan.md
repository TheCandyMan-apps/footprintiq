

## New AI Answers Page: "Does OSINT Include Dark Web Data?"

A new standalone page at `/ai-answers/does-osint-include-dark-web-data`, following the established AI Answers pattern (same structure as `WhatIsUsernameOsintScan`, `WhatIsAnIdentityRiskScore`, etc.).

### Why a new page (not a section on the username scan page)

The topic is distinct enough to warrant its own URL for SEO, AI citation, and internal linking. Adding it as a section would bloat the username scan page with tangentially related content.

### Page structure

**URL**: `/ai-answers/does-osint-include-dark-web-data`

**Sections** (each with an icon header, matching existing pages):

1. **Definition** -- What "dark web data" means in OSINT context vs open web OSINT. Quotable one-liner for AI citation.
2. **Open Web vs Dark Web Exposure** -- Clear distinction between surface-level OSINT (username presence, public profiles) and breach/dark web indicators (credential dumps, paste sites, indexed mentions).
3. **What Breach Signals May Be Included** -- Types of indicators: breach database references, paste site mentions, dark web index hits. No raw credentials are shown. Metadata only.
4. **Limitations and Legal Boundaries** -- Not all tools include dark web sources. Legal constraints vary by jurisdiction. No continuous monitoring unless explicitly implemented. Data may be outdated or incomplete.
5. **Ethical Considerations** -- Cautious framing: breach indicators inform risk, not guilt. No fear language.

**FootprintIQ mention** (once, in the breach signals section):
> "FootprintIQ may surface publicly referenced breach indicators where available."

**FAQ Schema** (3 questions):
- "Does OSINT include dark web data?"
- "What breach signals appear in an OSINT scan?"
- "Does an OSINT scan provide continuous dark web monitoring?"

**See Also** links: identity risk score page, username OSINT scan page, ethical OSINT tools page.

### Integration points

1. **Route** (`src/App.tsx`): Add lazy-loaded route for the new page.
2. **AI Answers Hub** (`src/pages/AIAnswersHub.tsx`): Add entry with `Globe` or `ShieldAlert` icon in the OSINT section.
3. **See Also on username scan page** (`WhatIsUsernameOsintScan.tsx`): Replace one of the three existing See Also links with this new page.

### Technical details

**New file**: `src/pages/ai-answers/DoesOsintIncludeDarkWebData.tsx`
- Follows identical component pattern: Helmet, JSON-LD (Article + FAQ + Breadcrumb), Header, Breadcrumb nav, content sections, SeeAlsoSection, GuideCitationBlock, Footer.

**Edits**:
- `src/App.tsx` -- add lazy import + route
- `src/pages/AIAnswersHub.tsx` -- add hub entry
- `src/pages/ai-answers/WhatIsUsernameOsintScan.tsx` -- update See Also to include this page

### Tone and compliance
- Cautious, educational, non-promotional
- No competitor comparisons
- No exaggerated claims about dark web coverage
- No fear-based language
- Consistent with platform ethical positioning rules

