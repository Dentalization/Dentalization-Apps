import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import appointmentService from '../../../services/appointmentService';

const AppointmentsScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demonstration
  const mockAppointments = [
    {
      id: 1,
      doctor: { name: 'Dr. Sarah Wijaya', specialization: 'Ortodontis', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face' },
      date: '2025-07-20',
      time: '10:00',
      service: 'Konsultasi Ortodontis',
      status: 'confirmed',
      type: 'clinic',
      clinic: 'Klinik Dental Plus'
    },
    {
      id: 2,
      doctor: { name: 'Dr. Ahmad Rizki', specialization: 'Umum', photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face' },
      date: '2025-07-18',
      time: '14:00',
      service: 'Pembersihan Karang Gigi',
      status: 'completed',
      type: 'clinic',
      clinic: 'RS Premier Bintaro'
    }
  ];

  const mockDoctors = [
    {
      id: 1,
      name: 'Dr. Sarah Wijaya',
      specialization: 'Ortodontis',
      rating: 4.8,
      reviews: 127,
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      experience: '8 tahun',
      nextAvailable: '2025-07-20'
    },
    {
      id: 2,
      name: 'Dr. Ahmad Rizki',
      specialization: 'Bedah Gigi',
      rating: 4.9,
      reviews: 89,
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      experience: '12 tahun',
      nextAvailable: '2025-07-21'
    },
    {
      id: 3,
      name: 'Dr. Lisa Andini',
      specialization: 'Gigi Anak',
      rating: 4.7,
      reviews: 156,
      photo: 'https://images.unsplash.com/photo-1594824694996-832b1c8a6e91?w=150&h=150&fit=crop&crop=face',
      experience: '6 tahun',
      nextAvailable: '2025-07-19'
    }
  ];

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setDoctors(mockDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAppointments(), fetchDoctors()]);
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'completed': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Dikonfirmasi';
      case 'pending': return 'Menunggu';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (activeTab === 'upcoming') return apt.status === 'confirmed' || apt.status === 'pending';
    if (activeTab === 'completed') return apt.status === 'completed';
    if (activeTab === 'cancelled') return apt.status === 'cancelled';
    return true;
  });

  const renderAppointmentCard = (appointment) => (
    <TouchableOpacity key={appointment.id} style={{ backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 15, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Image source={{ uri: appointment.doctor.photo }} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 }}>{appointment.doctor.name}</Text>
          <Text style={{ fontSize: 14, color: '#6B7280' }}>{appointment.doctor.specialization}</Text>
        </View>
        <View style={{ backgroundColor: getStatusColor(appointment.status), paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
          <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '500' }}>{getStatusText(appointment.status)}</Text>
        </View>
      </View>
      
      <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="event" size={16} color="#6B7280" />
            <Text style={{ marginLeft: 6, fontSize: 14, color: '#6B7280' }}>
              {new Date(appointment.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="access-time" size={16} color="#6B7280" />
            <Text style={{ marginLeft: 6, fontSize: 14, color: '#6B7280' }}>{appointment.time} WIB</Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <MaterialCommunityIcons name="medical-bag" size={16} color="#6B7280" />
          <Text style={{ marginLeft: 6, fontSize: 14, color: '#6B7280' }}>{appointment.service}</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name={appointment.type === 'clinic' ? 'hospital-building' : 'video'} size={16} color="#6B7280" />
          <Text style={{ marginLeft: 6, fontSize: 14, color: '#6B7280' }}>
            {appointment.type === 'clinic' ? appointment.clinic : 'Konsultasi Online'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDoctorCard = (doctor) => (
    <TouchableOpacity key={doctor.id} onPress={() => navigation.navigate('AppointmentBooking', { doctorId: doctor.id })} style={{ backgroundColor: '#FFFFFF', marginRight: 15, borderRadius: 12, padding: 16, width: 280, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Image source={{ uri: doctor.photo }} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 }}>{doctor.name}</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>{doctor.specialization}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="star" size={14} color="#FCD34D" />
            <Text style={{ marginLeft: 4, fontSize: 12, color: '#6B7280' }}>{doctor.rating} ({doctor.reviews})</Text>
          </View>
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 12, color: '#6B7280' }}>Pengalaman</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1F2937' }}>{doctor.experience}</Text>
        </View>
        <View style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
          <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '500' }}>Book</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient colors={['#8B5CF6', '#667EEA']} style={{ paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 }}>Appointments</Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Kelola jadwal konsultasi Anda</Text>
      </LinearGradient>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />} showsVerticalScrollIndicator={false}>
        {/* Quick Book Section */}
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>Dokter Tersedia</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorList')}>
              <Text style={{ fontSize: 14, color: '#8B5CF6', fontWeight: '500' }}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 5 }}>
            {doctors.map(renderDoctorCard)}
          </ScrollView>
        </View>

        {/* Appointments Section */}
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginHorizontal: 20, marginBottom: 15 }}>Appointment Saya</Text>
          
          {/* Tab Navigation */}
          <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            {[
              { key: 'upcoming', label: 'Mendatang' },
              { key: 'completed', label: 'Selesai' },
              { key: 'cancelled', label: 'Dibatalkan' }
            ].map(tab => (
              <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: activeTab === tab.key ? '#8B5CF6' : 'transparent', borderRadius: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: activeTab === tab.key ? '#FFFFFF' : '#6B7280' }}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Appointments List */}
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
          ) : filteredAppointments.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40, marginHorizontal: 20 }}>
              <MaterialCommunityIcons name="calendar-blank" size={60} color="#D1D5DB" />
              <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 16, textAlign: 'center' }}>
                {activeTab === 'upcoming' ? 'Belum ada appointment mendatang' : 
                 activeTab === 'completed' ? 'Belum ada appointment yang selesai' : 
                 'Belum ada appointment yang dibatalkan'}
              </Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity onPress={() => navigation.navigate('DoctorList')} style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 16 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Buat Appointment</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={{ paddingBottom: 20 }}>
              {filteredAppointments.map(renderAppointmentCard)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity onPress={() => navigation.navigate('DoctorList')} style={{ position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 }}>
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default AppointmentsScreen;
