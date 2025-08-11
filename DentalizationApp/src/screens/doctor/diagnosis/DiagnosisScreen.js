import React, { useState, useRef } from 'react';
import {
  View,
  Text,
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
import aiService from '../../../services/aiService';
import aiDiagnosisHistoryService from '../../../services/aiDiagnosisHistoryService';
import { wp, hp, spacing, fontSizes, borderRadius, iconSizes, responsiveDimensions } from '../../../utils/responsive';
import ResponsiveContainer from '../../../components/layouts/ResponsiveContainer';
import ResponsiveCard from '../../../components/layouts/ResponsiveCard';
import ResponsiveText from '../../../components/layouts/ResponsiveText';

const { width, height } = Dimensions.get('window');

const DiagnosisScreen = () => {
  const { user } = useSelector(state => state.auth);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [aiServerStatus, setAiServerStatus] = useState('checking');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
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

    // Check AI server status on component mount
    checkAIServerStatus();
  }, []);

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
    Alert.alert(
      'Pilih Foto Gigi',
      'Bagaimana Anda ingin mengambil foto untuk diagnosis?',
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
      console.log('🔍 Memulai analisis AI...');
      
      // Comment out patient info for doctor app - not needed
      // const patientInfo = {
      //   name: user?.profile ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() : 'Pasien Tidak Dikenal',
      //   age: user?.profile?.dateOfBirth ? calculateAge(user.profile.dateOfBirth) : null,
      //   gender: user?.profile?.gender || 'tidak diketahui',
      //   medical_history: user?.profile?.medicalHistory || 'Tidak ada riwayat medis yang tercatat',
      //   dental_history: user?.profile?.dentalHistory || 'Tidak ada riwayat dental yang tercatat',
      //   chief_complaint: 'Pemeriksaan dan diagnosis gigi'
      // };

      // console.log('📋 Info Pasien:', patientInfo);

      // Gunakan AIService untuk analisis (tanpa patient info untuk doctor app)
      const result = await aiService.performDentalReasoning(selectedImage.uri, null);
      
      if (result.success) {
        console.log('✅ Analisis AI berhasil diselesaikan');
        setAnalysisResult(result.data);
        setShowResultModal(true);
        
        // Save diagnosis to history
        try {
          await aiDiagnosisHistoryService.saveDiagnosis({
            imageUrl: selectedImage.uri,
            detectionResult: result.data.detection_result,
            reasoningResult: result.data.reasoning_result,
            reportUrl: result.data.report_url,
            requestId: result.data.request_id,
            aiServerResponse: result.data
          });
          console.log('✅ Diagnosis berhasil disimpan ke history');
        } catch (saveError) {
          console.error('❌ Gagal menyimpan diagnosis ke history:', saveError);
          // Don't show error to user as the main diagnosis was successful
        }
      } else {
        console.error('❌ Analisis AI gagal:', result.error);
        Alert.alert('Analisis Gagal', result.error || 'Gagal menganalisis gambar');
      }
    } catch (error) {
      console.error('❌ Error saat analisis:', error);
      Alert.alert('Error', 'Gagal terhubung ke server AI. Silakan periksa koneksi dan coba lagi.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setShowResultModal(false);
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <Modal
        visible={showResultModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowResultModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F1F8' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333333' }}>Hasil Diagnosis AI</Text>
            <TouchableOpacity onPress={() => setShowResultModal(false)}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* Patient Info section removed for doctor app */}

            {/* Deteksi yang ditemukan */}
             {analysisResult.detection_result?.detections && analysisResult.detection_result.detections.length > 0 && (
               <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                 <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333333' }}>🔍 Kondisi yang Terdeteksi</Text>
                 <Text style={{ fontSize: 14, color: '#666666', marginBottom: 12 }}>Ditemukan {analysisResult.detection_result.detection_count} kondisi pada gigi</Text>
                 {analysisResult.detection_result.detections.map((detection, index) => (
                   <View key={index} style={{ marginBottom: 12, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: detection.severity === 'berat' ? '#FF5722' : detection.severity === 'sedang' ? '#FF9800' : '#4CAF50' }}>
                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                       <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333', flex: 1 }}>{detection.condition_name || detection.class_name}</Text>
                       <Text style={{ fontSize: 14, color: '#666666', fontWeight: '600' }}>
                         {(detection.confidence * 100).toFixed(1)}%
                       </Text>
                     </View>
                     <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                       <Text style={{ fontSize: 12, color: detection.severity === 'berat' ? '#FF5722' : detection.severity === 'sedang' ? '#FF9800' : '#4CAF50', fontWeight: '600', textTransform: 'uppercase' }}>
                         {detection.severity}
                       </Text>
                     </View>
                     {detection.treatment_recommendation && (
                       <Text style={{ fontSize: 14, color: '#666666', marginTop: 4, fontStyle: 'italic' }}>💡 {detection.treatment_recommendation}</Text>
                     )}
                   </View>
                 ))}
               </View>
             )}

            {/* Gambar hasil visualisasi */}
            {analysisResult.detection_result?.visualization_url && (
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333333' }}>📊 Visualisasi Deteksi</Text>
                <Text style={{ fontSize: 14, color: '#666666', marginBottom: 12 }}>Gambar dengan overlay deteksi kondisi gigi</Text>
                <Image 
                  source={{ uri: analysisResult.detection_result.visualization_url }}
                  style={{ width: '100%', height: 250, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5E5' }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 12, color: '#999999', marginTop: 8, textAlign: 'center' }}>Timestamp: {new Date(analysisResult.detection_result.timestamp).toLocaleString('id-ID')}</Text>
              </View>
            )}

            {/* Analisis AI */}
             {analysisResult.reasoning_result?.reasoning_text && (
               <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                 <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333333' }}>🧠 Analisis AI Komprehensif</Text>
                 <View style={{ backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                   <Text style={{ fontSize: 12, color: '#666666', marginBottom: 4 }}>Model: {analysisResult.reasoning_result.model}</Text>
                   <Text style={{ fontSize: 12, color: '#666666' }}>Waktu Pemrosesan: {analysisResult.reasoning_result.processing_time?.toFixed(2)}s</Text>
                 </View>
                 <Text style={{ fontSize: 14, lineHeight: 22, color: '#444444' }}>{analysisResult.reasoning_result.reasoning_text}</Text>
               </View>
             )}

            {/* Ringkasan Statistik */}
             {analysisResult.reasoning_result?.detection_data && (
               <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                 <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333333' }}>📊 Ringkasan Deteksi</Text>
                 <View style={{ backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12 }}>
                   <Text style={{ fontSize: 14, color: '#444444', marginBottom: 4 }}>Total Kondisi Terdeteksi: {analysisResult.reasoning_result.detection_data.detection_count}</Text>
                   <Text style={{ fontSize: 14, color: '#444444' }}>Jenis Kondisi: {[...new Set(analysisResult.reasoning_result.detection_data.conditions)].join(', ')}</Text>
                 </View>
               </View>
             )}

            {/* Laporan */}
            {analysisResult.report_url && (
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333333' }}>📄 Laporan Lengkap</Text>
                <View style={{ backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, color: '#666666', marginBottom: 4 }}>Request ID: {analysisResult.request_id}</Text>
                  <Text style={{ fontSize: 12, color: '#666666' }}>Timestamp: {new Date(analysisResult.timestamp).toLocaleString('id-ID')}</Text>
                </View>
                <TouchableOpacity 
                  style={{ backgroundColor: '#007AFF', borderRadius: 8, padding: 12, alignItems: 'center' }}
                  onPress={() => {
                    console.log('Report URL:', analysisResult.report_url);
                    // Here you can implement opening the report URL
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>📥 Unduh Laporan Lengkap</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
          
          <View style={{ padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E5E5' }}>
            <TouchableOpacity
              onPress={resetAnalysis}
              style={{ backgroundColor: '#483AA0', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Analisis Baru</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F1F8' }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          {/* Beautiful Header */}
          <View style={{ alignItems: 'center', marginBottom: 40, paddingHorizontal: 20 }}>
            {/* Background Decoration */}
            <View style={{ position: 'absolute', top: -20, left: 0, right: 0, height: 200, opacity: 0.05 }}>
              <LinearGradient
                colors={['#483AA0', '#6B5CE7', 'transparent']}
                style={{ flex: 1, borderRadius: 100 }}
              />
            </View>
            
            {/* Main Icon Container */}
            <View style={{ position: 'relative', marginBottom: 24 }}>
              {/* Outer Glow Ring */}
              <View style={{ position: 'absolute', top: -15, left: -15, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(107, 92, 231, 0.1)', opacity: 0.8 }} />
              <View style={{ position: 'absolute', top: -8, left: -8, width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(107, 92, 231, 0.15)' }} />
              
              {/* Main Icon */}
              <LinearGradient
                colors={['#483AA0', '#6B5CE7', '#8B7ED8']}
                style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', shadowColor: '#483AA0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 12 }}
              >
                <MaterialIcons name="psychology" size={40} color="#FFFFFF" />
                {/* Sparkle Effect */}
                <View style={{ position: 'absolute', top: 8, right: 8, width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.4)' }} />
                <View style={{ position: 'absolute', bottom: 12, left: 12, width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' }} />
              </LinearGradient>
              
              {/* Floating Particles */}
              <View style={{ position: 'absolute', top: -5, right: -10, width: 4, height: 4, borderRadius: 2, backgroundColor: '#6B5CE7', opacity: 0.6 }} />
              <View style={{ position: 'absolute', bottom: -8, left: -12, width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#483AA0', opacity: 0.4 }} />
            </View>
            
            {/* Title Section */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 28, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', letterSpacing: -0.5, marginBottom: 4 }}>AI Diagnosis</Text>
              <View style={{ width: 40, height: 3, backgroundColor: '#6B5CE7', borderRadius: 2, marginBottom: 12 }} />
              
              {/* Enhanced Status Indicator */}
              <View style={[
                { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
                aiServerStatus === 'online' ? { backgroundColor: '#E8F5E8', borderColor: '#C8E6C9' } : 
                aiServerStatus === 'offline' ? { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' } : { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' }
              ]}>
                {/* Animated Status Dot */}
                <View style={[
                  { width: 10, height: 10, borderRadius: 5, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
                  aiServerStatus === 'online' ? { backgroundColor: '#4CAF50' } : 
                  aiServerStatus === 'offline' ? { backgroundColor: '#F44336' } : { backgroundColor: '#FF9800' }
                ]} />
                <Text style={[
                  { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
                  aiServerStatus === 'online' ? { color: '#2E7D32' } : 
                  aiServerStatus === 'offline' ? { color: '#C62828' } : { color: '#E65100' }
                ]}>
                  {aiServerStatus === 'online' ? '🟢 AI Online & Ready' : 
                   aiServerStatus === 'offline' ? '🔴 AI Offline' : '🟡 Connecting...'}
                </Text>
              </View>
            </View>
            
            {/* Description */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(107, 92, 231, 0.1)' }}>
              <Text style={{ fontSize: 16, color: '#555555', textAlign: 'center', lineHeight: 22, fontWeight: '500' }}>Analisis kondisi gigi dengan teknologi AI</Text>
              <Text style={{ fontSize: 14, color: '#888888', textAlign: 'center', marginTop: 4, fontStyle: 'italic' }}>Powered by Advanced Machine Learning</Text>
            </View>
          </View>

          {/* Image Selection Area */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
            {selectedImage ? (
              <View>
                <Image 
                  source={{ uri: selectedImage.uri }} 
                  style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 16 }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={handleImageSelection}
                  style={{ backgroundColor: '#F8F9FA', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 16 }}
                >
                  <Text style={{ color: '#483AA0', fontSize: 16, fontWeight: '600' }}>Ganti Foto</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleImageSelection}
                style={{ alignItems: 'center', paddingVertical: 40, borderWidth: 2, borderColor: '#E5E5E5', borderStyle: 'dashed', borderRadius: 12 }}
              >
                <MaterialIcons name="add-a-photo" size={48} color="#483AA0" style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#483AA0', marginBottom: 8 }}>Tambah Foto Gigi</Text>
                <Text style={{ fontSize: 14, color: '#666666', textAlign: 'center' }}>Ambil foto atau pilih dari galeri untuk memulai diagnosis</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Analysis Button */}
          {selectedImage && (
            <TouchableOpacity
              onPress={analyzeImage}
              disabled={isAnalyzing || aiServerStatus !== 'online'}
              style={{
                backgroundColor: (isAnalyzing || aiServerStatus !== 'online') ? '#B0B0B0' : '#483AA0',
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: 'center',
                marginBottom: 24,
                shadowColor: '#483AA0',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5
              }}
            >
              {isAnalyzing ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Menganalisis...</Text>
                </View>
              ) : aiServerStatus !== 'online' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="cloud-off" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                    {aiServerStatus === 'offline' ? 'AI Server Offline' : 'Checking AI Server...'}
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="analytics" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Mulai Diagnosis AI</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {aiServerStatus === 'offline' && (
            <TouchableOpacity 
              style={{
                backgroundColor: '#F8F9FA',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                alignItems: 'center',
                marginBottom: 24,
                flexDirection: 'row',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#E5E5E5'
              }}
              onPress={checkAIServerStatus}
            >
              <MaterialIcons name="refresh" size={16} color="#483AA0" style={{ marginRight: 8 }} />
              <Text style={{ color: '#483AA0', fontSize: 14, fontWeight: '600' }}>Coba Koneksi AI Lagi</Text>
            </TouchableOpacity>
          )}

          {/* Info Cards */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginRight: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
              <MaterialIcons name="speed" size={32} color="#4CAF50" style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333333', textAlign: 'center' }}>Cepat & Akurat</Text>
              <Text style={{ fontSize: 12, color: '#666666', textAlign: 'center', marginTop: 4 }}>Hasil dalam hitungan detik</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginLeft: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
              <MaterialIcons name="verified" size={32} color="#2196F3" style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333333', textAlign: 'center' }}>AI Terpercaya</Text>
              <Text style={{ fontSize: 12, color: '#666666', textAlign: 'center', marginTop: 4 }}>Teknologi terdepan</Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333333', marginBottom: 12 }}>Panduan Penggunaan</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, color: '#483AA0', marginRight: 8, fontWeight: 'bold' }}>1.</Text>
              <Text style={{ fontSize: 14, color: '#666666', flex: 1 }}>Ambil foto gigi dengan pencahayaan yang baik</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, color: '#483AA0', marginRight: 8, fontWeight: 'bold' }}>2.</Text>
              <Text style={{ fontSize: 14, color: '#666666', flex: 1 }}>Pastikan gigi terlihat jelas dan fokus</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16, color: '#483AA0', marginRight: 8, fontWeight: 'bold' }}>3.</Text>
              <Text style={{ fontSize: 14, color: '#666666', flex: 1 }}>Tekan tombol diagnosis untuk analisis AI</Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
      
      {renderAnalysisResult()}
    </SafeAreaView>
  );
};

export default DiagnosisScreen;
