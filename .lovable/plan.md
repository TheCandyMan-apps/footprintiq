

# iOS App Icons and Splash Screens for FootprintIQ

## What This Does

Sets up all the required app icon sizes and splash/launch screen images so the iOS app looks polished on every Apple device -- from iPhone SE to iPad Pro. Right now, the project has no iOS icon or splash assets at all, so this fills that gap.

## Approach

We will use Capacitor's official asset generation tool (`@capacitor/assets`). You provide two source images, and it automatically creates every size Apple requires -- no manual resizing needed.

## Step-by-Step Plan

### 1. Create the `assets/` source folder

Add a folder at the project root called `assets/` with these files:

| File | Purpose | Minimum Size |
|------|---------|-------------|
| `icon-only.png` | App icon (no background padding) | 1024 x 1024 px |
| `icon-foreground.png` | Icon foreground layer (for adaptive icons on Android too) | 1024 x 1024 px |
| `icon-background.png` | Solid background behind the foreground layer | 1024 x 1024 px |
| `splash.png` | Launch/splash screen shown while app loads | 2732 x 2732 px |
| `splash-dark.png` | Dark-mode variant of the splash screen | 2732 x 2732 px |

We will generate these from the existing `logo-icon.png` (1024x1024) brand asset. The splash screens will use FootprintIQ's brand colours (#0a0a0f dark background, #7c3aed purple accent) with the shield logo centered.

### 2. Generate icon source images programmatically

Create a small helper script (`scripts/generate-asset-sources.ts`) that:
- Takes `public/logo-icon-transparent.png` as the icon source
- Creates `assets/icon-only.png` (transparent logo on transparent background, 1024x1024)
- Creates `assets/icon-foreground.png` (logo padded to safe zone, 1024x1024)
- Creates `assets/icon-background.png` (solid #0a0a0f background, 1024x1024)
- Creates `assets/splash.png` (centered logo on #0a0a0f background, 2732x2732)
- Creates `assets/splash-dark.png` (same as splash but slightly different tint)

Since we cannot run image processing in the browser, these will be simple static PNGs placed manually from the existing brand assets.

### 3. Install `@capacitor/assets` as a dev dependency

Add it to `package.json`:
```
@capacitor/assets (dev dependency)
```

### 4. Add npm script for asset generation

Add to `package.json` scripts:
```json
"generate:assets": "npx capacitor-assets generate"
```

This command reads from `assets/` and outputs correctly sized icons and splash screens into the `ios/` and `android/` folders.

### 5. Add Apple Touch Icon to `index.html`

Add `<link>` tags for PWA/Safari support:
```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
```

### 6. Update PWA manifest

Replace placeholder icons in `manifest.json` and `vite.config.ts` PWA config with actual icon paths:
- 192x192 PNG icon
- 512x512 PNG icon

### 7. Add Capacitor splash screen configuration

Update `capacitor.config.ts` to include splash screen settings:
```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    launchAutoHide: true,
    backgroundColor: '#0a0a0f',
    showSpinner: false,
    launchFadeOutDuration: 500,
  }
}
```

## What Gets Created

After running `npx capacitor-assets generate`, the tool auto-generates:

**iOS App Icons (AppIcon.appiconset):**
- 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87, 120x120, 152x152, 167x167, 180x180, 1024x1024

**iOS Splash/Launch Screens:**
- All required sizes for iPhone SE through iPad Pro (portrait and landscape)

**PWA Icons:**
- 192x192, 512x512 (with maskable variants)

## Technical Details

### Files created:
- `assets/icon-only.png` -- source icon (1024x1024)
- `assets/icon-foreground.png` -- foreground layer (1024x1024)
- `assets/icon-background.png` -- background layer (1024x1024)
- `assets/splash.png` -- splash screen (2732x2732)
- `assets/splash-dark.png` -- dark splash screen (2732x2732)

### Files modified:
- `capacitor.config.ts` -- add SplashScreen plugin config
- `index.html` -- add apple-touch-icon link
- `vite.config.ts` -- update PWA manifest icon references
- `manifest.json` -- update icon references
- `package.json` -- add `@capacitor/assets` dev dependency and `generate:assets` script

### Post-implementation steps (on your Mac):
1. Export/pull the project from GitHub
2. Run `npm install`
3. Place your final 1024x1024 icon PNG and 2732x2732 splash PNG into the `assets/` folder (or use the generated defaults)
4. Run `npm run generate:assets` to produce all iOS/Android/PWA sizes
5. Run `npx cap sync ios` to sync everything to the Xcode project
6. Open in Xcode with `npx cap open ios` to verify icons appear correctly

