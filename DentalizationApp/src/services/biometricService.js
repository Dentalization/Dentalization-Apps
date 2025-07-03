// NOTE: Biometric functionality disabled for development

/**
 * Mock implementation of BiometricService that always returns disabled state
 * This mock implementation is used during development to avoid biometric errors
 */
class BiometricService {
  constructor() {
    console.log('Biometric service initialized in DISABLED mode for development');
  }

  // Mock method that always returns unavailable
  async isBiometricAvailable() {
    return {
      available: false,
      biometryType: null,
      error: null,
    };
  }

  // Get human-readable biometric type name
  getBiometricTypeName() {
    return 'None';
  }

  // Authenticate user with biometrics - mock implementation
  async authenticateWithBiometrics() {
    return {
      success: false,
      error: 'Biometrics disabled in development mode',
    };
  }

  // Create biometric key - mock implementation
  async createBiometricKey() {
    return {
      success: false,
      message: 'Biometrics disabled in development mode',
    };
  }

  // Delete biometric keys - mock implementation
  async deleteBiometricKeys() {
    return {
      success: true,
      message: 'No biometric keys to delete (disabled in development mode)',
    };
  }

  // Check if device has biometric enrollment - mock implementation
  async hasBiometricEnrollment() {
    return false;
  }

  // Get supported biometric types - mock implementation
  async getSupportedBiometricTypes() {
    return [];
  }

  // Get biometric type - mock implementation
  async getBiometricType() {
    return null;
  }

  // Check if stored credentials exist - mock implementation
  async hasStoredCredentials() {
    return false;
  }

  // Main authenticate method - mock implementation
  async authenticate() {
    return {
      success: false,
      error: 'Biometrics disabled in development mode',
    };
  }
}

export default new BiometricService();
