// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'com.transmogrify.transmobility',
//   appName: 'TransMobility',
//   webDir: 'dist',
//    server: {
//     androidScheme: 'https'  // Only this is needed
//     // Remove hostname: 'localhost' - it's for development only
//   }
// };


// export default config;

// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'com.transmogrify.transmobility',
//   appName: 'TransMobility',
//   webDir: 'dist',
//   server: {
//     androidScheme: 'https',
//     allowNavigation: ['be.shuttleapp.transev.site', 'shuttleapp.transev.site']
//   }
// };

// export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.transmogrify.transmobility',
  appName: 'TransMobility',
  webDir: 'dist',
  android: {
    // Keep the WebView inside the live status bar, navigation bar,
    // gesture navigation, and display cutout insets on edge-to-edge Android.
    adjustMarginsForEdgeToEdge: 'auto'
  },
  plugins: {
    StatusBar: {
      // Android versions before enforced edge-to-edge should also lay the
      // WebView out below the status bar.
      overlaysWebView: false
    }
  },
  server: {
    androidScheme: 'https',
    allowNavigation: ['be.shuttleapp.transev.site', 'shuttleapp.transev.site']
  }
};

export default config;