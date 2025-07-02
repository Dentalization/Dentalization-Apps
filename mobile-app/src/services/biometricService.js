import ReactNativeBiometrics from 'react-native-biometrics';
import TouchID from 'react-native-touch-id';
import { Platform } from 'react-native';

class BiometricService {
  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics();
  }

  // Check if biometric authentication is available
  async isBiometricAvailable() {
    try {
      if (Platform.OS === 'ios') {
        // For iOS, check TouchID/FaceID availability
        const biometryType = await TouchID.isSupported();
        return {
          available: biometryType !== false,
          biometryType,
          error: null,
        };
      } else {
        // For Android, check biometric availability
        const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
        return {
          available,
          biometryType,
          error: null,
        };
      }
    } catch (error) {
      console.error('Biometric availability check error:', error);
      return {
        available: false,
        biometryType: null,
        error: error.message,
      };
    }
  }

  // Get human-readable biometric type name
  getBiometricTypeName(biometryType) {
    switch (biometryType) {
      case 'TouchID':
        return 'Touch ID';
      case 'FaceID':
        return 'Face ID';
      case 'Biometrics':
        return 'Fingerprint';
      default:
        return 'Biometric Authentication';
    }
  }

  // Authenticate user with biometrics
  async authenticateWithBiometrics(reason = 'Authenticate to access the app') {
    try {
      const { available } = await this.isBiometricAvailable();
      
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication is not available',
        };
      }

      if (Platform.OS === 'ios') {
        // Use TouchID for iOS
        const result = await TouchID.authenticate(reason, {
          showPopup: true,
          imageColor: '#e00606',
          imageErrorColor: '#ff0000',
          sensorDescription: 'Touch sensor',
          sensorErrorDescription: 'Failed',
          cancelText: 'Cancel',
          fallbackLabel: 'Show Passcode',
          unifiedErrors: false,
          passcodeFallback: false,
        });

        return {
          success: true,
          result,
        };
      } else {
        // Use ReactNativeBiometrics for Android
        const { success } = await this.rnBiometrics.simplePrompt({
          promptMessage: reason,
          cancelButtonText: 'Cancel',
        });

        return {
          success,
          result: success ? 'Authenticated' : 'Failed',
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      
      // Handle specific error types
      if (error.name === 'UserCancel' || error.message === 'UserCancel') {
        return {
          success: false,
          error: 'User cancelled biometric authentication',
          cancelled: true,
        };
      }

      if (error.name === 'UserFallback') {
        return {
          success: false,
          error: 'User chose to enter password',
          fallback: true,
        };
      }

      if (error.name === 'BiometryNotAvailable') {
        return {
          success: false,
          error: 'Biometric authentication is not available',
        };
      }

      if (error.name === 'BiometryNotEnrolled') {
        return {
          success: false,
          error: 'No biometric credentials enrolled',
        };
      }

      return {
        success: false,
        error: error.message || 'Biometric authentication failed',
      };
    }
  }

  // Create biometric key for secure storage (Android only)
  async createBiometricKey(keyName = 'dentalization_biometric_key') {
    try {
      if (Platform.OS === 'android') {
        const { keysExist } = await this.rnBiometrics.biometricKeysExist();
        
        if (!keysExist) {
          const { publicKey } = await this.rnBiometrics.createKeys();
          return {
            success: true,
            publicKey,
          };
        }
        
        return {
          success: true,
          message: 'Keys already exist',
        };
      }
      
      return {
        success: true,
        message: 'iOS uses Keychain for secure storage',
      };
    } catch (error) {
      console.error('Create biometric key error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete biometric keys
  async deleteBiometricKeys() {
    try {
      if (Platform.OS === 'android') {
        const { keysExist } = await this.rnBiometrics.biometricKeysExist();
        
        if (keysExist) {
          await this.rnBiometrics.deleteKeys();
        }
      }
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('Delete biometric keys error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Check if device has biometric enrollment
  async hasBiometricEnrollment() {
    try {
      const { available } = await this.isBiometricAvailable();
      return available;
    } catch (error) {
      console.error('Biometric enrollment check error:', error);
      return false;
    }
  }

  // Get supported biometric types
  async getSupportedBiometricTypes() {
    try {
      if (Platform.OS === 'ios') {
        const biometryType = await TouchID.isSupported();
        return biometryType !== false ? [biometryType] : [];
      } else {
        const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
        return available ? [biometryType] : [];
      }
    } catch (error) {
      console.error('Get supported biometric types error:', error);
      return [];
    }
  }

  // Get biometric type
  async getBiometricType() {
    try {
      const { available, biometryType } = await this.isBiometricAvailable();
      return available ? biometryType : null;
    } catch (error) {
      console.error('Get biometric type error:', error);
      return null;
    }
  }

  // Check if stored credentials exist (for biometric login)
  async hasStoredCredentials() {
    try {
      // This would check if biometric credentials are stored
      // For now, we'll check if biometric is available and user has enabled it
      const { available } = await this.isBiometricAvailable();
      return available;
    } catch (error) {
      console.error('Check stored credentials error:', error);
      return false;
    }
  }

  // Main authenticate method (simplified interface)
  async authenticate(reason = 'Authenticate to access the app') {
    try {
      const result = await this.authenticateWithBiometrics(reason);
      return result;
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }
}

export default new BiometricService();
