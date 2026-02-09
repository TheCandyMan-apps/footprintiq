

# Further iOS Safari Optimisations

## What's Already Done
- Safe area insets (top, bottom)
- Touch-action: manipulation (no 300ms delay)
- Tap highlight removal
- 16px input font (no auto-zoom)
- Haptic feedback on buttons
- PWA manifest with standalone display
- apple-mobile-web-app-capable + status bar meta tags
- overscroll-behavior-y: none

## What's Left

### 1. iOS Splash Screens (Launch Images)
**Why**: When users add FootprintIQ to their home screen, iOS shows a blank white screen while the app loads. Apple requires specific `<link rel="apple-touch-startup-image">` tags with exact device dimensions to show a branded splash screen instead.

**Change**: Add `apple-touch-startup-image` link tags to `index.html` for key iOS device sizes, pointing to generated splash images. We'll create a simple HTML-canvas-based splash (dark background + logo) that covers the main device sizes:
- iPhone 15 Pro Max (1290x2796)
- iPhone 15/14 (1170x2532)
- iPhone SE (750x1334)
- iPad Pro 12.9" (2048x2732)

Since we can't generate image files directly, we'll use a `media` query approach with the existing `og-image.jpg` or `logo-dark.png` as a fallback, and note that proper splash PNGs should be generated offline.

### 2. Standalone Mode Styling
**Why**: When running as a home screen app (standalone mode), iOS doesn't show a browser URL bar, but the app still behaves like a webpage -- rubber-band scrolling on the body, visible scrollbars, and no distinction from browser mode.

**Change in `src/index.css`**:
- Add `@media (display-mode: standalone)` rules to:
  - Hide scrollbars globally for a native feel
  - Disable rubber-band overscroll on the root element
  - Apply a slightly different background to signal standalone mode is active

### 3. iOS-Safe Fixed Bottom Elements
**Why**: The `MobileCTABar` sits at `z-40` which can conflict with iOS keyboard and Safari's bottom toolbar. When the keyboard opens, fixed bottom elements can jump or overlap.

**Change in `src/components/MobileCTABar.tsx`**:
- Add a `visualViewport` resize listener that hides the CTA bar when the iOS keyboard is open (viewport height shrinks significantly)

### 4. Smooth Page Transitions
**Why**: Native iOS apps have smooth transitions between views. The current app has instant page swaps which feel jarring.

**Change in `src/App.tsx` or router wrapper**:
- Add a lightweight CSS fade transition (opacity 0 to 1, ~150ms) on route changes using framer-motion's `AnimatePresence` (already installed) wrapping the route outlet

### 5. Pull-to-Refresh Prevention on Non-Scrollable Pages
**Why**: On iOS Safari, pulling down on pages that don't scroll triggers the browser's reload gesture, which is disruptive mid-scan.

**Change in `src/index.css`**:
- Add `overscroll-behavior-y: contain` on specific containers (scan results, dashboard) to prevent accidental reloads while still allowing natural scroll within content areas

### 6. Theme-Color Updates for Dark/Light Mode
**Why**: The status bar colour should match the current theme. Currently, the meta tags set fixed purple values. When users switch themes, the status bar doesn't update.

**Change**: Add a small effect in the theme provider or `App.tsx` that updates `document.querySelector('meta[name="theme-color"]')` content dynamically when the theme changes -- white-ish for light mode, dark for dark mode.

## Files Modified
1. `index.html` -- splash screen link tags
2. `src/index.css` -- standalone mode styles, overscroll-behavior on containers
3. `src/components/MobileCTABar.tsx` -- keyboard-aware hide logic
4. `src/App.tsx` (or layout wrapper) -- route fade transitions, dynamic theme-color meta
