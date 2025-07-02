export { Colors, ColorSchemes } from './colors';
export {
  USER_ROLES,
  USER_STATUS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  MESSAGE_TYPES,
  APPOINTMENT_STATUS,
  PHOTO_ANALYSIS_STATUS,
} from './roles';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Dentalization',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
  SUPPORTED_LANGUAGES: ['en', 'id'], // English, Bahasa Indonesia
  DEFAULT_LANGUAGE: 'en',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@dentalization:auth_token',
  USER_DATA: '@dentalization:user_data',
  USER_ROLE: '@dentalization:user_role',
  THEME: '@dentalization:theme',
  LANGUAGE: '@dentalization:language',
  ONBOARDING_COMPLETED: '@dentalization:onboarding_completed',
};

// Navigation Routes
export const ROUTES = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  
  // Patient Routes
  PATIENT_DASHBOARD: 'PatientDashboard',
  PATIENT_CAMERA: 'PatientCamera',
  PATIENT_APPOINTMENTS: 'PatientAppointments',
  PATIENT_HISTORY: 'PatientHistory',
  PATIENT_PROFILE: 'PatientProfile',
  
  // Doctor Routes
  DOCTOR_DASHBOARD: 'DoctorDashboard',
  DOCTOR_PATIENTS: 'DoctorPatients',
  DOCTOR_APPOINTMENTS: 'DoctorAppointments',
  DOCTOR_DIAGNOSIS: 'DoctorDiagnosis',
  DOCTOR_PROFILE: 'DoctorProfile',
  
  // Shared Routes
  CHAT: 'Chat',
  SETTINGS: 'Settings',
  NOTIFICATIONS: 'Notifications',
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+\d{1,3}[- ]?)?\d{10,}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

export default {
  Colors,
  ColorSchemes,
  USER_ROLES,
  USER_STATUS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  MESSAGE_TYPES,
  APPOINTMENT_STATUS,
  PHOTO_ANALYSIS_STATUS,
  API_CONFIG,
  APP_CONFIG,
  STORAGE_KEYS,
  ROUTES,
  VALIDATION,
};
