import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import appointmentService from '../../../services/appointmentService';

const AppointmentBookingScreen = ({ navigation, route }) => {
  const { user } = useSelector(state => state.auth);
  const { doctorId } = route.params || {};
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [selectedType, setSelectedType] = useState('clinic'); // clinic or online
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [complaint, setComplaint] = useState('');

  // Mock data - akan diganti dengan API call
  const mockDoctor = {
    id: doctorId || 1,
    name: 'Dr. Sarah Wijaya',
    specialization: 'Ortodontis',
    rating: 4.8,
    reviews: 127,
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    clinics: [
      { id: 1, name: 'Klinik Dental Plus', address: 'Jl. Sudirman No. 123, Jakarta', distance: '2.1 km' },
      { id: 2, name: 'RS Premier Bintaro', address: 'Jl. MH Thamrin No. 1, Tangerang', distance: '5.3 km' }
    ]
  };

  const services = [
    { id: 1, name: 'Pemeriksaan Umum', price: 150000, duration: 30, bpjs: true },
    { id: 2, name: 'Pembersihan Karang Gigi', price: 250000, duration: 45, bpjs: true },
    { id: 3, name: 'Konsultasi Ortodontis', price: 300000, duration: 60, bpjs: false },
    { id: 4, name: 'Tambal Gigi', price: 200000, duration: 45, bpjs: true },
    { id: 5, name: 'Cabut Gigi', price: 350000, duration: 60, bpjs: true }
  ];

  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  useEffect(() => {
    setDoctor(mockDoctor);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAvailableSlots(timeSlots.filter(() => Math.random() > 0.3));
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat slot waktu');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      Alert.alert('Error', 'Mohon lengkapi semua data booking');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        doctorId: doctor.id,
        date: selectedDate,
        time: selectedTime,
        serviceId: selectedService.id,
        type: selectedType,
        complaint: complaint
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('Berhasil!', 'Appointment berhasil dibuat. Anda akan menerima konfirmasi via WhatsApp.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Gagal membuat appointment');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 20, backgroundColor: '#FFFFFF' }}>
      {[1, 2, 3, 4].map((stepNum) => (
        <View key={stepNum} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: step >= stepNum ? '#8B5CF6' : '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: step >= stepNum ? '#FFFFFF' : '#6B7280', fontSize: 14, fontWeight: '600' }}>{stepNum}</Text>
          </View>
          {stepNum < 4 && <View style={{ width: 30, height: 2, backgroundColor: step > stepNum ? '#8B5CF6' : '#E5E7EB', marginHorizontal: 8 }} />}
        </View>
      ))}
    </View>
  );

  const renderDoctorHeader = () => (
    <LinearGradient colors={['#8B5CF6', '#667EEA']} style={{ padding: 20 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 15 }}>
        <Icon name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: doctor?.photo }} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 15 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 }}>{doctor?.name}</Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 8 }}>{doctor?.specialization}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="star" size={16} color="#FCD34D" />
            <Text style={{ color: '#FFFFFF', marginLeft: 4, fontSize: 14 }}>{doctor?.rating} ({doctor?.reviews} ulasan)</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderStep1 = () => (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 }}>Pilih Jenis Konsultasi</Text>
      
      <TouchableOpacity onPress={() => setSelectedType('clinic')} style={{ padding: 20, borderRadius: 12, borderWidth: 2, borderColor: selectedType === 'clinic' ? '#8B5CF6' : '#E5E7EB', marginBottom: 15, backgroundColor: selectedType === 'clinic' ? '#F3F4F6' : '#FFFFFF' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="hospital-building" size={24} color={selectedType === 'clinic' ? '#8B5CF6' : '#6B7280'} />
          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Kunjungan Langsung</Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Datang ke klinik untuk pemeriksaan</Text>
          </View>
          {selectedType === 'clinic' && <Icon name="check-circle" size={24} color="#8B5CF6" />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setSelectedType('online')} style={{ padding: 20, borderRadius: 12, borderWidth: 2, borderColor: selectedType === 'online' ? '#8B5CF6' : '#E5E7EB', marginBottom: 20, backgroundColor: selectedType === 'online' ? '#F3F4F6' : '#FFFFFF' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="video" size={24} color={selectedType === 'online' ? '#8B5CF6' : '#6B7280'} />
          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Konsultasi Online</Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Video call dengan dokter</Text>
          </View>
          {selectedType === 'online' && <Icon name="check-circle" size={24} color="#8B5CF6" />}
        </View>
      </TouchableOpacity>

      {selectedType === 'clinic' && (
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 15 }}>Pilih Lokasi Klinik</Text>
          {doctor?.clinics?.map(clinic => (
            <View key={clinic.id} style={{ padding: 15, backgroundColor: '#F9FAFB', borderRadius: 8, marginBottom: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>{clinic.name}</Text>
              <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{clinic.address}</Text>
              <Text style={{ fontSize: 12, color: '#8B5CF6', marginTop: 4 }}>{clinic.distance}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity onPress={() => setStep(2)} disabled={!selectedType} style={{ backgroundColor: selectedType ? '#8B5CF6' : '#E5E7EB', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Lanjutkan</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 }}>Pilih Tanggal & Waktu</Text>
      
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: '#8B5CF6' } }}
        minDate={new Date().toISOString().split('T')[0]}
        theme={{ selectedDayBackgroundColor: '#8B5CF6', todayTextColor: '#8B5CF6', arrowColor: '#8B5CF6' }}
        style={{ marginBottom: 20 }}
      />

      {selectedDate && (
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 15 }}>Pilih Waktu</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#8B5CF6" style={{ marginVertical: 20 }} />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
              {availableSlots.map(time => (
                <TouchableOpacity key={time} onPress={() => setSelectedTime(time)} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: selectedTime === time ? '#8B5CF6' : '#E5E7EB', backgroundColor: selectedTime === time ? '#8B5CF6' : '#FFFFFF', marginRight: 10, marginBottom: 10 }}>
                  <Text style={{ color: selectedTime === time ? '#FFFFFF' : '#1F2937', fontSize: 14, fontWeight: '500' }}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => setStep(1)} style={{ backgroundColor: '#E5E7EB', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12 }}>
          <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '600' }}>Kembali</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStep(3)} disabled={!selectedDate || !selectedTime} style={{ backgroundColor: selectedDate && selectedTime ? '#8B5CF6' : '#E5E7EB', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Lanjutkan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 }}>Pilih Layanan</Text>
      
      {services.map(service => (
        <TouchableOpacity key={service.id} onPress={() => setSelectedService(service)} style={{ padding: 16, borderRadius: 12, borderWidth: 2, borderColor: selectedService?.id === service.id ? '#8B5CF6' : '#E5E7EB', marginBottom: 12, backgroundColor: selectedService?.id === service.id ? '#F3F4F6' : '#FFFFFF' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{service.name}</Text>
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>{service.duration} menit</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937' }}>Rp {service.price.toLocaleString()}</Text>
                {service.bpjs && <View style={{ backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 10 }}><Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: '600' }}>BPJS</Text></View>}
              </View>
            </View>
            {selectedService?.id === service.id && <Icon name="check-circle" size={24} color="#8B5CF6" />}
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
        <TouchableOpacity onPress={() => setStep(2)} style={{ backgroundColor: '#E5E7EB', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12 }}>
          <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '600' }}>Kembali</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStep(4)} disabled={!selectedService} style={{ backgroundColor: selectedService ? '#8B5CF6' : '#E5E7EB', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Lanjutkan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 }}>Konfirmasi Booking</Text>
      
      <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>Ringkasan Appointment</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#6B7280' }}>Dokter</Text>
          <Text style={{ color: '#1F2937', fontWeight: '500' }}>{doctor?.name}</Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#6B7280' }}>Jenis</Text>
          <Text style={{ color: '#1F2937', fontWeight: '500' }}>{selectedType === 'clinic' ? 'Kunjungan Langsung' : 'Konsultasi Online'}</Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#6B7280' }}>Tanggal</Text>
          <Text style={{ color: '#1F2937', fontWeight: '500' }}>{new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#6B7280' }}>Waktu</Text>
          <Text style={{ color: '#1F2937', fontWeight: '500' }}>{selectedTime} WIB</Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#6B7280' }}>Layanan</Text>
          <Text style={{ color: '#1F2937', fontWeight: '500' }}>{selectedService?.name}</Text>
        </View>
        
        <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#1F2937', fontWeight: '600' }}>Total</Text>
            <Text style={{ color: '#1F2937', fontWeight: '700', fontSize: 16 }}>Rp {selectedService?.price?.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
        <TouchableOpacity onPress={() => setStep(3)} style={{ backgroundColor: '#E5E7EB', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12 }}>
          <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '600' }}>Kembali</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBookAppointment} disabled={loading} style={{ backgroundColor: '#8B5CF6', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
          {loading && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />}
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
            {loading ? 'Memproses...' : 'Konfirmasi Booking'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  if (!doctor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {renderDoctorHeader()}
      {renderStepIndicator()}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>
    </View>
  );
};

export default AppointmentBookingScreen;
