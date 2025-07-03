// API Configuration
export const API_CONFIG = {
  // Using localhost special address for iOS simulator
  BASE_URL: __DEV__ 
    ? 'http://127.0.0.1:3001' 
    : 'https://api.dentalization.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  
  // Doctor endpoints
  DOCTORS: {
    BASE: '/api/doctors',
    DASHBOARD: '/api/doctors/dashboard',
    PATIENTS: '/api/doctors/patients',
    APPOINTMENTS: '/api/doctors/appointments',
    DIAGNOSES: '/api/doctors/diagnoses',
    REVIEWS: '/api/doctors/reviews',
  },
  
  // Patient endpoints
  PATIENTS: {
    BASE: '/api/patients',
    DASHBOARD: '/api/patients/dashboard',
    APPOINTMENTS: '/api/patients/appointments',
    MEDICAL_HISTORY: '/api/patients/medical-history',
    DIAGNOSES: '/api/patients/diagnoses',
  },
  
  // AI & Diagnosis endpoints
  AI: {
    DIAGNOSE: '/api/ai/diagnose',
    ANALYZE_IMAGE: '/api/ai/analyze-image',
    RECOMMENDATIONS: '/api/ai/recommendations',
  },
  
  // Chat & Communication
  CHAT: {
    CONVERSATIONS: '/api/chat/conversations',
    MESSAGES: '/api/chat/messages',
    SEND: '/api/chat/send',
  },
  
  // Health check
  HEALTH: '/health',
};

export default {
  API_CONFIG,
  API_ENDPOINTS,
};
