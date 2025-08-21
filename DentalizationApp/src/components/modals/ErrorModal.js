import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ErrorModal = ({ 
  visible, 
  onClose, 
  onRetry, 
  errorType = 'general',
  title,
  message,
  subMessage,
  showRetry = false,
  retryText = 'Coba Lagi',
  closeText = 'Tutup'
}) => {
  // Define error type configurations
  const errorConfigs = {
    auth: {
      icon: 'lock',
      colors: ['#FF6B6B', '#FF8E8E'],
      defaultTitle: 'Masalah Autentikasi',
      defaultMessage: 'Sesi Anda telah berakhir atau tidak valid.'
    },
    rateLimit: {
      icon: 'timer',
      colors: ['#FF9800', '#FFB74D'],
      defaultTitle: 'Terlalu Banyak Permintaan',
      defaultMessage: 'Anda telah mencapai batas permintaan. Silakan tunggu sebentar.'
    },
    network: {
      icon: 'wifi-off',
      colors: ['#9C27B0', '#BA68C8'],
      defaultTitle: 'Masalah Koneksi',
      defaultMessage: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
    },
    server: {
      icon: 'error',
      colors: ['#F44336', '#EF5350'],
      defaultTitle: 'Kesalahan Server',
      defaultMessage: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
    },
    general: {
      icon: 'warning',
      colors: ['#FF6B6B', '#FF8E8E'],
      defaultTitle: 'Terjadi Kesalahan',
      defaultMessage: 'Terjadi kesalahan tidak terduga. Silakan coba lagi.'
    }
  };

  const config = errorConfigs[errorType] || errorConfigs.general;
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={config.colors}
            style={styles.iconContainer}
          >
            <MaterialIcons name={config.icon} size={40} color="white" />
          </LinearGradient>
          
          <Text style={styles.title}>{displayTitle}</Text>
          
          <Text style={styles.message}>{displayMessage}</Text>
          
          {subMessage && (
            <Text style={styles.subMessage}>{subMessage}</Text>
          )}
          
          <View style={styles.buttonContainer}>
            {showRetry && onRetry && (
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={onRetry}
              >
                <MaterialIcons name="refresh" size={20} color="white" />
                <Text style={styles.retryButtonText}>{retryText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.closeButton, !showRetry && styles.fullWidthButton]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>{closeText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: width - 40,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  subMessage: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  fullWidthButton: {
    flex: 1,
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorModal;