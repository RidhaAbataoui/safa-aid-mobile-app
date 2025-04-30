
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fd5a5f8a51774e5995a5a9b8780ff489',
  appName: 'safa-aid-mobile-app',
  webDir: 'dist',
  server: {
    url: 'https://fd5a5f8a-5177-4e59-95a5-a9b8780ff489.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
