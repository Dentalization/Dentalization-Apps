import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../constants/api';
import { AUTH_ENDPOINTS, AUTH_STORAGE_KEYS } from '../constants/auth';

// Mock Keychain for development (biometrics disabled)
const Keychain = {
  setInternetCredentials: async () => {
    console.log('Mock Keychain: setInternetCredentials called');
    return { service: 'mock' };
  },
  getInternetCredentials: async () => {
    console.log('Mock Keychain: getInternetCredentials called');
    return null;
  },
  resetInternetCredentials: async () => {
    console.log('Mock Keychain: resetInternetCredentials called');
    return true;
  }
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
        config.baseURL = API_CONFIG.BASE_URL;
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
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  // Get access token
  async getAccessToken() {
    try {
      return await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Get refresh token
  async getRefreshToken() {
    try {
      return await AsyncStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Store user data
  async storeUserData(userData) {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  // Get user data
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Store biometric credentials - disabled in development mode
  async storeBiometricCredentials(email, password) {
    console.log('Biometric credential storage disabled in development mode');
    return false;
  }

  // Get biometric credentials - disabled in development mode
  async getBiometricCredentials() {
    console.log('Biometric credential retrieval disabled in development mode');
    return null;
  }

  // Check if biometric is enabled - always returns false in development
  async isBiometricEnabled() {
    return false;
  }

  // Disable biometric authentication - mock version for development
  async disableBiometric() {
    console.log('Biometric disable function called (no-op in development mode)');
    return true;
  }

  // Login user
  async login(email, password) {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.LOGIN, {
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
      const response = await axios.post(AUTH_ENDPOINTS.REGISTER, userData);
      
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
      // Since there's no specific verify token endpoint, we'll use the profile endpoint
      // to check if the token is still valid
      const response = await axios.get('/api/auth/profile');
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

  // Forgot password - request password reset
  async forgotPassword(email) {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { 
        email: email.trim().toLowerCase() 
      });
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Password reset instructions sent',
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'Failed to send password reset email';
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

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.RESET_PASSWORD, { 
        token,
        password: newPassword,
      });
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Password reset successful',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Failed to reset password';
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

  // Verify email address
  async verifyEmail(token) {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Email verification successful',
      };
    } catch (error) {
      console.error('Verify email error:', error);
      
      let errorMessage = 'Failed to verify email';
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

  // Clear stored data (alias for clearAllData)
  async clearStoredData() {
    return this.clearAllData();
  }

  // Clear biometric credentials - mock version for development
  async clearBiometricCredentials() {
    console.log('Biometric credentials clear called (no-op in development mode)');
    return true;
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
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
        await axios.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
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
      await axios.post('/api/auth/logout-all');
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
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
        AUTH_STORAGE_KEYS.USER_DATA,
        AUTH_STORAGE_KEYS.BIOMETRIC_ENABLED,
      ]);
      // Keychain usage removed for development
      console.log('Keychain credentials clearing skipped (disabled in development)');
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
      const response = await axios.get('/api/auth/profile');
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
      const response = await axios.put('/api/auth/change-password', {
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
