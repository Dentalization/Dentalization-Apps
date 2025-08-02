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
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import aiDiagnosisHistoryService from '../../../services/aiDiagnosisHistoryService';

const AiDiagnosisHistoryDoctor = ({ route, navigation }) => {
  const { patientId } = route.params || {};
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState(null);

  const user = useSelector(state => state.auth.user);
  const isDoctor = user?.role === 'DOCTOR';

  // Load diagnosis history
  const loadDiagnoses = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let response;
      if (isDoctor && patientId) {
        response = await aiDiagnosisHistoryService.getDiagnosisHistory(patientId, pageNum, 10);
      } else {
        response = await aiDiagnosisHistoryService.getMyDiagnosisHistory(pageNum, 10);
      }

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
  }, [isDoctor, patientId]);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await aiDiagnosisHistoryService.getDiagnosisStats(patientId);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }, [patientId]);

  useEffect(() => {
    loadDiagnoses(1, true);
    loadStats();
  }, [loadDiagnoses, loadStats]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadDiagnoses(1, true);
    loadStats();
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
                • {detection.label || detection.class}
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
                      <Text style={styles.detectionTitle}>{detection.label || detection.class}</Text>
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
    <View style={styles.header}>
      <Text style={styles.title}>
        {isDoctor && patientId ? 'Riwayat Diagnosis AI Pasien' : 'Riwayat Diagnosis AI Saya'}
      </Text>
      
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalDiagnoses}</Text>
            <Text style={styles.statLabel}>Total Diagnosis</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.recentDiagnoses}</Text>
            <Text style={styles.statLabel}>30 Hari Terakhir</Text>
          </View>
        </View>
      )}
    </View>
  );

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Memuat riwayat diagnosis...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={diagnoses}
        renderItem={renderDiagnosisItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        contentContainerStyle={styles.listContainer}
      />
      
      {renderDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
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
  listContainer: {
    padding: 16
  },
  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  diagnosisCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  doctorName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  deleteButton: {
    padding: 8
  },
  cardContent: {
    marginBottom: 12
  },
  detectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8
  },
  detectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  detectionLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1
  },
  detectionConfidence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  moreDetections: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  viewDetail: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20
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
  }
});

export default AiDiagnosisHistoryDoctor;