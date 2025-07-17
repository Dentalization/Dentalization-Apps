/**
 * Utility for consistent error handling across the app
 */

/**
 * Maps common error codes to user-friendly Indonesian messages
 */
export const ERROR_MESSAGES = {
  // Auth related errors
  'email_exists': 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun yang sudah ada.',
  'invalid_credentials': 'Email atau kata sandi salah. Silakan coba lagi.',
  'account_locked': 'Akun Anda telah dikunci karena terlalu banyak percobaan masuk. Silakan coba lagi nanti.',
  'password_incorrect': 'Kata sandi salah. Silakan coba lagi.',
  'email_not_verified': 'Email Anda belum diverifikasi. Silakan periksa email Anda untuk tautan verifikasi.',
  'token_expired': 'Sesi Anda telah berakhir. Silakan masuk kembali.',
  
  // Network errors
  'network_error': 'Gagal terhubung ke server. Silakan periksa koneksi internet Anda dan coba lagi.',
  'timeout': 'Permintaan terlalu lama untuk diproses. Silakan coba lagi.',
  'server_error': 'Terjadi kesalahan pada server. Tim kami sedang menangani masalah ini. Silakan coba lagi nanti.',
  
  // Form validation errors
  'missing_fields': 'Mohon lengkapi semua kolom yang wajib diisi.',
  'invalid_email': 'Format email tidak valid. Silakan periksa kembali.',
  'invalid_phone': 'Format nomor telepon tidak valid. Silakan periksa kembali.',
  'weak_password': 'Kata sandi terlalu lemah. Pastikan memenuhi semua persyaratan.',
  
  // Generic errors
  'unknown_error': 'Terjadi kesalahan tidak diketahui. Silakan coba lagi nanti.',
  'permission_denied': 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
};

/**
 * Parses error objects and returns a user-friendly message in Indonesian
 * 
 * @param {Error|Object|string} error - The error to parse
 * @param {string} fallbackMessage - Optional fallback message if no specific message is found
 * @returns {string} A user-friendly error message in Indonesian
 */
export const getReadableError = (error, fallbackMessage = 'Terjadi kesalahan tidak diketahui. Silakan coba lagi nanti.') => {
  // Handle null or undefined error
  if (!error) {
    return fallbackMessage;
  }
  
  // Handle string errors directly
  if (typeof error === 'string') {
    // Check if there's a mapped message for this error code
    if (error.toLowerCase().includes('email') && error.toLowerCase().includes('exist')) {
      return ERROR_MESSAGES.email_exists;
    }
    
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')) {
      return ERROR_MESSAGES.network_error;
    }
    
    if (error.toLowerCase().includes('timeout')) {
      return ERROR_MESSAGES.timeout;
    }
    
    if (error.toLowerCase().includes('server error') || error.toLowerCase().includes('500')) {
      return ERROR_MESSAGES.server_error;
    }
    
    // Return the string directly if no mapping
    return error;
  }
  
  // Handle Axios errors or objects with response property
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    // Check for specific error messages from the server
    if (data && data.message) {
      const serverMessage = data.message;
      
      // Check for common error cases
      if (typeof serverMessage === 'string') {
        if (serverMessage.toLowerCase().includes('email') && 
            serverMessage.toLowerCase().includes('exist')) {
          return ERROR_MESSAGES.email_exists;
        }
        
        if (serverMessage.toLowerCase().includes('password') && 
            serverMessage.toLowerCase().includes('incorrect')) {
          return ERROR_MESSAGES.password_incorrect;
        }
        
        if (serverMessage.toLowerCase().includes('verify') || 
            serverMessage.toLowerCase().includes('verification')) {
          return ERROR_MESSAGES.email_not_verified;
        }
        
        // Return the server message if no mapping
        return serverMessage;
      }
    }
    
    // Handle by status code if no specific message
    if (status === 400) return 'Data yang diberikan tidak valid. Silakan periksa kembali.';
    if (status === 401) return ERROR_MESSAGES.invalid_credentials;
    if (status === 403) return ERROR_MESSAGES.permission_denied;
    if (status === 404) return 'Sumber daya yang diminta tidak ditemukan.';
    if (status === 409) return ERROR_MESSAGES.email_exists;
    if (status === 429) return 'Terlalu banyak permintaan. Silakan coba lagi nanti.';
    if (status >= 500) return ERROR_MESSAGES.server_error;
  }
  
  // Handle network errors
  if (error.message) {
    if (error.message.includes('Network Error')) return ERROR_MESSAGES.network_error;
    if (error.message.includes('timeout')) return ERROR_MESSAGES.timeout;
    return error.message;
  }
  
  // Fallback for any other type of error
  return fallbackMessage;
};

/**
 * Formats validation errors into a readable message
 * 
 * @param {Array|Object} errors - Validation errors from the server
 * @returns {string} A formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors) return 'Terdapat kesalahan validasi.';
  
  if (Array.isArray(errors)) {
    return errors.map(e => {
      if (typeof e === 'string') return e;
      if (e.field && e.message) return `${e.field}: ${e.message}`;
      return JSON.stringify(e);
    }).join('\n');
  }
  
  if (typeof errors === 'object') {
    return Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join('\n');
  }
  
  return String(errors);
};

export default {
  getReadableError,
  formatValidationErrors,
  ERROR_MESSAGES
};
