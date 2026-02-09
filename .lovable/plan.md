

# Optimize Mobile Web Experience for iOS Safari

## Overview
Make FootprintIQ feel native on iOS Safari by applying safe area insets consistently, improving touch interactions, preventing iOS-specific quirks (bounce scroll, zoom on inputs, tap delay), and polishing responsive layouts across the key surfaces.

## Changes

### 1. Global CSS Improvements (`src/index.css`)
- Add safe area inset utilities for left/right (notch landscape support)
- Add `-webkit-tap-highlight-color: transparent` to remove iOS blue tap flash
- Add `touch-action: manipulation` globally to eliminate 300ms tap delay
- Add smooth momentum scrolling defaults
- Prevent text size adjustment on orientation change (`-webkit-text-size-adjust: 100%`)
- Add `overscroll-behavior-y: none` on body to prevent pull-to-refresh bounce on inner pages
- Set font size on inputs to `16px` minimum to prevent iOS auto-zoom on focus

### 2. Header Safe Area (`src/components/Header.tsx`)
- Add `pt-safe` to the sticky header so it respects the iOS status bar / Dynamic Island area
- The header currently uses `sticky top-0` but doesn't account for the safe area inset top -- content gets hidden behind the notch in standalone PWA mode

### 3. Footer Bottom Padding (`src/components/Footer.tsx`)
- Add `pb-safe` to the footer so content isn't obscured by the home indicator bar on iPhones without a home button

### 4. MobileCTABar Refinements (`src/components/MobileCTABar.tsx`)
- Already has `pb-safe` -- good
- Add `backdrop-saturate-150` for a more native iOS frosted-glass feel
- Increase the z-index to ensure it sits above all other fixed elements

### 5. Mobile Nav Sheet (`src/components/MobileNav.tsx`)
- Add `pb-safe` to the bottom of the sheet content so the last items aren't hidden behind the home indicator
- Ensure nav items have `active:scale-[0.97]` for tactile press feedback (native iOS feel)

### 6. Hero Section Touch Polish (`src/components/Hero.tsx`)
- Use `min-h-[80svh]` (already done) -- confirmed correct for iOS Safari's dynamic viewport
- Ensure the CTA button has `active:scale-[0.97]` for press feedback

### 7. HeroInputField iOS Fix (`src/components/HeroInputField.tsx`)
- Ensure the input has `text-base` (16px) to prevent iOS auto-zoom on focus
- Add `autocomplete`, `autocorrect="off"`, `autocapitalize="off"` attributes for username inputs

### 8. ScanForm Input Fix (`src/components/ScanForm.tsx`)
- Same 16px font-size fix on all input fields to prevent iOS zoom

## Technical Details

### CSS additions to `src/index.css`
```css
/* In @layer base */
html {
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

body {
  overscroll-behavior-y: none;
}

/* In @layer utilities */
.pl-safe { padding-left: env(safe-area-inset-left); }
.pr-safe { padding-right: env(safe-area-inset-right); }

/* Prevent iOS zoom on input focus */
input[type="text"],
input[type="email"],
input[type="tel"],
input[type="search"],
input[type="url"],
input[type="password"],
textarea,
select {
  font-size: 16px !important;
}

@media (min-width: 768px) {
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="search"],
  input[type="url"],
  input[type="password"],
  textarea,
  select {
    font-size: inherit !important;
  }
}
```

### Component changes (className additions only)
- **Header**: `pt-safe` on the `<header>` element
- **Footer**: `pb-safe` on the `<footer>` element  
- **MobileNav**: `pb-safe` on `SheetContent` inner container
- **MobileCTABar**: Add `backdrop-saturate-150`
- **Hero CTA button**: Add `active:scale-[0.97] transition-transform`
- **MobileNav items**: Add `active:scale-[0.97]`

### Files Modified
1. `src/index.css` -- global iOS Safari fixes
2. `src/components/Header.tsx` -- safe area top
3. `src/components/Footer.tsx` -- safe area bottom
4. `src/components/MobileNav.tsx` -- safe area + press feedback
5. `src/components/MobileCTABar.tsx` -- enhanced backdrop
6. `src/components/Hero.tsx` -- press feedback on CTA
7. `src/components/HeroInputField.tsx` -- iOS zoom prevention + autocorrect attrs

All changes are CSS/className only. No logic or functionality changes.
