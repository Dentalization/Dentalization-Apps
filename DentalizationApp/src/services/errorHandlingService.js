import { Alert } from 'react-native';

class ErrorHandlingService {
  constructor() {
    this.errorModalRef = null;
    this.isModalVisible = false;
  }

  // Set the error modal reference from the app component
  setErrorModalRef(ref) {
    this.errorModalRef = ref;
  }

  // Show error modal with specific error type and details
  showErrorModal({
    errorType = 'general',
    title,
    message,
    subMessage,
    showRetry = false,
    onRetry,
    onClose,
    debugInfo
  }) {
    // Log debug information for development
    if (__DEV__ && debugInfo) {
      console.group(`🐛 [DEBUG] ${errorType.toUpperCase()} Error`);
      console.log('Error Details:', debugInfo);
      console.groupEnd();
    }

    // If modal ref is available, show custom modal
    if (this.errorModalRef && !this.isModalVisible) {
      this.isModalVisible = true;
      this.errorModalRef.showError({
        errorType,
        title,
        message,
        subMessage,
        showRetry,
        onRetry,
        onClose: () => {
          this.isModalVisible = false;
          if (onClose) onClose();
        }
      });
    } else {
      // Fallback to native alert if modal is not available
      const alertTitle = title || this.getDefaultTitle(errorType);
      const alertMessage = message || this.getDefaultMessage(errorType);
      
      Alert.alert(
        alertTitle,
        alertMessage,
        [
          ...(showRetry && onRetry ? [{
            text: 'Coba Lagi',
            onPress: onRetry
          }] : []),
          {
            text: 'Tutup',
            onPress: onClose,
            style: 'cancel'
          }
        ]
      );
    }
  }

  // Handle authentication errors (401, token verification)
  handleAuthError(error, options = {}) {
    const errorDetails = {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      timestamp: new Date().toISOString()
    };

    this.showErrorModal({
      errorType: 'auth',
      title: options.title || 'Sesi Berakhir',
      message: options.message || 'Sesi Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.',
      subMessage: options.subMessage || 'Untuk keamanan, Anda akan diarahkan ke halaman login.',
      showRetry: options.showRetry || false,
      onRetry: options.onRetry,
      onClose: options.onClose,
      debugInfo: errorDetails
    });
  }

  // Handle rate limiting errors (429)
  handleRateLimitError(error, options = {}) {
    const errorDetails = {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      retryAfter: error.response?.headers?.['retry-after'],
      timestamp: new Date().toISOString()
    };

    const retryAfter = error.response?.headers?.['retry-after'];
    const waitTime = retryAfter ? `${retryAfter} detik` : 'beberapa saat';

    this.showErrorModal({
      errorType: 'rateLimit',
      title: options.title || 'Terlalu Banyak Permintaan',
      message: options.message || `Anda telah mencapai batas permintaan. Silakan tunggu ${waitTime} sebelum mencoba lagi.`,
      subMessage: options.subMessage || 'Ini dilakukan untuk menjaga kinerja sistem.',
      showRetry: options.showRetry || true,
      onRetry: options.onRetry,
      onClose: options.onClose,
      debugInfo: errorDetails
    });
  }

  // Handle network errors
  handleNetworkError(error, options = {}) {
    const errorDetails = {
      code: error.code,
      message: error.message,
      url: error.config?.url,
      timeout: error.config?.timeout,
      timestamp: new Date().toISOString()
    };

    this.showErrorModal({
      errorType: 'network',
      title: options.title || 'Masalah Koneksi',
      message: options.message || 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      subMessage: options.subMessage || 'Pastikan Anda terhubung ke internet dan coba lagi.',
      showRetry: options.showRetry || true,
      onRetry: options.onRetry,
      onClose: options.onClose,
      debugInfo: errorDetails
    });
  }

  // Handle server errors (500, etc.)
  handleServerError(error, options = {}) {
    const errorDetails = {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    };

    this.showErrorModal({
      errorType: 'server',
      title: options.title || 'Kesalahan Server',
      message: options.message || 'Terjadi kesalahan pada server. Tim teknis telah diberitahu.',
      subMessage: options.subMessage || 'Silakan coba lagi dalam beberapa menit.',
      showRetry: options.showRetry || true,
      onRetry: options.onRetry,
      onClose: options.onClose,
      debugInfo: errorDetails
    });
  }

  // Handle general errors
  handleGeneralError(error, options = {}) {
    const errorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    this.showErrorModal({
      errorType: 'general',
      title: options.title || 'Terjadi Kesalahan',
      message: options.message || 'Terjadi kesalahan tidak terduga. Silakan coba lagi.',
      subMessage: options.subMessage,
      showRetry: options.showRetry || false,
      onRetry: options.onRetry,
      onClose: options.onClose,
      debugInfo: errorDetails
    });
  }

  // Get default title for error type
  getDefaultTitle(errorType) {
    const titles = {
      auth: 'Masalah Autentikasi',
      rateLimit: 'Terlalu Banyak Permintaan',
      network: 'Masalah Koneksi',
      server: 'Kesalahan Server',
      general: 'Terjadi Kesalahan'
    };
    return titles[errorType] || titles.general;
  }

  // Get default message for error type
  getDefaultMessage(errorType) {
    const messages = {
      auth: 'Sesi Anda telah berakhir atau tidak valid.',
      rateLimit: 'Anda telah mencapai batas permintaan. Silakan tunggu sebentar.',
      network: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      server: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
      general: 'Terjadi kesalahan tidak terduga. Silakan coba lagi.'
    };
    return messages[errorType] || messages.general;
  }

  // Legacy method for backward compatibility
  logError(message, error) {
    if (__DEV__) {
      console.error(message, error);
    }
    // Could also send to crash reporting service here
  }
}

export default new ErrorHandlingService();