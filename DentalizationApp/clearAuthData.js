// Utility script to clear all authentication data
// Run this in the Expo console or add it to a debug screen

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE_KEYS } from './src/constants/auth';

export const clearAllAuthData = async () => {
  try {
    console.log('🧹 Clearing all authentication data...');
    
    // Clear all auth-related storage
    await AsyncStorage.multiRemove([
      AUTH_STORAGE_KEYS.ACCESS_TOKEN,
      AUTH_STORAGE_KEYS.REFRESH_TOKEN,
      AUTH_STORAGE_KEYS.USER_DATA,
      AUTH_STORAGE_KEYS.BIOMETRIC_ENABLED,
    ]);
    
    console.log('✅ All authentication data cleared successfully');
    console.log('📱 Please restart the app or reload to see changes');
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing authentication data:', error);
    return false;
  }
};

// For immediate execution in console
if (typeof window !== 'undefined' && window.__DEV__) {
  window.clearAuthData = clearAllAuthData;
  console.log('🔧 Debug function available: window.clearAuthData()');
}

export default clearAllAuthData;