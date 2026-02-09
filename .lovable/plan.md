
# Android Chrome Mobile Optimisations

## Overview
Most of the iOS optimisations already work on Android Chrome (safe areas, touch-action, overscroll, theme-color). This plan targets Android-specific improvements: proper adaptive icon support, richer install experience, Android back-button handling in standalone mode, and the `display_override` manifest field for a more native PWA feel.

## What's Already Working on Android
- `touch-action: manipulation` (no tap delay)
- `-webkit-tap-highlight-color: transparent`
- `overscroll-behavior-y: none` (prevents pull-to-refresh)
- `theme-color` meta tags (colours the Android status bar)
- 16px input font (prevents zoom on some Android browsers)
- Safe area insets (respected on Android notch/punch-hole devices)
- PWA manifest with standalone display, shortcuts, and screenshots
- `beforeinstallprompt` API in PWAInstallPrompt (works natively on Chrome Android)

## Changes

### 1. Manifest Enhancements (`public/manifest.json` + `vite.config.ts`)
- Add `display_override: ["standalone"]` -- this is the modern replacement for `display` on Android Chrome, giving you future-proofing for new display modes.
- Split icon purposes: Android requires separate `"any"` and `"maskable"` icon entries. Currently both are combined as `"any maskable"` which Chrome flags as a warning. Split into two entries per size.
- Add a `144x144` icon entry for older Android devices.
- Add `"form_factor": "narrow"` to the screenshot entry so Chrome shows it in the mobile install UI (richer install sheet).
- Add a second `"wide"` screenshot for tablet installs.
- Update `theme_color` and `background_color` to match the dynamic values used in App.tsx (align with light mode default: `#ffffff`).

### 2. Android Back Button / Gesture Navigation (`src/App.tsx`)
- In standalone PWA mode on Android, the hardware/gesture back button maps to `history.back()`. If the user is on the home page and presses back, the app closes -- which feels broken.
- Add a `popstate` listener that prevents closing the app when at the root route by pushing state back onto the history stack.

### 3. PWAInstallPrompt Android-Specific UI (`src/components/PWAInstallPrompt.tsx`)
- The component already handles `beforeinstallprompt` correctly for Android Chrome.
- Add platform detection: on Android, show "Install" with the native prompt. On iOS Safari (where `beforeinstallprompt` is unavailable), show manual instructions: "Tap Share, then Add to Home Screen".
- This makes the install prompt useful on both platforms instead of being a no-op on iOS.

### 4. Android Status Bar + Navigation Bar Colours
- The dynamic `theme-color` update in `App.tsx` already handles the status bar.
- Add a second meta tag approach: set `<meta name="theme-color">` without media queries as the primary (Android Chrome uses this), keeping the prefers-color-scheme variants as fallbacks. The JS in App.tsx already overrides these dynamically.

### 5. Viewport Stability for Android Keyboards
- Android Chrome resizes the viewport when the keyboard opens (unlike iOS which uses `visualViewport`). The current `MobileCTABar` keyboard detection using `visualViewport` also works on Android Chrome.
- No additional changes needed, but verify the threshold (75% of window height) works on Android where keyboard heights differ.

## Technical Details

### Manifest icon split (both files)
```json
"icons": [
  {
    "src": "/pwa-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/pwa-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "maskable"
  },
  {
    "src": "/pwa-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/pwa-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "maskable"
  }
]
```

### Android back-button handler (App.tsx)
```typescript
// Inside RouterContent component
useEffect(() => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (!isStandalone) return;

  // Prevent app from closing on back press at root
  const handlePopState = () => {
    if (window.location.pathname === '/') {
      window.history.pushState(null, '', '/');
    }
  };

  window.history.pushState(null, '', window.location.href);
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);
```

### PWAInstallPrompt iOS fallback
Add platform detection and show "Tap Share > Add to Home Screen" instructions when `deferredPrompt` is null and the user is on iOS Safari.

### Manifest additions
```json
"display_override": ["standalone"],
"screenshots": [
  {
    "src": "/og-image.jpg",
    "sizes": "1280x720",
    "type": "image/jpeg",
    "label": "FootprintIQ Dashboard",
    "form_factor": "narrow"
  }
]
```

### Files Modified
1. `public/manifest.json` -- display_override, split icons, screenshot form_factor
2. `vite.config.ts` -- mirror manifest changes in VitePWA config
3. `src/App.tsx` -- Android back-button handler for standalone mode
4. `src/components/PWAInstallPrompt.tsx` -- iOS/Android platform-aware install UI

All changes are lightweight: manifest fields, one useEffect, and conditional UI text. No new dependencies.
