import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../components/common/ThemeProvider';
import Card from '../../../components/common/Card';
import { useNavigation } from '@react-navigation/native';

const HistoryScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  // Mock data for consultation history
  const consultationHistory = [
    {
      id: '1',
      date: '2024-01-15',
      time: '10:00 AM',
      doctorName: 'Dr. Sarah Johnson',
      type: 'Video Consultation',
      diagnosis: 'Routine Dental Checkup',
      status: 'Completed',
      duration: '30 minutes'
    },
    {
      id: '2',
      date: '2024-01-08',
      time: '2:30 PM',
      doctorName: 'Dr. Michael Chen',
      type: 'Video Consultation',
      diagnosis: 'Tooth Pain Assessment',
      status: 'Completed',
      duration: '25 minutes'
    },
    {
      id: '3',
      date: '2023-12-20',
      time: '11:15 AM',
      doctorName: 'Dr. Sarah Johnson',
      type: 'Video Consultation',
      diagnosis: 'Dental Cleaning Consultation',
      status: 'Completed',
      duration: '35 minutes'
    }
  ];

  const handleConsultationPress = (consultationId) => {
    navigation.navigate('ConsultationDetailView', { consultationId });
  };

  const renderConsultationCard = (consultation) => (
    <TouchableOpacity
      key={consultation.id}
      onPress={() => handleConsultationPress(consultation.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.consultationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons 
              name="calendar-check" 
              size={20} 
              color={theme.colors.patient.primary} 
            />
            <Text style={[styles.dateText, { color: theme.scheme.text }]}>
              {consultation.date}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#E8F5E8' }]}>
            <Text style={[styles.statusText, { color: '#2E7D32' }]}>
              {consultation.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={[styles.doctorName, { color: theme.scheme.text }]}>
            {consultation.doctorName}
          </Text>
          <Text style={[styles.diagnosis, { color: theme.scheme.textSecondary }]}>
            {consultation.diagnosis}
          </Text>
          
          <View style={styles.consultationDetails}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={16} 
                color={theme.scheme.textSecondary} 
              />
              <Text style={[styles.detailText, { color: theme.scheme.textSecondary }]}>
                {consultation.time}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons 
                name="video-outline" 
                size={16} 
                color={theme.scheme.textSecondary} 
              />
              <Text style={[styles.detailText, { color: theme.scheme.textSecondary }]}>
                {consultation.duration}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={[styles.viewDetailsText, { color: theme.colors.patient.primary }]}>
            Lihat Detail
          </Text>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={20} 
            color={theme.colors.patient.primary} 
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.scheme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.scheme.text }]}>
          Riwayat Konsultasi
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.scheme.textSecondary }]}>
          Lihat detail konsultasi yang telah selesai
        </Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {consultationHistory.map(renderConsultationCard)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  consultationCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  diagnosis: {
    fontSize: 14,
    marginBottom: 8,
  },
  consultationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HistoryScreen;
