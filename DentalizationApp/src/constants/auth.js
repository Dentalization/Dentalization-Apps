// Authentication related constants
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH_TOKEN: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  VERIFY_EMAIL: '/api/auth/verify-email',
  CHECK_EMAIL: '/api/auth/check-email',  // Endpoint to check if email exists
};

export const AUTH_STORAGE_KEYS = {
  USER_DATA: '@dentalization_user_data',
  ACCESS_TOKEN: '@dentalization_access_token',
  REFRESH_TOKEN: '@dentalization_refresh_token',
  BIOMETRIC_ENABLED: '@dentalization_biometric_enabled',
};

export const AUTH_STATUSES = {
  IDLE: 'idle',
  AUTHENTICATING: 'authenticating',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error',
};

export const USER_ROLES = {
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
  ADMIN: 'ADMIN',
};

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  EXPIRED_TOKEN: 'Your session has expired. Please login again.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
};

export default {
  AUTH_ENDPOINTS,
  AUTH_STORAGE_KEYS,
  AUTH_STATUSES,
  USER_ROLES,
  AUTH_ERRORS,
};
