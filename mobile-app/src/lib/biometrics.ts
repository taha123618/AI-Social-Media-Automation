import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricStatus {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  biometryType: 'FACIAL_RECOGNITION' | 'FINGERPRINT' | 'NONE';
}

export const BiometricsService = {
  checkStatus: async (): Promise<BiometricStatus> => {
    if (Platform.OS === 'web') {
      return { isAvailable: false, hasHardware: false, isEnrolled: false, biometryType: 'NONE' };
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometryType: 'FACIAL_RECOGNITION' | 'FINGERPRINT' | 'NONE' = 'NONE';
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometryType = 'FACIAL_RECOGNITION';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometryType = 'FINGERPRINT';
      }

      return {
        isAvailable: hasHardware && isEnrolled,
        hasHardware,
        isEnrolled,
        biometryType,
      };
    } catch {
      return { isAvailable: false, hasHardware: false, isEnrolled: false, biometryType: 'NONE' };
    }
  },

  promptBiometrics: async (promptMessage = 'Unlock SocialAI'): Promise<boolean> => {
    if (Platform.OS === 'web') return false;

    try {
      const status = await BiometricsService.checkStatus();
      if (!status.isAvailable) return false;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Use Password',
        fallbackLabel: 'Enter Password',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch {
      return false;
    }
  },
};
