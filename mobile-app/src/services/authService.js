import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import axios from 'axios';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api' 
  : 'https://api.dentalization.com/api';

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: '@dentalization_user_data',
  ACCESS_TOKEN: '@dentalization_access_token',
  REFRESH_TOKEN: '@dentalization_refresh_token',
  BIOMETRIC_ENABLED: '@dentalization_biometric_enabled',
};

// Keychain service name for biometric storage
const KEYCHAIN_SERVICE = 'DentalizationApp';

class AuthService {
  constructor() {
    this.setupAxiosInterceptors();
  }

  // Setup axios interceptors for automatic token handling
  setupAxiosInterceptors() {
    // Request interceptor to add auth token
    axios.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.baseURL = API_BASE_URL;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken);
              if (response.success) {
                await this.storeTokens(response.data.token, response.data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                return axios(originalRequest);
              }
            }
          } catch (refreshError) {
            console.log('Token refresh failed:', refreshError);
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Store tokens securely
  async storeTokens(accessToken, refreshToken) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  // Get access token
  async getAccessToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Get refresh token
  async getRefreshToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Store user data
  async storeUserData(userData) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  // Get user data
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Store biometric credentials
  async storeBiometricCredentials(email, password) {
    try {
      await Keychain.setInternetCredentials(
        KEYCHAIN_SERVICE,
        email,
        password
      );
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
      return true;
    } catch (error) {
      console.error('Error storing biometric credentials:', error);
      return false;
    }
  }

  // Get biometric credentials
  async getBiometricCredentials() {
    try {
      const credentials = await Keychain.getInternetCredentials(KEYCHAIN_SERVICE);
      if (credentials) {
        return {
          email: credentials.username,
          password: credentials.password,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting biometric credentials:', error);
      return null;
    }
  }

  // Check if biometric is enabled
  async isBiometricEnabled() {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  }

  // Disable biometric authentication
  async disableBiometric() {
    try {
      await Keychain.resetInternetCredentials(KEYCHAIN_SERVICE);
      await AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    } catch (error) {
      console.error('Error disabling biometric:', error);
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password,
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await axios.post('/auth/register', userData);
      
      return {
        success: true,
        data: response.data,
        message: 'Registration successful',
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  // Verify token with backend
  async verifyToken() {
    try {
      const response = await axios.get('/auth/verify-token');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Clear stored data (alias for clearAllData)
  async clearStoredData() {
    return this.clearAllData();
  }

  // Clear biometric credentials
  async clearBiometricCredentials() {
    try {
      await Keychain.resetInternetCredentials(KEYCHAIN_SERVICE);
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
    } catch (error) {
      console.error('Error clearing biometric credentials:', error);
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post('/auth/refresh-token', { refreshToken });
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      const refreshToken = await this.getRefreshToken();
      
      // Call logout API
      if (refreshToken) {
        await axios.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage regardless of API call result
      await this.clearAllData();
    }
  }

  // Logout from all devices
  async logoutAll() {
    try {
      await axios.post('/auth/logout-all');
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      await this.clearAllData();
    }
  }

  // Clear all stored data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.BIOMETRIC_ENABLED,
      ]);
      await Keychain.resetInternetCredentials(KEYCHAIN_SERVICE);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await this.getAccessToken();
      const userData = await this.getUserData();
      return !!(token && userData);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await axios.get('/auth/profile');
      if (response.data.success) {
        await this.storeUserData(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axios.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      
      return {
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
      };
    }
  }
}

export default new AuthService();
