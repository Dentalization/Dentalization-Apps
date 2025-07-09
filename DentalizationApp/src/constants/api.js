// API Configuration
export const API_CONFIG = {
  // Using localhost for iOS simulator (should work for iOS Simulator)
  BASE_URL: __DEV__ 
    ? 'http://localhost:3001' 
    : 'https://api.dentalization.com',
  TIMEOUT: 30000,  // Increased timeout for slow connections
  RETRY_ATTEMPTS: 3,
  DEBUG_MODE: __DEV__,  // Enable debug mode in development
  
  // Alternative development servers (for troubleshooting)
  DEV_SERVERS: {
    LOCAL: 'http://127.0.0.1:3001',
    LOCAL_ALT: 'http://localhost:3001',
    LOCAL_IOS: 'http://localhost:3001',
    LOCAL_NETWORK: 'http://192.168.1.X:3001', // Replace X with your machine's IP
    NGROK: 'https://YOUR-NGROK-TUNNEL.ngrok.io', // Replace with your ngrok URL if using
    STAGING: 'https://staging-api.dentalization.com',
    FALLBACK: 'https://dentalization-api-dev.herokuapp.com', // Add your fallback server if available
  },
  
  // Registration specific options for troubleshooting
  REGISTRATION: {
    BYPASS_VALIDATION: false, // Set to true to bypass frontend validation (for testing)
    USE_SIMPLE_PAYLOAD: false, // Set to true to use a simplified payload format
    RETRY_WITH_DELAY: true, // Enables exponential backoff for retries
    MAX_RETRIES: 3, // Maximum number of retries for registration
    LOG_DETAILED_ERRORS: true, // Enable detailed error logging
  }
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
