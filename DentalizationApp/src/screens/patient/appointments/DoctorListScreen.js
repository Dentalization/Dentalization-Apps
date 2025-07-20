import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import appointmentService from '../../../services/appointmentService';

const DoctorListScreen = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const specialties = [
    { key: 'all', label: 'Semua' },
    { key: 'general', label: 'Umum' },
    { key: 'orthodontic', label: 'Ortodontis' },
    { key: 'surgery', label: 'Bedah Gigi' },
    { key: 'pediatric', label: 'Gigi Anak' },
    { key: 'endodontic', label: 'Endodontis' }
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
      price: 300000,
      nextAvailable: '2025-07-20',
      clinics: ['Klinik Dental Plus', 'RS Premier Bintaro'],
      onlineConsult: true
    },
    {
      id: 2,
      name: 'Dr. Ahmad Rizki',
      specialization: 'Bedah Gigi',
      rating: 4.9,
      reviews: 89,
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      experience: '12 tahun',
      price: 500000,
      nextAvailable: '2025-07-21',
      clinics: ['RS Mitra Keluarga'],
      onlineConsult: false
    },
    {
      id: 3,
      name: 'Dr. Lisa Andini',
      specialization: 'Gigi Anak',
      rating: 4.7,
      reviews: 156,
      photo: 'https://images.unsplash.com/photo-1594824694996-832b1c8a6e91?w=150&h=150&fit=crop&crop=face',
      experience: '6 tahun',
      price: 250000,
      nextAvailable: '2025-07-19',
      clinics: ['Klinik Anak Sehat'],
      onlineConsult: true
    },
    {
      id: 4,
      name: 'Dr. Budi Santoso',
      specialization: 'Umum',
      rating: 4.6,
      reviews: 203,
      photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
      experience: '10 tahun',
      price: 200000,
      nextAvailable: '2025-07-20',
      clinics: ['Puskesmas Cilandak', 'Klinik Pratama'],
      onlineConsult: true
    }
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDoctors(mockDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            doctor.specialization.toLowerCase().includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const renderDoctorCard = (doctor) => (
    <TouchableOpacity key={doctor.id} onPress={() => navigation.navigate('AppointmentBooking', { doctorId: doctor.id })} style={{ backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 15, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <Image source={{ uri: doctor.photo }} style={{ width: 70, height: 70, borderRadius: 35, marginRight: 15 }} />
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>{doctor.name}</Text>
              <Text style={{ fontSize: 14, color: '#8B5CF6', fontWeight: '500', marginBottom: 4 }}>{doctor.specialization}</Text>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Pengalaman {doctor.experience}</Text>
            </View>
            
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Icon name="star" size={14} color="#FCD34D" />
                <Text style={{ marginLeft: 2, fontSize: 12, color: '#6B7280' }}>{doctor.rating}</Text>
                <Text style={{ fontSize: 12, color: '#6B7280' }}> ({doctor.reviews})</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>Rp {doctor.price.toLocaleString()}</Text>
            </View>
          </View>
          
          <View style={{ backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <MaterialCommunityIcons name="hospital-building" size={14} color="#6B7280" />
              <Text style={{ marginLeft: 6, fontSize: 12, color: '#6B7280', flex: 1 }}>{doctor.clinics.join(', ')}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="event-available" size={14} color="#10B981" />
              <Text style={{ marginLeft: 6, fontSize: 12, color: '#10B981' }}>
                Tersedia {new Date(doctor.nextAvailable).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 }}>
                <Text style={{ fontSize: 10, color: '#8B5CF6', fontWeight: '500' }}>Klinik</Text>
              </View>
              {doctor.onlineConsult && (
                <View style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '500' }}>Online</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity onPress={() => navigation.navigate('AppointmentBooking', { doctorId: doctor.id })} style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
              <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '500' }}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient colors={['#8B5CF6', '#667EEA']} style={{ paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>Pilih Dokter</Text>
        </View>
        
        {/* Search Bar */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12 }}>
          <Icon name="search" size={20} color="#6B7280" />
          <TextInput placeholder="Cari dokter atau spesialisasi..." value={searchQuery} onChangeText={setSearchQuery} style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#1F2937' }} />
        </View>
      </LinearGradient>

      {/* Specialty Filter */}
      <View style={{ backgroundColor: '#FFFFFF', paddingVertical: 12, marginHorizontal: 20, marginTop: -15, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {specialties.map(specialty => (
            <TouchableOpacity 
              key={specialty.key} 
              onPress={() => setSelectedSpecialty(specialty.key)} 
              style={{ 
                paddingHorizontal: 14, 
                paddingVertical: 6, 
                borderRadius: 8, 
                backgroundColor: selectedSpecialty === specialty.key ? '#8B5CF6' : '#F8FAFC', 
                marginRight: 8,
                borderWidth: selectedSpecialty === specialty.key ? 0 : 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ 
                fontSize: 12, 
                fontWeight: selectedSpecialty === specialty.key ? '600' : '500', 
                color: selectedSpecialty === specialty.key ? '#FFFFFF' : '#6B7280' 
              }}>
                {specialty.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Doctors List */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={{ marginTop: 10, color: '#6B7280' }}>Memuat daftar dokter...</Text>
          </View>
        ) : filteredDoctors.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
            <MaterialCommunityIcons name="doctor" size={60} color="#D1D5DB" />
            <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 16, textAlign: 'center' }}>
              {searchQuery ? `Tidak ada dokter ditemukan untuk "${searchQuery}"` : 'Tidak ada dokter tersedia'}
            </Text>
          </View>
        ) : (
          <View style={{ paddingTop: 5, paddingBottom: 20 }}>
            <Text style={{ fontSize: 14, color: '#6B7280', marginHorizontal: 20, marginBottom: 15 }}>
              Ditemukan {filteredDoctors.length} dokter
            </Text>
            {filteredDoctors.map(renderDoctorCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DoctorListScreen;
