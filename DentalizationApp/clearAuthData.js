console.log('📋 Copy and paste this code in the Expo console (press "j" to open debugger):');
console.log('=' .repeat(70));
console.log(`
import AsyncStorage from '@react-native-async-storage/async-storage';

const clearAllAuthData = async () => {
  try {
    console.log('🧹 Clearing all authentication data...');
    
    const keysToRemove = [
      'access_token',
      'refresh_token', 
      'user_data',
      'biometric_enabled'
    ];
    
    await AsyncStorage.multiRemove(keysToRemove);
    
    // Verify clearing
    const remainingData = await AsyncStorage.multiGet(keysToRemove);
    console.log('🔍 Remaining data:', remainingData);
    
    console.log('✅ Authentication data cleared successfully');
    console.log('📱 Please reload the app');
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    return false;
  }
};

// Execute
clearAllAuthData();
`);
console.log('=' .repeat(70));
console.log('\n🔧 Instructions:');
console.log('1. Press "j" in the Expo terminal to open debugger');
console.log('2. Copy and paste the code above in the console');
console.log('3. Press Enter to execute');
console.log('4. Reload the app to see changes');