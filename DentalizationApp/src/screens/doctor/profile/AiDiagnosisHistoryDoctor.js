import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import aiDiagnosisHistoryService from '../../../services/aiDiagnosisHistoryService';
import aiAgentService from '../../../services/aiAgentService';
import AIAgentOfflineModal from '../../../components/modals/AIAgentOfflineModal';

const AiDiagnosisHistoryDoctor = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState(null);
  const [agentSessions, setAgentSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('classic'); // 'classic' or 'agent'
  const [agentServerStatus, setAgentServerStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  const isDoctor = user?.role === 'DOCTOR';

  // Load diagnosis history
  const loadDiagnoses = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // For doctor, always use getMyDiagnosisHistory to get their own diagnoses
      const response = await aiDiagnosisHistoryService.getMyDiagnosisHistory(pageNum, 10);

      if (response.success) {
        const newDiagnoses = response.data.diagnoses;
        
        if (pageNum === 1 || isRefresh) {
          setDiagnoses(newDiagnoses);
        } else {
          setDiagnoses(prev => [...prev, ...newDiagnoses]);
        }

        setHasMore(response.data.pagination.page < response.data.pagination.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Load diagnoses error:', error);
      Alert.alert('Error', 'Gagal memuat riwayat diagnosis AI');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [isDoctor]);

  // Check agent server status
  const checkAgentServerStatus = useCallback(async () => {
    try {
      setAgentServerStatus('checking');
      const healthCheck = await aiAgentService.checkHealth();
      if (healthCheck.status === 'success') {
        setAgentServerStatus('online');
        setShowOfflineModal(false);
        return true;
      } else {
        setAgentServerStatus('offline');
        setShowOfflineModal(true);
        return false;
      }
    } catch (error) {
      // AI Agent Server is offline - tidak perlu menampilkan log
      setAgentServerStatus('offline');
      setShowOfflineModal(true);
      return false;
    }
  }, []);

  // Load agent sessions
  const loadAgentSessions = useCallback(async () => {
    try {
      setLoading(true);
      const isOnline = await checkAgentServerStatus();
      
      if (!isOnline) {
        setAgentSessions([]);
        return;
      }
      
      const sessions = await aiAgentService.listSessions();
      setAgentSessions(sessions || []);
      setAgentServerStatus('online');
    } catch (error) {
      // Server AI Agent offline - tidak perlu menampilkan error
      setAgentServerStatus('offline');
      // Handle network errors more gracefully
      if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
        Alert.alert(
          'Server AI Agent Offline', 
          'Server AI Agent sedang tidak tersedia. Silakan coba lagi nanti atau hubungi administrator.'
        );
      } else {
        Alert.alert('Error', 'Gagal memuat riwayat sesi AI Agent: ' + (error.message || 'Unknown error'));
      }
      // Set empty array so UI shows empty state instead of loading
      setAgentSessions([]);
    } finally {
      setLoading(false);
    }
  }, [checkAgentServerStatus]);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await aiDiagnosisHistoryService.getDiagnosisStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        setStats({ totalDiagnoses: 0, recentDiagnoses: 0 });
      }
    } catch (error) {
      // Server AI Agent offline - tidak perlu menampilkan error
      setStats({ totalDiagnoses: 0, recentDiagnoses: 0 });
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'classic') {
      loadDiagnoses(1, true);
      loadStats();
    } else {
      loadAgentSessions();
    }
  }, [loadDiagnoses, loadStats, loadAgentSessions, viewMode]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    if (viewMode === 'classic') {
      loadDiagnoses(1, true);
      loadStats();
    } else {
      loadAgentSessions();
    }
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      loadDiagnoses(page + 1);
    }
  };

  const openDiagnosisDetail = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setModalVisible(true);
  };

  const openSessionDetail = (session) => {
    setSelectedSession(session);
    setSessionModalVisible(true);
  };

  const deleteDiagnosis = async (diagnosisId) => {
    Alert.alert(
      'Hapus Diagnosis',
      'Apakah Anda yakin ingin menghapus diagnosis ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await aiDiagnosisHistoryService.deleteDiagnosis(diagnosisId);
              setDiagnoses(prev => prev.filter(d => d.id !== diagnosisId));
              Alert.alert('Berhasil', 'Diagnosis berhasil dihapus');
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus diagnosis');
            }
          }
        }
      ]
    );
  };

  const renderSessionDetailModal = () => {
    if (!selectedSession) return null;

    const messages = selectedSession.messages || [];
    const images = selectedSession.images || [];

    return (
      <Modal
        visible={sessionModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detail Sesi AI Agent</Text>
            <TouchableOpacity 
              onPress={() => setSessionModalVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Session Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📱 Informasi Sesi</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Session ID:</Text>
                <Text style={styles.infoValue}>{selectedSession.session_id || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tanggal:</Text>
                <Text style={styles.infoValue}>{formatDate(selectedSession.created_at || selectedSession.timestamp)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Pesan:</Text>
                <Text style={styles.infoValue}>{messages.length}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gambar:</Text>
                <Text style={styles.infoValue}>{images.length}</Text>
              </View>
            </View>

            {/* Images */}
            {images.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🖼️ Gambar yang Dianalisis</Text>
                {images.map((image, index) => (
                  <View key={index} style={styles.detectionCard}>
                    <Text style={styles.detectionTitle}>Gambar {index + 1}</Text>
                    <Text style={styles.detectionDescription}>ID: {image.image_id}</Text>
                    <Text style={styles.detectionDescription}>Upload: {formatDate(image.uploaded_at)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Chat Messages */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💬 Riwayat Chat ({messages.length})</Text>
              {messages.map((message, index) => (
                <View key={index} style={[
                  styles.chatMessage,
                  message.role === 'user' ? styles.userMessage : styles.agentMessage
                ]}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageRole}>
                      {message.role === 'user' ? '👨‍⚕️ Dokter' : '🤖 AI Agent'}
                    </Text>
                    <Text style={styles.messageTime}>
                      {formatDate(message.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.messageContent}>{message.content}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (detections) => {
    if (!detections || detections.length === 0) return '#4CAF50';
    
    const hasSevere = detections.some(d => d.confidence > 0.8);
    const hasModerate = detections.some(d => d.confidence > 0.6);
    
    if (hasSevere) return '#F44336';
    if (hasModerate) return '#FF9800';
    return '#4CAF50';
  };

  const renderDiagnosisItem = ({ item }) => {
    const detections = item.detectionResult?.detections || [];
    const severityColor = getSeverityColor(detections);
    const doctorName = item.user?.doctorProfile ? 
      `${item.user.doctorProfile.firstName} ${item.user.doctorProfile.lastName}` : 
      'Unknown Doctor';

    return (
      <TouchableOpacity 
        style={styles.diagnosisCard}
        onPress={() => openDiagnosisDetail(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.severityIndicator, { backgroundColor: severityColor }]} />
            <View>
              <Text style={styles.diagnosisDate}>{formatDate(item.diagnosisDate)}</Text>
              <Text style={styles.doctorName}>Dr. {doctorName}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => deleteDiagnosis(item.id)}
            style={styles.deleteButton}
          >
            <MaterialIcons name="delete" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.detectionCount}>
            {detections.length} kondisi terdeteksi
          </Text>
          
          {detections.slice(0, 2).map((detection, index) => (
            <View key={index} style={styles.detectionItem}>
              <Text style={styles.detectionLabel}>
                • {detection.condition_name || detection.class_name || detection.label || detection.class}
              </Text>
              <Text style={styles.detectionConfidence}>
                {((detection.confidence || detection.score) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
          
          {detections.length > 2 && (
            <Text style={styles.moreDetections}>
              +{detections.length - 2} kondisi lainnya
            </Text>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          <MaterialIcons name="visibility" size={16} color="#666" />
          <Text style={styles.viewDetail}>Lihat Detail</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSessionItem = ({ item }) => {
    const sessionDate = new Date(item.created_at || item.timestamp);
    const messageCount = item.messages?.length || 0;
    const hasImages = item.images && item.images.length > 0;
    
    return (
      <TouchableOpacity 
        style={styles.diagnosisCard}
        onPress={() => openSessionDetail(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.severityIndicator, { backgroundColor: '#667eea' }]} />
            <View>
              <Text style={styles.diagnosisDate}>{formatDate(sessionDate)}</Text>
              <Text style={styles.doctorName}>AI Agent Session</Text>
            </View>
          </View>
          <MaterialIcons name="chat" size={20} color="#667eea" />
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.detectionCount}>
            {messageCount} pesan chat
          </Text>
          
          {hasImages && (
            <View style={styles.detectionItem}>
              <Text style={styles.detectionLabel}>
                • {item.images.length} gambar dianalisis
              </Text>
              <MaterialIcons name="image" size={16} color="#667eea" />
            </View>
          )}
          
          {item.session_id && (
            <Text style={styles.moreDetections}>
              Session ID: {item.session_id.substring(0, 8)}...
            </Text>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          <MaterialIcons name="visibility" size={16} color="#666" />
          <Text style={styles.viewDetail}>Lihat Chat</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedDiagnosis) return null;

    const detections = selectedDiagnosis.detectionResult?.detections || [];
    const reasoning = selectedDiagnosis.reasoningResult;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detail Diagnosis AI</Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Informasi Umum */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Informasi Diagnosis</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tanggal:</Text>
                <Text style={styles.infoValue}>{formatDate(selectedDiagnosis.diagnosisDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Request ID:</Text>
                <Text style={styles.infoValue}>{selectedDiagnosis.requestId || 'N/A'}</Text>
              </View>
              {selectedDiagnosis.user?.doctorProfile && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dokter:</Text>
                  <Text style={styles.infoValue}>
                    Dr. {selectedDiagnosis.user.doctorProfile.firstName} {selectedDiagnosis.user.doctorProfile.lastName}
                  </Text>
                </View>
              )}
            </View>

            {/* Hasil Deteksi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔍 Hasil Deteksi ({detections.length})</Text>
              {detections.map((detection, index) => {
                const confidence = (detection.confidence || detection.score) * 100;
                const severityColor = confidence > 80 ? '#F44336' : confidence > 60 ? '#FF9800' : '#4CAF50';
                
                return (
                  <View key={index} style={styles.detectionCard}>
                    <View style={styles.detectionHeader}>
                      <Text style={styles.detectionTitle}>{detection.condition_name || detection.class_name || detection.label || detection.class}</Text>
                      <View style={[styles.confidenceBadge, { backgroundColor: severityColor }]}>
                        <Text style={styles.confidenceText}>{confidence.toFixed(1)}%</Text>
                      </View>
                    </View>
                    {detection.description && (
                      <Text style={styles.detectionDescription}>{detection.description}</Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Analisis AI */}
            {reasoning?.reasoning_text && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🧠 Analisis AI Komprehensif</Text>
                <View style={styles.reasoningCard}>
                  <View style={styles.modelInfo}>
                    <Text style={styles.modelText}>Model: {reasoning.model}</Text>
                    <Text style={styles.processingTime}>
                      Waktu Pemrosesan: {reasoning.processing_time?.toFixed(2)}s
                    </Text>
                  </View>
                  <Text style={styles.reasoningText}>{reasoning.reasoning_text}</Text>
                </View>
              </View>
            )}

            {/* Visualisasi */}
            {selectedDiagnosis.detectionResult?.visualization_url && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Visualisasi Deteksi</Text>
                <Image 
                  source={{ uri: selectedDiagnosis.detectionResult.visualization_url }}
                  style={styles.visualizationImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Laporan */}
            {selectedDiagnosis.reportUrl && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📄 Laporan Lengkap</Text>
                <TouchableOpacity 
                  style={styles.reportButton}
                  onPress={() => {
                    console.log('Opening report:', selectedDiagnosis.reportUrl);
                    // Implement report opening logic
                  }}
                >
                  <MaterialIcons name="description" size={20} color="#FFF" />
                  <Text style={styles.reportButtonText}>Unduh Laporan Lengkap</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderHeader = () => (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: 70,
          paddingHorizontal: 20,
          paddingBottom: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity 
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#FFF',
              textAlign: 'center',
              marginBottom: 8
            }}>
              Riwayat Diagnosis AI
            </Text>
            <View style={{
              flexDirection: 'row',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 20,
              padding: 4
            }}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  viewMode === 'classic' && styles.activeModeButton
                ]}
                onPress={() => setViewMode('classic')}
              >
                <Text style={[
                  styles.modeButtonText,
                  viewMode === 'classic' && styles.activeModeButtonText
                ]}>Diagnosis Klasik</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  viewMode === 'agent' && styles.activeModeButton
                ]}
                onPress={() => setViewMode('agent')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[
                    styles.modeButtonText,
                    viewMode === 'agent' && styles.activeModeButtonText
                  ]}>AI Agent</Text>
                  {viewMode === 'agent' && (
                    <View style={[
                      styles.statusIndicator,
                      agentServerStatus === 'online' && styles.statusOnline,
                      agentServerStatus === 'offline' && styles.statusOffline,
                      agentServerStatus === 'checking' && styles.statusChecking
                    ]} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Server Status Info */}
            {viewMode === 'agent' && agentServerStatus === 'offline' && (
              <View style={styles.statusWarning}>
                <Text style={styles.statusWarningText}>
                  ⚠️ Server AI Agent sedang offline
                </Text>
              </View>
            )}
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>
    </View>
  );

  const renderStatsContainer = () => {
    if (!stats) return null;
    
    return (
      <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          gap: 12,
          marginBottom: 20,
          marginTop: 0
        }}>
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          style={{
            flex: 1,
            alignItems: 'center',
            padding: 20,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="assessment" size={24} color="#FFF" />
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#FFF',
            marginTop: 8
          }}>{stats.totalDiagnoses}</Text>
          <Text style={{
            fontSize: 12,
            color: '#FFF',
            marginTop: 4,
            textAlign: 'center',
            opacity: 0.9
          }}>Total Diagnosis</Text>
        </LinearGradient>
        <LinearGradient
          colors={['#43e97b', '#38f9d7']}
          style={{
            flex: 1,
            alignItems: 'center',
            padding: 20,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="schedule" size={24} color="#FFF" />
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#FFF',
            marginTop: 8
          }}>{stats.recentDiagnoses}</Text>
          <Text style={{
            fontSize: 12,
            color: '#FFF',
            marginTop: 4,
            textAlign: 'center',
            opacity: 0.9
          }}>30 Hari Terakhir</Text>
        </LinearGradient>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="history" size={60} color="#CCC" />
      <Text style={styles.emptyTitle}>Belum Ada Riwayat Diagnosis</Text>
      <Text style={styles.emptySubtitle}>
        Riwayat diagnosis AI akan muncul di sini setelah Anda melakukan diagnosis
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat lebih banyak...</Text>
      </View>
    );
  };

  if (loading && diagnoses.length === 0 && agentSessions.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>
            {viewMode === 'classic' ? 'Memuat riwayat diagnosis...' : 'Memuat riwayat sesi AI Agent...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <FlatList
          data={viewMode === 'classic' ? diagnoses : agentSessions}
          renderItem={viewMode === 'classic' ? renderDiagnosisItem : renderSessionItem}
          keyExtractor={(item) => viewMode === 'classic' ? item.id.toString() : (item.session_id || item.id || Math.random().toString())}
          ListHeaderComponent={viewMode === 'classic' ? renderStatsContainer : null}
          contentContainerStyle={{
              paddingTop: 80,
              paddingHorizontal: 20,
              paddingBottom: 120
            }}
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={5}
          getItemLayout={(data, index) => ({
            length: 200,
            offset: 200 * index,
            index,
          })}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#667eea']}
              tintColor="#667eea"
              progressBackgroundColor="#FFF"
            />
          }
          onEndReached={viewMode === 'classic' ? loadMore : undefined}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={() => {
            if (viewMode === 'agent' && agentServerStatus === 'offline') {
              return (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="cloud-off" size={64} color="#F44336" />
                  <Text style={styles.emptyTitle}>Server AI Agent Offline</Text>
                  <Text style={styles.emptySubtitle}>
                    Server AI Agent sedang tidak tersedia. Silakan coba lagi nanti atau hubungi administrator untuk bantuan.
                  </Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => loadAgentSessions()}
                  >
                    <MaterialIcons name="refresh" size={20} color="#FFF" />
                    <Text style={styles.retryButtonText}>Coba Lagi</Text>
                  </TouchableOpacity>
                </View>
              );
            }
            
            return (
              <View style={styles.emptyContainer}>
                <MaterialIcons name={viewMode === 'classic' ? "history" : "chat"} size={60} color="#CCC" />
                <Text style={styles.emptyTitle}>Belum Ada Riwayat {viewMode === 'classic' ? 'Diagnosis' : 'Sesi AI Agent'}</Text>
                <Text style={styles.emptySubtitle}>
                  {viewMode === 'classic' 
                    ? 'Riwayat diagnosis AI akan muncul di sini setelah Anda melakukan diagnosis'
                    : 'Riwayat sesi AI Agent akan muncul di sini setelah Anda menggunakan fitur AI Agent'}
                </Text>
              </View>
            );
          }}
          ListFooterComponent={loading && (viewMode === 'classic' ? diagnoses.length > 0 : agentSessions.length > 0) ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#667eea" />
              <Text style={{ marginLeft: 8, color: '#667eea' }}>Memuat lebih banyak...</Text>
            </View>
          ) : null}
        />
        
        {renderDetailModal()}
        {renderSessionDetailModal()}
        
        <AIAgentOfflineModal
          visible={showOfflineModal}
          onClose={() => setShowOfflineModal(false)}
          onRetry={checkAgentServerStatus}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  safeArea: {
    flex: 1
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },


  diagnosisCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    marginHorizontal: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(102, 126, 234, 0.1)'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  severityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12
  },
  diagnosisDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 4
  },
  doctorName: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  deleteButton: {
    padding: 8
  },
  cardContent: {
    marginBottom: 12
  },
  detectionCount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    alignSelf: 'flex-start',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  detectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea'
  },
  detectionLabel: {
    fontSize: 15,
    color: '#2d3748',
    flex: 1,
    fontWeight: '600'
  },
  detectionConfidence: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    textAlign: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  moreDetections: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 126, 234, 0.1)'
  },
  viewDetail: {
    fontSize: 13,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '600'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    padding: 8
  },
  modalContent: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right'
  },
  detectionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  detectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  detectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF'
  },
  detectionDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16
  },
  reasoningCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12
  },
  modelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  modelText: {
    fontSize: 12,
    color: '#666'
  },
  processingTime: {
    fontSize: 12,
    color: '#666'
  },
  reasoningText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  visualizationImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5'
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12
  },
  reportButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 2
  },
  activeModeButton: {
    backgroundColor: '#FFF'
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF'
  },
  activeModeButtonText: {
    color: '#667eea'
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6
  },
  statusOnline: {
    backgroundColor: '#4CAF50'
  },
  statusOffline: {
    backgroundColor: '#F44336'
  },
  statusChecking: {
    backgroundColor: '#FF9800'
  },
  statusWarning: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8
  },
  statusWarningText: {
    color: '#F44336',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500'
  },
  chatMessage: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8
  },
  userMessage: {
    backgroundColor: '#E3F2FD',
    marginLeft: 20
  },
  agentMessage: {
    backgroundColor: '#F3E5F5',
    marginRight: 20
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666'
  },
  messageTime: {
    fontSize: 10,
    color: '#999'
  },
  messageContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8
  }
});

export default AiDiagnosisHistoryDoctor;