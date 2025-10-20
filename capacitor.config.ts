import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.footprintiq.app',
  appName: 'footprintiq',
  webDir: 'dist',
  server: {
    url: 'https://93bce7e7-a3f9-4ffb-8036-32425962a83f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
