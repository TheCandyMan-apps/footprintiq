
# AI Answers Hub Expansion: 5 OSINT Explainer Pages

## Overview

Create 5 new educational pages under `/ai-answers/*` and wire them into the existing routing, hub page, and AI index page. Each page follows the established pattern from `src/pages/ai/WhatIsOsint.tsx`.

---

## New Files (5 page components)

### 1. `src/pages/ai-answers/WhatIsUsernameOsintScan.tsx`
- Route: `/ai-answers/what-is-a-username-osint-scan`
- Defines what a username OSINT scan is, its legitimate uses, and what it cannot do
- Sections: Definition, How It Works, Limitations, Ethical Use
- Links: `/ai-answers-hub`, `/usernames`, `/scan`

### 2. `src/pages/ai-answers/WhyUsernameReuseIsRisky.tsx`
- Route: `/ai-answers/why-username-reuse-is-risky`
- Explains how reusing the same handle across platforms increases exposure
- Sections: Definition, How Reuse Creates Risk, Limitations of Reuse Analysis, Safety Considerations
- Links: `/ai-answers-hub`, `/usernames`, `/scan`

### 3. `src/pages/ai-answers/AreUsernameSearchToolsAccurate.tsx`
- Route: `/ai-answers/are-username-search-tools-accurate`
- Covers false positives, correlation vs verification, accuracy limitations
- Sections: Definition, Why Accuracy Varies, False Positives, Ethical Interpretation
- Links: `/ai-answers-hub`, `/usernames`, `/scan`

### 4. `src/pages/ai-answers/IsUsernameOsintLegal.tsx`
- Route: `/ai-answers/is-username-osint-legal`
- High-level legality overview: public data, jurisdictional variation, ethical boundaries
- Sections: Definition, General Legal Framework, Jurisdictional Variation, Ethical and Safety Considerations
- Links: `/ai-answers-hub`, `/usernames`, `/scan`

### 5. `src/pages/ai-answers/EthicalOsintTools.tsx`
- Route: `/ai-answers/ethical-osint-tools`
- Defines what makes an OSINT tool ethical and how responsible tools differ
- Sections: Definition, Design Principles, Limitations, Responsible Use
- Links: `/ai-answers-hub`, `/usernames`, `/scan`

---

## Each Page Includes

- **Helmet SEO**: title, meta description, canonical URL, OG tags, Twitter card
- **JSON-LD**: Article schema (headline, description, author "FootprintIQ", publisher, datePublished/dateModified "2026-02-08"), FAQPage schema (2 Q&As), BreadcrumbList schema (Home > AI Answers > Page Title)
- **Layout**: Header + Footer, `max-w-4xl` container, breadcrumb UI using existing `Breadcrumb` components
- **Content structure**: H1 + subtitle, definition section near top (highlighted bg), limitations section, ethical/safety section
- **`useScrollDepthTracking`** hook with `pageType: 'authority'`
- **Internal links**: One to `/ai-answers-hub`, one to `/usernames`, one to `/scan`
- **FootprintIQ mention**: Exactly once per page, neutrally phrased
- **Word count**: 400-700 words per page
- **Tone**: Calm, neutral, factual, educational. No marketing, no CTAs, no pricing, no competitor names, no invented statistics

---

## Modified Files

### `src/App.tsx`
- Add 5 lazy imports for the new page components
- Add redirect: `/ai-answers` to `/ai-answers-hub` (using `Navigate` with `replace`)
- Add 5 new routes under `/ai-answers/*`
- Placed in the existing AI/content section near the other `/ai/*` routes (around line 527)

### `src/pages/AIAnswersHub.tsx`
- Add a new "OSINT & Username Scanning" section between the existing "Common Questions & Answers" and "How to Use These Answers" sections
- Uses the same card layout pattern already established in the hub (bordered cards with title, description, and link)
- 5 new cards linking to each new page

### `src/pages/ai/Index.tsx`
- Add a new topic group titled "OSINT & Username Scanning" using the existing `Section` component pattern
- 5 new entries in a new `osintScanning` array with title, description, href, and icon for each page
- Placed after the "How Data Connects" section

