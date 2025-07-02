// User roles and permissions for Dentalization app

export const USER_ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
};

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
};

export const PERMISSIONS = {
  // Patient permissions
  PATIENT: {
    VIEW_OWN_PROFILE: 'patient:view_own_profile',
    EDIT_OWN_PROFILE: 'patient:edit_own_profile',
    UPLOAD_PHOTOS: 'patient:upload_photos',
    BOOK_APPOINTMENTS: 'patient:book_appointments',
    VIEW_OWN_HISTORY: 'patient:view_own_history',
    CHAT_WITH_DOCTORS: 'patient:chat_with_doctors',
  },
  
  // Doctor permissions
  DOCTOR: {
    VIEW_OWN_PROFILE: 'doctor:view_own_profile',
    EDIT_OWN_PROFILE: 'doctor:edit_own_profile',
    VIEW_PATIENTS: 'doctor:view_patients',
    MANAGE_APPOINTMENTS: 'doctor:manage_appointments',
    ACCESS_AI_DIAGNOSIS: 'doctor:access_ai_diagnosis',
    CHAT_WITH_PATIENTS: 'doctor:chat_with_patients',
    VIEW_PATIENT_PHOTOS: 'doctor:view_patient_photos',
    CREATE_DIAGNOSIS: 'doctor:create_diagnosis',
  },
  
  // Admin permissions
  ADMIN: {
    MANAGE_USERS: 'admin:manage_users',
    VIEW_ANALYTICS: 'admin:view_analytics',
    MANAGE_SYSTEM: 'admin:manage_system',
    ACCESS_ALL_DATA: 'admin:access_all_data',
  },
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.PATIENT]: Object.values(PERMISSIONS.PATIENT),
  [USER_ROLES.DOCTOR]: [
    ...Object.values(PERMISSIONS.PATIENT), // Doctors can also be patients
    ...Object.values(PERMISSIONS.DOCTOR),
  ],
  [USER_ROLES.ADMIN]: [
    ...Object.values(PERMISSIONS.PATIENT),
    ...Object.values(PERMISSIONS.DOCTOR),
    ...Object.values(PERMISSIONS.ADMIN),
  ],
};

export const MESSAGE_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VOICE: 'VOICE',
  APPOINTMENT_REQUEST: 'APPOINTMENT_REQUEST',
  DIAGNOSIS_RESULT: 'DIAGNOSIS_RESULT',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED',
};

export const PHOTO_ANALYSIS_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

export default {
  USER_ROLES,
  USER_STATUS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  MESSAGE_TYPES,
  APPOINTMENT_STATUS,
  PHOTO_ANALYSIS_STATUS,
};
