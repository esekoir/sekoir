import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bf9c97fa10bf46e0a5082e040bbdceea',
  appName: 'sekoir',
  webDir: 'dist',
  server: {
    url: 'https://bf9c97fa-10bf-46e0-a508-2e040bbdceea.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    // Keep status bar visible - no fullscreen
    backgroundColor: '#0a0f1c',
    allowMixedContent: true
  },
  plugins: {
    StatusBar: {
      // Keep status bar visible with dark background
      style: 'DARK',
      backgroundColor: '#0a0f1c',
      overlaysWebView: false
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0f1c',
      showSpinner: false
    }
  }
};

export default config;