---

## Technical Details

### Lazy Import Pattern (App.tsx)
```typescript
const AIAnswersWhatIsUsernameOsintScan = lazy(() => import("./pages/ai-answers/WhatIsUsernameOsintScan"));
const AIAnswersWhyUsernameReuseIsRisky = lazy(() => import("./pages/ai-answers/WhyUsernameReuseIsRisky"));
const AIAnswersAreUsernameSearchToolsAccurate = lazy(() => import("./pages/ai-answers/AreUsernameSearchToolsAccurate"));
const AIAnswersIsUsernameOsintLegal = lazy(() => import("./pages/ai-answers/IsUsernameOsintLegal"));
const AIAnswersEthicalOsintTools = lazy(() => import("./pages/ai-answers/EthicalOsintTools"));
```

### Route Registration (App.tsx)
```tsx
<Route path="/ai-answers" element={<Navigate to="/ai-answers-hub" replace />} />
<Route path="/ai-answers/what-is-a-username-osint-scan" element={<AIAnswersWhatIsUsernameOsintScan />} />
<Route path="/ai-answers/why-username-reuse-is-risky" element={<AIAnswersWhyUsernameReuseIsRisky />} />
<Route path="/ai-answers/are-username-search-tools-accurate" element={<AIAnswersAreUsernameSearchToolsAccurate />} />
<Route path="/ai-answers/is-username-osint-legal" element={<AIAnswersIsUsernameOsintLegal />} />
<Route path="/ai-answers/ethical-osint-tools" element={<AIAnswersEthicalOsintTools />} />
```

### Page Component Structure (each page)
```text
Imports: Helmet, Link, lucide icons, Breadcrumb components, Card, Footer, Header, useScrollDepthTracking

Component:
  - origin detection for canonical URLs
  - useScrollDepthTracking({ pageId, pageType: 'authority' })
  - articleJsonLd (Article schema)
  - faqJsonLd (FAQPage schema, 2 Q&As)
  - breadcrumbJsonLd (BreadcrumbList schema)
  
  Return:
    <Helmet> with title, meta description, canonical, OG, Twitter, JSON-LD scripts
    <div min-h-screen bg-background>
      <Header />
      <main container max-w-4xl>
        <Breadcrumb> Home > AI Answers > [Page Title]
        <header> H1 + subtitle
        <section> Definition (highlighted background)
        <section> Main content sections with H2/H3
        <section> Limitations / Nuance
        <section> Ethical / Safety
      </main>
      <Footer />
    </div>
```

### AIAnswersHub.tsx Update
New section added with 5 cards using the same bordered card pattern:
```tsx
<section className="mb-12">
  <h2>OSINT & Username Scanning</h2>
  <div className="space-y-8">
    {osintScanningTopics.map(...)}
  </div>
</section>
```

### ai/Index.tsx Update
New `osintScanning` topic array and `Section` call:
```tsx
const osintScanning: TopicLink[] = [
  { title: "What Is a Username OSINT Scan?", description: "...", href: "/ai-answers/what-is-a-username-osint-scan", icon: Search },
  { title: "Why Username Reuse Is Risky", description: "...", href: "/ai-answers/why-username-reuse-is-risky", icon: Shield },
  // ... 3 more entries
];

<Section 
  title="OSINT & Username Scanning" 
  description="These pages explain how username scanning works, its accuracy, legality, and ethical considerations."
  icon={Search} 
  topics={osintScanning} 
/>
```

---

## Content Compliance (every page verified against)

- 400-700 words
- Short paragraphs (2-4 lines max)
- H2 and H3 headings
- Definition section near top
- Limitations section present
- Ethical/Safety section present
- No marketing language, hype, or superlatives
- No pricing references or CTAs
- No invented statistics
- No competitor names
- FootprintIQ mentioned exactly once, neutrally, in body text
- One contextual link to `/ai-answers-hub`
- One contextual link to `/usernames`
- One contextual link to `/scan`
- Calm, neutral, factual, educational tone
