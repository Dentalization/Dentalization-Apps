import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AIAgentOfflineModal = ({ visible, onClose, onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

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
            colors={['#FF6B6B', '#FF8E8E']}
            style={styles.iconContainer}
          >
            <MaterialIcons name="cloud-off" size={40} color="white" />
          </LinearGradient>
          
          <Text style={styles.title}>AI Agent Tidak Tersedia</Text>
          
          <Text style={styles.message}>
            Server AI Agent sedang offline atau tidak dapat dijangkau. 
            Fitur diagnosis AI tidak dapat digunakan saat ini.
          </Text>
          
          <Text style={styles.subMessage}>
            Silakan coba lagi dalam beberapa saat atau hubungi administrator sistem.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.retryButton, isRetrying && styles.retryButtonDisabled]}
              onPress={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialIcons name="refresh" size={20} color="white" />
              )}
              <Text style={styles.retryButtonText}>
                {isRetrying ? 'Memeriksa...' : 'Coba Lagi'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
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
  retryButtonDisabled: {
    backgroundColor: '#A0A0A0',
    opacity: 0.7,
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
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AIAgentOfflineModal;