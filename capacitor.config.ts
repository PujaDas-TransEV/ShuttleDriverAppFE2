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

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.transmogrify.transmobility',
  appName: 'TransMobility',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['be.shuttleapp.transev.site', 'shuttleapp.transev.site']
  }
};

export default config;