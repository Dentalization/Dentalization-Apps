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
    // Rate limiting tracking
    this.lastApiCall = {};
    this.rateLimitBackoff = 1000; // Start with 1 second backoff
  }

  // Add rate limiting protection
  async checkRateLimit(endpoint) {
    const now = Date.now();
    const lastCall = this.lastApiCall[endpoint] || 0;
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall < this.rateLimitBackoff) {
      const waitTime = this.rateLimitBackoff - timeSinceLastCall;
      console.log(`⚠️ Rate limiting: waiting ${waitTime}ms before calling ${endpoint}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastApiCall[endpoint] = Date.now();
  }

  // Reset rate limit backoff on successful calls
  resetRateLimit() {
    this.rateLimitBackoff = 1000;
  }

  // Increase backoff time when rate limited
  increaseBackoff() {
    this.rateLimitBackoff = Math.min(this.rateLimitBackoff * 2, 30000); // Max 30 seconds
    console.log(`📊 Increased rate limit backoff to ${this.rateLimitBackoff}ms`);
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
        
        // Set base URL
        config.baseURL = API_CONFIG.BASE_URL;
        
        // Add default timeout
        config.timeout = config.timeout || API_CONFIG.TIMEOUT;
        
        // Add diagnostics headers in development
        if (API_CONFIG.DEBUG_MODE) {
          config.headers['X-App-Version'] = '1.0.0';
          config.headers['X-Debug-Mode'] = 'true';
        }
        
        // Log outgoing requests in development
        if (API_CONFIG.DEBUG_MODE) {
          console.log(`🚀 [API] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, 
            config.data ? `\nPayload: ${JSON.stringify(config.data, null, 2)}` : '');
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh and logging
    axios.interceptors.response.use(
      (response) => {
        // Log successful responses in development mode
        if (API_CONFIG.DEBUG_MODE) {
          console.log(`✅ [API] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`,
            response.data ? `\nResponse: ${JSON.stringify(response.data, null, 2)}` : '');
        }
        return response;
      },
      async (error) => {
        // Log failed responses (reduced verbosity)
        if (API_CONFIG.DEBUG_MODE) {
          if (error.response?.status === 401) {
            console.warn(`🔑 [AUTH] Token expired/invalid for ${error.config?.url || 'unknown'}`);
          } else if (error.response?.status === 429) {
            console.warn(`⚠️ [RATE_LIMIT] Too many requests for ${error.config?.url || 'unknown'} - backing off`);
          } else {
            console.error(`❌ [API] ${error.config?.method?.toUpperCase() || 'REQ'} ${error.config?.url || 'unknown'} - ${error.response?.status || 'NETWORK_ERROR'}`,
              error.response?.data?.message ? `\nError: ${error.response.data.message}` : '');
          }
        }

        // Handle rate limiting (429) before other errors
        if (error.response?.status === 429) {
          console.log('🔍 Rate limit hit, implementing backoff strategy');
          // Don't retry immediately for rate limits - let the calling code handle it
          return Promise.reject(error);
        }

        // Handle network errors specifically
        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || !error.response) {
          console.error('🔍 Network Error Details:', {
            message: error.message,
            code: error.code,
            config: error.config,
            isNetworkError: true,
            baseURL: error.config?.baseURL
          });
          
          // Try fallback URLs for development
          if (__DEV__ && !error.config?._retryFallback) {
            const fallbackURLs = [
              'http://localhost:3001',
              'http://127.0.0.1:3001',
              'http://10.0.2.2:3001' // Android emulator
            ];
            
            for (const fallbackURL of fallbackURLs) {
              if (fallbackURL !== error.config?.baseURL) {
                try {
                  console.log(`🔄 Trying fallback URL: ${fallbackURL}`);
                  const retryConfig = {
                    ...error.config,
                    baseURL: fallbackURL,
                    _retryFallback: true
                  };
                  const response = await axios(retryConfig);
                  console.log(`✅ Fallback successful with: ${fallbackURL}`);
                  return response;
                } catch (fallbackError) {
                  console.log(`❌ Fallback failed with: ${fallbackURL}`, fallbackError.message);
                }
              }
            }
          }
        }

        const originalRequest = error.config;

        // Handle 401 Unauthorized errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('🔍 Received 401 error, attempting token refresh...');
          originalRequest._retry = true;

          try {
            const refreshToken = await this.getRefreshToken();
            if (refreshToken) {
              console.log('🔄 Attempting to refresh access token...');
              const response = await this.refreshAccessToken(refreshToken);
              if (response.success) {
                console.log('✅ Token refresh successful, retrying original request');
                await this.storeTokens(response.data.token, response.data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                return axios(originalRequest);
              } else {
                console.log('❌ Token refresh failed:', response.message);
              }
            } else {
              console.log('❌ No refresh token available');
            }
          } catch (refreshError) {
            console.log('❌ Token refresh error:', refreshError.message);
          }
          
          // If refresh fails, clear stored data and don't auto-logout to avoid loops
          console.log('🔍 Clearing stored auth data due to failed token refresh');
          await this.clearAllData();
          
          // Don't call logout() here as it might cause infinite loops
          // Instead, let the app handle the auth state change
        }
        
        // For 500 errors, add more diagnostic information
        if (error.response?.status === 500) {
          console.error('💥 SERVER ERROR (500):', {
            endpoint: `${error.config.baseURL}${error.config.url}`,
            method: error.config.method?.toUpperCase(),
            requestData: error.config.data ? JSON.parse(error.config.data) : null,
            responseData: error.response.data,
            headers: error.config.headers,
          });
          
          // If this is a registration attempt, log detailed error
          if (error.config.url.includes('/register')) {
            console.error('Registration request failed with 500 error:', {
              requestBody: error.config.data ? JSON.parse(error.config.data) : 'No data',
              serverError: error.response.data
            });
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Store tokens securely
  async storeTokens(accessToken, refreshToken) {
    try {
      console.log('Storing tokens:', { 
        accessToken: accessToken ? 'present' : 'missing', 
        refreshToken: refreshToken ? 'present' : 'missing' 
      });
      
      if (!accessToken) {
        throw new Error('Access token is required but was not provided');
      }
      if (!refreshToken) {
        throw new Error('Refresh token is required but was not provided');
      }
      
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      
      console.log('Tokens stored successfully');
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
        data: response.data.data, // Extract the nested data object
        message: response.data.message || 'Login successful',
      };
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Gagal masuk';
      
      if (error.response) {
        // Server responded with an error
        const statusCode = error.response.status;
        const serverMessage = error.response.data?.message;
        
        switch (statusCode) {
          case 401:
            // Invalid credentials
            if (serverMessage && serverMessage.toLowerCase().includes('invalid email or password')) {
              errorMessage = 'Email atau kata sandi salah. Silakan periksa kembali kredensial Anda.';
            } else {
              errorMessage = 'Email atau kata sandi tidak valid. Pastikan Anda telah mendaftar sebelumnya.';
            }
            break;
          case 400:
            errorMessage = 'Data login tidak valid. Silakan periksa email dan kata sandi Anda.';
            break;
          case 403:
            errorMessage = 'Akun Anda tidak memiliki izin untuk masuk. Hubungi dukungan teknis.';
            break;
          case 404:
            errorMessage = 'Email belum terdaftar. Silakan daftar terlebih dahulu atau periksa ejaan email Anda.';
            break;
          case 500:
            errorMessage = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
            break;
          default:
            errorMessage = serverMessage || `Gagal masuk (${statusCode}). Silakan coba lagi.`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        // Other error
        errorMessage = error.message || 'Terjadi kesalahan tidak terduga saat login.';
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  // Register user with enhanced error handling and diagnostics
  async register(userData) {
    try {
      // Enhanced payload validation
      if (!userData.email || !userData.password || !userData.firstName) {
        console.error('Missing required registration fields');
        return {
          success: false,
          message: 'Data pendaftaran tidak lengkap',
          validationErrors: ['Email, password, and firstName are required']
        };
      }

      // Ensure patient role has patientDetails
      if (userData.role === 'PATIENT' && !userData.patientDetails) {
        console.warn('Patient registration missing patientDetails, adding empty structure');
        userData.patientDetails = {
          bpjsNumber: "",
          emergencyContact: { name: "", phoneNumber: "" },
          medicalInfo: { allergies: "", chronicConditions: "", additionalInfo: "" }
        };
      }
      
      // Sanitize phone numbers - remove spaces that might cause backend issues
      if (userData.phoneNumber) {
        userData.phoneNumber = userData.phoneNumber.replace(/\s+/g, '');
      }
      if (userData.role === 'PATIENT' && userData.patientDetails?.emergencyContact?.phoneNumber) {
        userData.patientDetails.emergencyContact.phoneNumber = 
          userData.patientDetails.emergencyContact.phoneNumber.replace(/\s+/g, '');
      }
      
      // Ensure all fields are properly formatted for the backend
      if (userData.role === 'PATIENT') {
        // Make sure patientDetails exists and has the right structure
        userData.patientDetails = userData.patientDetails || {};
        userData.patientDetails.bpjsNumber = userData.patientDetails.bpjsNumber || '';
        
        // Ensure emergencyContact exists
        userData.patientDetails.emergencyContact = userData.patientDetails.emergencyContact || {};
        userData.patientDetails.emergencyContact.name = userData.patientDetails.emergencyContact.name || '';
        userData.patientDetails.emergencyContact.phoneNumber = userData.patientDetails.emergencyContact.phoneNumber || '';
        
        // Ensure medicalInfo exists
        userData.patientDetails.medicalInfo = userData.patientDetails.medicalInfo || {};
        userData.patientDetails.medicalInfo.allergies = userData.patientDetails.medicalInfo.allergies || '';
        userData.patientDetails.medicalInfo.chronicConditions = userData.patientDetails.medicalInfo.chronicConditions || '';
        userData.patientDetails.medicalInfo.additionalInfo = userData.patientDetails.medicalInfo.additionalInfo || '';
      }

      // Prepare a cleaned copy of the payload with any necessary adjustments
      const cleanedPayload = {...userData};
      
      // Enhance logging for debugging
      console.log('Sending registration request to:', `${API_CONFIG.BASE_URL}${AUTH_ENDPOINTS.REGISTER}`);
      console.log('Registration payload:', JSON.stringify(cleanedPayload, null, 2));
      
      // Add retry mechanism for transient errors
      let retryCount = 0;
      const maxRetries = API_CONFIG.REGISTRATION?.MAX_RETRIES || 3;
      let lastError = null;
      
      while (retryCount <= maxRetries) {
        try {
          // If this is a retry, add a small delay with exponential backoff
          if (retryCount > 0) {
            console.log(`Retry attempt ${retryCount}/${maxRetries}...`);
            
            // Exponential backoff delay: 500ms, 1s, 2s, 4s
            const delayMs = Math.pow(2, retryCount - 1) * 500; 
            console.log(`Waiting ${delayMs}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            
            // Add retry headers
            axios.defaults.headers.common['X-Retry-Count'] = retryCount.toString();
            axios.defaults.headers.common['X-Client-Debug'] = 'true';
          }
          
          // Try different server URLs on retries to work around potential network issues
          let baseURL = API_CONFIG.BASE_URL;
          if (retryCount > 0) {
            const serverOptions = [
              'http://localhost:3001', 
              'http://127.0.0.1:3001',
              API_CONFIG.DEV_SERVERS?.LOCAL_ALT || 'http://localhost:3001'
            ];
            baseURL = serverOptions[(retryCount - 1) % serverOptions.length];
          }
            
          console.log(`Using server URL: ${baseURL}`);
          
          // Send the registration request
          const response = await axios.post(AUTH_ENDPOINTS.REGISTER, cleanedPayload, {
            baseURL: baseURL,
            timeout: API_CONFIG.TIMEOUT + (retryCount * 5000), // Increase timeout with each retry
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Debug-Mode': 'true',
              'X-App-Version': '1.0.0',
            }
          });
          
          console.log('Registration response:', JSON.stringify(response.data, null, 2));
          return {
            success: true,
            data: response.data.data, // Extract the nested data object
            message: response.data.message || 'Registration successful',
            retryCount,
          };
        } catch (err) {
          lastError = err;
          
          // Log detailed error for each attempt
          console.error(`Registration attempt ${retryCount + 1} failed:`, err.message);
          
          if (err.response?.data) {
            console.error('Server error response:', JSON.stringify(err.response.data, null, 2));
          }
          
          // Only retry on 500 errors or network errors
          if ((err.response && err.response.status === 500) || !err.response) {
            if (retryCount < maxRetries) {
              console.log(`Will retry (attempt ${retryCount + 1}/${maxRetries})`);
              retryCount++;
              continue;
            }
          }
          
          // Break on 400 client errors - these won't be fixed by retrying
          break;
        }
      }
      
      // If we get here, all retries failed
      const error = lastError;
      console.error('Registration error after all retries:', error);
      
      // Return error details
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed after multiple attempts',
        error: error,
        retryCount,
      };
    } catch (error) {
      console.error('Unexpected error in register method:', error);
      return {
        success: false,
        message: 'Unexpected error during registration',
        error: error,
      };
    }
  }

  // Check if email exists in the system (to prevent duplicate registrations)
  async checkEmailExists(email) {
    console.log(`Checking if email exists: ${email}`);
    
    try {
      // First, try making a direct API call to check if the endpoint exists
      try {
        console.log(`Attempting to call ${API_CONFIG.BASE_URL}${AUTH_ENDPOINTS.CHECK_EMAIL}`);
        
        const response = await axios.post(`${API_CONFIG.BASE_URL}${AUTH_ENDPOINTS.CHECK_EMAIL}`, {
          email: email.toLowerCase()
        }, { timeout: 5000 }); // Shorter timeout for this check
        
        console.log('Email check response:', response.data);
        
        return {
          success: true,
          exists: response.data.exists, // Should return true if email exists, false otherwise
          message: response.data.message
        };
      } catch (apiError) {
        console.log('Error checking email:', apiError.message);
        
        // FIXED: Only treat specific status codes as "email exists" scenarios
        // If we got a 409 (Conflict), that usually means the email exists
        if (apiError.response && apiError.response.status === 409) {
          return {
            success: true, 
            exists: true,
            message: 'Email already exists'
          };
        }
        
        // If the response specifically mentions email exists in the error message
        if (apiError.response && apiError.response.data && 
            apiError.response.data.message && 
            apiError.response.data.message.toLowerCase().includes('exists')) {
          return {
            success: true, 
            exists: true,
            message: 'Email already exists'
          };
        }
        
        // If the endpoint doesn't exist (404) or other errors, assume the email is available
        // This is safer than blocking valid emails
        if (apiError.response && apiError.response.status === 404) {
          console.log('CHECK_EMAIL endpoint not available, assuming email is available');
          return {
            success: true,
            exists: false,
            message: 'Email check endpoint not available, proceeding with registration'
          };
        }
        
        // For network errors or other issues, proceed with registration
        return {
          success: false,
          exists: false, // We're not sure, so assume it doesn't exist
          message: 'Could not verify email availability'
        };
      }
    } catch (error) {
      console.log('Unexpected error checking email:', error);
      
      // For all other errors, proceed with registration and let the server handle it
      return {
        success: false,
        exists: false,
        message: error.message
      };
    }
  }

  // Debug helper for API issues
  async checkApiConnection() {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/health`, {
        timeout: 5000
      });
      
      return {
        success: true,
        status: response.status,
        message: 'API connection successful',
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        message: error.message || 'API connection failed',
        error: error
      };
    }
  }

  // Verify token with backend
  async verifyToken() {
    try {
      // Get current token
      const token = await this.getAccessToken();
      if (!token) {
        console.log('🔍 No access token found for verification');
        return {
          success: false,
          message: 'No access token available',
          requiresLogin: true
        };
      }

      // Check rate limiting before making API call
      await this.checkRateLimit('/api/auth/profile');

      console.log('🔍 Verifying token with backend...');
      
      // Since there's no specific verify token endpoint, we'll use the profile endpoint
      // to check if the token is still valid
      const response = await axios.get('/api/auth/profile');
      
      // Reset backoff on successful call
      this.resetRateLimit();
      
      console.log('✅ Token verification successful');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Token verification error:', error?.message || error);
      
      // Handle different types of errors
      if (error?.response?.status === 401) {
        console.log('🔍 Token expired or invalid (401) - attempting refresh');
        
        // Try to refresh token
        const refreshToken = await this.getRefreshToken();
        if (refreshToken) {
          try {
            const refreshResult = await this.refreshAccessToken(refreshToken);
            if (refreshResult.success) {
              console.log('✅ Token refreshed successfully, retrying verification');
              // Retry verification with new token
              const retryResponse = await axios.get('/api/auth/profile');
              this.resetRateLimit();
              return {
                success: true,
                data: retryResponse.data,
                tokenRefreshed: true
              };
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError.message);
          }
        }
        
        // If refresh failed or no refresh token, require login
        return {
          success: false,
          message: 'Token expired and refresh failed',
          requiresLogin: true
        };
      }
      
      // Handle rate limiting (429 error)
      if (error.response?.status === 429) {
        console.warn('⚠️ Rate limit exceeded (429) - backing off');
        this.increaseBackoff();
        return {
          success: false,
          message: 'Too many requests, please try again later',
          requiresLogin: false,
          rateLimited: true
        };
      }
      
      // For other errors, return error but don't force login
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        requiresLogin: false
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

  // Alias for clearAllData (for compatibility)
  async clearStoredData() {
    return this.clearAllData();
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await this.getAccessToken();
      const userData = await this.getUserData();
      
      return !!(token && userData);
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  // Check if token is likely expired (basic check without network call)
  async isTokenLikelyExpired() {
    try {
      const token = await this.getAccessToken();
      if (!token) return true;

      // Simple JWT expiry check (if the token is in JWT format)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          console.log('🔍 Token has expired based on JWT payload');
          return true;
        }
      } catch (jwtError) {
        // Not a JWT or couldn't parse - assume token is valid for now
        console.log('🔍 Could not parse token as JWT, assuming valid');
      }

      return false;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true; // Assume expired if we can't check
    }
  }
  
  // Clear biometric credentials - mock version for development
  async clearBiometricCredentials() {
    try {
      console.log('Biometric credential clearing skipped (disabled in development)');
      return true;
    } catch (error) {
      console.error('Error clearing biometric credentials:', error);
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

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
        refreshToken,
      });
      
      if (response.data.success) {
        // Store new tokens
        await this.storeTokens(response.data.data.token, response.data.data.refreshToken);
        
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Token refresh failed',
        };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Gagal memperbarui token. Silakan masuk kembali.',
      };
    }
  }

  // Logout user
  async logout() {
    try {
      const refreshToken = await this.getRefreshToken();
      
      if (refreshToken) {
        // Call backend logout endpoint
        await axios.post(AUTH_ENDPOINTS.LOGOUT, {
          refreshToken,
        });
      }
      
      // Clear local storage
      await AsyncStorage.multiRemove([
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
        AUTH_STORAGE_KEYS.USER_DATA,
      ]);
      
      return {
        success: true,
        message: 'Berhasil keluar',
      };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if backend call fails, clear local storage
      await AsyncStorage.multiRemove([
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
        AUTH_STORAGE_KEYS.USER_DATA,
      ]);
      
      return {
        success: true,
        message: 'Berhasil keluar',
      };
    }
  }
}

export default new AuthService();
