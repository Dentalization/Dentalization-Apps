import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../../services/authService';
import BiometricService from '../../services/biometricService';

const authService = new AuthService();
const biometricService = new BiometricService();

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
      // Check if biometric authentication is available
      const biometricType = await biometricService.getBiometricType();
      if (!biometricType) {
        return rejectWithValue('Biometric authentication not available');
      }

      // Authenticate with biometrics
      const biometricAuth = await biometricService.authenticate();
      if (!biometricAuth.success) {
        return rejectWithValue(biometricAuth.error || 'Biometric authentication failed');
      }

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
        return rejectWithValue(response.message || 'Registration failed');
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
      
      if (token && userData) {
        // Verify token with backend
        const response = await authService.verifyToken();
        if (response.success) {
          return {
            user: userData,
            token: token,
            isAuthenticated: true,
          };
        }
      }
      
      // Clear invalid tokens
      await authService.clearStoredData();
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    } catch (error) {
      await authService.clearStoredData();
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
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
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
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
    // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.token = action.payload.token;
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
} = authSlice.actions;

export default authSlice.reducer;
