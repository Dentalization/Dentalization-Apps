import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../../components/common/ThemeProvider';
import Card from '../../../components/common/Card';
import aiService from '../../../services/aiService';
import aiDiagnosisHistoryService from '../../../services/aiDiagnosisHistoryService';
import { wp, hp, spacing, fontSizes, borderRadius, iconSizes, responsiveDimensions } from '../../../utils/responsive';
import ResponsiveContainer from '../../../components/layouts/ResponsiveContainer';
import ResponsiveCard from '../../../components/layouts/ResponsiveCard';
import ResponsiveText from '../../../components/layouts/ResponsiveText';

const { width, height } = Dimensions.get('window');

const DiagnosisPatient = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [aiServerStatus, setAiServerStatus] = useState('checking');
  const [profileComplete, setProfileComplete] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();

    checkProfileCompletion();
    checkAIServerStatus();
  }, [user]);

  const checkProfileCompletion = () => {
    if (!user?.profile || !user?.id) {
      setProfileComplete(false);
      setCompletionPercentage(0);
      return;
    }

    const profile = user.profile;
    // Only require essential fields for AI diagnosis
    const requiredFields = [
      'firstName',
      'lastName', 
      'phone',
      'address',
      'dateOfBirth'
    ];

    let completed = 0;
    const total = requiredFields.length + 1; // +1 for patient ID (user.id)

    // Check required profile fields with detailed logging
    const fieldStatus = {};
    requiredFields.forEach(field => {
      const value = profile[field];
      const isValid = value && value.toString().trim() !== '';
      fieldStatus[field] = {
        value: value,
        isValid: isValid,
        type: typeof value
      };
      if (isValid) {
        completed += 1;
      }
    });

    // Check patient ID (user.id)
    const hasPatientId = !!user.id;
    if (hasPatientId) {
      completed += 1;
    }

    const percentage = Math.round((completed / total) * 100);
    setCompletionPercentage(percentage);
    setProfileComplete(percentage === 100);

    console.log('AI Diagnosis Profile completion check:', {
      completed,
      total,
      percentage,
      isComplete: percentage === 100,
      requiredFields: requiredFields,
      patientId: hasPatientId ? 'Available' : 'Missing',
      fieldStatus: fieldStatus,
      userId: user.id
    });
  };

  const checkAIServerStatus = async () => {
    try {
      const healthCheck = await aiService.healthCheck();
      if (healthCheck.success) {
        setAiServerStatus('online');
        console.log('✅ AI Server is online and ready');
      } else {
        setAiServerStatus('offline');
        console.log('❌ AI Server is offline:', healthCheck.error);
      }
    } catch (error) {
      setAiServerStatus('offline');
      console.log('❌ AI Server health check failed:', error);
    }
  };

  const handleProfileIncomplete = () => {
    Alert.alert(
      'Profil Belum Lengkap',
      `Profil Anda baru ${completionPercentage}% lengkap. Untuk menggunakan fitur AI Diagnosis, silakan lengkapi profil Anda terlebih dahulu.`,
      [
        {
           text: 'Lengkapi Profil',
           onPress: () => navigation.navigate('PatientProfile')
         },
        {
          text: 'Batal',
          style: 'cancel'
        }
      ]
    );
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Izin Kamera Diperlukan',
        'Aplikasi memerlukan akses kamera untuk mengambil foto gigi. Silakan aktifkan izin kamera di pengaturan perangkat.'
      );
      return false;
    }
    return true;
  };

  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Izin Galeri Diperlukan',
        'Aplikasi memerlukan akses galeri untuk memilih foto. Silakan aktifkan izin galeri di pengaturan perangkat.'
      );
      return false;
    }
    return true;
  };

  const handleImageSelection = () => {
    if (!profileComplete) {
      handleProfileIncomplete();
      return;
    }

    Alert.alert(
      'Pilih Foto Gigi',
      'Bagaimana Anda ingin mengambil foto untuk diagnosis AI?',
      [
        {
          text: 'Kamera',
          onPress: openCamera,
          style: 'default'
        },
        {
          text: 'Galeri',
          onPress: openImageLibrary,
          style: 'default'
        },
        {
          text: 'Batal',
          style: 'cancel'
        }
      ]
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setAnalysisResult(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal membuka kamera. Silakan coba lagi.');
      console.error('Camera error:', error);
    }
  };

  const openImageLibrary = async () => {
    const hasPermission = await requestLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setAnalysisResult(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal membuka galeri. Silakan coba lagi.');
      console.error('Image library error:', error);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Silakan pilih foto terlebih dahulu.');
      return;
    }

    if (aiServerStatus !== 'online') {
      Alert.alert(
        'AI Server Offline', 
        'Server AI diagnosis sedang offline. Silakan periksa koneksi dan coba lagi.',
        [
          { text: 'Coba Lagi', onPress: checkAIServerStatus },
          { text: 'Batal', style: 'cancel' }
        ]
      );
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('🔍 Memulai analisis AI untuk pasien...');
      
      // Comment out patient info for patient app - use same approach as doctor app
      // const patientInfo = aiService.formatPatientInfo(user.profile);
      // console.log('📋 Info Pasien:', patientInfo);

      // Perform AI analysis without patient info to avoid quota issues
      const result = await aiService.performDentalReasoning(
        selectedImage.uri, 
        null, // Use null like doctor app to avoid API quota issues
        true, // generate visualization
        true  // generate report
      );
      
      if (result.success) {
        console.log('✅ Analisis AI berhasil:', result.data);
        setAnalysisResult(result.data);
        setShowResultModal(true);
        
        // Save diagnosis to history
        try {
          const diagnosisData = aiDiagnosisHistoryService.formatDiagnosisForSaving(
            result.data,
            selectedImage.uri,
            user.id // patientId is current user for patient app
          );
          
          await aiDiagnosisHistoryService.saveDiagnosis(diagnosisData);
          console.log('✅ Diagnosis saved to history');
        } catch (saveError) {
          console.error('❌ Failed to save diagnosis:', saveError);
          // Don't show error to user, just log it
        }
      } else {
        console.error('❌ Analisis AI gagal:', result.error);
        Alert.alert(
          'Analisis Gagal',
          result.error || 'Terjadi kesalahan saat menganalisis foto. Silakan coba lagi.'
        );
      }
    } catch (error) {
      console.error('❌ Error during analysis:', error);
      
      let errorMessage = 'Terjadi kesalahan saat menganalisis foto.';
      
      if (error.message) {
        if (error.message.includes('insufficient_quota')) {
          errorMessage = 'Kuota AI analysis telah habis. Silakan coba lagi nanti atau hubungi administrator.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Analisis membutuhkan waktu terlalu lama. Silakan coba dengan foto yang lebih kecil atau coba lagi nanti.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Masalah koneksi internet. Silakan periksa koneksi dan coba lagi.';
        } else if (error.message.includes('server_error')) {
          errorMessage = 'Server AI sedang mengalami masalah. Silakan coba lagi dalam beberapa menit.';
        }
      }
      
      Alert.alert(
        'Analisis Gagal',
        errorMessage + ' Jika masalah berlanjut, silakan hubungi tim support.',
        [
          { text: 'Coba Lagi', onPress: () => analyzeImage() },
          { text: 'Batal', style: 'cancel' }
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderProfileStatus = () => {
    if (profileComplete) {
      return (
        <Card style={[styles.statusCard, { backgroundColor: theme.colors.patient.primary + '20' }]}>
          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.patient.primary} />
            <Text style={[styles.statusText, { color: theme.colors.patient.primary }]}>
              Profil Lengkap - Siap untuk AI Diagnosis
            </Text>
          </View>
        </Card>
      );
    }

    return (
      <Card style={[styles.statusCard, { backgroundColor: theme.colors.warning + '20' }]}>
        <View style={styles.statusRow}>
          <Ionicons name="warning" size={24} color={theme.colors.warning} />
          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusText, { color: theme.colors.warning }]}>
              Profil {completionPercentage}% Lengkap
            </Text>
            <Text style={[styles.statusSubtext, { color: theme.scheme.textSecondary }]}>
              Lengkapi profil untuk menggunakan AI Diagnosis
            </Text>
          </View>
        </View>
        <TouchableOpacity 
           style={[styles.completeButton, { backgroundColor: theme.colors.patient.primary }]}
           onPress={() => navigation.navigate('PatientProfile')}
         >
          <Text style={styles.completeButtonText}>Lengkapi Profil</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderServerStatus = () => {
    const statusColor = aiServerStatus === 'online' 
      ? theme.colors.patient.primary 
      : aiServerStatus === 'offline' 
        ? theme.colors.error 
        : theme.colors.warning;
    
    const statusText = aiServerStatus === 'online' 
      ? 'AI Server Online' 
      : aiServerStatus === 'offline' 
        ? 'AI Server Offline' 
        : 'Checking AI Server...';

    return (
      <View style={styles.serverStatus}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.serverStatusText, { color: statusColor }]}>
          {statusText}
        </Text>
        {aiServerStatus === 'offline' && (
          <TouchableOpacity onPress={checkAIServerStatus} style={styles.retryButton}>
            <Ionicons name="refresh" size={16} color={statusColor} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.scheme.background }]}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.scheme.text }]}>
              AI Diagnosis Gigi
            </Text>
            <Text style={[styles.subtitle, { color: theme.scheme.textSecondary }]}>
              Analisis kondisi gigi dengan teknologi AI
            </Text>
          </View>

          {/* Profile Status */}
          {renderProfileStatus()}

          {/* Server Status */}
          {renderServerStatus()}

          {/* Image Selection */}
          <Card style={styles.imageCard}>
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                <TouchableOpacity 
                  style={[styles.changeImageButton, { backgroundColor: theme.colors.patient.primary }]}
                  onPress={handleImageSelection}
                >
                  <Ionicons name="camera" size={20} color="white" />
                  <Text style={styles.changeImageText}>Ganti Foto</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.imageSelector}
                onPress={handleImageSelection}
                disabled={!profileComplete}
              >
                <LinearGradient
                  colors={profileComplete 
                    ? [theme.colors.patient.primary + '20', theme.colors.patient.primary + '10']
                    : [theme.scheme.surface, theme.scheme.surface]
                  }
                  style={styles.imageSelectorGradient}
                >
                  <Ionicons 
                    name="camera" 
                    size={60} 
                    color={profileComplete ? theme.colors.patient.primary : theme.scheme.textSecondary} 
                  />
                  <Text style={[
                    styles.imageSelectorText, 
                    { color: profileComplete ? theme.scheme.text : theme.scheme.textSecondary }
                  ]}>
                    {profileComplete ? 'Ambil Foto Gigi' : 'Lengkapi Profil Dulu'}
                  </Text>
                  <Text style={[
                    styles.imageSelectorSubtext, 
                    { color: theme.scheme.textSecondary }
                  ]}>
                    {profileComplete 
                      ? 'Tap untuk mengambil atau memilih foto'
                      : 'Profil harus lengkap untuk menggunakan AI'
                    }
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Card>

          {/* Analyze Button */}
          {selectedImage && (
            <TouchableOpacity 
              style={[
                styles.analyzeButton,
                { 
                  backgroundColor: theme.colors.patient.primary,
                  opacity: isAnalyzing || aiServerStatus !== 'online' ? 0.6 : 1
                }
              ]}
              onPress={analyzeImage}
              disabled={isAnalyzing || aiServerStatus !== 'online'}
            >
              {isAnalyzing ? (
                <View style={styles.analyzingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.analyzeButtonText}>Menganalisis...</Text>
                </View>
              ) : (
                <View style={styles.analyzeContainer}>
                  <Ionicons name="analytics" size={24} color="white" />
                  <Text style={styles.analyzeButtonText}>Analisis dengan AI</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Instructions */}
          <Card style={styles.instructionsCard}>
            <Text style={[styles.instructionsTitle, { color: theme.scheme.text }]}>
              Tips Foto yang Baik:
            </Text>
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.patient.primary} />
                <Text style={[styles.instructionText, { color: theme.scheme.textSecondary }]}>
                  Pastikan pencahayaan cukup terang
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.patient.primary} />
                <Text style={[styles.instructionText, { color: theme.scheme.textSecondary }]}>
                  Foto harus fokus dan tidak blur
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.patient.primary} />
                <Text style={[styles.instructionText, { color: theme.scheme.textSecondary }]}>
                  Tampilkan area gigi yang bermasalah
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.patient.primary} />
                <Text style={[styles.instructionText, { color: theme.scheme.textSecondary }]}>
                  Hindari bayangan pada foto
                </Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      </Animated.View>

      {/* Result Modal */}
      <Modal
        visible={showResultModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowResultModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.scheme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.scheme.text }]}>
              Hasil Analisis AI
            </Text>
            <TouchableOpacity 
              onPress={() => setShowResultModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.scheme.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {analysisResult && (
              <View>
                {/* Detection Results */}
                {analysisResult.detection_result && (
                  <Card style={styles.resultCard}>
                    <Text style={[styles.resultTitle, { color: theme.scheme.text }]}>
                      Deteksi Kondisi:
                    </Text>
                    {analysisResult.detection_result.detections?.map((detection, index) => (
                      <View key={index} style={styles.detectionItem}>
                        <Text style={[styles.detectionClass, { color: theme.colors.patient.primary }]}>
                          {detection.class}
                        </Text>
                        <Text style={[styles.detectionConfidence, { color: theme.scheme.textSecondary }]}>
                          Confidence: {(detection.confidence * 100).toFixed(1)}%
                        </Text>
                      </View>
                    ))}
                  </Card>
                )}

                {/* Reasoning Results */}
                {analysisResult.reasoning_result && (
                  <Card style={styles.resultCard}>
                    <Text style={[styles.resultTitle, { color: theme.scheme.text }]}>
                      Analisis AI:
                    </Text>
                    <Text style={[styles.reasoningText, { color: theme.scheme.textSecondary }]}>
                      {analysisResult.reasoning_result.analysis || 'Analisis tidak tersedia'}
                    </Text>
                    
                    {analysisResult.reasoning_result.recommendations && (
                      <View style={styles.recommendationsContainer}>
                        <Text style={[styles.recommendationsTitle, { color: theme.scheme.text }]}>
                          Rekomendasi:
                        </Text>
                        {analysisResult.reasoning_result.recommendations.map((rec, index) => (
                          <Text key={index} style={[styles.recommendationItem, { color: theme.scheme.textSecondary }]}>
                            • {rec}
                          </Text>
                        ))}
                      </View>
                    )}
                  </Card>
                )}

                {/* Visualization */}
                {analysisResult.visualization_path && (
                  <Card style={styles.resultCard}>
                    <Text style={[styles.resultTitle, { color: theme.scheme.text }]}>
                      Visualisasi:
                    </Text>
                    <Image 
                      source={{ uri: aiService.getFileUrl(analysisResult.visualization_path) }}
                      style={styles.visualizationImage}
                      resizeMode="contain"
                    />
                  </Card>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  statusCard: {
    marginBottom: 16,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
  completeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  serverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  serverStatusText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  retryButton: {
    padding: 4,
  },
  imageCard: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  selectedImageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: width - 80,
    height: (width - 80) * 0.75,
    borderRadius: 12,
    marginBottom: 16,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  changeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageSelector: {
    height: 200,
  },
  imageSelectorGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
  },
  imageSelectorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  imageSelectorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  analyzeButton: {
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionsCard: {
    marginBottom: 20,
    padding: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultCard: {
    marginVertical: 10,
    padding: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  detectionItem: {
    marginBottom: 8,
  },
  detectionClass: {
    fontSize: 16,
    fontWeight: '600',
  },
  detectionConfidence: {
    fontSize: 14,
    marginTop: 2,
  },
  reasoningText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  visualizationImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});

export default DiagnosisPatient;
