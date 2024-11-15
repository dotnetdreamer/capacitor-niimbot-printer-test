import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'capacitor-niimbot-printer-test',
  webDir: 'www',
  cordova: {
    preferences: {
      bluetooth_restore_state: "true",
      accessBackgroundLocation: "false",
    },
  }
};

export default config;
