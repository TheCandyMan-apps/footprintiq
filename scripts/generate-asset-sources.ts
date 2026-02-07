/**
 * Asset Source Generator for FootprintIQ
 * 
 * This script documents how to prepare source assets for @capacitor/assets.
 * Since we can't run image processing in the browser/Lovable environment,
 * the assets have been pre-generated and placed in the assets/ folder.
 * 
 * Source assets required by @capacitor/assets:
 * 
 * assets/
 *   icon-only.png        - 1024x1024 - App icon (transparent background)
 *   icon-foreground.png   - 1024x1024 - Adaptive icon foreground layer
 *   icon-background.png   - 1024x1024 - Adaptive icon background (solid #0a0a0f)
 *   splash.png            - 2732x2732 - Launch screen (centered logo on dark bg)
 *   splash-dark.png       - 2732x2732 - Dark mode launch screen variant
 * 
 * To regenerate all iOS/Android/PWA icon sizes:
 *   npm run generate:assets
 * 
 * This runs: npx capacitor-assets generate
 * 
 * It reads from the assets/ folder and outputs into:
 *   - ios/App/App/Assets.xcassets/AppIcon.appiconset/
 *   - ios/App/App/Assets.xcassets/Splash.imageset/
 *   - android/app/src/main/res/
 *   - public/ (PWA icons)
 * 
 * Brand colours:
 *   Background: #0a0a0f (dark navy)
 *   Primary:    #7c3aed (purple/violet)
 *   Accent:     #06B6D4 (cyan)
 * 
 * Usage:
 *   1. Place your final 1024x1024 icon PNG in assets/icon-only.png
 *   2. Place your 2732x2732 splash PNG in assets/splash.png
 *   3. Run: npm run generate:assets
 *   4. Run: npx cap sync ios
 *   5. Open Xcode: npx cap open ios
 */

console.log('📱 FootprintIQ Asset Generator');
console.log('=============================');
console.log('');
console.log('Source assets should be placed in the assets/ folder:');
console.log('  - assets/icon-only.png        (1024x1024)');
console.log('  - assets/icon-foreground.png   (1024x1024)');
console.log('  - assets/icon-background.png   (1024x1024)');
console.log('  - assets/splash.png            (2732x2732)');
console.log('  - assets/splash-dark.png       (2732x2732)');
console.log('');
console.log('To generate all platform icons and splash screens:');
console.log('  npm run generate:assets');
console.log('');
console.log('Then sync to iOS:');
console.log('  npx cap sync ios');
console.log('  npx cap open ios');
