import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { wp, hp, spacing, fontSizes, borderRadius, iconSizes, responsiveDimensions } from '../../../utils/responsive';
import ResponsiveContainer from '../../../components/layouts/ResponsiveContainer';
import ResponsiveCard from '../../../components/layouts/ResponsiveCard';
import ResponsiveText from '../../../components/layouts/ResponsiveText';

const { width } = Dimensions.get('window');

const ConsultationDetailView = ({ route, navigation }) => {
  const { consultationId } = route.params || {};
  const [expandedSections, setExpandedSections] = useState({});
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Mock data - in real app, this would come from API
  const consultationData = {
    id: consultationId || '1',
    date: '2024-01-15',
    time: '14:30',
    status: 'completed',
    doctor: {
      name: 'Dr. Sarah Johnson',
      specialization: 'Dental Specialist',
      photo: 'https://via.placeholder.com/100x100',
    },
    patient: {
      name: 'John Doe',
      age: 28,
      phone: '+62 812-3456-7890',
      email: 'john.doe@email.com',
    },
    // Ringkasan Konsultasi
    consultationSummary: {
      scheduledDuration: 30, // minutes
      actualDuration: 35,
      startTime: '14:30',
      endTime: '15:05',
      connectionQuality: 'good',
      patientAttendance: 'on_time',
    },
    // Hasil Pemeriksaan
    examination: {
      diagnosis: 'Karies gigi pada molar kiri atas, gingivitis ringan pada area posterior',
      oralCondition: 'Kondisi umum mulut cukup baik, terdapat plak pada area gigi belakang. Gusi sedikit bengkak di area molar.',
      examinedAreas: 'Molar kiri atas (gigi 26), area gusi posterior, pemeriksaan umum rongga mulut',
      photos: [
        'https://via.placeholder.com/200x150',
        'https://via.placeholder.com/200x150',
      ],
    },
    // Resep & Rekomendasi
    prescriptions: [
      {
        medicine: 'Amoxicillin 500mg',
        dosage: '500mg',
        instructions: '3x sehari setelah makan selama 7 hari',
      },
      {
        medicine: 'Ibuprofen 400mg',
        dosage: '400mg',
        instructions: '2x sehari saat nyeri, maksimal 3 hari',
      },
    ],
    recommendations: {
      homeCareTips: 'Sikat gigi 2x sehari dengan pasta gigi fluoride, gunakan benang gigi setiap hari, kumur dengan obat kumur antiseptik.',
      dietaryRestrictions: 'Hindari makanan dan minuman manis, kurangi konsumsi kopi dan teh, hindari makanan keras sementara.',
      nextAppointment: '2024-01-29 (2 minggu) untuk kontrol dan pembersihan karang gigi',
    },
    // Catatan Dokter
    doctorNotes: {
      chiefComplaint: 'Pasien mengeluh nyeri pada gigi belakang kiri atas sejak 3 hari yang lalu, terutama saat makan makanan dingin.',
      clinicalFindings: 'Karies profunda pada gigi 26, gingivitis marginalis pada area posterior, akumulasi plak dan kalkulus.',
      treatmentPerformed: 'Konsultasi dan edukasi oral hygiene, pemberian resep antibiotik dan analgesik.',
      patientResponse: 'Pasien kooperatif, memahami instruksi perawatan, berkomitmen untuk menjaga kebersihan mulut.',
    },
    // Informasi Billing
    billing: {
      consultationFee: 150000,
      additionalFees: [],
      totalAmount: 150000,
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card',
      paymentDate: '2024-01-15',
    },
    // Tindak Lanjut
    followUp: {
      nextAppointmentScheduled: true,
      nextAppointmentDate: '2024-01-29',
      reminders: [
        'Minum obat sesuai resep',
        'Kontrol 2 minggu lagi',
        'Hubungi dokter jika nyeri bertambah',
      ],
      emergencyContact: '+62 812-3456-7890',
      rating: null,
      feedback: null,
    },
    // Rekam Konsultasi
    recording: {
      available: true,
      duration: '35:24',
      screenshots: [
        'https://via.placeholder.com/300x200',
      ],
      expiryDate: '2024-02-15',
    },
    // Riwayat Perawatan
    treatmentHistory: {
      previousVisits: 3,
      lastVisit: '2023-12-01',
      progressNotes: 'Kondisi gigi membaik sejak perawatan terakhir, namun masih perlu peningkatan oral hygiene.',
      beforeAfterComparison: 'Sebelum: Gingivitis sedang, banyak plak. Sesudah: Gingivitis ringan, plak berkurang.',
    },
  };
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'rescheduled': return '#F59E0B';
      default: return '#6B7280';
    }
  };
  
  const getConnectionQualityColor = (quality) => {
    switch (quality) {
      case 'good': return '#10B981';
      case 'fair': return '#F59E0B';
      case 'poor': return '#EF4444';
      default: return '#6B7280';
    }
  };
  
  const renderSection = (title, icon, children, sectionKey, defaultExpanded = true) => {
    const isExpanded = expandedSections[sectionKey] !== undefined 
      ? expandedSections[sectionKey] 
      : defaultExpanded;
    
    return (
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionKey)}
        >
          <View style={styles.sectionTitleContainer}>
            <Ionicons name={icon} size={24} color="#6366F1" />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#6B7280" 
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.sectionContent}>
            {children}
          </View>
        )}
      </View>
    );
  };
  
  const renderInfoRow = (label, value, icon = null) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        {icon && <Ionicons name={icon} size={16} color="#6B7280" />}
        <Text style={styles.infoLabelText}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consultation Details</Text>
      </Animated.View>
      
      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.heroSection}
        >
          <TouchableOpacity 
            style={styles.heroBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.heroContent}>
            <Image 
              source={{ uri: consultationData.doctor.photo }}
              style={styles.doctorPhoto}
            />
            <Text style={styles.doctorName}>{consultationData.doctor.name}</Text>
            <Text style={styles.doctorSpecialization}>{consultationData.doctor.specialization}</Text>
            
            <View style={styles.consultationInfo}>
              <View style={styles.consultationDate}>
                <Ionicons name="calendar" size={16} color="#FFFFFF" />
                <Text style={styles.consultationDateText}>
                  {consultationData.date} at {consultationData.time}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(consultationData.status) }]}>
                <Text style={styles.statusText}>Completed</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        
        {/* Ringkasan Konsultasi */}
        {renderSection('Ringkasan Konsultasi', 'time', (
          <View>
            {renderInfoRow('Durasi Terjadwal', `${consultationData.consultationSummary.scheduledDuration} menit`, 'timer')}
            {renderInfoRow('Durasi Aktual', `${consultationData.consultationSummary.actualDuration} menit`, 'stopwatch')}
            {renderInfoRow('Waktu Mulai', consultationData.consultationSummary.startTime, 'play')}
            {renderInfoRow('Waktu Selesai', consultationData.consultationSummary.endTime, 'stop')}
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="wifi" size={16} color="#6B7280" />
                <Text style={styles.infoLabelText}>Kualitas Koneksi</Text>
              </View>
              <View style={styles.connectionQuality}>
                <View style={[
                  styles.connectionDot, 
                  { backgroundColor: getConnectionQualityColor(consultationData.consultationSummary.connectionQuality) }
                ]} />
                <Text style={[
                  styles.connectionText,
                  { color: getConnectionQualityColor(consultationData.consultationSummary.connectionQuality) }
                ]}>
                  {consultationData.consultationSummary.connectionQuality === 'good' ? 'Baik' : 
                   consultationData.consultationSummary.connectionQuality === 'fair' ? 'Cukup' : 'Buruk'}
                </Text>
              </View>
            </View>
            {renderInfoRow('Kehadiran Pasien', 'Tepat Waktu', 'checkmark-circle')}
          </View>
        ), 'summary')}
        
        {/* Hasil Pemeriksaan */}
        {renderSection('Hasil Pemeriksaan', 'medical', (
          <View>
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Diagnosis</Text>
              <Text style={styles.textSectionContent}>{consultationData.examination.diagnosis}</Text>
            </View>
            
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Kondisi Gigi dan Mulut</Text>
              <Text style={styles.textSectionContent}>{consultationData.examination.oralCondition}</Text>
            </View>
            
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Area yang Diperiksa</Text>
              <Text style={styles.textSectionContent}>{consultationData.examination.examinedAreas}</Text>
            </View>
            
            {consultationData.examination.photos.length > 0 && (
              <View style={styles.textSection}>
                <Text style={styles.textSectionTitle}>Foto Hasil Pemeriksaan</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
                  {consultationData.examination.photos.map((photo, index) => (
                    <TouchableOpacity key={index} style={styles.photoWrapper}>
                      <Image source={{ uri: photo }} style={styles.examinationPhoto} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        ), 'examination')}
        
        {/* Resep & Rekomendasi */}
        {renderSection('Resep & Rekomendasi', 'medical-outline', (
          <View>
            {consultationData.prescriptions.length > 0 && (
              <View style={styles.textSection}>
                <Text style={styles.textSectionTitle}>Obat yang Diresepkan</Text>
                {consultationData.prescriptions.map((prescription, index) => (
                  <View key={index} style={styles.prescriptionCard}>
                    <Text style={styles.prescriptionMedicine}>{prescription.medicine}</Text>
                    <Text style={styles.prescriptionDosage}>Dosis: {prescription.dosage}</Text>
                    <Text style={styles.prescriptionInstructions}>{prescription.instructions}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Instruksi Perawatan di Rumah</Text>
              <Text style={styles.textSectionContent}>{consultationData.recommendations.homeCareTips}</Text>
            </View>
            
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Pantangan Makanan/Minuman</Text>
              <Text style={styles.textSectionContent}>{consultationData.recommendations.dietaryRestrictions}</Text>
            </View>
            
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Jadwal Kontrol Berikutnya</Text>
              <Text style={styles.textSectionContent}>{consultationData.recommendations.nextAppointment}</Text>
            </View>
          </View>
        ), 'prescriptions')}
        
        {/* Catatan Dokter */}
        {renderSection('Catatan Dokter', 'document-text', (
          <View>
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Keluhan Utama</Text>
              <Text style={styles.textSectionContent}>{consultationData.doctorNotes.chiefComplaint}</Text>
            </View>
            
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Temuan Klinis</Text>
              <Text style={styles.textSectionContent}>{consultationData.doctorNotes.clinicalFindings}</Text>
            </View>
            
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Tindakan yang Dilakukan</Text>
              <Text style={styles.textSectionContent}>{consultationData.doctorNotes.treatmentPerformed}</Text>
            </View>
            
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Respons Pasien</Text>
              <Text style={styles.textSectionContent}>{consultationData.doctorNotes.patientResponse}</Text>
            </View>
          </View>
        ), 'doctorNotes')}
        
        {/* Informasi Billing */}
        {renderSection('Informasi Billing', 'card', (
          <View>
            {renderInfoRow('Biaya Konsultasi', formatCurrency(consultationData.billing.consultationFee), 'cash')}
            {renderInfoRow('Total Biaya', formatCurrency(consultationData.billing.totalAmount), 'calculator')}
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.infoLabelText}>Status Pembayaran</Text>
              </View>
              <View style={styles.paymentStatus}>
                <Text style={[styles.paymentStatusText, { color: '#10B981' }]}>Lunas</Text>
              </View>
            </View>
            {renderInfoRow('Metode Pembayaran', consultationData.billing.paymentMethod, 'card-outline')}
            {renderInfoRow('Tanggal Pembayaran', consultationData.billing.paymentDate, 'calendar-outline')}
          </View>
        ), 'billing')}
        
        {/* Tindak Lanjut */}
        {renderSection('Tindak Lanjut', 'arrow-forward-circle', (
          <View>
            {consultationData.followUp.nextAppointmentScheduled && (
              <View style={styles.nextAppointmentCard}>
                <Ionicons name="calendar" size={24} color="#6366F1" />
                <View style={styles.nextAppointmentInfo}>
                  <Text style={styles.nextAppointmentTitle}>Appointment Berikutnya</Text>
                  <Text style={styles.nextAppointmentDate}>{consultationData.followUp.nextAppointmentDate}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Reminder untuk Pasien</Text>
              {consultationData.followUp.reminders.map((reminder, index) => (
                <View key={index} style={styles.reminderItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#6366F1" />
                  <Text style={styles.reminderText}>{reminder}</Text>
                </View>
              ))}
            </View>
            
            {renderInfoRow('Kontak Emergency', consultationData.followUp.emergencyContact, 'call')}
          </View>
        ), 'followUp')}
        
        {/* Rekam Konsultasi */}
        {consultationData.recording.available && renderSection('Rekam Konsultasi', 'videocam', (
          <View>
            <View style={styles.recordingCard}>
              <Ionicons name="play-circle" size={40} color="#6366F1" />
              <View style={styles.recordingInfo}>
                <Text style={styles.recordingTitle}>Video Konsultasi</Text>
                <Text style={styles.recordingDuration}>Durasi: {consultationData.recording.duration}</Text>
                <Text style={styles.recordingExpiry}>Berlaku hingga: {consultationData.recording.expiryDate}</Text>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {consultationData.recording.screenshots.length > 0 && (
              <View style={styles.textSection}>
                <Text style={styles.textSectionTitle}>Screenshot Penting</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
                  {consultationData.recording.screenshots.map((screenshot, index) => (
                    <TouchableOpacity key={index} style={styles.photoWrapper}>
                      <Image source={{ uri: screenshot }} style={styles.screenshotPhoto} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        ), 'recording')}
        
        {/* Riwayat Perawatan */}
        {renderSection('Riwayat Perawatan', 'library', (
          <View>
            {renderInfoRow('Kunjungan Sebelumnya', `${consultationData.treatmentHistory.previousVisits} kali`, 'time')}
            {renderInfoRow('Kunjungan Terakhir', consultationData.treatmentHistory.lastVisit, 'calendar')}
            
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Catatan Progress</Text>
              <Text style={styles.textSectionContent}>{consultationData.treatmentHistory.progressNotes}</Text>
            </View>
            
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Perbandingan Sebelum/Sesudah</Text>
              <Text style={styles.textSectionContent}>{consultationData.treatmentHistory.beforeAfterComparison}</Text>
            </View>
          </View>
        ), 'history')}
        
        {/* Rating & Feedback */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="star" size={24} color="#6366F1" />
              <Text style={styles.sectionTitle}>Rating & Feedback</Text>
            </View>
          </View>
          <View style={styles.sectionContent}>
            {!consultationData.followUp.rating ? (
              <TouchableOpacity 
                style={styles.ratingButton}
                onPress={() => Alert.alert('Rating', 'Rating feature would open here')}
              >
                <Text style={styles.ratingButtonText}>Berikan Rating & Feedback</Text>
                <Ionicons name="arrow-forward" size={20} color="#6366F1" />
              </TouchableOpacity>
            ) : (
              <View style={styles.ratingDisplay}>
                <Text style={styles.ratingText}>Rating Anda: {consultationData.followUp.rating}/5</Text>
                <Text style={styles.feedbackText}>{consultationData.followUp.feedback}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
  },
  heroBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  heroContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  doctorPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 20,
  },
  consultationInfo: {
    alignItems: 'center',
    gap: 12,
  },
  consultationDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consultationDateText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionContent: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoLabelText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  connectionQuality: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textSection: {
    marginBottom: 20,
  },
  textSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textSectionContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  photosContainer: {
    marginTop: 8,
  },
  photoWrapper: {
    marginRight: 12,
  },
  examinationPhoto: {
    width: 120,
    height: 90,
    borderRadius: 8,
  },
  screenshotPhoto: {
    width: 160,
    height: 120,
    borderRadius: 8,
  },
  prescriptionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  prescriptionMedicine: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  prescriptionDosage: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginBottom: 4,
  },
  prescriptionInstructions: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  paymentStatus: {
    alignItems: 'flex-end',
  },
  paymentStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nextAppointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  nextAppointmentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nextAppointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 4,
  },
  nextAppointmentDate: {
    fontSize: 14,
    color: '#0284C7',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  recordingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recordingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recordingDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  recordingExpiry: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366F1',
  },
  ratingDisplay: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});

export default ConsultationDetailView;