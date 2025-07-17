import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import biometricService from '../../services/biometricService';
import { getReadableError } from '../../utils/errorHandler';

// Async thunks for authentication actions
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, rememberMe = false }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        // Store tokens and user data
        await authService.storeTokens(response.data.token, response.data.refreshToken);
        await authService.storeUserData(response.data.user);
        
        // Store biometric credentials if remember me is enabled
        if (rememberMe) {
          await authService.storeBiometricCredentials(email, password);
        }
        
        return {
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        };
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const loginWithBiometric = createAsyncThunk(
  'auth/loginWithBiometric',
  async (_, { rejectWithValue }) => {
    try {
      // Biometrics disabled in development mode
      return rejectWithValue('Biometric authentication disabled in development mode');
      
      /* Original code disabled for development:
      const biometricType = await biometricService.getBiometricType();
      if (!biometricType) {
        return rejectWithValue('Biometric authentication not available');
      }

      const biometricAuth = await biometricService.authenticate();
      if (!biometricAuth.success) {
        return rejectWithValue(biometricAuth.error || 'Biometric authentication failed');
      }
      */

      // Get stored credentials
      const credentials = await authService.getBiometricCredentials();
      if (!credentials) {
        return rejectWithValue('No stored credentials found');
      }

      // Login with stored credentials
      const response = await authService.login(credentials.email, credentials.password);
      
      if (response.success) {
        await authService.storeTokens(response.data.token, response.data.refreshToken);
        await authService.storeUserData(response.data.user);
        
        return {
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        };
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Biometric login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        // Store tokens and user data
        await authService.storeTokens(response.data.token, response.data.refreshToken);
        await authService.storeUserData(response.data.user);
        
        return {
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        };
      } else {
        // Convert technical error to user-friendly message in Indonesian
        const userFriendlyMessage = getReadableError(response.message || response.error);
        return rejectWithValue(userFriendlyMessage);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = await authService.getAccessToken();
      const userData = await authService.getUserData();
      
      console.log('🔍 checkAuthStatus - Stored token exists:', !!token);
      console.log('🔍 checkAuthStatus - Stored userData exists:', !!userData);
      
      if (token && userData) {
        // Verify token with backend and get fresh user data
        const response = await authService.verifyToken();
        if (response.success) {
          // Use fresh data from backend, not stored data
          const freshUserData = response.data.data || response.data;
          
          console.log('🔍 checkAuthStatus - Fresh user data from backend:', JSON.stringify(freshUserData, null, 2));
          
          // Parse JSON fields in profile if they exist
          if (freshUserData.profile) {
            try {
              // Parse emergencyContact if it's a JSON string
              if (typeof freshUserData.profile.emergencyContact === 'string' && freshUserData.profile.emergencyContact.startsWith('{')) {
                const emergencyData = JSON.parse(freshUserData.profile.emergencyContact);
                freshUserData.profile.emergencyContactName = emergencyData.name;
                freshUserData.profile.emergencyContactPhone = emergencyData.phone;
                freshUserData.profile.emergencyContactRelation = emergencyData.relation;
              }

              // Parse medicalHistory if it's a JSON string  
              if (typeof freshUserData.profile.medicalHistory === 'string' && freshUserData.profile.medicalHistory.startsWith('{')) {
                const medicalData = JSON.parse(freshUserData.profile.medicalHistory);
                freshUserData.profile.medicalConditions = medicalData.conditions;
                freshUserData.profile.smokingStatus = medicalData.smokingStatus;
                freshUserData.profile.alcoholConsumption = medicalData.alcoholConsumption;
              }

              // Parse insuranceInfo if it's a JSON string
              if (typeof freshUserData.profile.insuranceInfo === 'string' && freshUserData.profile.insuranceInfo.startsWith('{')) {
                const insuranceData = JSON.parse(freshUserData.profile.insuranceInfo);
                freshUserData.profile.insuranceProvider = insuranceData.provider;
                freshUserData.profile.insuranceNumber = insuranceData.number;
              }

              // Format dateOfBirth for display
              if (freshUserData.profile.dateOfBirth) {
                freshUserData.profile.dateOfBirth = new Date(freshUserData.profile.dateOfBirth).toISOString().split('T')[0];
              }

              // Clean up profilePicture URL - remove invalid URLs
              if (freshUserData.profile.profilePicture) {
                if (freshUserData.profile.profilePicture.includes('undefined') || 
                    freshUserData.profile.profilePicture === 'null' ||
                    freshUserData.profile.profilePicture === 'undefined') {
                  freshUserData.profile.profilePicture = null;
                }
              }

              console.log('🔍 checkAuthStatus - Parsed user data:', JSON.stringify(freshUserData, null, 2));
            } catch (error) {
              console.error('Error parsing profile JSON fields:', error);
            }
          }
          
          // Update stored data with fresh data
          await authService.storeUserData(freshUserData);
          
          return {
            user: freshUserData,
            token: token,
            isAuthenticated: true,
          };
        } else if (response.requiresLogin) {
          // Token completely invalid, clear data and require login
          console.log('🔍 checkAuthStatus - Token invalid, clearing data and requiring login');
          await authService.clearStoredData();
          return rejectWithValue('Authentication required');
        } else if (response.rateLimited) {
          // Rate limited, use stored data as fallback
          console.log('🔍 checkAuthStatus - Rate limited, using stored data as fallback');
          return {
            user: userData,
            token: token,
            isAuthenticated: true,
            dataStale: true,
            rateLimited: true,
          };
        } else {
          // Token verification failed but might be temporary (network issue)
          // Use stored data as fallback but mark as potentially stale
          console.log('🔍 checkAuthStatus - Token verification failed, using stored data as fallback');
          
          return {
            user: userData,
            token: token,
            isAuthenticated: true,
            dataStale: true, // Flag to indicate data might be outdated
          };
        }
      }
      
      // No token or user data
      console.log('🔍 checkAuthStatus - No valid token or user data found');
      await authService.clearStoredData();
      return rejectWithValue('No authentication data found');
    } catch (error) {
      console.error('🔍 checkAuthStatus - Error:', error);
      // Handle different error types
      if (error.message && (error.message.includes('401') || error.message.includes('Authentication required'))) {
        console.log('🔍 checkAuthStatus - Authentication error, clearing stored data');
        await authService.clearStoredData();
        return rejectWithValue('Authentication expired');
      }
      
      // For network errors, try to use stored data if available
      const storedUserData = await authService.getUserData();
      const storedToken = await authService.getAccessToken();
      
      if (storedUserData && storedToken) {
        console.log('🔍 checkAuthStatus - Network error, using stored data');
        return {
          user: storedUserData,
          token: storedToken,
          isAuthenticated: true,
          dataStale: true,
        };
      }
      
      return rejectWithValue(error.message || 'Authentication check failed');
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Call logout endpoint
      await authService.logout();
      // Clear stored data
      await authService.clearStoredData();
      // Clear biometric data if exists
      await authService.clearBiometricCredentials();
      
      return true;
    } catch (error) {
      // Even if API call fails, clear local data
      await authService.clearStoredData();
      await authService.clearBiometricCredentials();
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
  biometricAvailable: false,
  biometricEnabled: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setBiometricAvailable: (state, action) => {
      state.biometricAvailable = action.payload;
    },
    setBiometricEnabled: (state, action) => {
      state.biometricEnabled = action.payload;
    },
    setInitializing: (state, action) => {
      state.isInitializing = action.payload;
    },
    setProfileComplete: (state, action) => {
      if (state.user) {
        state.user.profileComplete = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitializing = false; // Set initializing to false after successful login
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        
        console.log('🔍 Redux - User data stored:', JSON.stringify(action.payload.user, null, 2));
        console.log('🔍 Redux - Profile complete:', action.payload.user?.profile?.profileComplete);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload;
      })
      
    // Login with biometric
      .addCase(loginWithBiometric.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithBiometric.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(loginWithBiometric.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
    // Register user
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitializing = false; // Set initializing to false after successful registration
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        console.error('Registration rejected with payload:', action.payload);
        // Store the user-friendly error message
        state.error = action.payload;
      })
      
    // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        
        // Extract user data - handle both direct user object and response.data format
        let userData = action.payload.user;
        if (userData && userData.data && userData.data.id) {
          userData = userData.data; // Extract from response.data format
        }
        
        // Parse JSON fields in profile if they exist
        if (userData && userData.profile) {
          try {
            // Parse emergencyContact if it's a JSON string
            if (typeof userData.profile.emergencyContact === 'string' && userData.profile.emergencyContact.startsWith('{')) {
              const emergencyData = JSON.parse(userData.profile.emergencyContact);
              userData.profile.emergencyContactName = emergencyData.name;
              userData.profile.emergencyContactPhone = emergencyData.phone;
              userData.profile.emergencyContactRelation = emergencyData.relation;
            }

            // Parse medicalHistory if it's a JSON string  
            if (typeof userData.profile.medicalHistory === 'string' && userData.profile.medicalHistory.startsWith('{')) {
              const medicalData = JSON.parse(userData.profile.medicalHistory);
              userData.profile.medicalConditions = medicalData.conditions;
              userData.profile.smokingStatus = medicalData.smokingStatus;
              userData.profile.alcoholConsumption = medicalData.alcoholConsumption;
            }

            // Parse insuranceInfo if it's a JSON string
            if (typeof userData.profile.insuranceInfo === 'string' && userData.profile.insuranceInfo.startsWith('{')) {
              const insuranceData = JSON.parse(userData.profile.insuranceInfo);
              userData.profile.insuranceProvider = insuranceData.provider;
              userData.profile.insuranceNumber = insuranceData.number;
            }

            // Format dateOfBirth for display
            if (userData.profile.dateOfBirth) {
              userData.profile.dateOfBirth = new Date(userData.profile.dateOfBirth).toISOString().split('T')[0];
            }

            // Clean up profilePicture URL - remove invalid URLs
            if (userData.profile.profilePicture) {
              if (userData.profile.profilePicture.includes('undefined') || 
                  userData.profile.profilePicture === 'null' ||
                  userData.profile.profilePicture === 'undefined') {
                userData.profile.profilePicture = null;
              }
            }

            console.log('🔍 Redux - Parsed user data in extraReducers:', JSON.stringify(userData, null, 2));
          } catch (error) {
            console.error('Error parsing profile JSON fields in extraReducers:', error);
          }
        }
        
        state.user = userData;
        state.token = action.payload.token;
        state.profileComplete = userData?.profile?.profileComplete || false;
        
        console.log('🔍 Redux - CheckAuth user data:', JSON.stringify(userData, null, 2));
        console.log('🔍 Redux - CheckAuth profile complete:', userData?.profile?.profileComplete);
        console.log('🔍 Redux - State profile complete set to:', state.profileComplete);
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isInitializing = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      
    // Logout user
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = null;
        state.biometricEnabled = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // Even if logout fails, clear local state
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.biometricEnabled = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  updateUser,
  setBiometricAvailable,
  setBiometricEnabled,
  setInitializing,
  setProfileComplete,
} = authSlice.actions;

export default authSlice.reducer;
